const express = require("express");
const ControlPanel = require("../models/ControlPanel");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const Driver = require("../models/Driver");
const { acceptReq } = require("./AdminControls");

const getAllCps = async (req, res) => {
  try {
    const persons = await ControlPanel.find({});

    res.status(200).json(persons);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getCP = async (req, res) => {
  try {
    const cp = await ControlPanel.findById(req.params.id);
    res.status(200).json(cp);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const Signup = async (req, res) => {
  try {
    const hashPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashPassword;
    const user = await ControlPanel.create(req.body);
    const admin = await Admin.find({});
    console.log(admin[0]);
    const adm = admin[0];
    adm.controlPanels.push(user);
    await adm.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const Login = async (req, res) => {
  try {
    const user = await ControlPanel.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (!user) {
      res.status(400).send("User not found");
    }
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.status(200).json(user);
    } else {
      res.status(400).send("Invalid credentials");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
};

const deleteCps = async (req, res) => {
  try {
    const cps = await ControlPanel.deleteMany({});
    res.status(200).json(cps);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteCpById = async (req, res) => {
  try {
    const cp = await ControlPanel.findByIdAndDelete(req.params.id);
    const admin = await Admin.find({});

    admin[0].controlPanels = admin[0].controlPanels.filter((cp) => {
      return String(cp._id) !== String(req.params.id);
    });
    await admin[0].save();
    const cps = await ControlPanel.find({});

    // Assign another CP to the drivers of this CP
    const drivers = await Driver.find({ controlPanel: req.params.id });
    drivers.forEach(async (driver) => {
      const cp = cps[Math.floor(Math.random() * cps.length)];
      driver.controlPanel = cp._id;
      cp.drivers.push(driver);
      await cp.save();
      await driver.save();
    });

    res.status(200).json(cps);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

const acceptDriver = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const user = await Driver.findById(id);
    console.log(user);
    user.requestStatus = "accepted";
    await user.save();
    const cp = await ControlPanel.findById(user.controlPanel);
    console.log(user.controlPanel);
    cp.requests = cp.requests.filter(
      (request) => String(request._id) !== String(user._id)
    );

    cp.drivers.push(user);
    await cp.save();

    const admin = await Admin.find({});
    admin[0].controlPanels = admin[0].controlPanels.filter(
      (panel) => panel._id.toString() === cp._id.toString()
    );

    admin[0].controlPanels.push(cp);
    await admin[0].save();

    res.status(200).json({ driver: user, ControlPanel: cp });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const rejectDriver = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await Driver.findById(id);
    user.requestStatus = "rejected";
    await user.save();
    const cp = await ControlPanel.findById(user.controlPanel);
    cp.requests = cp.requests.filter(
      (request) => String(request._id) !== String(user._id)
    );
    await cp.save();
    res.status(200).json({ driver: user, ControlPanel: cp });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const createContract = async (req, res) => {
  try {
    const cp = await ControlPanel.findById(req.body.id);
    const { companyId, companyName, duration } = req.body;
    const contract = {
      companyName: companyName,
      duration: duration,
      companyId: companyId,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    cp.contracts.push(contract);
    await cp.save();
    res.status(200).json(cp);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const assignContract = async (req, res) => {
  try {
    const { contract, drivers } = req.body;
    console.log(contract, drivers);
    const driver = await Driver.findById(drivers[0]);
    const cp = await ControlPanel.findById(driver.controlPanel);

    const targetContract = cp.contracts.find(
      (c) => c.contractId === contract.contractId
    );
    if (!targetContract) return res.status(404).send("Contract not found");

    const updateDrivers = await Promise.all(
      drivers.map(async (driverId) => {
        const driver = await Driver.findById(driverId);
        driver.contractDetails.push(targetContract);
        await driver.save();

        cp.drivers = cp.drivers.filter(
          (d) => d._id.toString() !== driver._id.toString()
        );
        cp.drivers.push(driver);
        await cp.save();

        return driver;
      })
    );
    res.status(200).json(updateDrivers);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message); // Error handling
  }
};

const generateReport = async (req, res) => {
  try {
    const cp = await ControlPanel.findById(req.params.id);
    const data = cp.drivers;
    const drivers = await Promise.all(
      data.map(async (item) => {
        const driver = await Driver.findById(item._id);
        const pending = driver.tripDetails.filter(
          (trip) => trip.tripPayment === "pending"
        );

        let amount = 0;

        pending.forEach((trip) => {
          amount += parseInt(trip.amount);
        });

        return {
          driverName: item.username,
          phoneNumber: item.phoneNumber,
          vehicleNumber: item.vehicleNumber,
          pendingTrips: pending,
          totalAmount: amount,
        };
      })
    );

    let amount = 0;
    let allPendingTrips = [];
    drivers.forEach((driver) => {
      driver.pendingTrips.forEach((trip) => {
        amount += parseInt(trip.amount);
        allPendingTrips.push(trip);
      });
    });
    console.log(amount);

    // Get current date and time
    const now = new Date();

    // Format the date
    const formattedDate = `${(now.getDate() < 10 ? "0" : "") + now.getDate()}-${
      (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1)
    }-${now.getFullYear()}`;

    // Format the time
    const formattedTime = `${
      (now.getHours() < 10 ? "0" : "") + now.getHours()
    }:${(now.getMinutes() < 10 ? "0" : "") + now.getMinutes()}:${
      (now.getSeconds() < 10 ? "0" : "") + now.getSeconds()
    }`;

    // Combine date and time
    const formattedDateTime = `${formattedDate}, ${formattedTime}`;

    const report = {
      reportId: crypto.randomUUID().toString(),
      reportDate: formattedDateTime,
      amount: amount,
      data: drivers,
      cpName: cp.username,
      cpId: cp._id,
      allPendingTrips: allPendingTrips,
      status: "Pending",
    };

    cp.reports.push(report);
    await cp.save();
    res.send(report);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong");
  }
};

const deleteReport = async (req, res) => {
  try {
    const cp = await ControlPanel.findById(req.params.id);
    cp.reports = cp.reports.filter(
      (report) => report.reportId !== req.params.reportId
    );
    await cp.save();
    res.status(200).json(cp);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

const payRequest = async (req, res) => {
  try {
    const admin = await Admin.find({});
    admin[0].payReqs.push(req.body);
    const cp = await ControlPanel.findById(req.body.cpId);
    await cp.save();
    await admin[0].save();
    res.status(200).json(admin[0]);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

const updateReq = async (req, res) => {
  try {
    console.log(req.body);
    const cp = await ControlPanel.findById(req.body.cpId);
    cp.updates.push(req.body);
    await cp.save();
    res.status(200).json("success");
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
};

const acceptUpdate = async (req, res) => {
  try {
    const cpId = req.body.cpId;
    const tripId = req.body.trip.tripID;
    const phoneNumber = req.body.phoneNumber;

    await ControlPanel.findOneAndUpdate(
      { _id: cpId, "updates.trip.tripID": tripId },
      { $set: { "updates.$.trip.status": "allowed" } }
    );

    await Driver.findOneAndUpdate(
      { phoneNumber: phoneNumber, "tripDetails.tripID": tripId },
      { $set: { "tripDetails.$.status": "allowed" } }
    );
    const cp = await ControlPanel.findOne({ _id: cpId });

    res.status(200).json(cp.updates);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllCps,
  getCP,
  Signup,
  Login,
  acceptDriver,
  rejectDriver,
  deleteCps,
  deleteCpById,
  createContract,
  assignContract,
  generateReport,
  deleteReport,
  payRequest,
  updateReq,
  acceptUpdate,
};

const express = require("express");
const ControlPanel = require("../models/ControlPanel");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const Driver = require("../models/Driver");

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

const acceptDriver = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const user = await Driver.findById(id);

    user.requestStatus = "accepted";
    await user.save();
    const cp = await ControlPanel.findById(user.controlPanel);
    cp.requests = cp.requests.filter(
      (request) => String(request._id) !== String(user._id)
    );

    await cp.save();
    cp.drivers.push(user);
    await cp.save();
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
    const contract = req.body.contract;
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
    const user = await Driver.findById(req.body.driverId);
    user.contractDetails.push(req.body.contract);
    user.currentContract = req.body.contract.contractId;
    await user.save();
    const cp = await ControlPanel.findById(user.controlPanel);
    res.status(200).json({ driver: user, ControlPanel: cp }); // Respond with updated JSON data of the driver
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
        const id = crypto.randomUUID().toString();
        return {
          id: id,
          cpId: cp._id,
          driverName: item.username,
          vehicleNumber: item.vehicleNumber,
          pendingTrips: pending,
        };
      })
    );
    console.log(drivers);
    res.send(drivers);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong");
  }
};

const payRequest = async (req, res) => {
  try {
    const admin = await Admin.find({});
    admin.payReqs.push(req.body.details);
    await admin.save();
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
  assignContract,
  generateReport,
  payRequest,
};

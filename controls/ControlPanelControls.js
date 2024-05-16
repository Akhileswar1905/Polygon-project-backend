const express = require("express");
const ControlPanel = require("../models/ControlPanel");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const getAllCps = async (req, res) => {
  try {
    const persons = await ControlPanel.find({});

    res.status(200).json(persons);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

const Signup = async (req, res) => {
  try {
    const hashPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashPassword;
    const user = await ControlPanel.create(req.body);
    const admin = await Admin.find({});
    admin.controlPanels.push({
      _id: user._id,
      name: user.username,
    });
    await admin.save();
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
    res.status(500).send("Something went wrong");
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
    res.status(500).send("Something went wrong. Please try again"); // Error handling
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
        return {
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
    admin.payoutDetails.push(req.body.details);
    await admin.save();
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllCps,
  Signup,
  Login,
  deleteCps,
  assignContract,
  generateReport,
  payRequest,
};

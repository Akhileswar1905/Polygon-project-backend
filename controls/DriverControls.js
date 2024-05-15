const express = require("express");
const Driver = require("../models/Driver");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const OTP = require("../models/OTPSchema");
const { ContentListInstance } = require("twilio/lib/rest/content/v1/content");
const ControlPanel = require("../models/ControlPanel");
const fast2sms = require("fast-two-sms");

require("dotenv").config();

// Get all drivers
const getDriver = async (req, res) => {
  try {
    console.log("getDriver");
    const persons = await Driver.find({});
    res.status(200).json(persons); // Respond with JSON data of all drivers
  } catch (error) {
    res.status(500).send("Error occurred " + error.message); // Error handling
  }
};

// Get driver by phone number
const getDriverByPhoneNumber = async (req, res) => {
  try {
    const person = await Driver.findOne({
      phoneNumber: req.params.phoneNumber,
    }); // Find driver by phone number
    res.status(200).json(person); // Respond with JSON data of the driver
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error occurred " + error.message); // Error handling
  }
};

// Update Trip Details
const updateTripDetails = async (req, res) => {
  try {
    // Updating driver document
    const person = await Driver.findOne({ phoneNumber: req.body.phoneNumber }); // Find and update driver by phone number
    const id = crypto.randomUUID();
    person.tripDetails.push({
      tripID: req.body.tripId,
      tripDate: req.body.tripDate,
      tripTime: req.body.tripTime,
      tripPayment: "pending",
      contract: req.body.contractId,
    }); // Add trip details
    await person.save(); // Save changes
    res.status(200).json(person); // Respond with updated JSON data of the driver
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred " + error.message); // Error handling
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const person = await Driver.findByIdAndDelete(req.params.id); // Find and delete driver by ID
    res.status(200).json(person); // Respond with JSON data of the deleted driver
  } catch (error) {
    res.status(500).send("Error occurred " + error.message); // Error handling
  }
};

// Delete all Drivers
const deleteAllDrivers = async (req, res) => {
  try {
    const person = await Driver.deleteMany({});
    res.status(200).json(person); // Respond with JSON data of
  } catch (error) {
    res.status(500).send("Error occurred " + error.message); // Error
  }
};

// -------------------------AUTHS --------------------------------------------------------
// Sign up new driver
const SignUp = async (req, res) => {
  try {
    const existing = await Driver.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (existing) {
      res.status(400).json({ message: "Driver already exists" });
    }

    const user = await Driver.create(req.body); // Create new driver
    console.log(user);
    const cps = await ControlPanel.find({});
    const cp = cps[Math.floor(Math.random() * cps.length)];
    cp.drivers.push({
      _id: user._id,
      phoneNumber: user.phoneNumber,
      name: user.username,
      email: user.email,
      vehicle: user.vehicleNumber,
    });
    user.controlPanel = cp._id;
    user.save();
    cp.save();
    res.status(200).json({ driver: user, cp: cp }); // Respond with JSON data of the
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error occurred " + error.message); // Error handling
  }
};

//  OTP Authentication
let otp;
const sendOTP = async (req, res) => {
  console.log("sendOTP");
  try {
    otp = Math.floor(Math.random() * 9000) + 1000;
    const options = {
      authorization: process.env.OTP_Auth,
      message: `Your OTP is: ${otp}`,
      numbers: [req.body.phoneNumber],
    };
    fast2sms
      .sendMessage(options)
      .then((response) => {
        console.log(response);

        if (!response) {
          console.log("Wrong");
          res.status(400).json({ message: "OTP not sent" });
        }
        console.log("Success", options);
        res.status(200).json("OTP Send Successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error occurred " + error.message); // Error handling
  }
};

// OTP Verification
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const rec = req.body.OTP;
    const driver = await Driver.findOne({ phoneNumber: phoneNumber });
    console.log(otp, rec);
    if (driver) {
      console.log("Exisiting User");
      if (parseInt(rec) === otp) {
        const token = jwt.sign(req.body.phoneNumber, process.env.ACCESS_TOKEN);
        res.json({
          token: token,
          message: "Welcome Back User",
          phoneNumber: phoneNumber,
          driver: driver,
        });
      } else res.status(401).json({ message: "Invalid OTP" }); // Invalid OTP
    } else {
      if (parseInt(rec) === otp) {
        console.log("New User");
        const token = jwt.sign(req.body.phoneNumber, process.env.ACCESS_TOKEN);
        res.json({
          token: token,
          message: "Hello New User",
          phoneNumber: phoneNumber,
        });
      } else res.status(401).json({ message: "Invalid OTP" }); // Invalid OTP
    }
  } catch (error) {
    res.status(500).send("Error occurred " + error.message); // Error handling
  }
};

module.exports = {
  getDriver,
  SignUp,
  deleteDriver,
  sendOTP,
  verifyOTP,
  updateTripDetails,
  deleteAllDrivers,
  getDriverByPhoneNumber,
};

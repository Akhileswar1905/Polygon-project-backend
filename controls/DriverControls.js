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

// Get driver by name
const getDriverByName = async (req, res) => {
  console.log("params", req.params);
  try {
    // Check if the username parameter is provided
    if (req.params.username) {
      // Create a case-insensitive regex from the username parameter
      const regex = new RegExp(`^${req.params.username}$`, "i");

      // Find driver by username using the constructed regex
      const person = await Driver.findOne({ username: regex });

      // Check if a driver was found
      if (!person) {
        return res.status(404).json({ message: "Driver not found" });
      }

      // Respond with JSON data of the driver
      res.status(200).json(person);
    } else {
      // If username parameter is not provided, fetch all drivers
      const allDrivers = await Driver.find({});

      // Respond with JSON data of all drivers
      res.status(200).json(allDrivers);
    }
  } catch (error) {
    // Log the error message
    console.error(error.message);

    // Respond with a 500 status code and error message
    res.status(500).json({ error: "Error occurred: " + error.message });
  }
};

// Update Trip Details
const updateTripDetails = async (req, res) => {
  try {
    // Updating driver document
    const person = await Driver.findOne({ phoneNumber: req.body.phoneNumber }); // Find and update driver by phone number
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
    cp.requests.push(user);
    user.controlPanel = cp._id;
    await user.save();
    await cp.save();
    res.status(200).json({ driver: user, cp: cp }); // Respond with JSON data of the
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error occurred " + error.message); // Error handling
  }
};

//  OTP Authentication
let otp;
const sendOTP = async (req, res) => {
  console.log("sendOTP", req.body);
  try {
    const phoneNumber = req.body.phoneNumber;
    const user = await Driver.findOne({ phoneNumber: phoneNumber });
    if (user.requestStatus === "pending") {
      return res.status(400).json({ message: "Request Pending" });
    }

    if (user.requestStatus === "rejected") {
      return res.status(400).json({ message: "Request Rejected" });
    }

    otp = Math.floor(Math.random() * 9000) + 1000;
    const options = {
      authorization: process.env.OTP_Auth,
      message: `Your OTP is: ${otp}`,
      numbers: [req.body.phoneNumber],
    };

    const response = await fast2sms.sendMessage(options);
    console.log("Response: ", response);
    if (!response || response.return === false) {
      console.log("OTP not sent:", response);
      return res.status(400).json({ message: error.message });
    }
    console.log("Success", response);
    const otpreq = await OTP.create({
      phoneNumber: req.body.phoneNumber,
      OTP: otp,
    });
    res.status(200).json({ message: "OTP sent successfully", id: otpreq._id });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ message: "Error occurred: " + error.message });
  }
};

// OTP Verification
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, OTP, id } = req.body;
    const otpreq = await OTP.findById(id);
    const driver = await Driver.find({ phoneNumber: otpreq.phoneNumber });
    if (parseInt(OTP) === otpreq.OTP) {
      if (driver) {
        const token = jwt.sign(req.body.phoneNumber, process.env.ACCESS_TOKEN);
        res.status(200).json({
          token: token,
          message: "Hello User",
          phoneNumber: phoneNumber,
        });
      } else {
        res
          .status(401)
          .json({ message: "Unauthorized Request: User does not exists" });
      }
    } else {
      res.status(400).json({ message: "Invalid OTP" });
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
  getDriverByName,
};

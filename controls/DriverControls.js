const express = require("express");
const Driver = require("../models/Driver");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTPSchema");
const { ContentListInstance } = require("twilio/lib/rest/content/v1/content");
require("dotenv").config();

// Get all drivers
const getDriver = async (req, res) => {
  try {
    console.log("getDriver");
    const persons = await Driver.find({});
    res.status(200).json(persons); // Respond with JSON data of all drivers
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
};

// Get driver by ID
const getDriverByID = async (req, res) => {
  try {
    const person = await Driver.findById(req.params.id); // Find driver by ID
    res.status(200).json(person); // Respond with JSON data of the driver
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
};

// Update Trip Details
const updateTripDetails = async (req, res) => {
  try {
    console.log(req.body);
    const person = await Driver.findByIdAndUpdate(req.params.id); // Find and update driver by ID
    person.tripDetails.push(req.body); // Add trip details
    await person.save(); // Save changes
    res.status(200).json(person); // Respond with updated JSON data of the driver
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
};

// Update Contract Details
const updateContractDetails = async (req, res) => {
  try {
    const person = await Driver.findByIdAndUpdate(req.params.id); // Find and update driver by ID
    person.contractDetails.push(req.body.contract); // Add contract details
    await person.save(); // Save changes
    res.status(200).json(person); // Respond with updated JSON data of the driver
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const person = await Driver.findByIdAndDelete(req.params.id); // Find and delete driver by ID
    res.status(200).json(person); // Respond with JSON data of the deleted driver
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
};

// Delete all Drivers
const deleteAllDrivers = async (req, res) => {
  try {
    const person = await Driver.deleteMany({});
    res.status(200).json(person); // Respond with JSON data of
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again"); // Error
  }
};

// -------------------------AUTHS --------------------------------------------------------
// Sign up new driver
const SignUp = async (req, res) => {
  try {
    console.log(req.body);
    req.body.phoneNumber = "+91" + req.body.phoneNumber;
    const user = await Driver.create(req.body); // Create new driver
    console.log(user);

    res.status(200).json(user); // Respond with JSON data of the
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
};

//  OTP Authentication
const sendOTP = async (req, res) => {
  console.log("sendOTP");
  try {
    console.log(req.body);
    const client = require("twilio")(
      process.env.ACCOUNT_SID, // Twilio Account SID
      process.env.AUTH_TOKEN // Twilio Auth Token
    );
    const phno = "+91" + req.body.phoneNumber; // Extract phone number from request
    const otp = Math.floor(1000 + Math.random() * 9000); // Generate OTP
    let sendOTP;
    if (!OTP.findOne({ phoneNumber: phno })) {
      sendOTP = await OTP.create({ phoneNumber: phno, OTP: otp });
    } else {
      sendOTP = await OTP.findOneAndUpdate({
        OTP: otp,
      });
    }
    const user = await OTP.findOne({ phoneNumber: phno });
    console.log(user);
    try {
      const message = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.PHONE_NUMBER, // Twilio phone number
        to: phno, // Recipient phone number
      });
      console.log(`Phno: ${phno} and Message SID: ${message.sid}`); // Log message SID

      res.status(200).json({ message: "OTP Sent" }); // Respond with success message
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Failed to send OTP" }); // Error handling
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
};

// OTP Verification
const verifyOTP = async (req, res) => {
  try {
    const otp = await OTP.findOne({
      phoneNumber: "+91" + req.body.phoneNumber,
    });
    console.log(req.body);
    console.log(otp);
    if (parseInt(req.body.OTP) === otp.OTP) {
      // Compare OTP
      const existingUser = await Driver.findOne({
        phoneNumber: req.body.phoneNumber,
      }); // Find user by phone number

      if (existingUser) {
        console.log("User Exists");
        const token = jwt.sign(req.body.phoneNumber, process.env.ACCESS_TOKEN);
        res.json({ token: token, message: "Welcome Back User" });
      } else {
        console.log("New User");
        const token = jwt.sign(req.body.phoneNumber, process.env.ACCESS_TOKEN);
        res.json({ token: token, message: "Hello New User" });
      }
    } else {
      console.log(parseInt(req.body.otp) === otp);
      res.status(401).json({ message: "Invalid OTP" }); // Invalid OTP
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong. Please try again" }); // Error handling
  }
};

module.exports = {
  getDriver,
  SignUp,
  deleteDriver,
  getDriverByID,
  sendOTP,
  verifyOTP,
  updateContractDetails,
  updateTripDetails,
  deleteAllDrivers,
};

const express = require("express");
const Driver = require("../models/Driver");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const client = require("twilio")(
  "ACfbd4dfea8b7f999c50aecc39b1090d19", // Twilio Account SID
  "f19749be0865e62991952e7f1b9c109d" // Twilio Auth Token
);

// Get all drivers
const getDriver = async (req, res) => {
  try {
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
    const person = await Driver.findByIdAndUpdate(req.params.id); // Find and update driver by ID
    person.tripDetails.push(req.body.trip); // Add trip details
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

// -------------------------AUTHS --------------------------------------------------------
// Sign up new driver
const SignUp = async (req, res) => {
  try {
    const existingUser = await Driver.findOne({
      phoneNumber: req.body.phoneNumber,
    });

    if (!existingUser) {
      const user = await Driver.create(req.body); // Create new driver
      console.log(user);
      res.status(200).json(user); // Respond with JSON data of the new driver
    } else {
      res.status(401).json({ message: "User Already Exists" }); // User already exists
    }
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
};

let otp, phoneNumber;

//  OTP Authentication
const sendOTP = async (req, res) => {
  try {
    phno = req.body.phoneNumber; // Extract phone number from request
    otp = Math.floor(1000 + Math.random() * 9000); // Generate OTP
    try {
      const message = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: "+16562315788", // Twilio phone number
        to: phno, // Recipient phone number
      });

      console.log(`Message SID ${message.sid}`); // Log message SID

      res.status(200).json({ message: "OTP Sent" }); // Respond with success message
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to send OTP" }); // Error handling
    }
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
};

// OTP Verification
const verifyOTP = async (req, res) => {
  try {
    if (req.body.otp === otp) {
      // Compare OTP
      const existingUser = await Driver.findOne({ phoneNumber: phoneNumber }); // Find user by phone number

      if (existingUser) {
        console.log("User Exists");
        const token = jwt.sign(
          { userId: existingUser._id },
          process.env.ACCESS_TOKEN_SECRET
        );
        res.json({ token: token, message: "Welcome Back User" });
      } else {
        console.log("New User");
        const token = jwt.sign(
          { phoneNumber: phoneNumber },
          process.env.ACCESS_TOKEN_SECRET
        );
        res.json({ token: token, message: "Hello New User" });
      }
    } else {
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
};

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
    //
    const person = await Driver.findOne({ phoneNumber: req.body.phoneNumber });

    if (!person) {
      return res.status(404).json({ message: "Driver not found" });
    }
    console.log(person);

    person.tripDetails.push({
      tripID: req.body.tripId,
      tripDate: req.body.tripDate,
      tripTime: req.body.tripTime,
      tripPayment: "pending",
      status: "not-allowed",
      contract: req.body.contractId,
      amount: req.body.payPerRide,
      phoneNumber: person.phoneNumber,
    });

    await person.save();

    const cpId = person.controlPanel;
    const cp = await ControlPanel.findById(cpId);

    if (!cp) {
      return res.status(404).json({ message: "ControlPanel not found" });
    }

    const driverIndex = cp.drivers.findIndex(
      (driver) =>
        driver.phoneNumber.toString() === person.phoneNumber.toString()
    );

    if (driverIndex === -1) {
      return res
        .status(404)
        .json({ message: "Driver not found in ControlPanel" });
    }

    cp.drivers[driverIndex].tripDetails.push({
      tripID: req.body.tripId,
      tripDate: req.body.tripDate,
      tripTime: req.body.tripTime,
      tripPayment: "pending",
      status: "not-allowed",
      contract: req.body.contractId,
      amount: req.body.payPerRide,
      phoneNumber: person.phoneNumber,
    });

    await cp.save();

    res.status(200).json(person);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred " + error.message);
  }
};

// Update a trip
const updateTrip = async (req, res) => {
  try {
    const updatedDriver = await Driver.findOneAndUpdate(
      {
        phoneNumber: req.body.phoneNumber,
        "tripDetails.tripID": req.body.tripID,
      },
      {
        $set: {
          "tripDetails.$.tripID": req.body.tripId,
          "tripDetails.$.tripDate": req.body.tripDate,
          "tripDetails.$.tripTime": req.body.tripTime,
          "tripDetails.$.status": "not-allowed",
        },
      },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const updatedTrip = updatedDriver.tripDetails.find(
      (trip) => trip.tripID === req.body.tripId
    );

    if (!updatedTrip) {
      return res
        .status(404)
        .json({ message: "Trip not found in driver's tripDetails" });
    }

    const cpId = updatedDriver.controlPanel;
    const cp = await ControlPanel.findById(cpId);

    if (!cp) {
      return res.status(404).json({ message: "ControlPanel not found" });
    }

    const driverIndex = cp.drivers.findIndex(
      (driver) => driver.phoneNumber === req.body.phoneNumber
    );

    if (driverIndex === -1) {
      return res
        .status(404)
        .json({ message: "Driver not found in ControlPanel" });
    }

    const driverInCp = cp.drivers[driverIndex];

    const tripIndex = driverInCp.tripDetails.findIndex(
      (trip) => trip.tripID === req.body.tripId
    );

    if (tripIndex === -1) {
      return res
        .status(404)
        .json({ message: "Trip not found in ControlPanel" });
    }

    driverInCp.tripDetails[tripIndex] = {
      ...driverInCp.tripDetails[tripIndex],
      tripID: req.body.tripId,
      tripDate: req.body.tripDate,
      tripTime: req.body.tripTime,
      status: "not-allowed",
    };

    await cp.save();

    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error occurred: " + error.message);
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
      return;
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
const sendOTP = async (req, res) => {
  console.log("sendOTP request received:", req.body);
  try {
    const { phoneNumber } = req.body;
    const user = await Driver.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.requestStatus === "pending") {
      return res.json({ message: "Request Pending" });
    }

    if (user.requestStatus === "rejected") {
      return res.json({ message: "Request Rejected" });
    }

    const otp = Math.floor(Math.random() * 9000) + 1000;
    const options = {
      authorization: process.env.OTP_Auth,
      message: `Your OTP is: ${otp}`,
      numbers: [phoneNumber],
    };

    const response = await fast2sms.sendMessage(options);
    console.log("fast2sms response:", response);

    if (!response || response.return === false) {
      return res
        .status(500)
        .json({ message: "OTP not sent", details: response });
    }

    const otpreq = await OTP.create({
      phoneNumber,
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
    console.log("verifyOTP request received:", req.body);
    const { phoneNumber, id, OTP: receivedOtp } = req.body;

    const otpreq = await OTP.findById(id);
    if (!otpreq) {
      return res.status(404).json({ message: "OTP request not found" });
    }

    const driver = await Driver.findOne({ phoneNumber: otpreq.phoneNumber });
    if (!driver) {
      return res
        .status(401)
        .json({ message: "Unauthorized Request: User does not exist" });
    }

    if (parseInt(receivedOtp) === otpreq.OTP) {
      const token = jwt.sign({ phoneNumber }, process.env.ACCESS_TOKEN);
      return res.status(200).json({
        token,
        message: "Hello User",
        phoneNumber,
      });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ message: "Error occurred: " + error.message });
  }
};
module.exports = {
  getDriver,
  SignUp,
  deleteDriver,
  sendOTP,
  verifyOTP,
  updateTripDetails,
  updateTrip,
  deleteAllDrivers,
  getDriverByPhoneNumber,
  getDriverByName,
};

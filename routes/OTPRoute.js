const express = require("express");
const router = express.Router();
const OTP = require("../models/OTPSchema");

// Get all OTPs
router.get("/", async (req, res) => {
  try {
    const otps = await OTP.find({});
    res.status(200).json(otps); // Respond with JSON data of all OTPs
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
});

// Delete all otps
router.delete("/", async (req, res) => {
  try {
    const otps = await OTP.deleteMany({});
    res.status(200).json(otps); // Respond with JSON data of all
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again");
  }
});

module.exports = router;

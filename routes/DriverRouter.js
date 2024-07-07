const express = require("express");
const router = express.Router();
const {
  getDriver,
  SignUp,
  deleteDriver,
  sendOTP,
  verifyOTP,
  updateTripDetails,
  deleteAllDrivers,
  getDriverByPhoneNumber,
  getDriverByName,
  updateTrip,
} = require("../controls/DriverControls");
// Get all drivers
router.get("/", getDriver);

// Signup new driver
router.post("/signup", SignUp);

// OTP Authentication
router.post("/auth", sendOTP);

// OTP Verification
router.post("/auth/verify", verifyOTP);

// Get driver by phoneNumber
router.get("/:phoneNumber", getDriverByPhoneNumber);

// Get driver by name
router.get("/name/:username", getDriverByName);

// Update trip details for a driver
router.put("/trip", updateTripDetails);

// Delete a driver
router.delete("/:id", deleteDriver);

// Delete all drivers
router.delete("/", deleteAllDrivers);

// Updating a trip
router.post("/update-trip", updateTrip);

module.exports = router; // Export router for use in other files

// ------------------------------------------------------------------------
/*                                                                         |
const path = message === "Welcome Back User" ? "/dashboard" : "/signup";   |
navigate(path);                                                            |                 
*/ //                                                                      |
// ------------------------------------------------------------------------

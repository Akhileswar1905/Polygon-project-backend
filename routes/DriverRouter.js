const express = require("express");
const router = express.Router();
const {
  getDriver,
  SignUp,
  deleteDriver,
  getDriverByID,
  sendOTP,
  verifyOTP,
  updateContractDetails,
  updateTripDetails,
  deleteAllDrivers,
} = require("../controls/DriverControls");
// Get all drivers
router.get("/", getDriver);

// Signup new driver
router.post("/signup", SignUp);

// OTP Authentication
router.post("/auth", sendOTP);

// OTP Verification
router.post("/auth/verify", verifyOTP);

// Get driver by ID
router.get("/:id", getDriverByID);

// Get driver by phoneNumber
router.get("/driver", getDriverByPhoneNumber);
// Update trip details for a driver
router.put("/trip", updateTripDetails);

// Delete a driver
router.delete("/:id", deleteDriver);

// Delete all drivers
router.delete("/", deleteAllDrivers);

module.exports = router; // Export router for use in other files

// ------------------------------------------------------------------------
/*                                                                         |
const path = message === "Welcome Back User" ? "/dashboard" : "/signup";   |
navigate(path);                                                            |                 
*/ //                                                                      |
// ------------------------------------------------------------------------

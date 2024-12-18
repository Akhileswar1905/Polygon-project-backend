const express = require("express");
const {
  getAdmin,
  createAdmin,
  login,
  deleteAdmin,
  acceptReq,
  getAllRequests,
  getReqById,
  rejectReq,
  getAllReports,
  getRepById,
  createContract,
  deleteContract,
  updateContract,
  assignContract,
} = require("../controls/AdminControls");

const router = express.Router();

// Get the admin
router.get("/", getAdmin);

// Sign Up
router.post("/signup", createAdmin);

// Login
router.post("/login", login);

// Create a new Contract
router.post("/contract", createContract);

// Delete a Contract
router.delete("/contract/:id", deleteContract);

// Update a Contract
router.put("/contract/:id", updateContract);

//  Assign a Contract
router.post("/assignContract", assignContract);

// Get all requests
router.get("/requests", getAllRequests);

// Get a particular request
router.get("/requests/:id", getReqById);

// Authenticate Payment Requests
router.post("/acceptReq/:id", acceptReq);

// Reject Payment Request
router.post("/rejectReq/:id", rejectReq);

// Generate the report of all payout details
router.get("/reports", getAllReports);

// Get Report by Id
router.get("/reports/:id", getRepById);

// Delete admin
router.delete("/", deleteAdmin);

module.exports = router;

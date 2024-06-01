const express = require("express");
const ControlPanel = require("../models/ControlPanel");
const Driver = require("../models/Driver");
const Admin = require("../models/Admin");
const {
  getAllCps,
  Signup,
  assignContract,
  deleteCps,
  generateReport,
  payRequest,
  Login,
  getCP,
  acceptDriver,
  rejectDriver,
  createContract,
} = require("../controls/ControlPanelControls");
const router = express.Router();

router.get("/", getAllCps);

router.get("/:id", getCP);

router.post("/signup", Signup);

router.post("/login", Login);

router.post("/accept", acceptDriver);

router.post("/reject", rejectDriver);

router.delete("/", deleteCps);

router.post("/contract", assignContract);

router.post("/create-contract", createContract);

router.post("/generate-report/:id", generateReport);

router.post("/payreq", payRequest);

module.exports = router;

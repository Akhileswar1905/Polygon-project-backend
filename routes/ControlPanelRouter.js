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
} = require("../controls/ControlPanelControls");
const router = express.Router();

router.get("/", getAllCps);

router.post("/signup", Signup);

router.post("/login", Login);

router.delete("/", deleteCps);

router.post("/contract", assignContract);

router.post("/generate-report/:id", generateReport);

router.post("/payreq", payRequest);

module.exports = router;

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
  deleteReport,
  deleteCpById,
  updateReq,
  acceptUpdate,
} = require("../controls/ControlPanelControls");
const router = express.Router();

router.get("/", getAllCps);

router.get("/:id", getCP);

router.post("/signup", Signup);

router.post("/login", Login);

router.post("/accept", acceptDriver);

router.post("/reject", rejectDriver);

router.delete("/", deleteCps);

router.delete("/:id", deleteCpById);

router.post("/contract", assignContract);

router.post("/create-contract", createContract);

router.post("/generate-report/:id", generateReport);

router.delete("/delete-report/:id/:reportId", deleteReport);

router.post("/payreq", payRequest);

router.post("/update-request", updateReq);

router.post("/accept-update-request", acceptUpdate);

module.exports = router;

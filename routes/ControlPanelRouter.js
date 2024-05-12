const express = require("express");
const ControlPanel = require("../models/ControlPanel");
const Driver = require("../models/Driver");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const persons = await ControlPanel.find({});
    res.status(200).json(persons);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

router.post("/signup", async (req, res) => {
  try {
    const user = await ControlPanel.create(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

router.delete("/", async (req, res) => {
  try {
    const cps = await ControlPanel.deleteMany({});
    res.status(200).json(cps);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

router.post("/contract", async (req, res) => {
  try {
    const user = await Driver.findById(req.body.driverId);
    user.contractDetails.push(req.body.contract);
    user.currentContract = req.body.contract.contractId;
    user.save();
    const cp = await ControlPanel.findById(user.controlPanel);
    res.status(200).json({ driver: user, ControlPanel: cp }); // Respond with updated JSON data of the driver
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again"); // Error handling
  }
});

router.post("/payreq", async (req, res) => {
  try {
    const admin = "admin";
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});
module.exports = router;

const express = require("express");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const router = express.Router();

// Get the admin
router.get("/", async (req, res) => {
  try {
    const admin = await Admin.find({});
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    res.status(200).send(admin);
  } catch (err) {
    res.status(500).send(error.message);
  }
});

// Sign Up
router.post("/signup", async (req, res) => {
  try {
    const hashPassword = bcrypt.hashSync(req.body.password);
    const admin = await Admin.create({
      username: req.body.username,
      password: hashPassword,
    });
    res.status(200).send(admin);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    const isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) {
      return res.status(400).send("Invalid password");
    }
    res.status(200).send("Login successful");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add Control Panel
router.post("/addControlPanel", async (req, res) => {});

// Authenticate Payment Requests
router.post("/payAuth", async (req, res) => {});

// Generate the report of all payout details
router.get("/report", async (req, res) => {});

// Delete admin
router.delete("/", async (req, res) => {
  try {
    const admin = await Admin.findOneAndDelete({ username: req.body.username });
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    res.status(200).send("Admin deleted");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;

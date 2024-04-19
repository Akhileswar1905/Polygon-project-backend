const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  username: {
    type: "string",
    required: true,
  },
  phoneNumber: { type: "string", required: true },
  email: { type: "string", required: true },
  Aadhar: { type: "number", required: true },
  PAN: { type: "string", required: true },
  DrivingLicense: { type: "string", required: true },
  IFSC: { type: "string", required: true },
  AccNumber: {
    type: "number",
    required: true,
  },
  photo: {
    type: "string",
    required: true,
  },
  vehicleNumber: { type: "string", required: true },
  tripDetails: {
    type: Array,
    default: [],
  },
  contractDetails: {
    type: Array,
    default: [],
  },
});

const Driver = mongoose.model("Driver", DriverSchema);

module.exports = Driver;

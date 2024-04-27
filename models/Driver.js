const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  username: {
    type: "string",
    required: true,
  },
  dob: {
    type: "string",
    required: true,
  },
  phoneNumber: { type: "string", required: true },
  email: { type: "string", required: false },
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
    required: false,
  },
  vehicleNumber: { type: "string", required: true },
  vehicleRC: { type: "string", required: true },
  vehicleModel: { type: "string", required: true },
  vehiclePhotos: { type: "string", required: true },
  vehicleVideo: { type: "string", required: true },
  tripDetails: {
    type: Array,
    default: [],
  },
  contractDetails: {
    type: Array,
    default: [],
  },
  controlPanel: {
    type: "string",
    required: false,
  },
});

const Driver = mongoose.model("Driver", DriverSchema);

module.exports = Driver;

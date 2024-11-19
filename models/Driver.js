const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema(
  {
    username: {
      type: "string",
      required: true,
    },
    dob: {
      type: "string",
      required: true,
    },
    phoneNumber: { type: "string", required: true },
    email: { type: "string", required: true },
    Aadhar: { type: "string", required: true },
    PAN: { type: "string", required: true },
    DrivingLicense: { type: "string", required: true },
    IFSC: { type: "string", required: true },
    AccNumber: {
      type: "string",
      required: true,
    },
    photo: {
      type: "string",
      required: true,
    },
    vehicleNumber: { type: "string", required: false },
    vehicleRC: { type: "string", required: true },
    vehicleModel: { type: "string", required: false },
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
    currentContract: {
      type: "string",
      required: false,
    },
    earnings: {
      type: Array,
      required: false,
    },
    requestStatus: {
      type: "string",
      required: false,
      default: "pending",
    },
    dateOfJoining: {
      type: "string",
      required: false,
      default: new Date().toISOString().slice(0, 10),
    },
  },
  {
    timestamps: true,
  }
);

const Driver = mongoose.model("Driver", DriverSchema);

module.exports = Driver;

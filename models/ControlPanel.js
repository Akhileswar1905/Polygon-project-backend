const mongoose = require("mongoose");

const ControlPanelScheme = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  drivers: {
    type: Array,
    default: [],
  },
  requests: {
    type: Array,
    default: [],
  },
  contracts: {
    type: Array,
    default: [],
  },
  reports: {
    type: Array,
    default: [],
  },
  updates: {
    type: Array,
    default: [],
  },
  prevDrivers: {
    type: Number,
    default: 0,
  },
  prevContracts: {
    type: Number,
    default: 0,
  },
  prevTrips: {
    type: Number,
    default: 0,
  },
  prevAmount: {
    type: Number,
    default: 0,
  },
  dateOfJoining: {
    type: String,
    required: false,
    default: new Date().toISOString().slice(0, 10),
  },
});

const ControlPanel = mongoose.model("ControlPanel", ControlPanelScheme);

module.exports = ControlPanel;

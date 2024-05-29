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
  tripDetails: {
    type: Array,
    default: [],
  },
});

const ControlPanel = mongoose.model("ControlPanel", ControlPanelScheme);

module.exports = ControlPanel;

const mongoose = require("mongoose");

const ControlPanelScheme = new mongoose.Schema({
  username: {
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
});

const ControlPanel = mongoose.model("ControlPanel", ControlPanelScheme);

module.exports = ControlPanel;

const mongoose = require("mongoose");

const controlPanelScheme = new mongoose.Schema({
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

const controlPanel = mongoose.Model("controlPanel", controlPanelScheme);

module.exports = controlPanel;

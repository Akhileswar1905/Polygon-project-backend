const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  controlPanels: {
    type: Array,
    default: [],
  },
  payReqs: {
    type: Array,
    default: [],
  },
  payReps: {
    type: Array,
    default: [],
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

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
  payoutDetails: {
    type: Array,
    default: [],
  },
  payAuth: {
    type: Boolean,
    default: false,
  },
  payAuthDetails: {
    type: Array,
    default: [],
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

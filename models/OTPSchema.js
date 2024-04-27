const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  OTP: {
    type: Number,
    required: true,
  },
});

const OTP = mongoose.model("Otp", OTPSchema);

module.exports = OTP;

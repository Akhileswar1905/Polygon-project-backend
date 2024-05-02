// Libraries
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const env = require("dotenv");
const driverRouter = require("./routes/DriverRouter");
const controlPanelRouter = require("./routes/ControlPanelRouter");
const { default: mongoose } = require("mongoose");
const OTProuter = require("./routes/OTPRoute");
env.config();
// App
const app = express();
app.use(express.json());
app.use(cors());
app.use("/driver", driverRouter);
app.use("/cp", controlPanelRouter);
app.use("/otp", OTProuter);
// MongoDB Connection
main().catch((err) => console.log(err));

async function main() {
  console.log("Database connection established");
}
// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to this API",
  });
});

app.listen(process.env.PORT || 5050, async (req, res) => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/");
  // await mongoose.connect("mongodb://localhost:27017/");
  console.log("Server listening on http://localhost:5050");
});

// Middleware
function authToken(req, res, next) {
  console.log(req.body);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = req.body;
    next();
  });
}

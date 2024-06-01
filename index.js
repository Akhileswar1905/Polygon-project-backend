// Libraries
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const env = require("dotenv");
const driverRouter = require("./routes/DriverRouter");
const controlPanelRouter = require("./routes/ControlPanelRouter");
const adminRouter = require("./routes/AdminRouter");
const { default: mongoose } = require("mongoose");
const OTProuter = require("./routes/OTPRoute");
const Admin = require("./models/Admin");
const ControlPanel = require("./models/ControlPanel");
const bcrypt = require("bcrypt");
env.config();
// App
const app = express();
app.use(express.json());
app.use(cors());
app.use("/driver", driverRouter);
app.use("/cp", controlPanelRouter);
app.use("/otp", OTProuter);
app.use("/admin", adminRouter);
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

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.find({ username: username });
    const cp = await ControlPanel.find({ username: username });
    console.log(admin, cp);
    if (admin.length > 0) {
      if (bcrypt.compareSync(password, admin[0].password)) {
        res.status(200).json(admin[0]);
      } else {
        res.status(400).send("Invalid credentials");
      }
    } else if (cp.length > 0) {
      console.log(bcrypt.compareSync(password, cp[0].password));
      if (bcrypt.compareSync(password, cp[0].password)) {
        res.status(200).json(cp[0]);
      } else {
        res.status(400).send("Invalid credentials");
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send(`Error: ${error.message}`);
  }
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

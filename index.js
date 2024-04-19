// Libraries
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const env = require("dotenv");
const driverRouter = require("./routes/DriverRouter");
const { default: mongoose } = require("mongoose");
env.config();
// App
const app = express();
app.use(express.json());
app.use(cors());
app.use("/driver", driverRouter);

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

// app.get("/users", authToken, (req, res) => {
//   console.log(req.user);
//   res.json(drivers.filter((driver) => driver.email === req.user.email));
// });

app.listen(5050, async (req, res) => {
  await mongoose.connect("mongodb://localhost:27017/");
  console.log("Server listening on http://localhost:5050");
});

// Middleware
function authToken(req, res, next) {
  console.log(req.body);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(
    token,
    "f3bb8ed3ef82c863aed009900551a761bc8238718b83d7da5e8950d70d640239a17364566379a0a976033f2bc074610bc880321c1a8edbb212948dce0f676f732875057ab14fef37addacd4495a2e306094734009f3a21f52438dbba2a627e78a8ef1cac",
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = req.body;
      next();
    }
  );
}

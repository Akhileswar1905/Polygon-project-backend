const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const Driver = require("../models/Driver");
const ControlPanel = require("../models/ControlPanel");

const acceptReq = async (req, res) => {
  try {
    console.log(req.body, req.params.id);
    const admin = await Admin.find({});
    const requests = admin[0].payReqs;
    console.log(requests);
    const request = requests.find(
      (request) => request.reportId === req.params.id
    );
    request.status = "Done";
    console.log(request);

    // Update Admin
    admin[0].payReqs = admin[0].payReqs.filter(
      (request) => request.reportId !== req.params.id
    );

    await admin[0].save();

    // Update CP
    const cp = await ControlPanel.findById(request.cpId);
    cp.reports = cp.reports.filter(
      (request) => request.reportId !== req.params.id
    );
    await cp.save();

    // Update driver
    const data = request.data;

    // Loop through each driver in the request
    for (const driver of data) {
      const pendingTripsIds = driver.pendingTrips.map((trip) => trip.tripID);

      // Update tripPayment for each pending trip of the driver
      for (const ride of pendingTripsIds) {
        await Driver.findOneAndUpdate(
          { phoneNumber: driver.phoneNumber, "tripDetails.tripID": ride },
          { $set: { "tripDetails.$.tripPayment": "Done" } }
        );
      }

      // Update earnings for the driver
      const rider = await Driver.findOne({ phoneNumber: driver.phoneNumber });
      for (const ride of pendingTripsIds) {
        const trip = rider.tripDetails.find((trip) => trip.tripID === ride);
        rider.earnings.push({
          tripId: ride,
          amount: parseInt(trip.amount),
          tripDate: trip.tripDate,
        });
      }
      await rider.save();
    }

    admin[0].payReps.push(request);
    await admin[0].save();
    cp.reports.push(request);
    await cp.save();
    res.status(200).json(request);
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
};

const rejectReq = async (req, res) => {
  try {
    const admin = await Admin.find({});
    const requests = admin[0].payReqs;
    const req = requests.find((req) => req.reportId === req.params.id);
    req.status = "Rejected";
    admin[0].payReqs = admin[0].payReqs.filter(
      (req) => req.reportId === req.params.id
    );
    const reps = admin[0].payReps;
    await admin.save();
    res.status(200).json(req);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// AUTH
const login = async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    const isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) {
      return res.status(400).send("Invalid password");
    }
    res.status(200).send("Login successful");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// CRUD

const createAdmin = async (req, res) => {
  try {
    const hashPassword = bcrypt.hashSync(req.body.password, 10);
    const admin = await Admin.create({
      username: req.body.username,
      password: hashPassword,
    });
    res.status(200).send(admin);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOneAndDelete({ username: req.body.username });
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    res.status(200).send("Admin deleted");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getAdmin = async (req, res) => {
  try {
    const admin = await Admin.find({});
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    res.status(200).send(admin);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getAllRequests = async (req, res) => {
  try {
    const admin = await Admin.find({});
    const requests = admin[0].payReqs;
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getReqById = async (req, res) => {
  try {
    const admin = await Admin.find({});
    const requests = admin[0].payReqs;
    const request = requests.find(
      (request) => request.reportId === req.params.id
    );
    res.status(200).json(request);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getAllReports = async (req, res) => {
  try {
    const admin = await Admin.find({});
    const reports = admin[0].payReps;
    res.status(200).json({ reports: reports });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getRepById = async (req, res) => {
  try {
    const admin = await Admin.find({});
    const reports = admin[0].payReps;
    const rep = reports.find((rep) => rep.reportId === rep.params.id);
    res.status(200).json(rep);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllRequests,
  getReqById,
  acceptReq,
  rejectReq,
  login,
  deleteAdmin,
  getAdmin,
  createAdmin,
  getAllReports,
  getRepById,
};

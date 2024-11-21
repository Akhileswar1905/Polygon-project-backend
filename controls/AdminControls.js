const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const Driver = require("../models/Driver");
const ControlPanel = require("../models/ControlPanel");
const uuid = require("uuid").v4;
// Helper function to find admin
const findAdmin = async () => {
  const admin = await Admin.findOne({});
  if (!admin) throw new Error("Admin not found");
  return admin;
};

// Helper function to save control panels
const saveControlPanels = async (admin, updatedPanels) => {
  admin.controlPanels = updatedPanels;
  await admin.save();
};

// CREATE CONTRACT
const createContract = async (req, res) => {
  try {
    const admin = await findAdmin();
    const contract = {
      contractId: req.body.companyId || uuid(),
      companyName: req.body.companyName,
      startDate:
        req.body.startDate !== ""
          ? req.body.startDate
          : new Date().toISOString().slice(0, 10),
      endDate: req.body.endDate,
      contactNumber: req.body.contactNumber,
      email: req.body.email,
      createdAt: req.body.createdAt || new Date().toISOString().slice(0, 10),
      amount: req.body.amount,
      assigned: false,
    };

    admin.contracts.push(contract);
    await admin.save();
    res.status(201).json(contract);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
};

// DELETE CONTRACT
const deleteContract = async (req, res) => {
  try {
    // Fetch admin and ensure it exists
    const admin = await Admin.findOne({});
    if (!admin) return res.status(404).send("Admin not found");

    // Find the contract to be deleted
    const contract = admin.contracts.find(
      (c) => c.contractId === req.params.id
    );
    if (!contract) return res.status(404).send("Contract not found");

    // Remove the contract from admin contracts
    admin.contracts = admin.contracts.filter(
      (c) => c.contractId !== req.params.id
    );

    // Update associated control panels
    const updatedControlPanels = await Promise.all(
      admin.controlPanels.map(async (panelId) => {
        const panel = await ControlPanel.findById(panelId);
        if (panel) {
          panel.contracts = panel.contracts.filter(
            (c) => c.contractId !== req.params.id
          );
          await panel.save(); // Save updated control panel
          return panel;
        }
        return null;
      })
    );

    // Filter out null panels (in case some IDs are invalid)
    admin.controlPanels = updatedControlPanels
      .filter(Boolean)
      .map((panel) => panel._id);

    // Save the admin document
    await admin.save();

    res
      .status(200)
      .json({ message: "Contract deleted successfully", contract });
  } catch (error) {
    console.error("Error deleting contract:", error.message);
    res.status(500).send({ error: error.message });
  }
};

// UPDATE CONTRACT
const updateContract = async (req, res) => {
  try {
    // Fetch admin and ensure it exists
    const admin = await Admin.findOne({});
    if (!admin) {
      console.error("Admin not found");
      return res.status(404).send("Admin not found");
    }

    // Find the contract to be updated
    const contract = admin.contracts.find(
      (c) => c.contractId === req.params.id
    );
    if (!contract) {
      console.error("Contract not found in admin");
      return res.status(404).send("Contract not found");
    }

    console.log("Original Admin Contract:", contract);
    // Update the contract in the admin document
    Object.assign(contract, {
      companyName: req.body.companyName || contract.companyName,
      startDate: req.body.startDate || contract.startDate,
      endDate: req.body.endDate || contract.endDate,
      contactNumber: req.body.contactNumber || contract.contactNumber,
      email: req.body.email || contract.email,
      amount: req.body.amount || contract.amount,
      assigned:
        req.body.assigned !== undefined ? req.body.assigned : contract.assigned,
    });

    console.log("Updated Admin Contract:", contract);

    admin.contracts = admin.contracts.filter((c) => {
      return c.contractId !== req.params.id;
    });

    admin.contracts.push(contract);
    // Save the updated admin document
    await admin.save();

    // Update the contract in associated control panels
    const updatedControlPanels = await Promise.all(
      admin.controlPanels.map(async (panelId) => {
        const panel = await ControlPanel.findById(panelId);
        if (!panel) {
          console.warn(`ControlPanel with ID ${panelId} not found`);
          return null;
        }

        // Find and update the contract in the control panel
        const panelContract = panel.contracts.find(
          (c) => c.contractId === req.params.id
        );
        if (panelContract) {
          Object.assign(panelContract, {
            companyName: req.body.companyName || panelContract.companyName,
            startDate: req.body.startDate || panelContract.startDate,
            endDate: req.body.endDate || panelContract.endDate,
            contactNumber:
              req.body.contactNumber || panelContract.contactNumber,
            amount: req.body.amount || panelContract.amount,
            assigned:
              req.body.assigned !== undefined
                ? req.body.assigned
                : panelContract.assigned,
          });

          panel.contracts = panel.contracts.filter((c) => {
            return c.contractId !== req.params.id;
          });

          panel.contracts.push(panelContract);

          await panel.save(); // Save updated panel
        } else {
          console.warn(`Contract not found in ControlPanel with ID ${panelId}`);
        }

        return panel;
      })
    );

    res.status(200).json(contract);
  } catch (error) {
    console.error("Error updating contract:", error.message);
    res.status(500).send({ error: error.message });
  }
};

// ASSIGN CONTRACT
const assignContract = async (req, res) => {
  try {
    // Validate request body
    const { contract, cps } = req.body;
    if (!contract || !cps || !Array.isArray(cps)) {
      return res.status(400).send("Invalid request: contract or cps missing");
    }

    // Find admin
    const admin = await findAdmin();
    if (!admin) {
      return res.status(404).send("Admin not found");
    }

    // Find target contract
    const targetContract = admin.contracts.find(
      (c) => c.contractId === contract.contractId
    );
    if (!targetContract) {
      return res.status(404).send("Contract not found");
    }

    // Mark contract as assigned
    targetContract.assigned = true;

    // Process control panels
    const updatedPanels = await Promise.all(
      cps.map(async (cpId) => {
        const panel = await ControlPanel.findById(cpId);
        if (panel) {
          // Assign contract to the panel
          panel.contracts.push(targetContract);

          // Remove from admin's controlPanels and re-add updated panel
          admin.controlPanels = admin.controlPanels.filter(
            (cp) => cp._id.toString() !== panel._id.toString()
          );
          admin.controlPanels.push(panel);

          // Save both panel and admin
          await panel.save();
        }
        return panel;
      })
    );

    // Save updated admin
    await admin.save();

    // Respond with the updated contract or control panels
    res.status(200).json({
      message: "Contract assigned successfully",
      contract: targetContract,
      updatedPanels,
    });
  } catch (error) {
    console.error("Error assigning contract:", error.message);
    res.status(500).send({ error: error.message });
  }
};

// PAYMENT REQUESTS
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
        const updatedDriver = await Driver.findOneAndUpdate(
          { phoneNumber: driver.phoneNumber, "tripDetails.tripID": ride },
          { $set: { "tripDetails.$.tripPayment": "Done" } }
        );
        if (!updatedDriver) {
          return res.status(404).json({ message: "Driver not found" });
        }
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

      cp.drivers = cp.drivers.filter(
        (driver) => driver._id.toString() === rider._id.toString()
      );
      await cp.save();
      cp.drivers.push(rider);
      await cp.save();
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
    res.status(200).send(admin[0]);
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
  createContract,
  deleteContract,
  updateContract,
  assignContract,
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

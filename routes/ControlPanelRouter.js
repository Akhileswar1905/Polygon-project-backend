const express = require("express");
const ControlPanel = require("../models/ControlPanel");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const persons = await ControlPanel.find({});
    res.status(200).json(persons);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

router.post("/signup",async(req,res)=>{
  try {
    const user = await ControlPanel.create(req.body)
    res.status(200).json(user)
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
})

module.exports = router;

const express = require("express");
const router = express.Router();
const bycrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const User = require("./models/user");
const simulator = require('../simulator')
const axios = require("axios");

// router.post("/createuser", async (req, res) => {
//   const uUser = new User(req.body);
//   const newUser = await uUser.save();
//   res.json({ status: 'success', message: 'User created', user: newUser });
// });

router.get("/get-sun-details", async (req, res) => {
  try {
    const sunDetails = await simulator.getSunDetails();
    res.status(200).json({ value: sunDetails });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/get-nasa-details", async (req, res) => {
  try {
    const NASADetails = await simulator.getAsteroidsNearEarth();
    res.status(200).json({ value: NASADetails });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/getsimulator", async (req, res) => {
  await axios
    .get("http://localhost:9200/logs/_search")
    .then((response) => {
      console.log("Message successfully sent to Elasticsearch:", response.data);
        res.status(200).json({ value: response.data });
    })
    .catch((error) => {
      console.error("Error sending message to Elasticsearch:", error.message);
    });
});




module.exports = router;
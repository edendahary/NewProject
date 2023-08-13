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

    const response = await axios.get(
      `http://localhost:9200/logs/_count`
    );
    var totalCount = response.data.count;
    // if (totalCount >= 200){
    //   totalCount = 200;
    // }
      try {
        const response = await axios.get(
          `http://localhost:9200/logs/_search?size=${totalCount}`
        );
        console.log(
          "Message successfully sent to Elasticsearch:",
          response.data
        );
        res.status(200).json({ value: response.data });
      } catch (error) {
        console.error("Error sending message to Elasticsearch:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
      }
});


  router.get("/getsimulator-recent-data", async (req, res) => {
    axios
          .get("http://localhost:9200/logs/_search", {
            params: {
              size: 1,
              sort: `${your_timestamp_field}:desc`, // Replace with your timestamp field
            },
          })
          .then((esResponse) => {
            if (esResponse.data.hits.hits.length > 0) {
              const latestDocument = esResponse.data.hits.hits[0]._source;
              res.status(200).json({ value: latestDocument });
              console.log('Latest Document:', latestDocument);
            } else {
              console.log('No documents found in Elasticsearch.');
              res.status(200).json({ value: latestDocument });
            }
          })

  });




module.exports = router;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const routesUrls = require("./routes/routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const Redis = require("ioredis");
const simulator = require("./simulator");
const axios = require("axios");
const path = require("path");
const fs = require("fs");


app.listen(8000, () => console.log("Server is running on port 8000"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use("/app", routesUrls);

const client = new Redis({
  host: "localhost", 
  port: 6379, 
});

client.on("error", function (err) {
  console.error("Redis connection error:", err);
});

client.on("connect", async function () {
  console.log("Redis connected");

  async function processRandomObject() {
    let cursor = "0";
    let randomKey = null;

    while (randomKey === null) {
      const [nextCursor, keys] = await client.scan(cursor, "COUNT", 9600);

      if (keys.length === 0) {
        console.log("No objects found in the Redis database.");
        return null;
      }

      // Pick a random key from the available keys
      randomKey = keys[Math.floor(Math.random() * keys.length)];

      // If nextCursor is 0, it means we have iterated through all the keys.
      if (nextCursor === "0") break;

      cursor = nextCursor;
    }

    if (randomKey === null) {
      return;
    }

    // Get the object corresponding to the random key
    const randomObjectString = await client.get(randomKey);

    // Parse the JSON string to obtain the object
    const randomObject = JSON.parse(randomObjectString);

    const sendKafka = await simulator.writeToKafka(randomObject);
  }

  // Run the function initially and then repeat it every 5 seconds
  // setInterval(processRandomObject, 10000);
});


// // used only once to upload the file to Redis
// client.on("connect", async function () {
//   console.log("Redis connected");

//   try {
//   // await client.flushdb(); // to clear the database
//     // Construct the absolute file path to BSC.json
//     const filePath = path.join(__dirname, "BSC.json");

//     // Read the JSON data from BSC.json
//     const jsonData = fs.readFileSync(filePath, "utf8");

//     // Parse the JSON data into an array of objects
//     const jsonArray = JSON.parse(jsonData);

//     // Store each object as a separate entity in Redis
//     for (let i = 0; i < jsonArray.length; i++) {
//       const objectKey = `harvard_ref_#${jsonArray[i]["harvard_ref_#"]}`;

//       // Store the JSON object as a string in Redis with a unique key
//       await client.set(objectKey, JSON.stringify(jsonArray[i]));
//     }
//   } catch (error) {
//     console.error("Error uploading JSON data to Redis:", error);
//   } finally {
//     // Close the Redis connection when done
//     console.log("finished")
//     client.quit();
//   }
// });

// mongoose
//   .connect("mongodb://127.0.0.1:27017/edenNewProject")
//   .then(() => {
//     console.log("MongoDB connected");
//   })
//   .catch((error) => {
//     console.error("MongoDB connection error:", error);
//   });


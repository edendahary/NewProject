const express = require("express");
const app = express();
const mongoose = require("mongoose");
const routesUrls = require("./routes/routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const Redis = require("ioredis");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { Kafka, Partitioners } = require("kafkajs");
const queueRandomMessage = require("./producer/index");
const client = new Redis({
  host: "localhost", // Redis server is running on localhost
  port: 6379, // Default Redis port
});

client.on("error", function (err) {
  console.error("Redis connection error:", err);
});

const getRandomKey = async () => {
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

  return randomKey;
};

client.on("connect", async function () {
  console.log("Redis connected");

  try {
    // Get a random key from the Redis database
    const randomKey = await getRandomKey();

    if (randomKey === null) {
      client.quit();
      return;
    }

    // Get the object corresponding to the random key
    const randomObjectString = await client.get(randomKey);

    // Parse the JSON string to obtain the object
    const randomObject = JSON.parse(randomObjectString);

    // Extract the required properties (DEC, RA, Title HD) from the object
    const { DEC, RA, "Title HD": TitleHD } = randomObject;

    // Create a new JSON object with the extracted properties
    const extractedData = { DEC, RA, "Title_HD": TitleHD };

    // Write the JSON object to a file
    const filePath = path.join(__dirname, "extracted_data.json");
    fs.writeFileSync(filePath, JSON.stringify(extractedData, null, 2));
    await queueRandomMessage(filePath);
    console.log("JSON file created successfully!");
  } catch (error) {
    console.error("Error while creating JSON file:", error);
  } finally {
    // Close the Redis connection when done
    client.quit();
  }
});


// not in use
// Create a new client with the Kafka server details
// async function kafkaService(filePath) {
//   const kafka = new Kafka({
//     clientId: "my-app",
//     brokers: ["welcomed-labrador-5547-us1-kafka.upstash.io:9092"],
//     ssl: true,
//     sasl: {
//       mechanism: "scram-sha-256", // or 'scram-sha-256' depending on your Kafka setup
//       username:
//         "d2VsY29tZWQtbGFicmFkb3ItNTU0NyQhrDA5mgn4oUpmxMHMQWn3TqT9DQCmPUU",
//       password: "0cae5bc74f4b496c8b359edb3972309f",
//     },
//   });
// const producer = kafka.producer({
//   createPartitioner: Partitioners.LegacyPartitioner,
// });

//   try {
//     // Connect the producer
//     await producer.connect();
//     console.log("Kafka producer is ready");

//     // Read the JSON file
//     const jsonData = fs.readFileSync(filePath, "utf8");

//     // Parse the JSON data into an object
//     const jsonObject = JSON.parse(jsonData);

//     // Send the JSON data as a message to a Kafka topic
//     const topic = "test"; // Replace with the desired Kafka topic
//     const messages = [{ value: JSON.stringify(jsonObject) }];

//     await producer.send({
//       topic,
//       messages,
//     });

//     console.log("Message sent successfully.");
//   } catch (error) {
//     console.error("Error while processing JSON data:", error);
//   } finally {
//     // Disconnect the producer when done
//     await producer.disconnect();
//     console.log("Kafka producer disconnected.");
//   }
// }


// used only once to upload the file to Redis
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

mongoose
  .connect("mongodb://127.0.0.1:27017/edenNewProject")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(8000, () => console.log("Server is running on port 8000"));
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use("/app", routesUrls);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const routesUrls = require("./routes/routes");
const cors = require("cors");
const bodyParser = require('body-parser');
const fs = require("fs");
const path = require("path");
const { MongoAPIError } = require("mongodb");

mongoose.connect("mongodb://127.0.0.1:27017/edenNewProject")
  .then(() => {
    console.log("DB connected");
    app.listen(8000, () => console.log("Server is running "));
  })
  .catch((error) => {
    console.error("DB connection error:", error);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use("/app", routesUrls);

const express = require("express");
const router = express.Router();
const bycrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const User = require("./models/user");


router.post("/createuser", async (req, res) => {
  const uUser = new User(req.body);
  const newUser = await uUser.save();
  res.json({ status: 'success', message: 'User created', user: newUser });
});


module.exports = router;
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET all users
router.get("/", async (req, res) => {
    const users = await User.find();
    console.log("Users from DB:", users);
    res.json(users);
});

// POST new user
router.post("/", async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.json(user);
});

module.exports = router;
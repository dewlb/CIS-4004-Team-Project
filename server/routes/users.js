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

// LOGIN user
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true, user });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
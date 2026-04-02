const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// GET all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        console.log("Users from DB:", users);
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST new user (Registration) with password encryption
router.post("/", async (req, res) => {
    try {
        const { firstName, lastName, username, password } = req.body;

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            firstName,
            lastName,
            username,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ success: true, user });

    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// LOGIN user with bcrypt password verification
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        res.json({ success: true, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { _id: user._id, id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
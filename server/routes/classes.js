const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const User = require("../models/User");
const Group = require("../models/Group");
const auth = require("../middleware/auth");


//gets all classes a student is in by username
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const classes = await Class.find({
            students: user._id
        }).populate("students", "username");

        res.json(classes);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//get all classes taught by a professor
router.get("/professor", auth, async (req, res) => {
    try {
        const professor = await User.findById(req.user.id);
        if (!professor) {
            return res.status(404).json({ error: "Professor not found" });
        }

        const classes = await Class.find({ professorId: professor._id }).populate("students", "username role");

        res.json(classes);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//get all groups in a class
router.get("/:classId/groups", auth, async (req, res) => {
    try {
        const { classId } = req.params;

        const classDoc = await Class.findById(classId).populate({
            path: "groups",
            populate: {
                path: "members",
                select: "username"
            }
        })
        if (!classDoc) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.json(classDoc.groups);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//get student specific group
router.get("/:classId/student-group", auth, async (req, res) => {
    try {
        const { classId } = req.params;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const groups = await Group.find({
            classId,
            members: user._id
        });

        if (!groups.length) {
            return res.status(404).json({ error: "Student is not in a group" });
        }

        res.json(groups);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//student post to an existing class
router.post("/join", auth, async (req, res) => {
    try {
        const { classId } = req.body;

        const student = await User.findById(req.user.id);
        if (!student) return res.status(404).json({ error: "Student not found" });

        const classDoc = await Class.findById(classId);
        if (!classDoc) return res.status(404).json({ error: "Class not found" });

        if (!classDoc.students.includes(student._id)) {
            classDoc.students.push(student._id);
            await classDoc.save();
        }

        res.json({ message: "Student added to class", class: classDoc });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//professor adding or creating a new class
router.post("/create", auth, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Class name required" });
        }

        const professor = await User.findOne({ username: req.user.username });
        if (!professor) {
            return res.status(404).json({ error: "Professor not found" });
        }

        const newClass = new Class({
            name,
            professorId: professor._id,
            students: [],
            groups: []
        });

        await newClass.save();

        res.json({ message: "Class created successfully", class: newClass });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//prof deletes a class and asscoated groups 
router.delete("/:classId", auth, async (req, res) => {
    try {
        const { classId } = req.params;

        const professor = await User.findById(req.user.id);
        if (!professor) {
            return res.status(404).json({ error: "Professor not found" });
        }

        const classDoc = await Class.findById(classId);
        if (!classDoc) return res.status(404).json({ error: "Class not found" });

        if (!classDoc.professorId.equals(professor._id)) {
            return res.status(403).json({ error: "You can only delete your own class" });
        }

        await Group.deleteMany({ classId: classDoc._id });

        await Class.findByIdAndDelete(classId);

        res.json({ message: "Class and its groups deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const User = require("../models/User");
const Group = require("../models/Group");



//gets all classes a student is in by username
router.get("/", async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ error: "Username required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const classes = await Class.find({
            students: user._id
        });

        res.json(classes);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//get all classes taught by a professor
router.get("/professor", async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ error: "Username required" });
        }

        const professor = await User.findOne({ username });
        if (!professor) {
            return res.status(404).json({ error: "Professor not found" });
        }

        const classes = await Class.find({ professorId: professor._id });

        res.json(classes);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//get all groups in a class
router.get("/:classId/groups", async (req, res) => {
    try {
        const { classId } = req.params;

        const classDoc = await Class.findById(classId).populate("groups");
        if (!classDoc) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.json(classDoc.groups);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//get student specific group
router.get("/:classId/student-group", async (req, res) => {
    try {
        const { classId } = req.params;
        const { username } = req.query;
        if (!username) return res.status(400).json({ error: "Username required" });

        const user = await User.findOne({ username });
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
router.post("/join", async (req, res) => {
    console.log("Join route hit", req.body);
    try {
        const { classId, username } = req.body;
        if (!classId || !username) return res.status(400).json({ error: "ClassId and username required" });

        const student = await User.findOne({ username });
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
router.post("/create", async (req, res) => {
    try {
        const { name, professorUsername } = req.body;

        if (!name || !professorUsername) {
            return res.status(400).json({ error: "Name and professorUsername required" });
        }

        const professor = await User.findOne({ username: professorUsername });
        if (!professor) return res.status(404).json({ error: "Professor not found" });

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
router.delete("/:classId", async (req, res) => {
    try {
        const { classId } = req.params;
        const { professorUsername } = req.body;

        if (!professorUsername) {
            return res.status(400).json({ error: "Professor username required" });
        }

        const professor = await User.findOne({ username: professorUsername });
        if (!professor) return res.status(404).json({ error: "Professor not found" });

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
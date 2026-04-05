const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const Class = require("../models/Class");
const User = require("../models/User");
const auth = require("../middleware/auth");


// =============================
// CREATE GROUP
// =============================
router.post("/create", auth, async (req, res) => {
    try {
        const { name, classId } = req.body;

        if (!name || !classId) {
            return res.status(400).json({ error: "Name and classId required" });
        }

        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return res.status(404).json({ error: "Class not found" });
        }

        const newGroup = new Group({
            name,
            classId,
            members: []
        });

        await newGroup.save();

        // 🔥 IMPORTANT: link to class
        classDoc.groups.push(newGroup._id);
        await classDoc.save();

        res.json({ message: "Group created", group: newGroup });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =============================
// DELETE GROUP
// =============================
router.delete("/:groupId", auth, async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // remove from class
        await Class.findByIdAndUpdate(group.classId, {
            $pull: { groups: group._id }
        });

        await Group.findByIdAndDelete(groupId);

        res.json({ message: "Group deleted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =============================
// ADD STUDENT TO GROUP
// =============================
router.post("/:groupId/add", auth, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { username } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        if (!group.members.includes(user._id)) {
            group.members.push(user._id);
            await group.save();
        }

        res.json({ message: "Student added to group", group });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =============================
// REMOVE STUDENT FROM GROUP
// =============================
router.post("/:groupId/remove", auth, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        group.members = group.members.filter(
            id => id.toString() !== userId
        );

        await group.save();

        res.json({ message: "Student removed", group });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
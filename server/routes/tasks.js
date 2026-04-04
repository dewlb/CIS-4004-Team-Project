const express = require("express");
const router = express.Router();

const Task = require("../models/Task");
const Class = require("../models/Class");   // needed for class checks
const Group = require("../models/Group");   // needed for group checks

const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");


// =============================
//      PROFESSOR ROUTES
// =============================

// CREATE TASK
router.post("/", auth, authorizeRoles("professor"), async (req, res) => {
  try {
    const { title, description, assignedToUser, assignedToClass, assignedToGroup, dueDate } = req.body;

    const targets = [assignedToUser, assignedToClass, assignedToGroup].filter(Boolean);
    if (targets.length !== 1) {
      return res.status(400).json({
        message: "Task must be assigned to exactly ONE of: user, class, or group"
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedToUser,
      assignedToClass,
      assignedToGroup,
      dueDate,
      createdBy: req.user._id
    });

    res.status(201).json(task);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ASSIGN / REASSIGN TASK
router.put("/:id/assign", auth, authorizeRoles("professor"), async (req, res) => {
  try {
    const { assignedToUser, assignedToClass, assignedToGroup } = req.body;

    const targets = [assignedToUser, assignedToClass, assignedToGroup].filter(Boolean);
    if (targets.length !== 1) {
      return res.status(400).json({
        message: "Task must be assigned to exactly ONE of: user, class, or group"
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        assignedToUser,
        assignedToClass,
        assignedToGroup
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE TASK
router.delete("/:id", auth, authorizeRoles("professor"), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
//         STUDENT ROUTES
// =============================

// UPDATE STATUS (ONLY thing students can do)
router.put("/:id/status", auth, authorizeRoles("student"), async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user._id.toString();

    if (!["to-do", "in-progress", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    let isAssigned = false;

    if (task.assignedToUser && task.assignedToUser.toString() === userId) {
    isAssigned = true;
    }

    if (!isAssigned && task.assignedToClass) {
    const classDoc = await Class.findById(task.assignedToClass);

    if (classDoc?.students?.some(id => id.toString() === userId)) {
        isAssigned = true;
    }
    }

    if (!isAssigned && task.assignedToGroup) {
    const groupDoc = await Group.findById(task.assignedToGroup);

    if (groupDoc?.members?.some(id => id.toString() === userId)) {
        isAssigned = true;
    }
    }

    if (!isAssigned) {
      return res.status(403).json({ message: "Not assigned to this task" });
    }

    task.status = status;

    await task.save();

    res.json(task);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
//          GET ROUTES
// =============================

// GET ALL TASKS
router.get("/", auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "professor") {
      tasks = await Task.find({ createdBy: req.user._id });
    } else {
      tasks = await Task.find({ assignedToUser: req.user._id });
    }

    res.json(tasks);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET SINGLE TASK
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
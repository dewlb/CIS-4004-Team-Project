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
      createdBy: req.user.id
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


// DELETE TASK (Soft delete)
// Professors can delete any task they created
// Students can only delete completed tasks assigned to them
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.isDeleted) {
      return res.status(400).json({ message: "Task already deleted" });
    }

    const userId = req.user._id.toString();

    if (req.user.role === "professor") {
      // Professors can delete any task they created
      if (task.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this task" });
      }
    } else if (req.user.role === "student") {
      // Students can only delete completed tasks assigned to them
      if (task.status !== "done") {
        return res.status(403).json({ message: "Can only delete completed tasks" });
      }

      // Check if task is assigned to the student
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
    }

    // Perform soft delete
    task.isDeleted = true;
    task.deletedAt = new Date();
    task.deletedBy = req.user._id;
    await task.save();

    res.json({ message: "Task deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET DELETED TASKS
router.get("/deleted/all", auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "professor") {
      tasks = await Task.find({ createdBy: req.user.id, isDeleted: true });
    } else {
      // For students, get deleted tasks assigned to them
      const userId = req.user._id;
      
      // Find all classes the student is in
      const studentClasses = await Class.find({ students: userId });
      const classIds = studentClasses.map(c => c._id);
      
      // Find all groups the student is in
      const studentGroups = await Group.find({ members: userId });
      const groupIds = studentGroups.map(g => g._id);
      
      // Get all deleted tasks assigned to user, their classes, or their groups
      tasks = await Task.find({
        isDeleted: true,
        $or: [
          { assignedToUser: userId },
          { assignedToClass: { $in: classIds } },
          { assignedToGroup: { $in: groupIds } }
        ]
      });
    }

    res.json(tasks);

  } catch (err) {
    console.error('Error fetching deleted tasks:', err);
    res.status(500).json({ error: err.message });
  }
});


// RESTORE DELETED TASK
router.put("/:id/restore", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.isDeleted) {
      return res.status(400).json({ message: "Task is not deleted" });
    }

    const userId = req.user._id.toString();

    if (req.user.role === "professor") {
      // Professors can restore tasks they created
      if (task.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to restore this task" });
      }
    } else if (req.user.role === "student") {
      // Students can restore tasks assigned to them
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
    }

    // Restore the task
    task.isDeleted = false;
    task.deletedAt = undefined;
    task.deletedBy = undefined;
    await task.save();

    res.json(task);

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

// GET ALL TASKS (excluding deleted)
router.get("/", auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "professor") {
      tasks = await Task.find({ createdBy: req.user.id, isDeleted: false });
    } else {
      // For students, get tasks assigned to them directly, their classes, and their groups
      const userId = req.user._id;
      
      // Find all classes the student is in
      const studentClasses = await Class.find({ students: userId });
      const classIds = studentClasses.map(c => c._id);
      
      // Find all groups the student is in
      const studentGroups = await Group.find({ members: userId });
      const groupIds = studentGroups.map(g => g._id);
      
      // Get all tasks assigned to user, their classes, or their groups (excluding deleted)
      tasks = await Task.find({
        isDeleted: false,
        $or: [
          { assignedToUser: userId },
          { assignedToClass: { $in: classIds } },
          { assignedToGroup: { $in: groupIds } }
        ]
      });
    }

    res.json(tasks);

  } catch (err) {
    console.error('Error fetching tasks:', err);
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
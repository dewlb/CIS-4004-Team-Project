const express = require("express");
const router = express.Router();

const Task = require("../models/Task");
const Class = require("../models/Class");   // needed for class checks
const Group = require("../models/Group");   // needed for group checks
const StudentTaskPreference = require("../models/StudentTaskPreference");
const StudentTaskProgress = require("../models/StudentTaskProgress");
const { updateStudentProgress, calculateTaskStatus, getOrCreateProgress } = require("../utils/taskStatus");

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
      { returnDocument: 'after' }
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
// Professors: soft delete (affects all students viewing the task)
// Students: hide task (only affects their own view)
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = req.user._id.toString();

    // Log for debugging
    console.log("DELETE request - User role:", req.user.role, "User ID:", userId);

    if (req.user.role === "professor") {
      // Professors can delete any task they created (soft delete affects everyone)
      if (task.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this task" });
      }

      if (task.isDeleted) {
        return res.status(400).json({ message: "Task already deleted" });
      }

      console.log("Professor deleting task - performing soft delete");

      // Perform soft delete
      task.isDeleted = true;
      task.deletedAt = new Date();
      task.deletedBy = req.user._id;
      await task.save();

      // Remove task from all students' trash bins (delete their hide preferences)
      await StudentTaskPreference.deleteMany({ taskId: req.params.id });
      console.log("Removed task from student trash bins");

      // Clean up student progress records for this task
      await StudentTaskProgress.deleteMany({ taskId: req.params.id });
      console.log("Cleaned up student progress records");

      res.json({ message: "Task deleted" });

    } else if (req.user.role === "student") {
      // Students can hide tasks assigned to them (per-student hiding)
      console.log("Student hiding task - creating preference");
      
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

      // Create or update student preference to hide this task
      const preference = await StudentTaskPreference.findOneAndUpdate(
        { studentId: req.user._id, taskId: req.params.id },
        { isHidden: true, hiddenAt: new Date() },
        { upsert: true, returnDocument: 'after' }
      );

      console.log("Created student preference:", preference);

      res.json({ message: "Task hidden from your view" });
    } else {
      // Unknown role
      console.log("Unknown role attempting to delete:", req.user.role);
      return res.status(403).json({ message: "Invalid user role" });
    }

  } catch (err) {
    console.error("Error in DELETE task:", err);
    res.status(500).json({ error: err.message });
  }
});


// GET DELETED/HIDDEN TASKS
// Professors: see tasks they soft-deleted
// Students: see tasks they hid from their view
router.get("/deleted/all", auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "professor") {
      // Professors see tasks they soft-deleted
      tasks = await Task.find({ createdBy: req.user.id, isDeleted: true });
    } else {
      // Students see tasks they've hidden
      const userId = req.user._id;
      
      // Find all hidden tasks for this student
      const hiddenPreferences = await StudentTaskPreference.find({
        studentId: userId,
        isHidden: true
      }).select('taskId');
      
      const hiddenTaskIds = hiddenPreferences.map(pref => pref.taskId);
      
      // Get the actual task documents, but exclude tasks that professors have deleted
      tasks = await Task.find({ 
        _id: { $in: hiddenTaskIds },
        isDeleted: false  // Only show tasks that haven't been deleted by professor
      });
    }

    res.json(tasks);

  } catch (err) {
    console.error('Error fetching deleted tasks:', err);
    res.status(500).json({ error: err.message });
  }
});


// RESTORE DELETED/HIDDEN TASK
// Professors: restore soft-deleted tasks
// Students: unhide tasks from their view
router.put("/:id/restore", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = req.user._id.toString();

    if (req.user.role === "professor") {
      // Professors can restore tasks they soft-deleted
      if (!task.isDeleted) {
        return res.status(400).json({ message: "Task is not deleted" });
      }

      if (task.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to restore this task" });
      }

      // Restore the task
      task.isDeleted = false;
      task.deletedAt = undefined;
      task.deletedBy = undefined;
      await task.save();

      res.json(task);

    } else if (req.user.role === "student") {
      // Students can unhide tasks they've hidden
      
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

      // Remove the hidden preference
      await StudentTaskPreference.findOneAndDelete({
        studentId: req.user._id,
        taskId: req.params.id
      });

      res.json(task);
    }

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

    // Update individual student's progress
    await updateStudentProgress(userId, task._id, status);

    // Calculate and update the aggregated task status for professors
    const aggregatedStatus = await calculateTaskStatus(task);
    task.status = aggregatedStatus;
    await task.save();

    res.json(task);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
//          GET ROUTES
// =============================

// GET ALL TASKS (excluding deleted/hidden)
router.get("/", auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "professor") {
      tasks = await Task.find({ createdBy: req.user.id, isDeleted: false });
      
      // Calculate aggregated status for each task
      tasks = await Promise.all(tasks.map(async (task) => {
        try {
          const calculatedStatus = await calculateTaskStatus(task);
          const taskObj = task.toObject();
          taskObj.status = calculatedStatus;
          return taskObj;
        } catch (err) {
          console.error(`Error calculating status for task ${task._id}:`, err);
          // Return task with its current status if calculation fails
          return task.toObject();
        }
      }));
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

      // Filter out tasks that the student has hidden
      const hiddenPreferences = await StudentTaskPreference.find({
        studentId: userId,
        isHidden: true
      }).select('taskId');
      
      const hiddenTaskIds = new Set(hiddenPreferences.map(pref => pref.taskId.toString()));
      
      tasks = tasks.filter(task => !hiddenTaskIds.has(task._id.toString()));
      
      // Add individual student's progress status to each task
      tasks = await Promise.all(tasks.map(async (task) => {
        try {
          const progress = await getOrCreateProgress(userId, task._id);
          const taskObj = task.toObject();
          taskObj.studentStatus = progress.status; // Individual student's status
          taskObj.completed = progress.status === 'done'; // For backward compatibility
          return taskObj;
        } catch (err) {
          console.error(`Error getting progress for task ${task._id}:`, err);
          // Return task with default status if progress fetch fails
          const taskObj = task.toObject();
          taskObj.studentStatus = 'to-do';
          taskObj.completed = false;
          return taskObj;
        }
      }));
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
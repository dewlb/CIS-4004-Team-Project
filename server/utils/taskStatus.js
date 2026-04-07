const StudentTaskProgress = require('../models/StudentTaskProgress');
const User = require('../models/User');
const Class = require('../models/Class');
const Group = require('../models/Group');

/**
 * Get all student IDs assigned to a task
 * @param {Object} task - Task document
 * @returns {Promise<Array>} Array of student ObjectIds
 */
async function getAssignedStudents(task) {
  const studentIds = [];

  if (task.assignedToUser) {
    // Task assigned to individual student
    studentIds.push(task.assignedToUser);
  } else if (task.assignedToClass) {
    // Task assigned to entire class - get all students in the class
    const classDoc = await Class.findById(task.assignedToClass);
    if (classDoc && classDoc.students) {
      studentIds.push(...classDoc.students);
    }
  } else if (task.assignedToGroup) {
    // Task assigned to group - get all members in the group
    const group = await Group.findById(task.assignedToGroup);
    if (group && group.members) {
      studentIds.push(...group.members);
    }
  }

  return studentIds;
}

/**
 * Calculate aggregated task status for professors based on student progress
 * Rules:
 * - "to-do": No students have started (default)
 * - "in-progress": At least one student has started but not all have completed
 * - "done": All assigned students have completed
 * 
 * @param {Object} task - Task document
 * @returns {Promise<String>} Calculated status: "to-do", "in-progress", or "done"
 */
async function calculateTaskStatus(task) {
  const assignedStudents = await getAssignedStudents(task);
  
  if (assignedStudents.length === 0) {
    return 'to-do';
  }

  // Get progress for all assigned students
  const progressRecords = await StudentTaskProgress.find({
    taskId: task._id,
    studentId: { $in: assignedStudents }
  });

  // Count how many students have started and completed
  let inProgressCount = 0;
  let completedCount = 0;

  progressRecords.forEach(progress => {
    if (progress.status === 'done') {
      completedCount++;
    } else if (progress.status === 'in-progress') {
      inProgressCount++;
    }
  });

  // Determine overall status
  if (completedCount === assignedStudents.length) {
    return 'done';
  } else if (inProgressCount > 0 || completedCount > 0) {
    return 'in-progress';
  } else {
    return 'to-do';
  }
}

/**
 * Get or create student task progress record
 * @param {ObjectId} studentId 
 * @param {ObjectId} taskId 
 * @returns {Promise<Object>} StudentTaskProgress document
 */
async function getOrCreateProgress(studentId, taskId) {
  // Use findOneAndUpdate with upsert to handle race conditions
  const progress = await StudentTaskProgress.findOneAndUpdate(
    { studentId, taskId },
    { 
      $setOnInsert: { 
        studentId, 
        taskId, 
        status: 'to-do' 
      } 
    },
    { 
      upsert: true, 
      returnDocument: 'after'
    }
  );

  return progress;
}

/**
 * Update student progress for a task
 * @param {ObjectId} studentId 
 * @param {ObjectId} taskId 
 * @param {String} newStatus - "to-do", "in-progress", or "done"
 * @returns {Promise<Object>} Updated progress document
 */
async function updateStudentProgress(studentId, taskId, newStatus) {
  const progress = await getOrCreateProgress(studentId, taskId);
  
  progress.status = newStatus;
  
  if (newStatus === 'in-progress' && !progress.startedAt) {
    progress.startedAt = new Date();
  } else if (newStatus === 'done' && !progress.completedAt) {
    progress.completedAt = new Date();
  } else if (newStatus === 'to-do') {
    progress.startedAt = null;
    progress.completedAt = null;
  }

  await progress.save();
  return progress;
}

module.exports = {
  getAssignedStudents,
  calculateTaskStatus,
  getOrCreateProgress,
  updateStudentProgress
};

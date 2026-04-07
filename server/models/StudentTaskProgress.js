const mongoose = require('mongoose');

const studentTaskProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  status: {
    type: String,
    enum: ['to-do', 'in-progress', 'done'],
    default: 'to-do'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create compound index to ensure one progress record per student-task pair
studentTaskProgressSchema.index({ studentId: 1, taskId: 1 }, { unique: true });

module.exports = mongoose.model('StudentTaskProgress', studentTaskProgressSchema);

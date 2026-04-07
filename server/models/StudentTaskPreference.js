const mongoose = require("mongoose");

const studentTaskPreferenceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: true,
    },
    hiddenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one preference per student per task
studentTaskPreferenceSchema.index({ studentId: 1, taskId: 1 }, { unique: true });

module.exports = mongoose.model("StudentTaskPreference", studentTaskPreferenceSchema);

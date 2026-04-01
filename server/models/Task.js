const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    // Task information
    title: {
        type: String,
        required: true
    },
    description: String,

    // Who created this task
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Who is this assigned to
    assignedToUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    assignedToClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    },
    assignedToGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },

    // Progress status of the task
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },

    // Due date for the task
    dueDate: Date,
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema, "Tasks");
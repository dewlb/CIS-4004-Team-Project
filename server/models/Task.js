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

    // Student progress on this task
    progress: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            status: {
                type: String,
                enum: ["todo", "in-progress", "done"],
                default: "todo"
            }
        }
    ],

    // Due date for the task
    dueDate: Date,
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema, "Tasks");
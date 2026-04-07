const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

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

    status: {
        type: String,
        enum: ["to-do", "in-progress", "done"],
        default: "to-do"
    },

    dueDate: Date,

    // Soft delete fields
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });


// ENFORCE EXACTLY ONE ASSIGNMENT

taskSchema.pre("save", function (next) {
    const count =
        (this.assignedToUser ? 1 : 0) +
        (this.assignedToClass ? 1 : 0) +
        (this.assignedToGroup ? 1 : 0);

    if (count !== 1) {
        return next(new Error("Task must be assigned to exactly one target (user, class, or group)"));
    }
});

module.exports = mongoose.model("Task", taskSchema, "Tasks");
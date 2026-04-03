const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    // Group information
    name: {
        type: String,
        required: true
    },

    // Which class this group belongs to
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },

    // Professor who manages this group
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Which students are in this group
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    // Tasks assigned to this group
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }],

    // Permissions for this group
    permissions: {
        // If true, all members can add tasks
        canAddTasks: {
            type: Boolean,
            default: false
        },

        // If specified, only these students can add tasks
        allowedStudents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    }

}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema, "Groups");
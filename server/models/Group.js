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

    // Which students are in this group
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    // Permissions for this group
    permissions: {
        canAddTasks: {
            type: Boolean,
            default: false
        }
    }

}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema, "Groups");
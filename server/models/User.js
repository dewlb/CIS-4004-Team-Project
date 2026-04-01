const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    // First name, last name, username, password, role (student or professor)
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["student", "professor"],
        required: true
    },

    // For professors, which classes they teach
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    }],

    // For students, which groups they are in
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema, "Users");
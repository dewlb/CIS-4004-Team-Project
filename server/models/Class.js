const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    // Class information
    name: {
        type: String,
        required: true
    },
    section: String,

    // Which professor teaches this class
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Which students are in this class
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    // Which groups are in this class
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }]

}, { timestamps: true });

module.exports = mongoose.model("Class", classSchema, "Classes");
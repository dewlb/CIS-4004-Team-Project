const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    name: String,
    email: String
});

module.exports = mongoose.model("Task", taskSchema, "Tasks");
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    name: String,
    email: String
});

module.exports = mongoose.model("Class", classSchema, "Classes");
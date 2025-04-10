const mongoose = require("mongoose");

const newSchema = new mongoose.Schema({});

const New = mongoose.model("New", newSchema);

module.exports = New;

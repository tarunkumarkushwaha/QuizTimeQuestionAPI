const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String
});

module.exports = mongoose.model("Javascript", questionSchema, "javascript");

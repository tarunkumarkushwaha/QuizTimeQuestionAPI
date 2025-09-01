const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String
});

function getQuestionModel(topic) {
  const name = topic.toLowerCase();
  return mongoose.model(name, questionSchema, name);
}

module.exports = getQuestionModel;


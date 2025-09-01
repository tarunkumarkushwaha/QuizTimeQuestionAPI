const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  option1: { type: String, required: true },
  option2: { type: String, required: true },
  option3: { type: String, required: true },
  option4: { type: String, required: true },
  correctresponse: { type: String, required: true },
  time: { type: Number, default: 1 }
});

function getQuestionModel(topic) {
  const name = topic.toLowerCase();
  return mongoose.model(name, questionSchema, name);
}

module.exports = getQuestionModel;


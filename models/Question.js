const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  question: { type: String, required: true },
  option1: String,
  option2: String,
  option3: String,
  option4: String,
  correctresponse: String,
  time: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Question", questionSchema);



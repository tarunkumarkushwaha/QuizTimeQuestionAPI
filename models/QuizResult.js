const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number, 
      required: true,
    },
    accuracy: {
      type: Number, 
    },
  },
  { timestamps: true }
);

// Auto-calc accuracy
quizResultSchema.pre("save", function (next) {
  this.accuracy = (this.correctAnswers / this.totalQuestions) * 100;
  next();
});

module.exports = mongoose.model("QuizResult", quizResultSchema);

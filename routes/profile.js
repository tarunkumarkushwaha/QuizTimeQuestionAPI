const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Question = require("../models/Question");
const Discussion = require("../models/Discussion");
const QuizResult = require("../models/QuizResult");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [questionCount, discussionCount, resultCount] = await Promise.all([
      Question.countDocuments({ userId }),
      Discussion.countDocuments({ userId }),
      QuizResult.countDocuments({ userId }),
    ]);

    const performance = await QuizResult.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          totalQuestions: { $sum: "$totalQuestions" },
          correctAnswers: { $sum: "$correctAnswers" },
          averageScore: { $avg: "$score" },
          averageAccuracy: { $avg: "$accuracy" },
        },
      },
    ]);

    res.json({
      questionsCreated: questionCount,
      discussions: discussionCount,
      testsTaken: resultCount,
      performance: performance[0] || {
        totalTests: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        averageAccuracy: 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/questions", verifyToken, async (req, res) => {
  try {
    const questions = await Question.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/discussions", verifyToken, async (req, res) => {
  try {
    const discussions = await Discussion.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(discussions);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/results", verifyToken, async (req, res) => {
  try {
    const results = await QuizResult.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;

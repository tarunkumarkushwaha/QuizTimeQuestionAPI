const router = require("express").Router();
const QuizResult = require("../models/QuizResult");
const verifyToken = require("../middleware/verifyToken");

const sortLogic = {
  score: -1,
  accuracy: -1,
  timeTaken: 1,
};

// 1. Static Routes FIRST
router.get("/global", verifyToken, async (req, res) => {
  try {
    const leaderboard = await QuizResult.find().sort(sortLogic).limit(50);
    res.json(leaderboard);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/weekly", verifyToken, async (req, res) => {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const allResults = await QuizResult.find(); // no filter

    const filtered = allResults
      .filter(item => new Date(item.createdAt) >= start)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return a.timeTaken - b.timeTaken;
      })
      .slice(0, 50);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/monthly", verifyToken, async (req, res) => {
  try {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);

    const allResults = await QuizResult.find();

    const filtered = allResults
      .filter(item => new Date(item.createdAt) >= start)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return a.timeTaken - b.timeTaken;
      })
      .slice(0, 50);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/subject/:subject", verifyToken, async (req, res) => {
  try {
    const leaderboard = await QuizResult.find({
      subject: req.params.subject
    }).sort(sortLogic).limit(50);
    res.json(leaderboard);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
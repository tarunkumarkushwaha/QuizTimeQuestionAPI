const router = require("express").Router();
const QuizResult = require("../models/QuizResult");

/**
 * Ranking priority:
 * 1. Score (DESC)
 * 2. Accuracy (DESC)
 * 3. Time Taken (ASC)
 */

const sortLogic = {
  score: -1,
  accuracy: -1,
  timeTaken: 1,
};

router.get("/global", async (req, res) => {
  try {
    const leaderboard = await QuizResult.find()
      .sort(sortLogic)
      .limit(50);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/subject/:subject", async (req, res) => {
  try {
    const leaderboard = await QuizResult.find({
      subject: req.params.subject,
    })
      .sort(sortLogic)
      .limit(50);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/weekly", async (req, res) => {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const leaderboard = await QuizResult.find({
      createdAt: { $gte: start },
    })
      .sort(sortLogic)
      .limit(50);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);

    const leaderboard = await QuizResult.find({
      createdAt: { $gte: start },
    })
      .sort(sortLogic)
      .limit(50);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
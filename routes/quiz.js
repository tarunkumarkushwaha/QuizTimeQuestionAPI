const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// dynamic import for static files
router.get('/questions/:topic', async (req, res) => {
  const topic = req.params.topic;

  try {
    const module = await import(`./public/questions/${topic}.js`);
    res.json(module.default);
  } catch (error) {
    res.status(404).json({ error: 'Questions file not found' });
  }
});

// Example MongoDB insert (optional)
router.post("/add", async (req, res) => {
  try {
    const newQ = await Question.create(req.body);
    res.json(newQ);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const getQuestionModel = require("../models/question");

router.get("/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;
    const Question = getQuestionModel(topic);   
    const allQs = await Question.find();
    res.json(allQs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new question for a topic
router.post("/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;
    const Question = getQuestionModel(topic);
    const newQ = await Question.create(req.body);
    res.json(newQ);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single question by ID
router.get("/:topic/:id", async (req, res) => {
  try {
    const { topic, id } = req.params;
    const Question = getQuestionModel(topic);
    const q = await Question.findById(id);
    if (!q) return res.status(404).json({ error: "Question not found" });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update question by ID
router.put("/:topic/:id", async (req, res) => {
  try {
    const { topic, id } = req.params;
    const Question = getQuestionModel(topic);
    const updatedQ = await Question.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedQ) return res.status(404).json({ error: "Question not found" });
    res.json(updatedQ);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete question by ID
router.delete("/:topic/:id", async (req, res) => {
  try {
    const { topic, id } = req.params;
    const Question = getQuestionModel(topic);
    const deletedQ = await Question.findByIdAndDelete(id);
    if (!deletedQ) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

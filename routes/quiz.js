const express = require("express");
const router = express.Router();
const Question = require("../models/Question"); // single model, not dynamic

// Delete all questions of a subject for the logged-in user
router.delete("/:subject", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { subject } = req.params;

    const result = await Question.deleteMany({ userId: req.session.userId, subject });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `No questions found for subject '${subject}'` });
    }

    res.status(200).json({ message: `All questions for '${subject}' deleted successfully.` });
  } catch (err) {
    console.error("Error deleting subject:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all subjects for the logged-in user
router.get("/allsubjects", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const subjects = await Question.distinct("subject", { userId: req.session.userId });

    res.status(200).json({ subjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all questions for a subject
router.get("/:subject", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { subject } = req.params;
    const questions = await Question.find({ userId: req.session.userId, subject });

    res.json({ data: questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new question for a subject
router.post("/:subject", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { subject } = req.params;
    const newQ = new Question({
      ...req.body,
      userId: req.session.userId,
      subject
    });

    await newQ.save();
    res.json(newQ);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single question by ID
router.get("/:subject/:id", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { subject, id } = req.params;
    const q = await Question.findOne({ _id: id, userId: req.session.userId, subject });

    if (!q) return res.status(404).json({ error: "Question not found" });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update question by ID
router.put("/:subject/:id", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { subject, id } = req.params;
    const updatedQ = await Question.findOneAndUpdate(
      { _id: id, userId: req.session.userId, subject },
      req.body,
      { new: true }
    );

    if (!updatedQ) return res.status(404).json({ error: "Question not found" });
    res.json(updatedQ);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete single question by ID
router.delete("/:subject/:id", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { subject, id } = req.params;
    const deletedQ = await Question.findOneAndDelete({ _id: id, userId: req.session.userId, subject });

    if (!deletedQ) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

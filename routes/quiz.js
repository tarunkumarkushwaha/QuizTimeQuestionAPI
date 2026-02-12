const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const verifyToken = require("../middleware/verifyToken")
const jwt = require("jsonwebtoken");

// Middleware to verify access token
// function verifyToken(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ error: "No token provided" });

//   const token = authHeader.split(" ")[1]; // Bearer <token>
//   jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ error: "Invalid token" });
//     req.user = decoded;
//     next();
//   });
// }

// Delete all questions of a subject for the logged-in user
router.delete("/:subject", verifyToken, async (req, res) => {
  try {
    const { subject } = req.params;
    const result = await Question.deleteMany({ userId: req.user.userId, subject });

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
router.get("/allsubjects", verifyToken, async (req, res) => {
  try {
    const subjects = await Question.distinct("subject", { userId: req.user.userId });
    res.status(200).json({ subjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all questions for a subject
router.get("/:subject", verifyToken, async (req, res) => {
  try {
    const { subject } = req.params;
    const questions = await Question.find({ userId: req.user.userId, subject });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new question for a subject
router.post("/:subject", verifyToken, async (req, res) => {
  try {
    const { subject } = req.params;
    const newQ = new Question({
      ...req.body,
      userId: req.user.userId,
      subject,
    });
    await newQ.save();
    res.json(newQ);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / bulk subject
router.post("/bulk/:subject", verifyToken, async (req, res) => {
  try {
    const { questions } = req.body;
    const subject = req.params.subject;
    const userId = req.user.userId; 

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "No questions provided" });
    }

    const formatted = questions.map((q) => ({
      ...q,
      subject,
      userId,
    }));

    await Question.insertMany(formatted);

    res.status(201).json({ message: "Questions added successfully" });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ error: "Server error while uploading questions" });
  }
});



// Get single question by ID
router.get("/:subject/:id", verifyToken, async (req, res) => {
  try {
    const { subject, id } = req.params;
    const q = await Question.findOne({ _id: id, userId: req.user.userId, subject });
    if (!q) return res.status(404).json({ error: "Question not found" });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update question by ID
router.put("/:subject/:id", verifyToken, async (req, res) => {
  try {
    const { subject, id } = req.params;
    const updatedQ = await Question.findOneAndUpdate(
      { _id: id, userId: req.user.userId, subject },
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
router.delete("/:subject/:id", verifyToken, async (req, res) => {
  try {
    const { subject, id } = req.params;
    const deletedQ = await Question.findOneAndDelete({ _id: id, userId: req.user.userId, subject });
    if (!deletedQ) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

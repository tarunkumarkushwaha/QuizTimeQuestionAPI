const express = require("express");
const router = express.Router();
const getQuestionModel = require("../models/Question");
const mongoose = require("mongoose");

router.delete("/:name", async (req, res) => {
  const collectionName = req.params.name;

  try {
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {
      return res.status(404).json({ error: `Collection '${collectionName}' not found.` });
    }

    await mongoose.connection.db.dropCollection(collectionName);

    res.status(200).json({ message: `Collection '${collectionName}' deleted successfully.` });
  } catch (err) {
    console.error("Error deleting collection:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/allsubjects", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(collection => collection.name);
    res.status(200).json({ subjectss: collectionNames });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
router.delete("/delete/:topic/:id", async (req, res) => {
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

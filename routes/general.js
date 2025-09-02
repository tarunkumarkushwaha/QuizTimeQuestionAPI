const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/hello", (req, res) => {
  res.send("Hello Worlddd!");
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/templates/index.html"));
});

router.get("/quiz/quizmanager", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/templates/quizmanager.html"));
});

router.post("/", (req, res) => {
  res.send("Hello POST req");
});

// load question data dynamically
router.get("/questions/:topic", (req, res) => {
  try {
    const questions = require(path.join(__dirname, `../public/questions/${req.params.topic}.js`));
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Questions file not found" });
  }
});

module.exports = router;


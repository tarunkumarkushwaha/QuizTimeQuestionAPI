const express = require("express");
const router = express.Router();
const path = require("path");

// ✅ test route
router.get("/hello", (req, res) => {
  res.send("Hello Worlddd!");
});

// ✅ serve index.html from /public/templates
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/templates/index.html"));
});

// ✅ POST example
router.post("/", (req, res) => {
  res.send("Hello POST req");
});

// ✅ load question data dynamically
router.get("/questions/:topic", (req, res) => {
  try {
    // require instead of import for CommonJS
    const questions = require(path.join(__dirname, `../public/questions/${req.params.topic}.js`));
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Questions file not found" });
  }
});

module.exports = router;


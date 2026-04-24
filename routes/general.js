const express = require("express");
const router = express.Router();
const path = require("path");
const rateLimit = require("express-rate-limit");
const getquestion = require("../controlers/generalroutecontroler")

router.get("/hello", (req, res) => {
  res.send("Hello Worlddd!");
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/templates/index.html"));
});

// router.get("/what", (req, res) => {
//   console.log(req.query)
//   res.send("Hello POST req");
// });

// load question data dynamically

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: { error: "Too many requests, take a breather!" }
});

router.get("/questions/:topic", publicLimiter, getquestion);
// router.get("/questions/:topic", getquestion);

module.exports = router;


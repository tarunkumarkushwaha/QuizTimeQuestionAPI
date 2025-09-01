const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const convertJsonString = require("../utils/parseJson");

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let AIquestions = `[{"question": "question","option1": "optiona","option2": "optionb","option3": "optionc","option4": "optiond","correctresponse": "optiona","time": 1}]`;

router.get("/", async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const count = req.query.count || 10;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const topic = `${prompt} ${count} questions in this format ${AIquestions}`;
    const result = await model.generateContent(topic);
    const text = (await result.response).text();

    const parsedQuestions = convertJsonString(text);

    res.json({
      time: parsedQuestions.length,
      question: parsedQuestions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

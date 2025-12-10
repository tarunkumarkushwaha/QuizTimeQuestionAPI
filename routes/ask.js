const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const convertJsonString = require("../utils/parseJson");

const router = express.Router();

// Initialize Gemini (NO key? pass inside constructor)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Use latest working model
const MODEL_NAME = "gemini-2.5-flash";

let AIquestions = `[{"question": "question","option1": "optiona","option2": "optionb","option3": "optionc","option4": "optiond","correctresponse": "optiona","time": 1}]`;

// ROUTE
router.get("/", async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const count = req.query.count || 10;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const topic = `${prompt} ${count} questions in this format ${AIquestions}`;

    // NEW SDK FORMAT
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: topic
    });

    const text = result.text;

    const parsedQuestions = convertJsonString(text);

    res.json({
      time: parsedQuestions.length,
      question: parsedQuestions
    });

  } catch (err) {
    console.error("GEMINI ERROR:", err);
    res.status(500).json({ error: err.message || "Gemini API failed" });
  }
});

module.exports = router;


// old code


// const express = require("express");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const convertJsonString = require("../utils/parseJson");

// const router = express.Router();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// let AIquestions = `[{"question": "question","option1": "optiona","option2": "optionb","option3": "optionc","option4": "optiond","correctresponse": "optiona","time": 1}]`;

// // Middleware to verify access token
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

// router.get("/", async (req, res) => {
//   try {
//     const prompt = req.query.prompt;
//     const count = req.query.count || 10;

//     if (!prompt) {
//       return res.status(400).json({ error: "Prompt required" });
//     }

//     const topic = `${prompt} ${count} questions in this format ${AIquestions}`;
//     const result = await model.generateContent(topic);
//     const text = (await result.response).text();

//     const parsedQuestions = convertJsonString(text);

//     res.json({
//       time: parsedQuestions.length,
//       question: parsedQuestions
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

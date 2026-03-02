const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const convertJsonString = require("../utils/parseJson");
const verifyToken = require("../middleware/verifyToken")
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Initialize Gemini (NO key? pass inside constructor)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Use latest working model !!!! very very very importabnt
const MODEL_NAME = "gemini-2.5-flash";

let AIquestions = `[{"question": "any question","option1": "any name a","option2": "any name b","option3": "any name c","option4": "any name d","correctresponse": "any name d","time": 1}]`;

// ROUTE
router.get("/", verifyToken, async (req, res) => {
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
router.get("/explain", verifyToken, async (req, res) => {
  try {
    const prompt = req.query.question;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const topic = `Explain this question in maximum 300 words:\n${prompt}`;

    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: topic
    });

    const explanationText =
      result?.candidates?.[0]?.content?.parts
        ?.map(p => p.text)
        .join("") || "";

    // if (!explanationText.trim()) {
    //   return res.status(500).json({ error: "Empty response from Gemini" });
    // }

    res.json({
      question: prompt,
      explanation: explanationText
    });

  } catch (err) {
    console.error("GEMINI ERROR:", err);
    res.status(500).json({ error: err.message || "Gemini API failed" });
  }
});


// pdf upload

// Convert file to Gemini format
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

// Extract JSON array safely from AI response
function extractJSONArray(text) {
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found");
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("JSON Parse Error:", err);
    throw new Error("Invalid JSON returned from AI");
  }
}

// Safe file delete
function safeDelete(path) {
  try {
    if (path && fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  } catch (err) {
    console.error("File delete error:", err);
  }
}

// Route
router.post(
  "/generate-from-pdf",
  upload.single("pdf"),
  verifyToken,
  async (req, res) => {
    let filePath = null;

    try {
      const { count = 10 } = req.body;
      const pdfFile = req.file;

      if (!pdfFile) {
        return res.status(400).json({
          error: "PDF file is required",
        });
      }

      filePath = pdfFile.path;

      const pdfPart = fileToGenerativePart(filePath, "application/pdf");

      const prompt = `
Based on the attached PDF, generate ${count} interview questions.

Return ONLY a valid JSON array.
Do not include markdown.
Do not include explanation.

Format example:
${AIquestions}
`;

      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: "user",
            parts: [pdfPart, { text: prompt }],
          },
        ],
      });

      const text =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        result?.response?.text() ||
        "";

      const parsedQuestions = extractJSONArray(text);

      //       let parsedQuestions = [
      //   {
      //     "question": "What is the SI derived unit of electric charge?",
      //     "option1": "Ampere",
      //     "option2": "Volt",
      //     "option3": "Coulomb",
      //     "option4": "Ohm",
      //     "correctresponse": "Coulomb",
      //     "time": 1
      //   },
      //   {
      //     "question": "Who was the first to note the discrete nature of electric charge in electrolysis experiments?",
      //     "option1": "Charles-François de Cisternay du Fay",
      //     "option2": "Benjamin Franklin",
      //     "option3": "Michael Faraday",
      //     "option4": "Robert Millikan",
      //     "correctresponse": "Michael Faraday",
      //     "time": 1
      //   }
      // ]

      res.json({
        success: true,
        count: parsedQuestions.length,
        questions: parsedQuestions,
      });
    } catch (err) {
      console.error("GEMINI ERROR:", err);

      res.status(500).json({
        success: false,
        error: "Failed to process PDF",
      });
    } finally {
      safeDelete(filePath);
    }
  }
);



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

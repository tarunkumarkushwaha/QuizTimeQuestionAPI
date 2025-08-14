const express = require("express");
const cors = require("cors");
const blog = require("./routes/blogs.js");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "https://quiztimefrontend.onrender.com", // your deployed frontend
  "http://localhost:5173", // optional: keep for local dev
  "http://localhost:3000" // optional: keep for local dev
];

app.use(
  cors({
    origin: "*"    // for dev
    // function (origin, callback) {
    //   if (!origin || allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // }
  })
);
app.use(express.static('public'))      // to use files publicly
app.use('/blogs', blog)

app.get('/hello', (req, res) => {
  res.send('Hello Worlddd!')
})

app.get('/', (req, res) => {
  res.sendFile('templetes/index.html', { root: __dirname })   // set root directory
})

app.get('/questions/:topic', async (req, res) => {
  const topic = req.params.topic;

  try {
    const module = await import(`./public/questions/${topic}.js`);
    res.json(module.default);
  } catch (error) {
    res.status(404).json({ error: 'Questions file not found' });
  }
});


app.post('/', (req, res) => {
  res.send('Hello post reeq')
  //   console.log("post req")
})

app.get('/questiondata/:data', (req, res) => {
  res.send(`question ${req.params.data}`)
  //   console.log(req.query)
})

// AI stuff 

// fixed format
let AIquestions = `[{"question": "question","option1": "optiona","option2": "optionb","option3": "optionc","option4": "optiond","correctresponse": "optiona","time": 1} ,]`;

function convertJsonString(input) {
  const cleaned = input
    .replace(/```json\s*/g, '') 
    .replace(/```/g, '')        
    .trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("Invalid JSON input");
    return [];
  }

  return parsed.map(item => ({
    question: item.question,
    option1: item.option1,
    option2: item.option2,
    option3: item.option3,
    option4: item.option4,
    correctresponse: item.correctresponse,
    time: item.time
  }));
}

app.get("/ask", async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const count = req.query.count || 10;

    if (!prompt || !count) {
      return res.status(400).json({ error: "Topic and count are required" });
    }

    const topic = `${prompt} ${count} questions in this format ${AIquestions}`;

    const result = await model.generateContent(topic);
    const response = await result.response;
    const text = response.text();

    const parsedQuestions = convertJsonString(text);

    res.json({
      time: parsedQuestions.length,
      question: parsedQuestions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
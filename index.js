const express = require("express");
const blog = require("./routes/blogs.js");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const app = express();
const port = 3000;


app.use(express.static('public'))      // to use files publicly
app.use('/blogs', blog)

app.get('/hello', (req, res) => {
  res.send('Hello Worlddd!')
})

// app.get('/index', (req, res) => {
//   res.sendFile('H:/codes/BackEnd Projects/QuizTimeQuestionAPI/servefiles/index.html')
// })

app.get('/', (req, res) => {
  res.sendFile('templetes/index.html', { root: __dirname })   // set root directory
})

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
let AIquestions = `[{"question": "HTML stands for?","option1": "Hypertext Markup Language","option2": "Hyper Makeup Language","option3": "Web development","option4": "Hamara Mark Language","correctresponse": "Hypertext Markup Language","time": 1} ,]`;

function convertJsonString(input) {
  // Remove the triple backticks and any "json" annotation
  const cleaned = input
    .replace(/```json\s*/g, '') // remove starting ```json
    .replace(/```/g, '')        // remove ending ```
    .trim();

  // Parse into a JavaScript object
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("Invalid JSON input");
    return [];
  }

  // Optionally, map it to ensure only desired keys remain
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
    const prompt = `${req.query.prompt} questions in this format ${AIquestions}`; 

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Run Gemini API request
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Send JSON response
    res.json({
      time : [...convertJsonString(text)].length ,
      question: convertJsonString(text),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const generalRoutes = require("./routes/general");
const quizRoutes = require("./routes/quiz");
const aiRoutes = require("./routes/ask");

const app = express();
const port = process.env.PORT || 3000;

// CORS config
const allowedOrigins = [
  "https://quiztimefrontend.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: "*", // allow all in dev
    // origin: function (origin, callback) {
    //   if (!origin || allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // }
  })
);

app.use(express.json());
app.use(express.static("public"));

// Connect DB
connectDB();

// Routes
app.use("/", generalRoutes);
app.use("/quiz", quizRoutes);
app.use("/ask", aiRoutes);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
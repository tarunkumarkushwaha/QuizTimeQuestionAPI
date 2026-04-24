const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const path = require("path");
// const session = require("express-session");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
const generalRoutes = require("./routes/general");
const quizRoutes = require("./routes/quiz");
const aiRoutes = require("./routes/ask");
const discussionRoutes = require("./routes/discussion")
const resultRoutes = require("./routes/results")
const leadersRoutes = require("./routes/leaderboard")
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const verifyToken = require("./middleware/verifyToken");

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Max 10 attempts per 15 mins
  message: "Too many attempts, try again later."
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const port = process.env.PORT || 3000;

// for testing only
// app.get("/config", (req, res) => {
//   res.json({ port });
// });

// CORS config

const allowedOrigins = [
  "https://quiztimefrontend.onrender.com",
  "https://quizotg.netlify.app",
  "http://localhost:5173",  // turn off in dev pls
  "http://localhost:8081",   // turn off in dev pls
  // "http://localhost:3000"   // turn off in dev pls
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true // Required for session cookies
  })
);

// Connect DB
connectDB();

app.use(express.urlencoded({ extended: true }));
// app.use(session({
//   secret: process.env.PASSWORD,
//   resave: false,
//   saveUninitialized: true
// }));


// Login route

app.post("/login", authLimiter, async (req, res) => {
  try {
    // const { username, password } = req.body;
    const username = req.body.username ? String(req.body.username).trim() : null;
    const password = req.body.password ? String(req.body.password) : null;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Use schema method
    const isMatch = await user.comparePassword(password.trim());
    if (!isMatch) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    res.json({ success: true, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error logging in" });
  }
});


// signup route 

app.post("/signup", authLimiter, async (req, res) => {
  try {
    const username = req.body.username ? String(req.body.username).trim() : null;
    const password = req.body.password ? String(req.body.password) : null;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const user = new User({
      username,
      password: password.trim()
    });

    await user.save();

    res.json({ message: "User created successfully" });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: "Error creating user" });
  }
});



app.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(200).json({ accessToken: null, message: "No refresh token" });
  }

  jwt.verify(token, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      return res.status(401).json({ accessToken: null });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  });
});




// Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully" });
});

app.get("/api/check-auth", verifyToken, (req, res) => {
  res.json({
    loggedIn: true,
    user: {
      userId: req.user.userId,
      username: req.user.username
    }
  });
});


// Routes
app.use("/", generalRoutes);
app.use("/quiz", quizRoutes);
app.use("/ask", aiRoutes);
app.use("/results", resultRoutes);
app.use("/leaderboard", leadersRoutes);
app.use("/discussions", discussionRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
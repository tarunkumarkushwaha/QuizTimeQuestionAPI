const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const session = require("express-session");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
const generalRoutes = require("./routes/general");
const quizRoutes = require("./routes/quiz");
const aiRoutes = require("./routes/ask");
const discussionRoutes = require("./routes/discussion")

const app = express();
const port = process.env.PORT || 3000;

app.get("/config", (req, res) => {
  res.json({ port });
});

app.use(cookieParser());

// CORS config

const allowedOrigins = [
  "https://quiztimefrontend.onrender.com",
  "https://quizotg.netlify.app",
  "http://localhost:5173",
  "http://localhost:8081",
  // "http://localhost:3000"
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


app.use(express.json());


// Connect DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.PASSWORD,
  resave: false,
  saveUninitialized: true
}));


// Login route

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Wrong password" });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" } // short-lived
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,     // 7 days
    });


    // Send access token in response
    res.json({ success: true, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error logging in" });
  }
});



// signup route 

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send("Missing fields");
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).send("Username already taken");

    const hashed = await bcrypt.hash(password, 10);
    await new User({ username, password: hashed }).save();
    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

app.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    // instead of bare 401, send JSON with message
    return res.status(200).json({ accessToken: null, message: "No refresh token" });
  }

  jwt.verify(token, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(200).json({ accessToken: null, message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  });
});




// Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

app.get("/api/check-auth", (req, res) => {
  if (req.session.loggedIn) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});


// Routes
app.use("/", generalRoutes);
app.use("/quiz", quizRoutes);
app.use("/ask", aiRoutes);
app.use("/discussions", discussionRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
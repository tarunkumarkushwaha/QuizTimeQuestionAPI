const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const session = require("express-session");
const User = require("./models/User");


const connectDB = require("./db");
const generalRoutes = require("./routes/general");
const quizRoutes = require("./routes/quiz");
const aiRoutes = require("./routes/ask");

const app = express();
const port = process.env.PORT || 3000;

app.get("/config", (req, res) => {
  res.json({ port });
});

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


// Connect DB
connectDB();

app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public/templates"));
app.use(session({
  secret: process.env.PASSWORD,
  resave: false,
  saveUninitialized: true
}));



// Auth middleware
function requireLogin(req, res, next) {
  if (req.session.loggedIn && req.session.userId) {
    return next();
  }

  const wantsJSON = req.xhr || req.headers.accept?.includes("application/json");

  if (wantsJSON) {
    return res.status(401).json({ error: "Unauthorized. Please login first." });
  } else {
    req.session.redirectTo = req.originalUrl;
    return res.redirect("/login.html");
  }
}


// Login route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("User not found <a href='/login.html'>Try again</a>");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send("Wrong password! <a href='/login.html'>Try again</a>");
    }

    // Save login session
    req.session.loggedIn = true;
    req.session.userId = user._id;

    const redirectTo = req.session.redirectTo || "/quizmanager";
    delete req.session.redirectTo;
    res.redirect(redirectTo);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});


// signup route 

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const user = new User({ username, password });
    await user.save();

    res.redirect("/login.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});


// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.send("Error while logging out");
    }
    res.clearCookie("connect.sid"); // remove session cookie
    res.redirect("/login.html"); // back to login
  });
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
app.use("/quiz", requireLogin, quizRoutes);
app.use("/ask", aiRoutes);

app.get("/quizmanager", requireLogin, (req, res) => {
  res.sendFile(__dirname + "/templates/quizmanager.html");
});

// for testing and skipping login
// app.use("/quiz",  quizRoutes);
// app.get("/quizmanager", (req, res) => {
//   res.sendFile(__dirname + "/templates/quizmanager.html");
// });

app.use(express.static("public/templates"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const session = require("express-session");


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
  if (req.session.loggedIn) {
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
app.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.PASSWORD) {
    req.session.loggedIn = true;

    // Redirect to saved page or default to /quiz
    const redirectTo = req.session.redirectTo || "/quizmanager";
    delete req.session.redirectTo;
    res.redirect(redirectTo);

  } else {
    res.send("Wrong password! <a href='/login.html'>Try aagain</a>");
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
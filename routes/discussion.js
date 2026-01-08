const express = require("express");
const router = express.Router();
const Discussion = require("../models/Discussion");
const jwt = require("jsonwebtoken");

// Middleware to verify access token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

router.post("/", verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Post content required" });

    const newPost = new Discussion({
      userId: req.user.userId,
      username: req.user.username,
      content,
      subjectName,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Discussion.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update post (only if created by same user)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Discussion.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { content: req.body.content },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: "Post not found or unauthorized" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete post
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Discussion.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!deleted) return res.status(404).json({ error: "Post not found or unauthorized" });
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Like a post
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.likes += 1;
    await post.save();
    res.json({ message: "Post liked", likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add a comment
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Comment text required" });

    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({
      userId: req.user.userId,
      username: req.user.username,
      text,
    });

    await post.save();
    res.json({ message: "Comment added", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
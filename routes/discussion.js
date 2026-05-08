const express = require("express");
const router = express.Router();
const Discussion = require("../models/Discussion");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");

// add post route
router.post("/", verifyToken, async (req, res) => {
  try {
    const { content, subject } = req.body;
    if (!content)
      return res.status(400).json({ error: "Post content required" });

    const newPost = new Discussion({
      userId: req.user.userId,
      username: req.user.username,
      subjectName: subject,
      content,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// getpost route
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const posts = await Discussion.find().sort({ createdAt: -1 }).lean();

    const formattedPosts = posts.map((post) => ({
      ...post,
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      userLiked: post.likes.some((id) => id.toString() === userId),
      userDisliked: post.dislikes.some((id) => id.toString() === userId),
    }));

    res.json(formattedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// getpost by id / get indivisual post
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const userId = req.user.userId;

    res.json({
      ...post._doc,
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      userLiked: post.likes.some((id) => id.toString() === userId),
      userDisliked: post.dislikes.some((id) => id.toString() === userId),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update post route
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Discussion.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { content: req.body.content },
      { new: true },
    );
    if (!post)
      return res.status(404).json({ error: "Post not found or unauthorized" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete post route
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Discussion.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!deleted)
      return res.status(404).json({ error: "Post not found or unauthorized" });
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST like
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);
    const alreadyDisliked = post.dislikes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
      if (alreadyDisliked) {
        post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);
      }
    }

    await post.save();

    res.json({
      ...post._doc,
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      userLiked: post.likes.some((id) => id.toString() === userId),
      userDisliked: post.dislikes.some((id) => id.toString() === userId),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// dislike
router.post("/:id/dislike", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const post = await Discussion.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);
    const alreadyDisliked = post.dislikes.includes(userId);

    if (alreadyDisliked) {
      post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);
    } else {
      post.dislikes.push(userId);
      if (alreadyLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== userId);
      }
    }

    await post.save();

    res.json({
      ...post._doc,
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      userLiked: post.likes.some((id) => id.toString() === userId),
      userDisliked: post.dislikes.some((id) => id.toString() === userId),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// comment route
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

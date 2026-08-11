const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const Question = require("../models/Question");
const Discussion = require("../models/Discussion");
const QuizResult = require("../models/QuizResult");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload.js");

// GET tha profile

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [user, profile] = await Promise.all([
      User.findById(userId).select("-password"),
      UserProfile.findOne({ userId }),
    ]);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        createdAt: user.createdAt,
      },

      profile: profile || {
        userId,
        displayName: "",
        profilePic: "",
        bio: "",
        location: "",
        website: "",
      },
    });
  } catch (err) {
    console.error("Profile error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// GET tha stats
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const [questionCount, discussionCount, resultCount] = await Promise.all([
      Question.countDocuments({ userId }),
      Discussion.countDocuments({ userId }),
      QuizResult.countDocuments({ userId }),
    ]);

    const performance = await QuizResult.aggregate([
      {
        $match: {
          userId: objectUserId,
        },
      },
      {
        $group: {
          _id: null,

          totalTests: {
            $sum: 1,
          },

          totalQuestions: {
            $sum: "$totalQuestions",
          },

          correctAnswers: {
            $sum: "$correctAnswers",
          },

          averageScore: {
            $avg: "$score",
          },

          averageAccuracy: {
            $avg: "$accuracy",
          },
        },
      },
    ]);

    const performanceData = performance[0] || {
      totalTests: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0,
      averageAccuracy: 0,
    };

    res.json({
      questionsCreated: questionCount,
      discussions: discussionCount,
      testsTaken: resultCount,

      performance: {
        totalTests: performanceData.totalTests,
        totalQuestions: performanceData.totalQuestions,
        correctAnswers: performanceData.correctAnswers,

        averageScore: Number((performanceData.averageScore || 0).toFixed(2)),

        averageAccuracy: Number(
          (performanceData.averageAccuracy || 0).toFixed(2),
        ),
      },
    });
  } catch (err) {
    console.error("Stats error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/questions", verifyToken, async (req, res) => {
  try {
    const questions = await Question.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/discussions", verifyToken, async (req, res) => {
  try {
    const discussions = await Discussion.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(discussions);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/results", verifyToken, async (req, res) => {
  try {
    const results = await QuizResult.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET /profile/dashboard
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const [user, profile, questions, discussions, results, performance] =
      await Promise.all([
        User.findById(userId).select("-password"),

        UserProfile.findOne({ userId }),

        Question.find({ userId }).sort({ createdAt: -1 }).limit(10),

        Discussion.find({ userId }).sort({ createdAt: -1 }).limit(10),

        QuizResult.find({ userId }).sort({ createdAt: -1 }).limit(10),

        QuizResult.aggregate([
          {
            $match: {
              userId: objectUserId,
            },
          },
          {
            $group: {
              _id: null,

              testsTaken: {
                $sum: 1,
              },

              totalQuestions: {
                $sum: "$totalQuestions",
              },

              correctAnswers: {
                $sum: "$correctAnswers",
              },

              averageScore: {
                $avg: "$score",
              },

              averageAccuracy: {
                $avg: "$accuracy",
              },

              bestScore: {
                $max: "$score",
              },
            },
          },
        ]),
      ]);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const stats = performance[0] || {
      testsTaken: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0,
      averageAccuracy: 0,
      bestScore: 0,
    };

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        createdAt: user.createdAt,
      },

      profile: profile || {
        userId,
        displayName: "",
        profilePic: "",
        bio: "",
        location: "",
        website: "",
      },

      stats: {
        testsTaken: stats.testsTaken,
        totalQuestions: stats.totalQuestions,
        correctAnswers: stats.correctAnswers,
        averageScore: Number((stats.averageScore || 0).toFixed(2)),
        averageAccuracy: Number((stats.averageAccuracy || 0).toFixed(2)),
        bestScore: stats.bestScore || 0,
        questionsCreated: await Question.countDocuments({ userId }),
        discussions: await Discussion.countDocuments({ userId }),
      },

      recentQuestions: questions,
      recentDiscussions: discussions,
      recentResults: results,
    });
  } catch (err) {
    console.error("Profile dashboard error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

router.put("/", verifyToken, upload.single("profilePic"), async (req, res) => {
  try {
    const userId = req.user.userId;

    const { username, displayName, bio, location, website } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (username !== undefined && username.trim() !== "") {
      const newUsername = username.trim();

      if (newUsername !== user.username) {
        const existingUser = await User.findOne({
          username: newUsername,
          _id: { $ne: userId },
        });

        if (existingUser) {
          return res.status(409).json({
            message: "Username already exists",
          });
        }

        user.username = newUsername;

        await user.save();
      }
    }

    let profile = await UserProfile.findOne({
      userId,
    });

    if (!profile) {
      profile = new UserProfile({
        userId,
      });
    }

    if (displayName !== undefined) {
      profile.displayName = displayName;
    }

    if (bio !== undefined) {
      profile.bio = bio;
    }

    if (location !== undefined) {
      profile.location = location;
    }

    if (website !== undefined) {
      profile.website = website;
    }

    if (req.file) {
      // Delete old image
      if (profile.profilePicPublicId) {
        try {
          await cloudinary.uploader.destroy(profile.profilePicPublicId);
        } catch (error) {
          console.error("Failed to delete old profile picture:", error);
        }
      }

      // Upload new image
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "quizotg/profile-pictures",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        uploadStream.end(req.file.buffer);
      });

      profile.profilePic = uploadResult.secure_url;
      profile.profilePicPublicId = uploadResult.public_id;
    }

    await profile.save();

    res.json({
      message: "Profile updated successfully",

      user: {
        id: user._id,
        username: user.username,
      },

      profile: {
        userId: profile.userId,
        displayName: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        profilePic: profile.profilePic,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);

    res.status(500).json({
      message: "Failed to update profile",
      error: err.message,
    });
  }
});

module.exports = router;

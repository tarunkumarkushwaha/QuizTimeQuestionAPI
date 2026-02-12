const router = require("express").Router();
const QuizResult = require("../models/QuizResult");
const verifyToken = require("../middleware/verifyToken");


router.get("/result", verifyToken, async (req, res) => {
  try {
    const results = await QuizResult.find({
      userId: req.user.userId,
    })
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            // userName,
            subject,
            score,
            totalQuestions,
            correctAnswers,
            timeTaken,
        } = req.body;

        // console.log(req.user)

        const existing = await QuizResult.findOne({
            userId: req.user.userId,
            subject,
        });

        if (existing) {
            if (score > existing.score) {
                existing.score = score;
                existing.timeTaken = timeTaken;
                existing.correctAnswers = correctAnswers;
                existing.totalQuestions = totalQuestions;
                await existing.save();

                return res.json({
                    message: "OO better score, Improvement, try to improve more",
                    result: existing,
                });
            }

            return res.json({
                message: "try again, performance is not satisfactory",
            });
        }



        const result = new QuizResult({
            userId: req.user.userId,
            username: req.user.username,
            subject,
            score,
            totalQuestions,
            correctAnswers,
            timeTaken,
        });

        await result.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
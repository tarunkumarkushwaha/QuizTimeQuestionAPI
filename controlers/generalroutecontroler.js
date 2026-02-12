const path = require("path");

const getquestion = async (req, res) => {
    try {
        const questions = require(path.join(__dirname, `../public/questions/${req.params.topic}.js`));
        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: "Questions file not found" });
    }
}


module.exports = getquestion
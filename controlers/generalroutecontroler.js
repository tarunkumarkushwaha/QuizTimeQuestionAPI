const path = require("path");
const fs = require("fs");

const getquestion = async (req, res) => {
    try {
        const { topic } = req.params;

        const safeTopic = topic.replace(/[^a-zA-Z0-9-]/g, "");

        if (!safeTopic) {
            return res.status(400).json({ error: "Invalid topic format" });
        }

        const filePath = path.join(__dirname, `../public/questions/${safeTopic}.js`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Questions not found" });
        }

        const questions = require(filePath);
        res.json(questions);
    } catch (err) {
        console.error("General Route Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = getquestion;
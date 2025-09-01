function convertJsonString(input) {
  const cleaned = input
    .replace(/```json\s*/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("Invalid JSON input");
    return [];
  }

  return parsed.map(item => ({
    question: item.question,
    option1: item.option1,
    option2: item.option2,
    option3: item.option3,
    option4: item.option4,
    correctresponse: item.correctresponse,
    time: item.time
  }));
}

module.exports = convertJsonString;

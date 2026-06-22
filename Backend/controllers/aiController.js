const { openai, DEFAULT_MODEL } = require("../utils/openAI");

const extractContent = (response) => {
  if (!response || !response.choices) return "";
  return response.choices[0]?.message?.content?.trim() || "";
};

exports.generateAnnouncement = async (req, res) => {
  try {
    const { topic, audience, tone, department, priority } = req.body;
    if (!topic) {
      return res.status(400).json({ message: "Topic is required." });
    }

    const prompt = `Create a short internal company announcement with a clear title and description. Topic: ${topic}. Audience: ${audience || "All employees"}. Tone: ${tone || "Professional"}. Department: ${department || "General"}. Priority: ${priority || "Medium"}.`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an HR assistant that writes clear internal announcements." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const aiText = extractContent(response);
    const [titleLine, ...descriptionLines] = aiText.split("\n").filter(Boolean);
    const title = titleLine || `Announcement: ${topic}`;
    const description = descriptionLines.join(" ") || aiText;

    res.status(200).json({ title, description });
  } catch (error) {
    console.error("AI announcement error:", error);
    res.status(500).json({ message: "Unable to generate announcement.", error: error.message });
  }
};

exports.generateJobDescription = async (req, res) => {
  try {
    const {
      jobTitle,
      department,
      requiredSkills = [],
      qualifications,
      experience,
      location,
      jobType,
      numberOfPositions,
    } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ message: "Job title is required." });
    }

    const skills = Array.isArray(requiredSkills)
      ? requiredSkills.filter(Boolean)
      : String(requiredSkills)
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

    const prompt = `Write an improved and engaging job description for the following role. Title: ${jobTitle}. Department: ${department || "General"}. Required skills: ${skills.length ? skills.join(", ") : "None specified"}. Qualifications: ${qualifications || "Not provided"}. Experience: ${experience || "Not provided"}. Location: ${location || "Not specified"}. Job type: ${jobType || "Full-time"}. Number of positions: ${numberOfPositions || 1}.`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an HR assistant that writes clear, inclusive job descriptions." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const jobDescription = extractContent(response);
    res.status(200).json({ jobDescription });
  } catch (error) {
    console.error("AI job description error:", error);
    res.status(500).json({ message: "Unable to generate job description.", error: error.message });
  }
};

exports.summarizeText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required to summarize." });
    }

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an HR knowledge assistant that summarizes documents clearly." },
        { role: "user", content: `Summarize the following text in two or three concise sentences:\n\n${text}` },
      ],
      temperature: 0.5,
    });

    const summary = extractContent(response);
    res.status(200).json({ summary });
  } catch (error) {
    console.error("AI summary error:", error);
    res.status(500).json({ message: "Unable to summarize text.", error: error.message });
  }
};

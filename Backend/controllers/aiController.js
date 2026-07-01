/**
 * AI Controller Module
 * Handles AI-powered features for HR management system
 * Integrates with OpenAI API to generate announcements, job descriptions, and summarize content
 */

// Import OpenAI client and default model configuration
const { openai, DEFAULT_MODEL } = require("../utils/openAI");

/**
 * Helper function to extract content from OpenAI API response
 * @param {Object} response - The response object from OpenAI API
 * @returns {string} Extracted text content from the AI response, or empty string if not available
 */
const extractContent = (response) => {
  // Check if response and choices exist, return empty string if missing
  if (!response || !response.choices) return "";
  // Extract text content from first choice and trim whitespace, fallback to empty string
  return response.choices[0]?.message?.content?.trim() || "";
};

/**
 * Generates an AI-powered company announcement
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.topic - Required: The announcement topic/subject
 * @param {string} [req.body.audience] - Target audience for the announcement (default: "All employees")
 * @param {string} [req.body.tone] - Tone of the announcement (default: "Professional")
 * @param {string} [req.body.department] - Department related to announcement (default: "General")
 * @param {string} [req.body.priority] - Priority level of announcement (default: "Medium")
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with generated title and description
 */
exports.generateAnnouncement = async (req, res) => {
  try {
    // Extract parameters from request body
    const { topic, audience, tone, department, priority } = req.body;
    
    // Validate that topic is provided - it's a required field
    if (!topic) {
      return res.status(400).json({ message: "Topic is required." });
    }

    // Build the prompt for OpenAI with all announcement parameters
    // Use default values if optional parameters are not provided
    const prompt = `Create a short internal company announcement with a clear title and description. Topic: ${topic}. Audience: ${audience || "All employees"}. Tone: ${tone || "Professional"}. Department: ${department || "General"}. Priority: ${priority || "Medium"}.`;

    // Call OpenAI API with system and user messages to generate the announcement
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an HR assistant that writes clear internal announcements." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7, // Use moderate creativity (0.7) for professional announcements
    });

    // Extract the generated text from OpenAI response
    const aiText = extractContent(response);
    
    // Split response into title (first line) and description (remaining lines)
    const [titleLine, ...descriptionLines] = aiText.split("\n").filter(Boolean);
    
    // Use generated title or fallback to a default title with the topic
    const title = titleLine || `Announcement: ${topic}`;
    
    // Join remaining lines as description or use entire response as fallback
    const description = descriptionLines.join(" ") || aiText;

    // Return generated announcement with 200 OK status
    res.status(200).json({ title, description });
  } catch (error) {
    // Log error details for debugging
    console.error("AI announcement error:", error);
    // Return 500 error with user-friendly message
    res.status(500).json({ message: "Unable to generate announcement.", error: error.message });
  }
};

/**
 * Generates an improved AI-powered job description
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.jobTitle - Required: The job title for the position
 * @param {string} [req.body.department] - Department for the job (default: "General")
 * @param {Array|string} [req.body.requiredSkills] - Array or comma-separated string of required skills
 * @param {string} [req.body.qualifications] - Required qualifications for the role
 * @param {string} [req.body.experience] - Required experience level
 * @param {string} [req.body.location] - Job location
 * @param {string} [req.body.jobType] - Type of employment (default: "Full-time")
 * @param {number} [req.body.numberOfPositions] - Number of open positions (default: 1)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with generated job description
 */
exports.generateJobDescription = async (req, res) => {
  try {
    // Destructure job parameters from request body with default values
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

    // Validate that job title is provided - it's a required field
    if (!jobTitle) {
      return res.status(400).json({ message: "Job title is required." });
    }

    // Process skills: handle both array input and comma-separated string input
    // Normalize to array format and filter out empty values
    const skills = Array.isArray(requiredSkills)
      ? requiredSkills.filter(Boolean) // Filter falsy values from array
      : String(requiredSkills) // Convert to string if not array
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean); // Filter empty strings after trimming

    // Build the prompt for OpenAI with all job parameters
    // Include skills as comma-separated list or "None specified" if empty
    const prompt = `Write an improved and engaging job description for the following role. Title: ${jobTitle}. Department: ${department || "General"}. Required skills: ${skills.length ? skills.join(", ") : "None specified"}. Qualifications: ${qualifications || "Not provided"}. Experience: ${experience || "Not provided"}. Location: ${location || "Not specified"}. Job type: ${jobType || "Full-time"}. Number of positions: ${numberOfPositions || 1}.`;

    // Call OpenAI API to generate an improved job description
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an HR assistant that writes clear, inclusive job descriptions." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7, // Moderate creativity for professional job descriptions
    });

    // Extract the generated job description from the response
    const jobDescription = extractContent(response);
    
    // Return generated job description with 200 OK status
    res.status(200).json({ jobDescription });
  } catch (error) {
    // Log error details for debugging
    console.error("AI job description error:", error);
    // Return 500 error with user-friendly message
    res.status(500).json({ message: "Unable to generate job description.", error: error.message });
  }
};

/**
 * Summarizes provided text into concise sentences using AI
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.text - Required: The text to summarize
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with generated summary
 */
exports.summarizeText = async (req, res) => {
  try {
    // Extract text from request body
    const { text } = req.body;
    
    // Validate that text is provided - it's a required field
    if (!text) {
      return res.status(400).json({ message: "Text is required to summarize." });
    }

    // Call OpenAI API to generate a summary of the provided text
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an HR knowledge assistant that summarizes documents clearly." },
        { role: "user", content: `Summarize the following text in two or three concise sentences:\n\n${text}` },
      ],
      temperature: 0.5, // Lower creativity (0.5) for more factual and accurate summaries
    });

    // Extract the generated summary from the response
    const summary = extractContent(response);
    
    // Return generated summary with 200 OK status
    res.status(200).json({ summary });
  } catch (error) {
    // Log error details for debugging
    console.error("AI summary error:", error);
    // Return 500 error with user-friendly message
    res.status(500).json({ message: "Unable to summarize text.", error: error.message });
  }
};

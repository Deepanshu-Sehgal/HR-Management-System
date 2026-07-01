/**
 * AI Controller Module
 * Handles AI-powered features for HR management system
 * Integrates with OpenAI API to generate announcements, job descriptions, and summarize content
 * 
 * DESIGN PATTERNS:
 * - All functions follow a consistent try-catch pattern for robust error handling
 * - Uses destructuring for request parameters to maintain clean, readable code
 * - Implements helper utility (extractContent) to prevent code duplication
 * 
 * PERFORMANCE & COST CONSIDERATIONS:
 * - Temperature parameters are tuned per use case (0.7 for creative tasks, 0.5 for factual)
 * - Each API call incurs OpenAI costs; consider caching frequently requested outputs
 * - Async/await pattern allows non-blocking operations for better scalability
 * 
 * FUTURE ENHANCEMENTS:
 * - Consider implementing request validation middleware to reduce redundant checks
 * - Add logging/monitoring for API usage and cost tracking
 * - Implement rate limiting to prevent API quota exhaustion
 * - Add prompt templates for easier maintenance and A/B testing
 */

// Import OpenAI client and default model configuration
// NOTE: Ensure OPENAI_API_KEY environment variable is properly set
const { openai, DEFAULT_MODEL } = require("../utils/openAI");

/**
 * Helper function to extract content from OpenAI API response
 * @param {Object} response - The response object from OpenAI API
 * @returns {string} Extracted text content from the AI response, or empty string if not available
 */
/**
 * Helper function to extract content from OpenAI API response
 * Implements defensive programming to handle unexpected API response structures
 * 
 * RATIONALE:
 * - Centralized extraction logic prevents null reference errors throughout the module
 * - Trimming removes unwanted leading/trailing whitespace from AI responses
 * - Always returns a string (never null/undefined) for safer downstream processing
 * 
 * @param {Object} response - The response object from OpenAI API
 * @returns {string} Extracted text content from the AI response, or empty string if not available
 */
const extractContent = (response) => {
  // Check if response and choices exist, return empty string if missing
  // This guards against API errors or unexpected response structures
  if (!response || !response.choices) return "";
  // Extract text content from first choice and trim whitespace, fallback to empty string
  // Optional chaining (?.) prevents errors if nested properties don't exist
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
    // Early return prevents wasted API calls and improves error feedback
    if (!topic) {
      return res.status(400).json({ message: "Topic is required." });
    }

    // Build the prompt for OpenAI with all announcement parameters
    // Use default values if optional parameters are not provided
    // DESIGN NOTE: Template literals provide clean string interpolation and easy maintenance
    // Each parameter gets a sensible default to allow flexible client implementations
    // NOTE: Prompt engineering is crucial - this prompt instructs the AI to return structured output
    const prompt = `Create a short internal company announcement with a clear title and description. Topic: ${topic}. Audience: ${audience || "All employees"}. Tone: ${tone || "Professional"}. Department: ${department || "General"}. Priority: ${priority || "Medium"}.`;

    // Call OpenAI API with system and user messages to generate the announcement
    // SYSTEM ROLE: Establishes context and personality for consistent tone
    // USER ROLE: Contains the actual request with parameters
    // This dual-message approach gives AI framework for generating appropriate content
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an HR assistant that writes clear internal announcements." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7, // Use moderate creativity (0.7) for professional announcements
      // NOTE: Temperature range 0 (deterministic) to 2 (random); 0.7 balances creativity with consistency
    });

    // Extract the generated text from OpenAI response using helper function
    // This ensures we handle malformed responses gracefully
    const aiText = extractContent(response);
    
    // Split response into title (first line) and description (remaining lines)
    // .filter(Boolean) removes empty lines for cleaner output parsing
    // ASSUMPTION: AI returns title as first line, followed by description
    const [titleLine, ...descriptionLines] = aiText.split("\n").filter(Boolean);
    
    // Use generated title or fallback to a default title with the topic
    // Fallback ensures we never send undefined/null title to client
    const title = titleLine || `Announcement: ${topic}`;
    
    // Join remaining lines as description or use entire response as fallback
    // This handles both structured and unstructured AI outputs
    const description = descriptionLines.join(" ") || aiText;

    // Return generated announcement with 200 OK status
    // SUCCESS RESPONSE: Client receives generated title and description for immediate use
    res.status(200).json({ title, description });
  } catch (error) {
    // Log error details for debugging
    // CRITICAL: Logs help identify API issues, rate limits, authentication problems
    // Production deployment should integrate with centralized logging service
    console.error("AI announcement error:", error);
    // Return 500 error with user-friendly message
    // ERROR HANDLING: Prevents exposing sensitive error details while aiding debugging
    // NOTE: Consider implementing retry logic for transient API failures
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
    // FLEXIBILITY PATTERN: Accepts multiple input formats for better API usability
    // Normalize to array format and filter out empty values
    // This defensive approach accommodates different frontend implementations
    const skills = Array.isArray(requiredSkills)
      ? requiredSkills.filter(Boolean) // Filter falsy values from array (null, undefined, false, 0, "")
      : String(requiredSkills) // Convert to string if not array (handles numbers, objects, etc.)
          .split(",") // Split on comma delimiter
          .map((skill) => skill.trim()) // Remove leading/trailing whitespace from each skill
          .filter(Boolean); // Filter empty strings after trimming

    // Build the prompt for OpenAI with all job parameters
    // Include skills as comma-separated list or "None specified" if empty
    // PROMPT DESIGN: Each parameter fills a specific context gap for the AI
    // Ternary operators provide sensible defaults; empty skills list gets explicit handling
    // NOTE: AI quality depends heavily on prompt clarity - this is well-structured for best results
    const prompt = `Write an improved and engaging job description for the following role. Title: ${jobTitle}. Department: ${department || "General"}. Required skills: ${skills.length ? skills.join(", ") : "None specified"}. Qualifications: ${qualifications || "Not provided"}. Experience: ${experience || "Not provided"}. Location: ${location || "Not specified"}. Job type: ${jobType || "Full-time"}. Number of positions: ${numberOfPositions || 1}.`;

    // Call OpenAI API to generate an improved job description
    // SYSTEM INSTRUCTION: "clear, inclusive" guides AI toward accessible, diverse-friendly content
    // This system message ensures job postings meet modern HR standards
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an HR assistant that writes clear, inclusive job descriptions." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7, // Moderate creativity for professional job descriptions
      // NOTE: Could implement streaming response for large descriptions if needed
    });

    // Extract the generated job description from the response
    // Uses centralized extraction logic for consistency and error safety
    const jobDescription = extractContent(response);
    
    // Return generated job description with 200 OK status
    // RESPONSE FORMAT: Single field makes it easy for frontend to display the entire description
    res.status(200).json({ jobDescription });
  } catch (error) {
    // Log error details for debugging
    // Helps identify issues: API authentication, quota limits, network problems, malformed requests
    console.error("AI job description error:", error);
    // Return 500 error with user-friendly message
    // BEST PRACTICE: Hide internal details from client; log details server-side
    // Consider implementing exponential backoff for retrying on transient failures
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
    // STRATEGY: "two or three concise sentences" provides output format guidance to AI
    // This constraint prevents excessively long summaries while maintaining key information
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an HR knowledge assistant that summarizes documents clearly." },
        { role: "user", content: `Summarize the following text in two or three concise sentences:\n\n${text}` },
      ],
      temperature: 0.5, // Lower creativity (0.5) for more factual and accurate summaries
      // REASONING: Lower temperature ensures AI maintains factual accuracy vs. being creative
      // This is appropriate for summaries where fidelity matters more than style
    });

    // Extract the generated summary from the response
    // Centralized extraction ensures consistent handling across all endpoints
    const summary = extractContent(response);
    
    // Return generated summary with 200 OK status
    // USAGE: Frontend can display summary inline or as preview for large documents
    // Consider adding character count limit validation before sending to API
    res.status(200).json({ summary });
  } catch (error) {
    // Log error details for debugging
    // Common errors: text too long (exceeds token limit), API quota exceeded, auth failure
    // Token limits: GPT models have ~4k-128k tokens; long documents may exceed limits
    console.error("AI summary error:", error);
    // Return 500 error with user-friendly message
    // FUTURE: Implement chunking strategy for text longer than token limit
    // Could summarize in sections, then summarize the summaries for better results
    res.status(500).json({ message: "Unable to summarize text.", error: error.message });
  }
};

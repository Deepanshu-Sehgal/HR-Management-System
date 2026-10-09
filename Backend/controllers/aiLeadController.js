/**
 * AI Lead Management
 * AI-assisted triage of pipeline leads (candidates): fit scoring, bulk
 * prioritization, and drafting personalized outreach emails. Reuses the shared
 * OpenAI client and mirrors the patterns in aiController.js.
 */
const { openai, DEFAULT_MODEL } = require("../utils/openAI");
const JobApplication = require("../models/JobApplication");
const JobOpening = require("../models/JobOpening");
const Pipeline = require("../models/Pipeline");
const logger = require("../utils/logger");

const extractContent = (response) =>
  response?.choices?.[0]?.message?.content?.trim() || "";

// Best-effort lookup of the linked job opening (jobOpeningId is stored as a
// string and may not be a valid ObjectId).
async function findJobOpening(jobOpeningId) {
  if (!jobOpeningId || !/^[0-9a-fA-F]{24}$/.test(jobOpeningId)) return null;
  try {
    return await JobOpening.findById(jobOpeningId);
  } catch {
    return null;
  }
}

function stageName(pipeline, stageKey) {
  return pipeline?.stages.find((s) => s.key === stageKey)?.name || stageKey || "n/a";
}

// Build the candidate-vs-role profile block fed to the model.
function buildProfile(app, job, pipeline) {
  const req = job
    ? [
        `Role: ${job.jobTitle} (${job.department || "n/a"})`,
        `Required skills: ${(job.requiredSkills || []).join(", ") || "n/a"}`,
        `Qualifications: ${job.qualifications || "n/a"}`,
        `Experience required: ${job.experience || "n/a"}`,
      ].join("\n")
    : `Role: ${app.jobTitle}`;

  const cand = [
    `Name: ${app.applicantName}`,
    `Experience: ${app.experience || "n/a"}`,
    `Qualifications: ${app.qualifications || "n/a"}`,
    `Cover letter: ${app.coverLetter || "n/a"}`,
    `Current stage: ${stageName(pipeline, app.stageKey)}`,
    `Recruiter rating: ${app.rating ? `${app.rating}/5` : "unrated"}`,
  ].join("\n");

  return `JOB REQUIREMENTS:\n${req}\n\nCANDIDATE PROFILE:\n${cand}`;
}

// Run one scoring completion and normalize the JSON result.
async function scoreOne(app, job, pipeline) {
  const prompt = `${buildProfile(app, job, pipeline)}

Assess how well this candidate fits the role. Respond ONLY with a JSON object:
{
  "score": <integer 0-100 overall fit>,
  "fit": "Strong" | "Moderate" | "Weak",
  "strengths": [<up to 3 short strings>],
  "concerns": [<up to 3 short strings>],
  "recommendedAction": "<one short next step for the recruiter>",
  "summary": "<one or two sentence rationale>"
}`;

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical recruiter that objectively scores candidate fit. Be concise and avoid bias based on names or personal attributes.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  let data;
  try {
    data = JSON.parse(extractContent(response));
  } catch {
    data = {};
  }

  const score = Math.max(0, Math.min(100, Math.round(Number(data.score) || 0)));
  const fit = ["Strong", "Moderate", "Weak"].includes(data.fit)
    ? data.fit
    : score >= 75
    ? "Strong"
    : score >= 50
    ? "Moderate"
    : "Weak";

  app.aiScore = score;
  app.aiFit = fit;
  app.aiInsights = {
    strengths: Array.isArray(data.strengths) ? data.strengths.slice(0, 3) : [],
    concerns: Array.isArray(data.concerns) ? data.concerns.slice(0, 3) : [],
    recommendedAction: data.recommendedAction || "",
    summary: data.summary || "",
    scoredAt: new Date(),
  };
  app.activities.push({
    type: "system",
    message: `AI scored this lead ${score}/100 (${fit} fit)`,
    by: "AI",
  });
  return app;
}

// ----- Score a single lead -----
exports.scoreLead = async (req, res) => {
  try {
    const app = await JobApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    const job = await findJobOpening(app.jobOpeningId);
    const pipeline = app.pipelineId ? await Pipeline.findById(app.pipelineId) : null;

    await scoreOne(app, job, pipeline);
    await app.save();
    res.status(200).json({ message: "Lead scored", application: app });
  } catch (error) {
    logger.error(`AI lead scoring failed: ${error.message}`);
    res.status(500).json({ message: "Unable to score lead.", error: error.message });
  }
};

// ----- Bulk prioritize: score every active, not-yet-scored lead -----
exports.prioritizeLeads = async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });

    const activeKeys = pipeline.stages
      .filter((s) => s.category === "active")
      .map((s) => s.key);

    const rescore = req.body?.rescore === true;
    const query = { pipelineId: pipeline._id, stageKey: { $in: activeKeys } };
    if (!rescore) query.aiScore = null;

    // Cap per run to control API cost/latency.
    const limit = Math.min(parseInt(req.body?.limit, 10) || 15, 25);
    const apps = await JobApplication.find(query).limit(limit);

    let scored = 0;
    for (const app of apps) {
      try {
        const job = await findJobOpening(app.jobOpeningId);
        await scoreOne(app, job, pipeline);
        await app.save();
        scored += 1;
      } catch (err) {
        logger.error(`AI prioritize error for ${app._id}: ${err.message}`);
      }
    }
    res.status(200).json({ message: "Prioritization complete", scored, scanned: apps.length });
  } catch (error) {
    logger.error(`AI prioritize failed: ${error.message}`);
    res.status(500).json({ message: "Unable to prioritize leads.", error: error.message });
  }
};

// ----- Draft a personalized outreach / follow-up email for a lead -----
exports.draftLeadEmail = async (req, res) => {
  try {
    const app = await JobApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    const pipeline = app.pipelineId ? await Pipeline.findById(app.pipelineId) : null;
    const purpose = req.body?.purpose || "a friendly status update and next steps";

    const prompt = `Write a short, warm, professional recruiting email to a candidate.
Candidate: ${app.applicantName}
Role: ${app.jobTitle}
Current stage: ${stageName(pipeline, app.stageKey)}
Purpose: ${purpose}

Respond ONLY with JSON: { "subject": "<subject line>", "body": "<email body, 3-6 sentences, no placeholders left unfilled>" }`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a recruiting coordinator who writes concise, personable candidate emails.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    let data;
    try {
      data = JSON.parse(extractContent(response));
    } catch {
      data = {};
    }
    res.status(200).json({
      subject: data.subject || `Update on your ${app.jobTitle} application`,
      body: data.body || "",
    });
  } catch (error) {
    logger.error(`AI email draft failed: ${error.message}`);
    res.status(500).json({ message: "Unable to draft email.", error: error.message });
  }
};

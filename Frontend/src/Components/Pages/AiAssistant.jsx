import React, { useState } from "react";
import { AiApi } from "../../redux/Services/ApiServices";
import styles from "./AiAssistant.module.css";

function AiAssistant() {
  const [announcementForm, setAnnouncementForm] = useState({
    topic: "",
    audience: "All employees",
    tone: "Professional",
    department: "General",
    priority: "Medium",
  });
  const [announcementResult, setAnnouncementResult] = useState(null);
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  const [jobForm, setJobForm] = useState({
    jobTitle: "",
    department: "",
    requiredSkills: "",
    qualifications: "",
    experience: "",
    location: "",
    jobType: "Full-time",
    numberOfPositions: 1,
  });
  const [jobDescription, setJobDescription] = useState("");
  const [jobLoading, setJobLoading] = useState(false);

  const [summaryText, setSummaryText] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [interviewForm, setInterviewForm] = useState({
    jobTitle: "",
    department: "",
    requiredSkills: "",
    experience: "",
    jobType: "Full-time",
    numberOfQuestions: 5,
  });
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [interviewLoading, setInterviewLoading] = useState(false);

  const [onboardingForm, setOnboardingForm] = useState({
    jobTitle: "",
    department: "",
    startDate: "",
    onboardingLengthDays: 30,
  });
  const [onboardingChecklist, setOnboardingChecklist] = useState([]);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const handleAnnouncementChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setAnnouncementLoading(true);
    setAnnouncementResult(null);

    try {
      const response = await AiApi.generateAnnouncement(announcementForm);
      setAnnouncementResult(response.data);
    } catch (error) {
      setAnnouncementResult({ title: "Error", description: error?.response?.data?.message || "Unable to create announcement." });
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setJobLoading(true);
    setJobDescription("");

    try {
      const payload = {
        ...jobForm,
        requiredSkills: jobForm.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };
      const response = await AiApi.generateJobDescription(payload);
      setJobDescription(response.data.jobDescription);
    } catch (error) {
      setJobDescription(error?.response?.data?.message || "Unable to generate job description.");
    } finally {
      setJobLoading(false);
    }
  };

  const handleInterviewChange = (e) => {
    const { name, value } = e.target;
    setInterviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    setInterviewLoading(true);
    setInterviewQuestions([]);

    try {
      const payload = {
        ...interviewForm,
        requiredSkills: interviewForm.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        numberOfQuestions: Number(interviewForm.numberOfQuestions) || 5,
      };
      const response = await AiApi.generateInterviewQuestions(payload);
      setInterviewQuestions(response.data.questions || []);
    } catch (error) {
      setInterviewQuestions([error?.response?.data?.message || "Unable to generate interview questions."]);
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleOnboardingChange = (e) => {
    const { name, value } = e.target;
    setOnboardingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setOnboardingLoading(true);
    setOnboardingChecklist([]);

    try {
      const payload = {
        ...onboardingForm,
        onboardingLengthDays: Number(onboardingForm.onboardingLengthDays) || 30,
      };
      const response = await AiApi.generateOnboardingChecklist(payload);
      setOnboardingChecklist(response.data.checklist || []);
    } catch (error) {
      setOnboardingChecklist([error?.response?.data?.message || "Unable to generate onboarding checklist."]);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleSummarySubmit = async (e) => {
    e.preventDefault();
    setSummaryLoading(true);
    setSummaryResult("");

    try {
      const response = await AiApi.summarizeText({ text: summaryText });
      setSummaryResult(response.data.summary);
    } catch (error) {
      setSummaryResult(error?.response?.data?.message || "Unable to summarize the text.");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>AI Assistant</h1>

      <section className={styles.card}>
        <h2>Generate Announcement</h2>
        <form onSubmit={handleAnnouncementSubmit} className={styles.form}>
          <input name="topic" value={announcementForm.topic} onChange={handleAnnouncementChange} placeholder="Announcement topic" required />
          <input name="audience" value={announcementForm.audience} onChange={handleAnnouncementChange} placeholder="Audience" />
          <input name="department" value={announcementForm.department} onChange={handleAnnouncementChange} placeholder="Department" />
          <input name="priority" value={announcementForm.priority} onChange={handleAnnouncementChange} placeholder="Priority" />
          <input name="tone" value={announcementForm.tone} onChange={handleAnnouncementChange} placeholder="Tone" />
          <button type="submit" disabled={announcementLoading}>
            {announcementLoading ? "Generating..." : "Generate Announcement"}
          </button>
        </form>
        {announcementResult && (
          <div className={styles.resultBox}>
            <h3>{announcementResult.title}</h3>
            <p>{announcementResult.description}</p>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2>Job Description Assistant</h2>
        <form onSubmit={handleJobSubmit} className={styles.form}>
          <input name="jobTitle" value={jobForm.jobTitle} onChange={handleJobChange} placeholder="Job Title" required />
          <input name="department" value={jobForm.department} onChange={handleJobChange} placeholder="Department" />
          <input name="requiredSkills" value={jobForm.requiredSkills} onChange={handleJobChange} placeholder="Required Skills (comma-separated)" />
          <input name="qualifications" value={jobForm.qualifications} onChange={handleJobChange} placeholder="Qualifications" />
          <input name="experience" value={jobForm.experience} onChange={handleJobChange} placeholder="Experience" />
          <input name="location" value={jobForm.location} onChange={handleJobChange} placeholder="Location" />
          <select name="jobType" value={jobForm.jobType} onChange={handleJobChange}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Temporary">Temporary</option>
          </select>
          <input name="numberOfPositions" type="number" min="1" value={jobForm.numberOfPositions} onChange={handleJobChange} placeholder="Number of Positions" />
          <button type="submit" disabled={jobLoading}>
            {jobLoading ? "Creating..." : "Generate Job Description"}
          </button>
        </form>
        {jobDescription && (
          <div className={styles.resultBox}>
            <p>{jobDescription}</p>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2>Interview Question Generator</h2>
        <form onSubmit={handleInterviewSubmit} className={styles.form}>
          <input name="jobTitle" value={interviewForm.jobTitle} onChange={handleInterviewChange} placeholder="Job Title" required />
          <input name="department" value={interviewForm.department} onChange={handleInterviewChange} placeholder="Department" />
          <input name="requiredSkills" value={interviewForm.requiredSkills} onChange={handleInterviewChange} placeholder="Required Skills (comma-separated)" />
          <input name="experience" value={interviewForm.experience} onChange={handleInterviewChange} placeholder="Experience" />
          <select name="jobType" value={interviewForm.jobType} onChange={handleInterviewChange}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Temporary">Temporary</option>
          </select>
          <input name="numberOfQuestions" type="number" min="1" value={interviewForm.numberOfQuestions} onChange={handleInterviewChange} placeholder="Number of Questions" />
          <button type="submit" disabled={interviewLoading}>
            {interviewLoading ? "Generating..." : "Generate Interview Questions"}
          </button>
        </form>
        {interviewQuestions.length > 0 && (
          <div className={styles.resultBox}>
            <ol>
              {interviewQuestions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2>Onboarding Checklist Creator</h2>
        <form onSubmit={handleOnboardingSubmit} className={styles.form}>
          <input name="jobTitle" value={onboardingForm.jobTitle} onChange={handleOnboardingChange} placeholder="Job Title" required />
          <input name="department" value={onboardingForm.department} onChange={handleOnboardingChange} placeholder="Department" />
          <input name="startDate" value={onboardingForm.startDate} onChange={handleOnboardingChange} placeholder="Start Date (optional)" />
          <input name="onboardingLengthDays" type="number" min="7" value={onboardingForm.onboardingLengthDays} onChange={handleOnboardingChange} placeholder="Checklist Length (days)" />
          <button type="submit" disabled={onboardingLoading}>
            {onboardingLoading ? "Creating..." : "Generate Onboarding Checklist"}
          </button>
        </form>
        {onboardingChecklist.length > 0 && (
          <div className={styles.resultBox}>
            <ol>
              {onboardingChecklist.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2>Document Summary</h2>
        <form onSubmit={handleSummarySubmit} className={styles.form}>
          <textarea
            rows="6"
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            placeholder="Paste document text or description here"
            required
          />
          <button type="submit" disabled={summaryLoading}>
            {summaryLoading ? "Summarizing..." : "Summarize Text"}
          </button>
        </form>
        {summaryResult && (
          <div className={styles.resultBox}>
            <p>{summaryResult}</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default AiAssistant;

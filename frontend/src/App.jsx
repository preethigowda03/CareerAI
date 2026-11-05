import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("careerai-theme") || "light"
  );

  const [page, setPage] = useState(
    localStorage.getItem("careerai-token")
      ? "dashboard"
      : "login"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ============================================================
  // NEW FEATURE STATES
  // ============================================================

  const [roadmap, setRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [applications, setApplications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("careerai-applications") || "[]");
    } catch {
      return [];
    }
  });
  const [applicationForm, setApplicationForm] = useState({
    company: "",
    role: "",
    status: "Applied",
    date: new Date().toISOString().slice(0, 10),
  });

  const [learning, setLearning] = useState([]);
  const [learningLoading, setLearningLoading] = useState(false);

  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewResult, setInterviewResult] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);

  // ============================================================
  // THEME
  // ============================================================

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("careerai-theme", theme);
  }, [theme]);

  // ============================================================
  // TOKEN
  // ============================================================

  const getToken = () => {
    return localStorage.getItem("careerai-token");
  };

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  // ============================================================
  // MESSAGES
  // ============================================================

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!name || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/register`,
        {
          name,
          email,
          password,
        }
      );

      setMessage(
        response.data.message ||
          "Registration successful! Please login."
      );

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        setPage("login");
        setMessage("");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Registration failed."
      );
    }
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/login`,
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "careerai-token",
        response.data.access_token
      );

      localStorage.setItem(
        "careerai-user",
        JSON.stringify(response.data.user)
      );

      setMessage("Login successful!");

      setTimeout(async () => {
        setPage("dashboard");
        setMessage("");
        await fetchHistory();
      }, 500);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid email or password."
      );
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("careerai-token");
    localStorage.removeItem("careerai-user");

    setPage("login");

    setAnalysis(null);
    setHistory([]);
    setFile(null);
    setChatMessages([]);

    setName("");
    setEmail("");
    setPassword("");

    clearMessages();
  };

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email) {
      setError("Enter your registered email address.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/forgot-password`,
        {
          email,
        }
      );

      setMessage(
        response.data.message ||
          "Password reset request received."
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to process request."
      );
    }
  };

  // ============================================================
  // HISTORY
  // ============================================================

  const fetchHistory = async () => {
    setHistoryLoading(true);

    try {
      const token = getToken();

      if (!token) {
        setHistory([]);
        return;
      }

      const response = await axios.get(
        `${API_URL}/resume-history`,
        {
          headers: authHeaders(),
        }
      );

      setHistory(response.data.resumes || []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  // ============================================================
  // PROFILE
  // ============================================================

  const fetchProfile = async () => {
    setProfileLoading(true);
    clearMessages();

    try {
      const response = await axios.get(
        `${API_URL}/profile`,
        {
          headers: authHeaders(),
        }
      );

      const user = response.data.user;

      setProfileName(user.name || "");
      setProfileEmail(user.email || "");

      localStorage.setItem(
        "careerai-user",
        JSON.stringify(user)
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const openProfile = async () => {
    setPage("profile");
    await fetchProfile();
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    clearMessages();

    if (profileName.trim().length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    setProfileSaving(true);

    try {
      const response = await axios.put(
        `${API_URL}/profile`,
        {
          name: profileName.trim(),
        },
        {
          headers: authHeaders(),
        }
      );

      const updatedUser = response.data.user;

      localStorage.setItem(
        "careerai-user",
        JSON.stringify(updatedUser)
      );

      setProfileName(updatedUser.name);
      setProfileEmail(updatedUser.email);

      setMessage(
        response.data.message ||
          "Profile updated successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: authHeaders(),
        }
      );

      setMessage(
        response.data.message ||
          "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ============================================================
  // FILE SELECT
  // ============================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF resume.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setAnalysis(null);
    clearMessages();
  };

  // ============================================================
  // UPLOAD + ANALYZE
  // ============================================================

  const handleUpload = async () => {
    if (!file) {
      setError("Please select your resume first.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please login before uploading.");
      setPage("login");
      return;
    }

    setLoading(true);
    clearMessages();
    setAnalysis(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const uploadResponse = await axios.post(
        `${API_URL}/upload-resume`,
        formData,
        {
          headers: authHeaders(),
        }
      );

      const resumeId =
        uploadResponse.data.resume_id;

      if (!resumeId) {
        throw new Error(
          "Resume ID was not returned."
        );
      }

      const analysisResponse =
        await axios.get(
          `${API_URL}/analyze-resume/${resumeId}`,
          {
            headers: authHeaders(),
          }
        );

      setAnalysis(analysisResponse.data);

      setMessage(
        "Resume analyzed successfully!"
      );

      await fetchHistory();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to upload or analyze resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VIEW HISTORY
  // ============================================================

  const viewHistory = (resume) => {
    if (!resume.analysis) {
      setError("Analysis is not available.");
      return;
    }

    clearMessages();

    setAnalysis({
      filename: resume.filename,
      resume_score:
        resume.analysis.resume_score || 0,
      skills_found:
        resume.analysis.skills_found || [],
      skills_count:
        resume.analysis.skills_count || 0,
      education:
        resume.analysis.education || [],
      experience:
        resume.analysis.experience ||
        "No experience detected",
      career_recommendations:
        resume.analysis.career_recommendations ||
        [],
      skill_gap:
        resume.analysis.skill_gap || [],
      score_breakdown:
        resume.analysis.score_breakdown || null,
      improvement_tips:
        resume.analysis.improvement_tips || [],
    });

    setPage("dashboard");

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  // ============================================================
  // DOWNLOAD REPORT
  // ============================================================

  const downloadReport = () => {
    if (!analysis) {
      setError("No analysis available.");
      return;
    }

    const reportWindow = window.open(
      "",
      "_blank"
    );

    if (!reportWindow) {
      setError(
        "Please allow pop-ups to download the report."
      );
      return;
    }

    const skills = analysis.skills_found || [];
    const education = analysis.education || [];
    const careers =
      analysis.career_recommendations || [];
    const gaps = analysis.skill_gap || [];
    const tips =
      analysis.improvement_tips || [];

    const breakdown =
      analysis.score_breakdown || {};

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CareerAI Resume Analysis</title>

        <style>
          body {
            font-family: Arial;
            padding: 40px;
            color: #222;
          }

          h1 {
            color: #2563eb;
          }

          h2 {
            margin-top: 30px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 8px;
          }

          .score {
            font-size: 40px;
            font-weight: bold;
            color: #16a34a;
          }

          .tag {
            display: inline-block;
            padding: 7px 12px;
            margin: 4px;
            background: #eef2ff;
            border-radius: 20px;
          }

          li {
            margin: 8px 0;
          }

          .breakdown {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }

          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>

      <body>

        <h1>CareerAI</h1>

        <p>
          AI-Powered Career and Placement Assistant
        </p>

        <h2>Resume</h2>

        <p>
          <strong>
            ${analysis.filename || "Resume"}
          </strong>
        </p>

        <h2>Resume Score</h2>

        <div class="score">
          ${analysis.resume_score || 0}/100
        </div>

        <h2>Score Breakdown</h2>

        ${
          Object.keys(breakdown).length
            ? Object.entries(breakdown)
                .map(
                  ([key, value]) => `
                    <div class="breakdown">
                      <span>${key}</span>
                      <strong>
                        ${value.score}/${value.maximum}
                      </strong>
                    </div>
                  `
                )
                .join("")
            : "<p>Unavailable</p>"
        }

        <h2>Skills</h2>

        ${
          skills.length
            ? skills
                .map(
                  skill =>
                    `<span class="tag">${skill}</span>`
                )
                .join("")
            : "<p>No skills detected.</p>"
        }

        <h2>Education</h2>

        <ul>
          ${
            education.length
              ? education
                  .map(
                    item =>
                      `<li>${item}</li>`
                  )
                  .join("")
              : "<li>Not detected</li>"
          }
        </ul>

        <h2>Experience & Projects</h2>

        <p>
          ${analysis.experience || "None"}
        </p>

        <h2>Career Recommendations</h2>

        <ul>
          ${
            careers.length
              ? careers
                  .map(
                    career =>
                      `<li>${career}</li>`
                  )
                  .join("")
              : "<li>None</li>"
          }
        </ul>

        <h2>Skill Gap</h2>

        <ul>
          ${
            gaps.length
              ? gaps
                  .map(
                    gap =>
                      `<li>${gap}</li>`
                  )
                  .join("")
              : "<li>No major gaps.</li>"
          }
        </ul>

        <h2>Improvement Tips</h2>

        <ul>
          ${
            tips.length
              ? tips
                  .map(
                    tip =>
                      `<li>${tip}</li>`
                  )
                  .join("")
              : "<li>Keep improving.</li>"
          }
        </ul>

        <button onclick="window.print()">
          Print / Save as PDF
        </button>

      </body>
      </html>
    `);

    reportWindow.document.close();
  };

  // ============================================================
  // ROADMAP
  // ============================================================

  const loadRoadmap = async () => {
    setRoadmapLoading(true);
    clearMessages();

    try {
      const response = await axios.get(
        `${API_URL}/roadmap`,
        {
          headers: authHeaders(),
        }
      );

      setRoadmap(
        response.data.roadmap ||
        response.data
      );

      setPage("roadmap");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load roadmap."
      );
    } finally {
      setRoadmapLoading(false);
    }
  };

  // ============================================================
  // CHATBOT
  // ============================================================

  const sendChatMessage = async (
    customMessage = null
  ) => {
    const text =
      customMessage !== null
        ? customMessage
        : chatInput.trim();

    if (!text) return;

    const token = getToken();

    if (!token) {
      setError("Please login first.");
      return;
    }

    const userMessage = {
      role: "user",
      message: text,
    };

    setChatMessages(prev => [
      ...prev,
      userMessage,
    ]);

    setChatInput("");
    setChatLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/chat`,
        {
          message: text,
        },
        {
          headers: authHeaders(),
        }
      );

      const reply =
        response.data.reply ||
        response.data.message ||
        response.data.response ||
        "I couldn't generate a response.";

      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          message: reply,
        },
      ]);
    } catch (err) {
      if (err.response?.status === 401) {
        setChatMessages(prev => [
          ...prev,
          {
            role: "assistant",
            message:
              "Your session expired. Please login again.",
          },
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            role: "assistant",
            message:
              "Sorry, I couldn't connect to CareerAI.",
          },
        ]);
      }
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      {
        role: "assistant",
        message:
          "Chat cleared. 👋 How can I help you with your career?",
      },
    ]);
  };

  // ============================================================
  // JOBS
  // ============================================================

  const loadJobs = async () => {
    setJobsLoading(true);
    clearMessages();

    try {
      const response = await axios.get(
        `${API_URL}/jobs`,
        {
          headers: authHeaders(),
        }
      );

      setJobs(response.data.jobs || []);
      setPage("jobs");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load jobs."
      );
    } finally {
      setJobsLoading(false);
    }
  };

  // ============================================================
  // APPLICATION TRACKER
  // ============================================================

  const openApplicationTracker = () => {
    clearMessages();
    setPage("applications");
  };

  const addApplication = (e) => {
    e.preventDefault();
    if (!applicationForm.company.trim() || !applicationForm.role.trim()) {
      setError("Enter the company and job role.");
      return;
    }

    const item = {
      id: Date.now(),
      ...applicationForm,
      company: applicationForm.company.trim(),
      role: applicationForm.role.trim(),
    };

    const next = [item, ...applications];
    setApplications(next);
    localStorage.setItem("careerai-applications", JSON.stringify(next));
    setApplicationForm({
      company: "",
      role: "",
      status: "Applied",
      date: new Date().toISOString().slice(0, 10),
    });
    setMessage("Application added successfully.");
  };

  const updateApplicationStatus = (id, status) => {
    const next = applications.map((item) =>
      item.id === id ? { ...item, status } : item
    );
    setApplications(next);
    localStorage.setItem("careerai-applications", JSON.stringify(next));
  };

  const removeApplication = (id) => {
    const next = applications.filter((item) => item.id !== id);
    setApplications(next);
    localStorage.setItem("careerai-applications", JSON.stringify(next));
  };

  // ============================================================
  // LEARNING
  // ============================================================

  const loadLearning = async () => {
    setLearningLoading(true);
    clearMessages();

    try {
      const response = await axios.get(
        `${API_URL}/learning`,
        {
          headers: authHeaders(),
        }
      );

      setLearning(
        response.data.learning || []
      );

      setPage("learning");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load learning."
      );
    } finally {
      setLearningLoading(false);
    }
  };

  // ============================================================
  // PROGRESS
  // ============================================================

  const loadProgress = async () => {
    setProgressLoading(true);
    clearMessages();

    try {
      const response = await axios.get(
        `${API_URL}/progress`,
        {
          headers: authHeaders(),
        }
      );

      setProgress(
        response.data.progress || {}
      );

      setPage("progress");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load progress."
      );
    } finally {
      setProgressLoading(false);
    }
  };

  // ============================================================
  // INTERVIEW
  // ============================================================

  const startInterview = async (
    career = "Machine Learning Engineer"
  ) => {
    setInterviewLoading(true);
    setInterviewResult(null);
    setInterviewAnswer("");
    setInterviewIndex(0);
    clearMessages();

    try {
      const response = await axios.get(
        `${API_URL}/interview/questions`,
        {
          params: {
            career,
          },
          headers: authHeaders(),
        }
      );

      setInterviewQuestions(
        response.data.questions || []
      );

      setPage("interview");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to start interview."
      );
    } finally {
      setInterviewLoading(false);
    }
  };

  const submitInterviewAnswer = async () => {
    if (!interviewAnswer.trim()) {
      setError("Please enter your answer.");
      return;
    }

    setInterviewLoading(true);
    clearMessages();

    try {
      const response = await axios.post(
        `${API_URL}/interview/evaluate`,
        {
          question:
            interviewQuestions[interviewIndex],

          answer: interviewAnswer,

          career:
            "Machine Learning Engineer",
        },
        {
          headers: authHeaders(),
        }
      );

      setInterviewResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to evaluate answer."
      );
    } finally {
      setInterviewLoading(false);
    }
  };

  const nextInterviewQuestion = () => {
    if (
      interviewIndex <
      interviewQuestions.length - 1
    ) {
      setInterviewIndex(
        interviewIndex + 1
      );

      setInterviewAnswer("");
      setInterviewResult(null);
    } else {
      setMessage(
        "🎉 Mock interview completed!"
      );
    }
  };

  // ============================================================
  // SAVED USER
  // ============================================================

  let savedUser = null;

  try {
    savedUser = JSON.parse(
      localStorage.getItem(
        "careerai-user"
      ) || "null"
    );
  } catch {
    savedUser = null;
  }

  // ============================================================
  // AUTH PAGES
  // ============================================================

  if (
    page === "login" ||
    page === "register" ||
    page === "forgot"
  ) {
    return (
      <div className="auth-page">

        <div className="theme-switch auth-theme">

          <button
            className={
              theme === "light"
                ? "active"
                : ""
            }
            onClick={() =>
              setTheme("light")
            }
          >
            ☀️
          </button>

          <button
            className={
              theme === "dark"
                ? "active"
                : ""
            }
            onClick={() =>
              setTheme("dark")
            }
          >
            🌙
          </button>

        </div>

        <div className="auth-card">

          <div className="brand">

            <div className="brand-icon">
              AI
            </div>

            <div>
              <h1>CareerAI</h1>
              <p>
                AI-Powered Career Assistant
              </p>
            </div>

          </div>

          {page === "login" && (
            <>
              <h2>
                Welcome Back 👋
              </h2>

              <p className="auth-subtitle">
                Sign in to continue to CareerAI
              </p>

              <form
                onSubmit={handleLogin}
              >

                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e =>
                    setEmail(e.target.value)
                  }
                />

                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  className="primary-btn"
                  type="submit"
                >
                  Sign In
                </button>

              </form>

              <button
                className="link-btn"
                onClick={() => {
                  clearMessages();
                  setPage("forgot");
                }}
              >
                Forgot Password?
              </button>

              <p className="switch-text">
                Don't have an account?

                <button
                  onClick={() => {
                    clearMessages();
                    setPage("register");
                  }}
                >
                  Register
                </button>
              </p>
            </>
          )}

          {page === "register" && (
            <>
              <h2>
                Create Account
              </h2>

              <p className="auth-subtitle">
                Register your CareerAI account
              </p>

              <form
                onSubmit={handleRegister}
              >

                <label>Name</label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e =>
                    setName(e.target.value)
                  }
                />

                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e =>
                    setEmail(e.target.value)
                  }
                />

                <label>Password</label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={e =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  className="primary-btn"
                  type="submit"
                >
                  Create Account
                </button>

              </form>

              <p className="switch-text">
                Already have an account?

                <button
                  onClick={() => {
                    clearMessages();
                    setPage("login");
                  }}
                >
                  Sign In
                </button>
              </p>
            </>
          )}

          {page === "forgot" && (
            <>
              <h2>
                Forgot Password 🔐
              </h2>

              <p className="auth-subtitle">
                Enter your registered email.
              </p>

              <form
                onSubmit={
                  handleForgotPassword
                }
              >

                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e =>
                    setEmail(e.target.value)
                  }
                />

                <button
                  className="primary-btn"
                  type="submit"
                >
                  Reset Password
                </button>

              </form>

              <button
                className="back-btn"
                onClick={() => {
                  clearMessages();
                  setPage("login");
                }}
              >
                ← Back to Login
              </button>
            </>
          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {message && (
            <div className="success-message">
              ✓ {message}
            </div>
          )}

        </div>
      </div>
    );
  }

  // ============================================================
  // COMMON SIDEBAR HEADER
  // ============================================================

  const openChat = () => {
    clearMessages();
    setPage("chat");

    if (!chatMessages.length) {
      setChatMessages([
        {
          role: "assistant",
          message:
            "Hello! 👋 I'm CareerAI Assistant. Ask me anything about your career.",
        },
      ]);
    }
  };

  const goToDashboardSection = (section) => {
    clearMessages();
    setPage("dashboard");

    setTimeout(() => {
      const target = document.getElementById(section);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 80);
  };

  const Header = () => (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">AI</div>
          <div>
            <h1>CareerAI</h1>
            <p>AI-Powered Career Assistant</p>
          </div>
        </div>

        <div className="sidebar-section-label">MAIN MENU</div>

        <nav className="sidebar-nav">
          <button
            className={page === "dashboard" ? "side-nav-btn active" : "side-nav-btn"}
            onClick={() => setPage("dashboard")}
          >
            <span>🏠</span>
            <strong>Dashboard</strong>
          </button>

          <button
            className="side-nav-btn"
            onClick={() => goToDashboardSection("resume-analysis")}
          >
            <span>🧠</span>
            <strong>Resume Analysis</strong>
          </button>

          <button
            className={page === "roadmap" ? "side-nav-btn active" : "side-nav-btn"}
            onClick={loadRoadmap}
          >
            <span>🗺️</span>
            <strong>Career Roadmap</strong>
          </button>

          <button
            className={page === "jobs" ? "side-nav-btn active" : "side-nav-btn"}
            onClick={loadJobs}
          >
            <span>💼</span>
            <strong>Jobs</strong>
          </button>

          <button
            className={page === "interview" ? "side-nav-btn active" : "side-nav-btn"}
            onClick={() => startInterview()}
          >
            <span>🎤</span>
            <strong>Interview</strong>
          </button>

          <button
            className={page === "learning" ? "side-nav-btn active" : "side-nav-btn"}
            onClick={loadLearning}
          >
            <span>📚</span>
            <strong>Learning</strong>
          </button>

          <button
            className={page === "progress" ? "side-nav-btn active" : "side-nav-btn"}
            onClick={loadProgress}
          >
            <span>📊</span>
            <strong>Progress</strong>
          </button>

          <button
            className={page === "applications" ? "side-nav-btn active" : "side-nav-btn"}
            onClick={openApplicationTracker}
          >
            <span>📋</span>
            <strong>Application Tracker</strong>
            <em>NEW</em>
          </button>

          <button
            className="side-nav-btn"
            onClick={() => goToDashboardSection("resume-history")}
          >
            <span>🕘</span>
            <strong>Resume History</strong>
          </button>
        </nav>

        <div className="sidebar-section-label sidebar-bottom-label">ACCOUNT</div>

        <div className="sidebar-account">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {savedUser?.name
                ? savedUser.name.charAt(0).toUpperCase()
                : "U"}
            </div>
            <div>
              <strong>{savedUser?.name || "CareerAI User"}</strong>
              <small>CareerAI Member</small>
            </div>
          </div>

          <div className="sidebar-theme">
            <span>Appearance</span>
            <div className="theme-switch">
              <button
                className={theme === "light" ? "active" : ""}
                onClick={() => setTheme("light")}
                aria-label="Light mode"
              >
                ☀️
              </button>
              <button
                className={theme === "dark" ? "active" : ""}
                onClick={() => setTheme("dark")}
                aria-label="Dark mode"
              >
                🌙
              </button>
            </div>
          </div>

          <button
            className={page === "settings" ? "side-nav-btn active" : "side-nav-btn"}
            onClick={() => { clearMessages(); setPage("settings"); }}
          >
            <span>⚙️</span>
            <strong>Settings</strong>
          </button>

          <button className={page === "profile" ? "side-nav-btn active" : "side-nav-btn"} onClick={openProfile}>
            <span>👤</span>
            <strong>Profile</strong>
          </button>

          <button className="side-nav-btn logout-side-btn" onClick={handleLogout}>
            <span>🚪</span>
            <strong>Logout</strong>
          </button>
        </div>
      </aside>

      <button className="floating-chat" onClick={openChat} aria-label="Open CareerAI chatbot">
        <span>🤖</span>
        <small>AI</small>
      </button>
    </>
  );

  // ============================================================
  // APPLICATION TRACKER PAGE
  // ============================================================

  if (page === "applications") {
    return (
      <div className="dashboard">
        <Header />
        <main className="feature-page applications-page feature-background applications-background">
          <div className="feature-hero">
            <span className="small-label">CAREER MANAGEMENT</span>
            <h2>Application Tracker</h2>
            <p>Track your job applications, interview stages and progress in one place.</p>
          </div>

          <div className="tracker-layout">
            <section className="settings-card tracker-form-card">
              <div className="section-heading"><span>📋</span><div><h3>Add Application</h3><p>Save a new application instantly.</p></div></div>
              <form onSubmit={addApplication} className="tracker-form">
                <label>Company<input value={applicationForm.company} onChange={e => setApplicationForm({...applicationForm, company:e.target.value})} placeholder="Company name" /></label>
                <label>Job Role<input value={applicationForm.role} onChange={e => setApplicationForm({...applicationForm, role:e.target.value})} placeholder="e.g. Machine Learning Engineer" /></label>
                <label>Status<select value={applicationForm.status} onChange={e => setApplicationForm({...applicationForm, status:e.target.value})}><option>Applied</option><option>Shortlisted</option><option>Interview</option><option>Offer</option><option>Rejected</option></select></label>
                <label>Applied Date<input type="date" value={applicationForm.date} onChange={e => setApplicationForm({...applicationForm, date:e.target.value})} /></label>
                <button className="primary-btn" type="submit">+ Add Application</button>
              </form>
            </section>

            <section className="history-list tracker-list">
              {applications.length === 0 ? (
                <div className="empty-history"><span>📋</span><h3>No applications yet</h3><p>Add your first job application above.</p></div>
              ) : applications.map(item => (
                <div className="history-item tracker-item" key={item.id}>
                  <div className="history-icon">💼</div>
                  <div className="history-info"><h3>{item.role}</h3><p>{item.company} · {item.date}</p></div>
                  <select value={item.status} onChange={e => updateApplicationStatus(item.id, e.target.value)}><option>Applied</option><option>Shortlisted</option><option>Interview</option><option>Offer</option><option>Rejected</option></select>
                  <button className="view-btn danger-btn" onClick={() => removeApplication(item.id)}>Remove</button>
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // SETTINGS PAGE
  // ============================================================

  if (page === "settings") {
    return (
      <div className="dashboard">
        <Header />
        <main className="feature-page settings-page feature-background settings-background">
          <div className="feature-hero">
            <span className="small-label">PERSONALIZATION</span>
            <h2>Settings</h2>
            <p>Manage your CareerAI appearance and session preferences.</p>
          </div>
          <section className="settings-card settings-main-card">
            <div className="section-heading"><span>⚙️</span><div><h3>Appearance</h3><p>Choose how CareerAI looks while you work.</p></div></div>
            <div className="settings-theme-row">
              <div><strong>Light / Dark Theme</strong><small>Switch instantly between light and dark mode.</small></div>
              <div className="theme-switch large-theme-switch">
                <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>☀️</button>
                <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>🌙</button>
              </div>
            </div>
          </section>
          <section className="settings-card">
            <div className="section-heading"><span>🔐</span><div><h3>Account</h3><p>Use Profile to update your account details and password.</p></div></div>
            <button className="secondary-btn" onClick={openProfile}>Open Profile</button>
          </section>
        </main>
      </div>
    );
  }

  // ============================================================
  // PROFILE PAGE
  // ============================================================

  if (page === "profile") {
    return (
      <div className="dashboard">

        <Header />

        <main className="profile-page profile-feature-page feature-background profile-background">

          <div className="profile-header">

            <span className="small-label">
              👤 ACCOUNT SETTINGS
            </span>

            <h2>My Profile</h2>

            <p>
              Manage your CareerAI account.
            </p>

          </div>

          {profileLoading ? (
            <div className="loading-card">
              <h3>
                Loading Profile...
              </h3>
            </div>
          ) : (

            <div className="profile-grid">

              <div className="profile-card">

                <div className="profile-avatar">
                  {profileName
                    ? profileName
                        .charAt(0)
                        .toUpperCase()
                    : "👤"}
                </div>

                <h3>
                  {profileName ||
                    "CareerAI User"}
                </h3>

                <p>
                  {profileEmail}
                </p>

                <span className="profile-badge">
                  CareerAI Member
                </span>

              </div>

              <div className="settings-card">

                <div className="section-heading">

                  <span>✏️</span>

                  <div>
                    <h3>
                      Edit Profile
                    </h3>

                    <p>
                      Update your account information
                    </p>
                  </div>

                </div>

                <form
                  onSubmit={
                    handleProfileSave
                  }
                >

                  <label>Name</label>

                  <input
                    type="text"
                    value={profileName}
                    onChange={e =>
                      setProfileName(
                        e.target.value
                      )
                    }
                  />

                  <label>Email</label>

                  <input
                    type="email"
                    value={profileEmail}
                    disabled
                  />

                  <button
                    className="primary-btn"
                    type="submit"
                    disabled={profileSaving}
                  >
                    {profileSaving
                      ? "Saving..."
                      : "Save Profile"}
                  </button>

                </form>

              </div>

              <div className="settings-card">

                <div className="section-heading">

                  <span>🔐</span>

                  <div>
                    <h3>
                      Change Password
                    </h3>

                    <p>
                      Keep your account secure
                    </p>
                  </div>

                </div>

                <form
                  onSubmit={
                    handleChangePassword
                  }
                >

                  <label>
                    Current Password
                  </label>

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                  />

                  <label>
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={e =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                  />

                  <label>
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                  />

                  <button
                    className="primary-btn"
                    type="submit"
                    disabled={
                      passwordLoading
                    }
                  >
                    {passwordLoading
                      ? "Changing..."
                      : "Change Password"}
                  </button>

                </form>

              </div>

            </div>

          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {message && (
            <div className="success-message">
              ✓ {message}
            </div>
          )}

        </main>
      </div>
    );
  }

  // ============================================================
  // ROADMAP
  // ============================================================

  if (page === "roadmap") {
    return (
      <div className="dashboard">

        <Header />

        <main className="feature-page roadmap-page feature-background roadmap-background">

          <span className="small-label">
            🗺️ CAREER DEVELOPMENT
          </span>

          <h2>
            AI Career Roadmap
          </h2>

          <p>
            Follow a step-by-step path to
            reach your career goal.
          </p>

          {roadmapLoading ? (
            <div className="loading-card">
              Loading roadmap...
            </div>
          ) : (
            <div className="roadmap-container">

              {Array.isArray(roadmap) ? (
                roadmap.map(
                  (step, index) => (

                    <div
                      className="roadmap-step"
                      key={index}
                    >

                      <div className="roadmap-number">
                        {index + 1}
                      </div>

                      <div>
                        <h3>
                          {step.title ||
                            step.name ||
                            `Step ${index + 1}`}
                        </h3>

                        <p>
                          {step.description ||
                            ""}
                        </p>

                        {step.items &&
                          Array.isArray(
                            step.items
                          ) && (
                            <ul>
                              {step.items.map(
                                (
                                  item,
                                  itemIndex
                                ) => (
                                  <li
                                    key={
                                      itemIndex
                                    }
                                  >
                                    ○ {item}
                                  </li>
                                )
                              )}
                            </ul>
                          )}

                      </div>

                    </div>

                  )
                )
              ) : (
                <div className="result-card">

                  <h3>
                    🎯 Career Goal
                  </h3>

                  <p>
                    {roadmap?.career_goal ||
                      "Machine Learning Engineer"}
                  </p>

                  {roadmap?.steps &&
                    roadmap.steps.map(
                      (step, index) => (

                        <div
                          className="roadmap-step"
                          key={index}
                        >

                          <div className="roadmap-number">
                            {index + 1}
                          </div>

                          <div>

                            <h3>
                              {step.title}
                            </h3>

                            <ul>
                              {(
                                step.items ||
                                []
                              ).map(
                                (
                                  item,
                                  itemIndex
                                ) => (
                                  <li
                                    key={
                                      itemIndex
                                    }
                                  >
                                    ○ {item}
                                  </li>
                                )
                              )}
                            </ul>

                          </div>

                        </div>

                      )
                    )}

                </div>
              )}

            </div>
          )}

        </main>

      </div>
    );
  }

  // ============================================================
  // CHATBOT
  // ============================================================

  if (page === "chat") {
    return (
      <div className="dashboard">

        <Header />

        <main className="chat-page chatbot-page feature-background chatbot-background">

          <div className="chat-header">

            <span className="small-label">
              🤖 CAREERAI ASSISTANT
            </span>

            <h2>
              AI Career Chatbot
            </h2>

            <p>
              Ask questions about your resume,
              career, skills, interviews and learning.
            </p>

            <span className="ai-online">
              ● AI Online
            </span>

          </div>

          <div className="chat-card">

            <div className="chat-top">

              <div>
                <strong>
                  🤖 CareerAI Assistant
                </strong>

                <small>
                  Real-time career guidance
                </small>
              </div>

              <button
                className="clear-chat-btn"
                onClick={clearChat}
              >
                🗑️ Clear
              </button>

            </div>

            <div className="chat-messages">

              {chatMessages.map(
                (item, index) => (

                  <div
                    key={index}
                    className={
                      item.role === "user"
                        ? "chat-message user-message"
                        : "chat-message ai-message"
                    }
                  >

                    <div className="chat-avatar">
                      {item.role === "user"
                        ? "👤"
                        : "AI"}
                    </div>

                    <div>
                      {item.message}
                    </div>

                  </div>

                )
              )}

              {chatLoading && (
                <div className="chat-message ai-message">

                  <div className="chat-avatar">
                    AI
                  </div>

                  <div>
                    Thinking... 🤔
                  </div>

                </div>
              )}

            </div>

            <div className="chat-suggestions">

              <button
                onClick={() =>
                  sendChatMessage(
                    "What skills should I learn for Machine Learning?"
                  )
                }
              >
                What skills should I learn for Machine Learning?
              </button>

              <button
                onClick={() =>
                  sendChatMessage(
                    "How can I improve my resume?"
                  )
                }
              >
                Improve my resume
              </button>

              <button
                onClick={() =>
                  sendChatMessage(
                    "What should I prepare for interviews?"
                  )
                }
              >
                Interview preparation
              </button>

            </div>

            <div className="chat-input-area">

              <input
                type="text"
                placeholder="Ask CareerAI anything..."
                value={chatInput}
                onChange={e =>
                  setChatInput(
                    e.target.value
                  )
                }
                onKeyDown={e => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
              />

              <button
                onClick={() =>
                  sendChatMessage()
                }
                disabled={chatLoading}
              >
                ➤
              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ============================================================
  // JOBS
  // ============================================================

  if (page === "jobs") {
    return (
      <div className="dashboard">

        <Header />

        <main className="feature-page jobs-page feature-background jobs-background">

          <span className="small-label">
            💼 CAREER OPPORTUNITIES
          </span>

          <h2>
            Job Recommendations
          </h2>

          <p>
            Explore opportunities matching
            your career interests.
          </p>

          {jobsLoading ? (
            <div className="loading-card">
              Loading jobs...
            </div>
          ) : (

            <div className="job-grid">

              {jobs.map(
                (job, index) => (

                  <div
                    className="job-card"
                    key={index}
                  >

                    <div className="job-icon">
                      💼
                    </div>

                    <h3>
                      {job.title}
                    </h3>

                    <strong>
                      {job.company}
                    </strong>

                    <p>
                      📍 {job.location}
                    </p>

                    <span className="job-type">
                      {job.type}
                    </span>

                    <p>
                      {job.description}
                    </p>

                    <div className="tags">

                      {(job.skills || []).map(
                        (skill, skillIndex) => (
                          <span
                            key={skillIndex}
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                    <button
                      className="primary-btn"
                      onClick={() =>
                        alert(
                          `Application option for ${job.title}`
                        )
                      }
                    >
                      Apply Now →
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </main>

      </div>
    );
  }

  // ============================================================
  // LEARNING
  // ============================================================

  if (page === "learning") {
    return (
      <div className="dashboard">

        <Header />

        <main className="feature-page learning-page feature-background learning-background">

          <span className="small-label">
            📚 LEARNING CENTER
          </span>

          <h2>
            Recommended Learning
          </h2>

          <p>
            Improve the skills needed for your
            target career.
          </p>

          {learningLoading ? (
            <div className="loading-card">
              Loading learning resources...
            </div>
          ) : (

            <div className="learning-grid">

              {learning.map(
                (item, index) => (

                  <div
                    className="learning-card"
                    key={index}
                  >

                    <div className="learning-icon">
                      📚
                    </div>

                    <h3>
                      {item.skill}
                    </h3>

                    <span>
                      {item.level}
                    </span>

                    <ul>

                      {(item.topics || []).map(
                        (
                          topic,
                          topicIndex
                        ) => (

                          <li
                            key={topicIndex}
                          >
                            ✓ {topic}
                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )
              )}

            </div>

          )}

        </main>

      </div>
    );
  }

  // ============================================================
  // PROGRESS
  // ============================================================

  if (page === "progress") {
    const values = progress || {};

    const numbers =
      Object.values(values).filter(
        value =>
          typeof value === "number"
      );

    const total = numbers.length
      ? Math.round(
          numbers.reduce(
            (a, b) => a + b,
            0
          ) / numbers.length
        )
      : 0;

    return (
      <div className="dashboard">

        <Header />

        <main className="feature-page progress-page feature-background progress-background">

          <span className="small-label">
            📊 CAREER ANALYTICS
          </span>

          <h2>
            Your Career Progress
          </h2>

          <p>
            Track your progress toward your
            career goals.
          </p>

          {progressLoading ? (
            <div className="loading-card">
              Loading progress...
            </div>
          ) : (

            <>
              <div className="overall-progress-card">

                <h3>
                  Overall Progress
                </h3>

                <strong>
                  {total}%
                </strong>

                <div className="progress-background">

                  <div
                    className="progress-fill"
                    style={{
                      width: `${total}%`,
                    }}
                  />

                </div>

              </div>

              <div className="progress-grid">

                {Object.entries(values).map(
                  ([key, value]) => (

                    <div
                      className="progress-card"
                      key={key}
                    >

                      <h3>
                        {key
                          .replaceAll(
                            "_",
                            " "
                          )
                          .replace(
                            /\b\w/g,
                            l =>
                              l.toUpperCase()
                          )}
                      </h3>

                      <strong>
                        {value}%
                      </strong>

                      <div className="progress-background">

                        <div
                          className="progress-fill"
                          style={{
                            width: `${value}%`,
                          }}
                        />

                      </div>

                    </div>

                  )
                )}

              </div>
            </>

          )}

        </main>

      </div>
    );
  }

  // ============================================================
  // INTERVIEW
  // ============================================================

  if (page === "interview") {
    return (
      <div className="dashboard">

        <Header />

        <main className="feature-page interview-page feature-background interview-background">

          <span className="small-label">
            🎤 AI INTERVIEW
          </span>

          <h2>
            Mock Interview
          </h2>

          <p>
            Practice technical interview
            questions with CareerAI.
          </p>

          {interviewQuestions.length === 0 ? (

            <div className="interview-start">

              <h3>
                Choose your career
              </h3>

              <button
                className="primary-btn"
                onClick={() =>
                  startInterview(
                    "Machine Learning Engineer"
                  )
                }
              >
                Machine Learning Engineer
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  startInterview(
                    "Python Developer"
                  )
                }
              >
                Python Developer
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  startInterview(
                    "Data Scientist"
                  )
                }
              >
                Data Scientist
              </button>

            </div>

          ) : (

            <div className="interview-card">

              <div className="interview-progress">
                Question{" "}
                {interviewIndex + 1}
                {" "}of{" "}
                {interviewQuestions.length}
              </div>

              <h3>
                {
                  interviewQuestions[
                    interviewIndex
                  ]
                }
              </h3>

              <textarea
                placeholder="Type your answer here..."
                value={interviewAnswer}
                onChange={e =>
                  setInterviewAnswer(
                    e.target.value
                  )
                }
              />

              {!interviewResult ? (

                <button
                  className="primary-btn"
                  onClick={
                    submitInterviewAnswer
                  }
                  disabled={
                    interviewLoading
                  }
                >
                  {interviewLoading
                    ? "Evaluating..."
                    : "Evaluate Answer"}
                </button>

              ) : (

                <div className="interview-result">

                  <h3>
                    Score:{" "}
                    {
                      interviewResult.score
                    }/100
                  </h3>

                  <p>
                    {
                      interviewResult.feedback
                    }
                  </p>

                  <p>
                    <strong>
                      Strength:
                    </strong>{" "}
                    {
                      interviewResult.strength
                    }
                  </p>

                  <p>
                    <strong>
                      Improve:
                    </strong>{" "}
                    {
                      interviewResult.improvement
                    }
                  </p>

                  <button
                    className="primary-btn"
                    onClick={
                      nextInterviewQuestion
                    }
                  >
                    Next Question →
                  </button>

                </div>

              )}

            </div>

          )}

        </main>

      </div>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="dashboard">

      <Header />

      <main className="dashboard-content dashboard-home dashboard-ai-background">

        <section className="welcome">

          <div>

            <span className="small-label">
              CAREERAI DASHBOARD
            </span>

            <h2>
              Welcome back, {savedUser?.name || "CareerAI User"}! 👋
            </h2>

            <p>
              Your career journey continues. Keep learning, keep growing!
            </p>

          </div>

          <div className="ai-badge">
            AI Powered ✨
          </div>

        </section>

        {/* =====================================================
            QUICK FEATURES
        ===================================================== */}

        <section className="quick-features dashboard-feature-grid">

          <button className="quick-feature resume-feature" onClick={() => goToDashboardSection("resume-analysis")}>
            <span className="quick-feature-icon">CV</span>
            <span className="quick-feature-content"><strong>Resume Analysis</strong><small>Analyze your resume with AI</small></span>
            <span className="quick-feature-arrow">→</span>
          </button>

          <button className="quick-feature roadmap-feature" onClick={loadRoadmap}>
            <span className="quick-feature-icon">🗺</span>
            <span className="quick-feature-content"><strong>Career Roadmap</strong><small>Follow your personalized career path</small></span>
            <span className="quick-feature-arrow">→</span>
          </button>

          <button className="quick-feature jobs-feature" onClick={loadJobs}>
            <span className="quick-feature-icon">💼</span>
            <span className="quick-feature-content"><strong>Job Opportunities</strong><small>Explore roles matching your career</small></span>
            <span className="quick-feature-arrow">→</span>
          </button>

          <button className="quick-feature interview-feature" onClick={() => startInterview()}>
            <span className="quick-feature-icon">🎤</span>
            <span className="quick-feature-content"><strong>Interview</strong><small>Practice real interview questions</small></span>
            <span className="quick-feature-arrow">→</span>
          </button>

          <button className="quick-feature learning-feature" onClick={loadLearning}>
            <span className="quick-feature-icon">📚</span>
            <span className="quick-feature-content"><strong>Learning</strong><small>Build skills for your target career</small></span>
            <span className="quick-feature-arrow">→</span>
          </button>

          <button className="quick-feature progress-feature" onClick={loadProgress}>
            <span className="quick-feature-icon">📊</span>
            <span className="quick-feature-content"><strong>Progress</strong><small>Track your career development</small></span>
            <span className="quick-feature-arrow">→</span>
          </button>

          <button className="quick-feature history-feature" onClick={() => goToDashboardSection("resume-history")}>
            <span className="quick-feature-icon">↺</span>
            <span className="quick-feature-content"><strong>Resume History</strong><small>View your previous analyses</small></span>
            <span className="quick-feature-arrow">→</span>
          </button>

          <button className="quick-feature tracker-feature" onClick={openApplicationTracker}>
            <span className="quick-feature-icon">📋</span>
            <span className="quick-feature-content"><strong>Application Tracker</strong><small>Track your job applications</small></span>
            <span className="quick-feature-arrow">→</span>
          </button>

          <button className="quick-feature chat-feature" onClick={openChat}>
            <span className="quick-feature-icon">🤖</span>
            <span className="quick-feature-content"><strong>CareerAI Chat</strong><small>Get instant career guidance</small></span>
            <span className="quick-feature-arrow">→</span>
          </button>

          <button className="quick-feature settings-feature" onClick={() => { clearMessages(); setPage("settings"); }}>
            <span className="quick-feature-icon">⚙️</span>
            <span className="quick-feature-content"><strong>Settings</strong><small>Personalize your CareerAI experience</small></span>
            <span className="quick-feature-arrow">→</span>
          </button>

        </section>

        {/* =====================================================
            UPLOAD
        ===================================================== */}

        <section className="upload-section">

          <div className="upload-icon-large resume-upload-visual">
            <span>CV</span>
          </div>

          <h2>
            Upload Your Resume
          </h2>

          <p>
            Upload a PDF resume to get your
            AI-powered career analysis.
          </p>

          <label className="choose-file">

            Choose PDF Resume

            <input
              type="file"
              accept=".pdf"
              onChange={
                handleFileChange
              }
            />

          </label>

          {file && (
            <div className="selected-file">

              <span>
                📎
              </span>

              <div>

                <strong>
                  {file.name}
                </strong>

                <small>
                  {(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)}
                  {" MB"} · Ready for analysis
                </small>

              </div>

            </div>
          )}

          <button
            className="analyze-btn"
            onClick={
              handleUpload
            }
            disabled={loading}
          >
            {loading
              ? "⏳ Analyzing..."
              : "✨ Upload & Analyze Resume"}
          </button>

        </section>

        {error && (
          <div className="error-message dashboard-message">
            ⚠️ {error}
          </div>
        )}

        {message && !loading && (
          <div className="success-message dashboard-message">
            ✓ {message}
          </div>
        )}

        {loading && (
          <div className="loading-card">

            <div className="loading-icon">
              AI
            </div>

            <h3>
              Analyzing Your Resume...
            </h3>

            <p>
              Extracting skills, education,
              career recommendations and
              improvement areas.
            </p>

            <div className="loading-bar">
              <div />
            </div>

          </div>
        )}

        {/* =====================================================
            ANALYSIS
        ===================================================== */}

        {analysis && !loading && (
          <section id="resume-analysis" className="results resume-analysis-feature">

            <div className="analysis-header">

              <span>
                ✓ ANALYSIS COMPLETE
              </span>

              <h2>
                Resume Analysis
              </h2>

              <p>
                {analysis.filename}
              </p>

              <button
                className="download-btn"
                onClick={
                  downloadReport
                }
              >
                📥 Download Analysis Report
              </button>

            </div>

            <div className="stats-grid">

              <div className="score-card">

                <span>
                  Resume Score
                </span>

                <strong>
                  {analysis.resume_score || 0}%
                </strong>

                <p>
                  {analysis.resume_score >= 80
                    ? "Excellent resume!"
                    : analysis.resume_score >= 60
                    ? "Good resume, but can improve."
                    : "Needs improvement."}
                </p>

                <div className="score-progress">

                  <div
                    style={{
                      width: `${Math.min(
                        analysis.resume_score || 0,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

              <div className="stat-card">

                <strong>
                  {analysis.skills_count || 0}
                </strong>

                <span>
                  Skills Found
                </span>

              </div>

              <div className="stat-card">

                <strong>
                  {analysis.education?.length || 0}
                </strong>

                <span>
                  Education Details
                </span>

              </div>

              <div className="stat-card">

                <strong>
                  {
                    analysis
                      .career_recommendations
                      ?.length || 0
                  }
                </strong>

                <span>
                  Career Options
                </span>

              </div>

            </div>

            {/* SCORE */}

            {analysis.score_breakdown && (
              <div className="result-card">

                <div className="section-heading">

                  <span>
                    📊
                  </span>

                  <div>
                    <h3>
                      Resume Score Breakdown
                    </h3>

                    <p>
                      See how your resume score
                      was calculated
                    </p>
                  </div>

                </div>

                <div className="breakdown-list">

                  {Object.entries(
                    analysis.score_breakdown
                  ).map(
                    ([key, value]) => {

                      const percentage =
                        value.maximum > 0
                          ? (
                              value.score /
                              value.maximum
                            ) * 100
                          : 0;

                      return (
                        <div
                          className="breakdown-item"
                          key={key}
                        >

                          <div className="breakdown-top">

                            <span>
                              {key
                                .replaceAll(
                                  "_",
                                  " "
                                )
                                .replace(
                                  /\b\w/g,
                                  l =>
                                    l.toUpperCase()
                                )}
                            </span>

                            <strong>
                              {value.score}/
                              {value.maximum}
                            </strong>

                          </div>

                          <div className="progress-background">

                            <div
                              className="progress-fill"
                              style={{
                                width:
                                  `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                <div className="breakdown-total">

                  <span>
                    Total Resume Score
                  </span>

                  <strong>
                    {analysis.resume_score || 0}/100
                  </strong>

                </div>

              </div>
            )}

            {/* SKILLS */}

            <div className="result-card">

              <div className="section-heading">

                <span>
                  🎯
                </span>

                <div>

                  <h3>
                    Skills
                  </h3>

                  <p>
                    Technical skills detected
                    in your resume
                  </p>

                </div>

              </div>

              <div className="tags">

                {analysis.skills_found?.length
                  ? analysis.skills_found.map(
                      (skill, index) => (
                        <span
                          key={index}
                        >
                          {skill}
                        </span>
                      )
                    )
                  : (
                    <p>
                      No skills detected.
                    </p>
                  )}

              </div>

            </div>

            {/* EDUCATION */}

            <div className="result-card">

              <div className="section-heading">

                <span>
                  🎓
                </span>

                <div>

                  <h3>
                    Education
                  </h3>

                  <p>
                    Education details detected
                  </p>

                </div>

              </div>

              {analysis.education?.length ? (

                <ul className="clean-list">

                  {analysis.education.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}

                </ul>

              ) : (
                <p>
                  No education details detected.
                </p>
              )}

            </div>

            {/* EXPERIENCE */}

            <div className="result-card">

              <div className="section-heading">

                <span>
                  💼
                </span>

                <div>

                  <h3>
                    Experience & Projects
                  </h3>

                </div>

              </div>

              <div className="experience">
                ✓{" "}
                {analysis.experience ||
                  "No experience detected"}
              </div>

            </div>

            {/* CAREER */}

            <div className="result-card">

              <div className="section-heading">

                <span>
                  🚀
                </span>

                <div>

                  <h3>
                    Career Recommendations
                  </h3>

                </div>

              </div>

              <div className="career-grid">

                {analysis
                  .career_recommendations
                  ?.map(
                    (career, index) => (
                      <div
                        className="career-item"
                        key={index}
                      >
                        <span>
                          ✓
                        </span>
                        {career}
                      </div>
                    )
                  )}

              </div>

            </div>

            {/* SKILL GAP */}

            <div className="result-card">

              <div className="section-heading">

                <span>
                  🎯
                </span>

                <div>

                  <h3>
                    Skill Gap Analysis
                  </h3>

                </div>

              </div>

              {analysis.skill_gap?.length ? (

                <div className="gap-grid">

                  {analysis.skill_gap.map(
                    (skill, index) => (

                      <div
                        className="gap-item"
                        key={index}
                      >

                        <span>
                          📚
                        </span>

                        <div>

                          <strong>
                            {skill}
                          </strong>

                          <small>
                            Recommended skill
                          </small>

                        </div>

                      </div>

                    )
                  )}

                </div>

              ) : (
                <div className="empty-small">
                  ✓ No major skill gaps detected.
                </div>
              )}

            </div>

            {/* TIPS */}

            <div className="result-card">

              <div className="section-heading">

                <span>
                  💡
                </span>

                <div>

                  <h3>
                    Resume Improvement Tips
                  </h3>

                </div>

              </div>

              <div className="tips-list">

                {analysis.improvement_tips?.length
                  ? analysis.improvement_tips.map(
                      (tip, index) => (
                        <div
                          className="tip-item"
                          key={index}
                        >
                          <span>
                            💡
                          </span>

                          <p>
                            {tip}
                          </p>
                        </div>
                      )
                    )
                  : (
                    <>
                      <div className="tip-item">
                        <span>
                          💡
                        </span>
                        <p>
                          Consider adding internship
                          experience.
                        </p>
                      </div>

                      <div className="tip-item">
                        <span>
                          💡
                        </span>
                        <p>
                          Improve communication and
                          presentation skills.
                        </p>
                      </div>

                      <div className="tip-item">
                        <span>
                          💡
                        </span>
                        <p>
                          Practice problem-solving
                          and coding challenges.
                        </p>
                      </div>
                    </>
                  )}

              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            HISTORY
        ===================================================== */}

        <section id="resume-history" className="history-section">

          <div className="history-title">

            <div>

              <span className="small-label">
                📁 YOUR RESUMES
              </span>

              <h2>
                Resume History
              </h2>

              <p>
                Previously analyzed resumes
              </p>

            </div>

            <div className="history-actions">

              <span className="history-count">
                {history.length} resumes
              </span>

              <button
                className="refresh-btn"
                onClick={
                  fetchHistory
                }
              >
                {historyLoading
                  ? "Loading..."
                  : "↻ Refresh"}
              </button>

            </div>

          </div>

          {history.length === 0 &&
            !historyLoading && (

              <div className="empty-history">

                <span>
                  📄
                </span>

                <h3>
                  No Resume History
                </h3>

                <p>
                  Upload and analyze a resume
                  to see it here.
                </p>

              </div>
            )}

          {history.length > 0 && (

            <div className="history-list">

              {history.map(
                (resume, index) => (

                  <div
                    className="history-item"
                    key={
                      resume.resume_id ||
                      index
                    }
                  >

                    <div className="history-icon">
                      📄
                    </div>

                    <div className="history-info">

                      <h3>
                        {resume.filename}
                      </h3>

                      <p>
                        Status:{" "}
                        <strong>
                          {resume.status}
                        </strong>
                      </p>

                    </div>

                    <div className="history-score">

                      {resume.analysis ? (

                        <>
                          <strong>
                            {
                              resume.analysis
                                .resume_score || 0
                            }%
                          </strong>

                          <span>
                            Score
                          </span>
                        </>

                      ) : (
                        <span>
                          Not analyzed
                        </span>
                      )}

                    </div>

                    {resume.analysis && (

                      <button
                        className="view-btn"
                        onClick={() =>
                          viewHistory(
                            resume
                          )
                        }
                      >
                        🔍 View Analysis
                      </button>

                    )}

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/SpeechRecorder.css"; // ✅ CSS Connected

const SpeechRecorder = () => {

  const navigate = useNavigate();

  // ---------------- STATES ----------------
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState("");

  // ---------------- REFS ----------------
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const startTimeRef = useRef(0);
  const lastSpeechRef = useRef(0);
  const pausesRef = useRef([]);

  const textRef = useRef(""); // session storage (persists across engine restarts)


  // ---------------- CHECK LOGIN ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      window.location.href = "/login";
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };


  // ---------------- START RECORDING ----------------
  const startRecording = () => {

    if (isRecording) return;

    setError("");
    setResult(null);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;


    // Reset for FRESH session
    setText("");
    textRef.current = "";
    pausesRef.current = [];
    setRecordingTime(0);

    const now = performance.now();
    startTimeRef.current = now;
    lastSpeechRef.current = now;

    setIsRecording(true);
    recognition.start();

    // Timer setup
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);


    // ---------- ON RESULT ----------
    recognition.onresult = (event) => {
      const currentTime = performance.now();
      const gap = currentTime - lastSpeechRef.current;

      if (gap > 1200) {
        pausesRef.current.push(gap);
      }

      lastSpeechRef.current = currentTime;

      let currentChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentChunk += event.results[i][0].transcript;
      }

      setText(textRef.current + " " + currentChunk);
    };


    // ---------- ON END ----------
    recognition.onend = () => {
      // If user still wants to record but engine stopped (e.g. silence timeout)
      if (recognitionRef.current && isRecording) {
        console.log("Restarting speech engine for long speech support...");
        // Save what we have so far to textRef before resetting session index
        textRef.current = textRef.current + (textRef.current.endsWith(" ") ? "" : " ") + (document.querySelector(".transcript-text").innerText || "");
        
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Recognition restart failed (already started?)");
        }
        return;
      }

      // If user manually stopped
      if (!isRecording) {
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Final merge of what's on screen into textRef
        const currentScreenText = document.querySelector(".transcript-text")?.innerText || "";
        const finalText = currentScreenText.trim();

        if (!finalText) {
          setError("No speech captured. Try again.");
          return;
        }

        sendToBackend({
          text: finalText,
          totalTime: recordingTime || (performance.now() - startTimeRef.current) / 1000,
          pauses: pausesRef.current
        });
      }
    };


    // ---------- ON ERROR ----------
    recognition.onerror = (err) => {
      console.error("Speech Recognition Error:", err.error, err.message);
      
      let errorMsg = "Microphone error";
      
      switch (err.error) {
        case 'not-allowed':
          errorMsg = "Microphone access denied. Please enable it in browser settings and reload.";
          break;
        case 'no-speech':
          errorMsg = "No speech detected. Please check your microphone and try again.";
          break;
        case 'audio-capture':
          errorMsg = "No microphone found. Please connect one and try again.";
          break;
        case 'network':
          errorMsg = "Network error. Speech recognition requires an active internet connection.";
          break;
        case 'service-not-allowed':
          errorMsg = "Speech service is not allowed in this browser. Chrome is recommended.";
          break;
        default:
          errorMsg = `Microphone error: ${err.error}`;
      }

      setError(errorMsg);
      setIsRecording(false);
    };
  };


  // ---------------- STOP ----------------
  const stopRecording = () => {
    setIsRecording(false); // crucial to stop onend from restarting
    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };


  // ---------------- SEND TO BACKEND ----------------
  const sendToBackend = async (data) => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Session expired. Login again.");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/audio/analyze-text",
        {
          text: data.text,
          totalTime: data.totalTime,
          pauses: data.pauses
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      console.log("Backend:", res.data);

      setResult(res.data.analysis);

    } catch (err) {
      console.error("Backend error:", err.response?.data);
      const msg = err.response?.data?.message || "Analysis failed";
      setError(msg);

      if (err.response?.status === 401 || msg === "Invalid token" || msg === "Token expired") {
        setError(`${msg}. Please login again.`);
        // Optional: localStorage.removeItem("token");
      }
    }
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };


  // ---------------- ICONS ----------------
  const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
  );

  const GrammarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8" /><path d="M7 16V8" /><path d="M17 14h4" /><path d="M7 12h4" /><path d="M11 16V8" /></svg>
  );

  const AIIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
  );

  // ---------------- UI ----------------
  return (
    <div className="speech-container">
      <div className="recorder-header">
        <h2 className="speech-title">SpeakTrack</h2>
        <div className="header-actions">
          <button onClick={() => navigate("/analytics")} className="analytics-btn">
            View Analytics
          </button>
          <button onClick={() => navigate("/history")} className="history-btn">
            View History
          </button>
          <button onClick={clearSession} className="reset-btn">
            End Session
          </button>
        </div>
      </div>

      <div className="dashboard-surface">
        <div className="recorder-section">
          <div className="recorder-controls">
            {!isRecording ? (
              <button onClick={startRecording} className="speech-btn start-btn">
                <MicIcon /> Start Analysis
              </button>
            ) : (
              <div className="recording-active">
                <button onClick={stopRecording} className="speech-btn stop-btn">
                  <div className="pulse-indicator"></div> Stop Recording
                </button>
                <div className="recording-timer">
                   {formatTime(recordingTime)}
                </div>
              </div>
            )}
          </div>

          <div className="transcript-card">
            <span className="transcript-label">Live Transcription</span>
            <p className="transcript-text">
              {text || "Voice will be transcribed in real-time..."}
            </p>
          </div>
        </div>

        {error && (
          <div className="error-text" style={{
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto 40px',
            color: '#fb7185',
            fontWeight: 600,
            padding: '16px',
            background: 'rgba(251, 113, 133, 0.05)',
            border: '1px solid rgba(251, 113, 133, 0.2)',
            borderRadius: '12px'
          }}>
            {error}
          </div>
        )}

        {result && (
          <div className="analysis-dashboard">
            <div className="stats-dashboard">
              <div className="stat-card">
                <span className="stat-label">Word Count</span>
                <span className="stat-value">{result.totalWords}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Filler Words</span>
                <span className="stat-value" style={{ color: result.fillerCount > 5 ? '#fb7185' : 'var(--heading)' }}>
                  {result.fillerCount}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Vocabulary IQ</span>
                <span className="stat-value">{result.vocabularyScore}%</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '6px solid var(--secondary)' }}>
                <span className="stat-label">Fluency Score</span>
                <span className="stat-value">{result.fluencyScore}%</span>
              </div>
            </div>

            <div className="feedback-grid">
              {/* Grammar Section */}
              <div className="feedback-module">
                <div className="module-header">
                  <div className="module-icon"><GrammarIcon /></div>
                  <h2 className="module-title">Grammar & Mechanics</h2>
                </div>

                <div className="feedback-list">
                  {result.grammarErrors?.length === 0 ? (
                    <div className="ai-section" style={{ borderColor: 'var(--secondary)' }}>
                      <p style={{ color: 'var(--secondary)', fontWeight: 800, margin: 0 }}>Excellent Accuracy</p>
                    </div>
                  ) : (
                    result.grammarErrors.map((err, i) => (
                      <div key={i} className="feedback-item">
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span className="wrong-txt">{err.wrongText}</span>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 800 }}>→</span>
                            <span className="correct-txt">{err.suggestion}</span>
                          </div>
                          <p className="ai-text" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{err.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Insights Section */}
              <div className="feedback-module">
                <div className="module-header">
                  <div className="module-icon"><AIIcon /></div>
                  <h2 className="module-title">AI Personal Coach</h2>
                </div>

                {result.aiAnalysis && (
                  <div className="ai-card-content">
                    {result.aiAnalysis.correctedSentence && (
                      <div className="ai-section">
                        <span className="ai-section-title">Polished Version</span>
                        <p className="ai-text" style={{ color: 'var(--primary)', fontWeight: 700 }}>"{result.aiAnalysis.correctedSentence}"</p>
                      </div>
                    )}

                    {result.aiAnalysis.grammarExplanation && (
                      <div className="ai-section">
                        <span className="ai-section-title">Critical Insight</span>
                        <p className="ai-text">{result.aiAnalysis.grammarExplanation}</p>
                      </div>
                    )}

                    {result.aiAnalysis.fluencyTips && (
                      <div className="ai-section">
                        <span className="ai-section-title">Growth Strategy</span>
                        <p className="ai-text">{result.aiAnalysis.fluencyTips}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechRecorder;




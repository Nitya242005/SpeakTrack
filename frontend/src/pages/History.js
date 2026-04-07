import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/History.css";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/audio/history", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
      setError("Failed to load history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Icons (Reuse common ones from SpeechRecorder if possible, defining here for independence)
  const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
  );

  const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  );

  return (
    <div className="history-container">
      <div className="history-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeftIcon /> Back to Dashboard
        </button>
        <h1 className="history-title">Session History</h1>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your history...</p>
        </div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <h2>No sessions yet</h2>
          <p>Your speech analysis history will appear here once you start practicing.</p>
          <button className="start-btn" onClick={() => navigate("/dashboard")}>
            Start First Session
          </button>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((session) => (
            <div key={session._id} className="history-card glass-card">
              <div className="card-header">
                <span className="session-date">
                  <CalendarIcon /> {formatDate(session.createdAt)}
                </span>
                <span className="fluency-badge" style={{ 
                  color: session.fluencyScore > 70 ? 'var(--secondary)' : '#fb7185' 
                }}>
                  {session.fluencyScore}% Fluency
                </span>
              </div>

              <div className="card-body">
                <p className="transcript-preview">
                  "{session.transcript.length > 120 ? session.transcript.substring(0, 120) + "..." : session.transcript}"
                </p>
                
                <div className="card-stats">
                  <div className="mini-stat">
                    <span className="stat-label">Words</span>
                    <span className="stat-val">{session.totalWords}</span>
                  </div>
                  <div className="mini-stat">
                    <span className="stat-label">Vocabulary</span>
                    <span className="stat-val">{session.vocabularyScore}%</span>
                  </div>
                  <div className="mini-stat">
                    <span className="stat-label">Fillers</span>
                    <span className="stat-val" style={{ color: session.fillerCount > 5 ? '#fb7185' : 'var(--text-main)' }}>
                      {session.fillerCount}
                    </span>
                  </div>
                </div>

                {/* New: Key Insight Section */}
                {session.aiAnalysis && (
                  <div className="key-insight">
                    <span className="insight-label">Key Insight</span>
                    <p className="insight-text">
                      {session.aiAnalysis.speakingSuggestions || session.aiAnalysis.grammarExplanation || "Consistency is key to improvement."}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="card-footer">
                <button className="details-btn" onClick={() => navigate("/dashboard")}>
                  Re-analyze
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;

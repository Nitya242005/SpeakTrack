import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./styles/Login.css"; // ✅ CSS Connected

const Login = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");



  // ---------------- LOGIN ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      // Save token
      localStorage.setItem("token", res.data.token);

      // Redirect to recorder
      navigate("/dashboard");

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message || "Login failed"
      );
    }
  };



  // Icons
  const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle', opacity: 0.7 }}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
  );

  const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle', opacity: 0.7 }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
  );

  // ---------------- UI ----------------
  return (
    <div className="login-container">
      <div className="auth-split-layout">
        <div className="branding-section">
          <div className="branding-content">
            <span className="motto-text">SpeakTrack • AI Insight</span>
            <h1>Analyze your English Progress</h1>
            <p>Elevate your communication skills with real-time AI-powered fluency and grammar analysis.</p>
          </div>
        </div>

        <div className="form-section">
          <div className="login-card glass-card">
            <h2>Login</h2>

            {error && (
              <p className="error-text">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label><MailIcon /> Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label><LockIcon /> Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="login-btn">
                Login to Dashboard
              </button>
            </form>

            <div className="login-footer">
              Don't have an account? <Link to="/register">Join SpeakTrack</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


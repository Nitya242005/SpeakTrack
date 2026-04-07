import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./styles/Register.css"; // ✅ CSS Connected

const Register = () => {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");



  // ---------------- REGISTER ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {

      await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password }
      );

      alert("Registered successfully. Login now.");

      navigate("/login");

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message || "Registration failed"
      );
    }
  };



  // Icons
  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle', opacity: 0.7 }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  );

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
            <h1>Join the Future of Communication</h1>
            <p>Create your account and start receiving personalized AI feedback on your English speaking and grammar.</p>
          </div>
        </div>

        <div className="form-section">
          <div className="login-card glass-card">
            <h2>Register</h2>

            {error && (
              <p className="error-text">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label><UserIcon /> Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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
                <label><LockIcon /> Create Password</label>
                <input
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="login-btn">
                Create Account
              </button>
            </form>

            <div className="login-footer">
              Already have an account? <Link to="/login">Login instead</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


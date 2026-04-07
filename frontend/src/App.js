import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import SpeechRecorder from "./SpeechRecorder";
import History from "./pages/History";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";


// --------------------
// Private Route
// --------------------
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" />;
};


// --------------------
// Landing Page
// --------------------
const LandingPage = () => {

  const token = localStorage.getItem("token");

  // ✅ If already logged in → go dashboard
  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>🎯 SpeakTrack</h1>

      <p style={styles.subtitle}>
        Improve your English speaking, grammar, and fluency
        using AI-powered analysis.
      </p>

      <div style={styles.buttonBox}>

        <Link to="/login">
          <button style={styles.btnPrimary}>Login</button>
        </Link>

        <Link to="/register">
          <button style={styles.btnSecondary}>Register</button>
        </Link>

      </div>

    </div>
  );
};


// --------------------
// App
// --------------------
function App() {
  return (
    <Router>

      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <SpeechRecorder />
            </PrivateRoute>
          }
        />

        {/* History Page */}
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />

        {/* Analytics Dashboard */}
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <AnalyticsDashboard />
            </PrivateRoute>
          }
        />

      </Routes>

    </Router>
  );
}

export default App;


// --------------------
// Styles
// --------------------
const styles = {

  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#061b46",
    textAlign: "center",
    padding: "20px"
  },

  title: {
    fontSize: "48px",
    marginBottom: "10px",
    color: "#fafafa"
  },

  subtitle: {
    fontSize: "18px",
    color: "#ffffff",
    maxWidth: "500px",
    marginBottom: "30px"
  },

  buttonBox: {
    display: "flex",
    gap: "20px"
  },

  btnPrimary: {
    padding: "12px 25px",
    fontSize: "16px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },

  btnSecondary: {
    padding: "12px 25px",
    fontSize: "16px",
    background: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }

};





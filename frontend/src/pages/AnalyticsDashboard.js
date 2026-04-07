import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  CheckCircle, 
  Zap, 
  Activity, 
  Flag, 
  BarChart2, 
  Award, 
  MinusCircle 
} from "lucide-react";
import "../styles/AnalyticsDashboard.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/audio/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchProgressAnalysis = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/audio/ai-progress-analysis", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCoachData(res.data.analysis);
      }
    } catch (err) {
      console.error("Coach error:", err);
    } finally {
      setLoadingCoach(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchProgressAnalysis();
  }, [fetchAnalytics, fetchProgressAnalysis]);

  if (loading) return <div className="analytics-status">Loading Analytics...</div>;
  if (error) return <div className="analytics-status error">{error}</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  const fillerChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        suggestedMax: 5,
        ticks: {
          ...chartOptions.scales.y.ticks,
          stepSize: 1,
          precision: 0
        }
      }
    }
  };

  const fluencyData = {
    labels: data.trends.dates,
    datasets: [{
      label: 'Fluency',
      data: data.trends.fluency,
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#7c3aed'
    }]
  };

  const vocabData = {
    labels: data.trends.dates,
    datasets: [{
      label: 'Vocabulary',
      data: data.trends.vocabulary,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#10b981'
    }]
  };

  const fillerData = {
    labels: data.trends.dates,
    datasets: [{
      label: 'Fillers',
      data: data.trends.fillers,
      backgroundColor: '#f43f5e',
      borderRadius: 6,
    }]
  };

  const getTrend = (arr) => {
    if (arr.length < 2) return null;
    const last = arr[arr.length - 1];
    const prev = arr[arr.length - 2];
    if (last > prev) return "up";
    if (last < prev) return "down";
    return "stable";
  };

  const trends = data?.trends || {};
  const fluencyTrend = getTrend(trends.fluency || []);
  const vocabTrend = getTrend(trends.vocabulary || []);
  const fillerTrendStat = getTrend(trends.fillers || []);
  const wordsTrend = getTrend(trends.totalWords || []);

  const wordCountData = {
    labels: trends.dates,
    datasets: [{
      label: 'Word Count',
      data: trends.totalWords,
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }]
  };

  const radarData = {
    labels: ['Fluency', 'Vocab IQ', 'Clarity', 'Speed', 'Filler Control'],
    datasets: [{
      label: 'Skill Overview',
      data: [
        data.avgFluency,
        data.avgVocabulary,
        85,
        Math.min(100, Math.round(data.totalSessions * 5)),
        Math.max(0, 100 - (data.totalFillers / data.totalSessions) * 10)
      ],
      backgroundColor: 'rgba(124, 58, 237, 0.2)',
      borderColor: '#7c3aed',
      pointBackgroundColor: '#7c3aed',
      pointBorderColor: '#fff',
    }]
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#94a3b8', font: { size: 11 } },
        ticks: { display: false },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
           Back to Dashboard
        </button>
        <h1 className="analytics-title">Performance Analytics</h1>
      </header>

      <div className="analytics-grid-main">
        {/* TOP STATS */}
        <section className="stats-container">
          <div className="stat-card glass-card">
            <div className="stat-info">
              <span className="stat-label">Total Sessions</span>
              <span className="stat-value">{data.totalSessions}</span>
            </div>
            <Award className="stat-icon" size={24} />
          </div>

          <div className="stat-card glass-card">
            <div className="stat-info">
              <span className="stat-label">Avg. Fluency</span>
              <div className="stat-row">
                <span className="stat-value">{data.avgFluency}%</span>
                {fluencyTrend && (
                  <span className={`trend-tag ${fluencyTrend}`}>
                    {fluencyTrend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-info">
              <span className="stat-label">Avg. Vocab IQ</span>
              <div className="stat-row">
                <span className="stat-value">{data.avgVocabulary}%</span>
                {vocabTrend && (
                  <span className={`trend-tag ${vocabTrend}`}>
                    {vocabTrend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-info">
              <span className="stat-label">Total Fillers</span>
              <div className="stat-row">
                <span className="stat-value">{data.totalFillers}</span>
                {fillerTrendStat && (
                  <span className={`trend-tag ${fillerTrendStat === "up" ? "down" : "up"}`}>
                    {fillerTrendStat === "up" ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MIDDLE SECTION: GRAPHS & COACH */}
        <div className="dashboard-content">
          <div className="charts-column">
            <div className="chart-row">
              <div className="chart-item glass-card">
                <div className="chart-header">
                  <h3>Fluency Trend</h3>
                  <TrendingUp size={18} className="text-purple" />
                </div>
                <div className="chart-box">
                  <Line data={fluencyData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-item glass-card">
                <div className="chart-header">
                  <h3>Vocabulary Trend</h3>
                  <BarChart2 size={18} className="text-green" />
                </div>
                <div className="chart-box">
                  <Line data={vocabData} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="chart-row">
              <div className="chart-item glass-card">
                <div className="chart-header">
                  <h3>Filler Trend</h3>
                  <AlertTriangle size={18} className="text-red" />
                </div>
                <div className="chart-box">
                  <Bar data={fillerData} options={fillerChartOptions} />
                </div>
              </div>

              <div className="chart-item glass-card">
                <div className="chart-header">
                  <h3>Word Count Trend</h3>
                  <Activity size={18} className="text-blue" />
                </div>
                <div className="chart-box">
                  <Bar data={wordCountData} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="overview-section glass-card">
              <div className="overview-header">
                <h3>Performance Overview</h3>
                <span className="consistency-badge">
                  {data.avgFluency > 80 ? "Stable Performance" : "Fluctuating"}
                </span>
              </div>
              <div className="radar-container">
                <div className="radar-box">
                  <Radar data={radarData} options={radarOptions} />
                </div>
                <div className="insights-summary">
                  {data.insights.slice(0, 2).map((insight, idx) => (
                    <div key={idx} className="small-insight">
                      <CheckCircle size={14} />
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="coach-panel-redesign glass-card">
            <div className="coach-header-new">
              <Zap size={24} className="zap-icon" />
              <div className="coach-title-group">
                <h3>AI Progress Coach</h3>
                <span className="live-tag">Live Insights</span>
              </div>
            </div>

            {(loadingCoach) ? (
              <div className="coach-skeleton">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
            ) : coachData ? (
              <div className="coach-scrollable">
                <div className="coach-block">
                  <h4 className="label"><Activity size={14} /> Summary</h4>
                  <p className="summary-text">{coachData.summary}</p>
                </div>

                <div className="coach-block">
                  <h4 className="label text-green"><CheckCircle size={14} /> Improvements</h4>
                  <ul className="bullet-list">
                    {coachData.improvements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="coach-block">
                  <h4 className="label text-red"><AlertTriangle size={14} /> Weak Areas</h4>
                  <ul className="bullet-list">
                    {coachData.weakAreas.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="coach-block highlight">
                  <h4 className="label"><BarChart2 size={14} /> Pattern</h4>
                  <p>{coachData.pattern}</p>
                </div>

                <div className="coach-block">
                  <h4 className="label"><Target size={14} /> Action Plan</h4>
                  <div className="action-items">
                    {coachData.actionPlan.map((step, i) => (
                      <div key={i} className="action-step">
                        <span className="step-num">{i + 1}</span>
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="coach-block next-goal">
                  <h4 className="label"><Flag size={14} /> Next Goal</h4>
                  <div className="goal-card">
                    {coachData.nextGoal}
                  </div>
                </div>
              </div>
            ) : (
              <div className="coach-placeholder">
                <TrendingUp size={32} />
                <p>Record more sessions to unlock coaching.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

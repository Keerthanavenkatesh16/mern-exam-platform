import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import api from '../../api/axios';

// ─── Count-up hook (same as AdminDashboard) ───────────────────────────────────
const useCountUp = (target, duration = 900) => {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    const numericTarget = typeof target === 'number' ? target : parseFloat(target);
    if (isNaN(numericTarget)) { setDisplay(target); return; }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplay(Math.round(eased * numericTarget));
      if (elapsed < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return display;
};

const ExamAnalytics = () => {
  const { examId } = useParams();
  // ─── Original state — UNCHANGED ───────────────────────────────────────────
  const [analytics, setAnalytics] = useState(null);
  const [questionStats, setQuestionStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Original data fetch — UNCHANGED ──────────────────────────────────────
  useEffect(() => {
    api.get(`/analytics/exam/${examId}`).then(({ data }) => {
      setAnalytics(data.analytics);
      setQuestionStats(data.questionStats || []);
      setLoading(false);
    });
  }, [examId]);

  // ─── Skeleton loader ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="container">
      <h1>Exam Analytics</h1>
      <div className="skeleton-stats">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="skeleton skeleton-stat" key={i} />
        ))}
      </div>
    </div>
  );

  const chartData = questionStats.map((q, i) => ({ name: `Q${i + 1}`, ...q }));

  return (
    <div className="container">
      <h1>Exam Analytics</h1>

      <div className="stats-grid">
        <StatCard label="Total Attempts" value={analytics.totalAttempts} />
        <StatCard label="Average Score"  value={`${analytics.averageScore}%`} raw={analytics.averageScore} />
        <StatCard label="Highest Score"  value={`${analytics.highestScore}%`} raw={analytics.highestScore} />
        <StatCard label="Lowest Score"   value={`${analytics.lowestScore}%`}  raw={analytics.lowestScore} />
        <StatCard label="Pass Rate"      value={`${analytics.passPercentage}%`} raw={analytics.passPercentage} />
        <StatCard label="Passed / Failed" value={`${analytics.passCount} / ${analytics.failCount}`} />
      </div>

      <h3>Question-wise Analysis</h3>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          {/* isAnimationActive enables recharts built-in bar grow animation */}
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--card-bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
              }}
            />
            <Legend />
            <Bar dataKey="correct"   stackId="a" fill="#2e7d32" name="Correct"    isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
            <Bar dataKey="incorrect" stackId="a" fill="#c62828" name="Incorrect"  isAnimationActive={true} animationDuration={900} animationEasing="ease-out" />
            <Bar dataKey="unanswered" stackId="a" fill="#9e9e9e" name="Unanswered" isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── StatCard with count-up ───────────────────────────────────────────────────
// 'raw' is the numeric value for animation; 'value' is the display string.
// If raw is provided and value has a suffix (e.g. "%"), we show animated + suffix.
const StatCard = ({ label, value, raw }) => {
  const animated = useCountUp(raw !== undefined ? raw : (typeof value === 'number' ? value : null));
  const display = raw !== undefined
    ? `${animated}%`
    : typeof value === 'number' ? animated : value;

  return (
    <div className="card stat-card">
      <span className="stat-value">{display}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
};

export default ExamAnalytics;

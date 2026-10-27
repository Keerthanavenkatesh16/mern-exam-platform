import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'upcoming' | 'ended'
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [examsRes, notifRes] = await Promise.all([
          api.get('/exams'),
          api.get('/notifications'),
        ]);
        setExams(examsRes.data.exams || []);
        setNotifications((notifRes.data.notifications || []).slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="container">
      <div className="skeleton-hero" />
      <div className="grid-2col" style={{ marginTop: '1.5rem' }}>
        <div className="card-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton skeleton-line w-60" />
              <div className="skeleton skeleton-line w-80" />
              <div className="skeleton skeleton-line w-40" />
            </div>
          ))}
        </div>
        <div className="card-list">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton skeleton-line w-60" />
              <div className="skeleton skeleton-line w-80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const now = new Date();

  // Distinct subjects from exams
  const subjects = ['all', ...Array.from(new Set(exams.map((e) => e.subject).filter(Boolean)))];

  const filteredExams = exams.filter((exam) => {
    const started = new Date(exam.startTime) <= now;
    const ended = new Date(exam.endTime) < now;
    const isAvailable = started && !ended;

    if (activeFilter === 'active' && !isAvailable) return false;
    if (activeFilter === 'upcoming' && started) return false;
    if (activeFilter === 'ended' && !ended) return false;

    if (selectedSubject !== 'all' && exam.subject !== selectedSubject) {
      return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        exam.title?.toLowerCase().includes(q) ||
        exam.subject?.toLowerCase().includes(q) ||
        exam.description?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const availableCount = exams.filter((e) => new Date(e.startTime) <= now && new Date(e.endTime) >= now).length;
  const upcomingCount = exams.filter((e) => new Date(e.startTime) > now).length;
  const endedCount = exams.filter((e) => new Date(e.endTime) < now).length;

  return (
    <div className="container">
      {/* Futuristic Hero Banner */}
      <section className="student-hero-banner">
        <div className="hero-content">
          <div className="hero-greeting-tag">
            <span className="live-indicator-dot" />
            <span>Authenticated Student Portal · 2026 Academic Session</span>
          </div>
          <h1 className="hero-title">Welcome back, {user?.name || 'Student'}! 👋</h1>
          <p className="hero-subtitle">
            Access your secure examinations, verify scheduled assessments, and track instant graded evaluations with automated proctoring protection.
          </p>

          <div className="hero-metrics-row">
            <div className="hero-stat-card">
              <span className="stat-num">{exams.length}</span>
              <span className="stat-label">Total Exams</span>
            </div>
            <div className="hero-stat-card active-stat">
              <span className="stat-num">{availableCount}</span>
              <span className="stat-label">Available Now</span>
            </div>
            <div className="hero-stat-card">
              <span className="stat-num">{upcomingCount}</span>
              <span className="stat-label">Upcoming</span>
            </div>
            <div className="hero-stat-card security-stat">
              <span className="stat-num">100%</span>
              <span className="stat-label">Proctor Standing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <div className="dashboard-filter-toolbar">
        <div className="filter-pill-group" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Assessments ({exams.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            🟢 Available Now ({availableCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveFilter('upcoming')}
          >
            ⏳ Upcoming ({upcomingCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'ended' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ended')}
          >
            ✓ Past Tests ({endedCount})
          </button>
        </div>

        <div className="search-box-wrapper">
          <input
            className="search-input"
            placeholder="🔍 Search title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Pills */}
      {subjects.length > 2 && (
        <div className="subject-pills-row">
          <span className="subject-pills-label">Subject:</span>
          {subjects.map((sub) => (
            <button
              key={sub}
              type="button"
              className={`subject-pill ${selectedSubject === sub ? 'active' : ''}`}
              onClick={() => setSelectedSubject(sub)}
            >
              {sub === 'all' ? 'All Subjects' : sub}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid-2col">
        <section>
          {filteredExams.length === 0 && (
            <div className="card empty-state-card">
              <span style={{ fontSize: '3rem' }}>📂</span>
              <h3>No Examinations Found</h3>
              <p className="muted">
                {exams.length === 0
                  ? 'There are currently no examinations scheduled for your course.'
                  : 'No assessments match your active filter and search criteria.'}
              </p>
              {(activeFilter !== 'all' || selectedSubject !== 'all' || search) && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setActiveFilter('all');
                    setSelectedSubject('all');
                    setSearch('');
                  }}
                  style={{ marginTop: '0.8rem' }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}

          <div className="card-list">
            {filteredExams.map((exam) => {
              const started = new Date(exam.startTime) <= now;
              const ended = new Date(exam.endTime) < now;
              const isAvailable = started && !ended;

              return (
                <div
                  className={`exam-overview-card ${isAvailable ? 'available-glow' : ''}`}
                  key={exam._id}
                >
                  <div className="card-top-header">
                    <div className="title-and-chips">
                      <div className="exam-subject-chip">{exam.subject}</div>
                      <h3 className="exam-title-heading">{exam.title}</h3>
                    </div>
                    <span className={`status-pill status-${isAvailable ? 'active' : exam.status}`}>
                      {isAvailable ? '🟢 Available Now' : exam.status}
                    </span>
                  </div>

                  {exam.description && (
                    <p className="exam-desc-text">{exam.description}</p>
                  )}

                  <div className="exam-features-row">
                    <span className="exam-feat-chip">⏱️ {exam.duration} Minutes</span>
                    <span className="exam-feat-chip">📝 {exam.questionCount || exam.questions?.length || 0} Questions</span>
                    <span className="exam-feat-chip">🎯 {exam.totalMarks} Total Marks</span>
                    <span className="exam-feat-chip">🏆 Pass: {exam.passingMarks}</span>
                    {exam.negativeMarking && (
                      <span className="exam-feat-chip neg">⚠️ Negative Marking</span>
                    )}
                    {exam.proctoring?.requireFullscreen && (
                      <span className="exam-feat-chip proctor">🛡️ Fullscreen Enforced</span>
                    )}
                  </div>

                  <div className="exam-schedule-bar">
                    <span>📅 Available: {new Date(exam.startTime).toLocaleDateString()} {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(exam.endTime).toLocaleDateString()} {new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="card-actions-row">
                    {isAvailable && (
                      <Link className="btn btn-primary btn-start-glow" to={`/student/exam/${exam._id}`}>
                        🚀 Start Assessment Now →
                      </Link>
                    )}
                    {!started && (
                      <span className="status-pill status-scheduled">
                        🔒 Starts {new Date(exam.startTime).toLocaleString()}
                      </span>
                    )}
                    {ended && (
                      <Link className="btn btn-outline" to="/student/results">
                        📊 View Assessment Result
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sidebar Notifications & Quick Tools */}
        <aside className="student-sidebar">
          <div className="sidebar-section-header">
            <h3>Recent Announcements</h3>
            {notifications.length > 0 && (
              <span className="badge badge-student">{notifications.length}</span>
            )}
          </div>

          <div className="card-list">
            {notifications.map((n) => (
              <div className="card notification-card" key={n._id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📢</span>
                  <strong>{n.title}</strong>
                </div>
                <p style={{ margin: '0.35rem 0' }}>{n.message}</p>
                <span className="muted small">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="card" style={{ padding: '1.2rem', textAlign: 'center' }}>
                <p className="muted" style={{ margin: 0 }}>No new notifications at this time.</p>
              </div>
            )}
          </div>

          {/* Quick Performance Link */}
          <div className="card performance-shortcut-card">
            <h4>📈 Performance Center</h4>
            <p className="muted small">
              View your published exam results, question-by-question breakdown, and official certificates.
            </p>
            <Link
              to="/student/results"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              🎓 View My Results & Certificates
            </Link>
          </div>

          {/* Security & Code of Conduct Reminder */}
          <div className="card integrity-notice-card">
            <h4>🛡️ Academic Integrity Protocol</h4>
            <p className="muted small" style={{ margin: 0 }}>
              All assessments monitor tab focus, fullscreen exits, and device activity. Flagged anomalies are audited by the course faculty.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;

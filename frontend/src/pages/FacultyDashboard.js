import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// ─── Status-to-next-action map — UNCHANGED ────────────────────────────────
const statusActions = {
  draft:     [{ label: 'Schedule', next: 'scheduled' }],
  scheduled: [{ label: 'Archive', next: 'archived' }],
  active:    [{ label: 'Mark completed', next: 'completed' }],
  completed: [{ label: 'Publish results', next: 'published' }],
  published: [],
  archived:  [],
};

const FacultyDashboard = () => {
  // ─── Original state — UNCHANGED ───────────────────────────────────────────
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Original load function — UNCHANGED ────────────────────────────────────
  const load = useCallback(async () => {
    const { data } = await api.get('/exams');
    setExams(data.exams);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Original changeStatus — UNCHANGED ────────────────────────────────────
  const changeStatus = async (examId, next) => {
    await api.patch(`/exams/${examId}/status`, { status: next });
    if (next === 'published') {
      await api.patch(`/results/${examId}/publish`);
    }
    load();
  };

  // ─── Skeleton loader ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="container">
      <div className="page-header-row">
        <h1>My Exams</h1>
      </div>
      <div className="card-list">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton skeleton-line w-60" />
            <div className="skeleton skeleton-line w-80" />
            <div className="skeleton skeleton-line w-40" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="page-header-row">
        <h1>My Exams</h1>
        <div>
          <Link to="/faculty/question-banks" className="btn btn-outline">
            Question Banks
          </Link>
          <Link to="/faculty/exams/new" className="btn btn-primary">
            + New Exam
          </Link>
        </div>
      </div>

      <div className="card-list">
        {exams.map((exam) => (
          <div className="card" key={exam._id}>
            <div className="card-header">
              <h3>{exam.title}</h3>
              <span className={`status-pill status-${exam.status}`}>{exam.status}</span>
            </div>
            <p className="muted">
              {exam.subject} · {exam.questionCount} questions · {exam.totalMarks} marks
            </p>
            <p className="muted">
              {new Date(exam.startTime).toLocaleString()} → {new Date(exam.endTime).toLocaleString()}
            </p>
            <div className="card-actions">
              <Link className="btn btn-outline" to={`/faculty/exams/${exam._id}/attempts`}>
                View attempts
              </Link>
              <Link className="btn btn-outline" to={`/faculty/exams/${exam._id}/analytics`}>
                Analytics
              </Link>
              {(statusActions[exam.status] || []).map((action) => (
                <button
                  key={action.next}
                  className="btn btn-outline"
                  onClick={() => changeStatus(exam._id, action.next)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {exams.length === 0 && <p className="muted">You haven't created any exams yet.</p>}
      </div>
    </div>
  );
};

export default FacultyDashboard;

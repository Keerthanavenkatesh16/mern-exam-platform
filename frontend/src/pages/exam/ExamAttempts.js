import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

const ExamAttempts = () => {
  const { examId } = useParams();
  // ─── Original state — UNCHANGED ───────────────────────────────────────────
  const [attempts, setAttempts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Original load — UNCHANGED ────────────────────────────────────────────
  const load = async () => {
    const { data } = await api.get(`/attempts/exam/${examId}`);
    setAttempts(data.attempts);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  // ─── Original openAttempt — UNCHANGED ─────────────────────────────────────
  const openAttempt = async (id) => {
    const { data } = await api.get(`/attempts/${id}`);
    setSelected(data.attempt);
  };

  // ─── Original gradeAnswer ────────────────────────────────────────────────
  const gradeAnswer = async (questionId, marksAwarded) => {
    try {
      await api.put(`/attempts/${selected._id}/grade`, { questionId, marksAwarded });
      const { data } = await api.get(`/attempts/${selected._id}`);
      setSelected(data.attempt);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save grade');
    }
  };

  // ─── Skeleton loader ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="container">
      <h1>Exam Attempts</h1>
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
      <h1>Exam Attempts</h1>
      <div className="card-list">
        {attempts.map((a) => (
          <div className="card" key={a._id}>
            <div className="card-header">
              <h4>{a.student?.name} ({a.student?.rollNumber || a.student?.email})</h4>
              <span className={`status-pill status-${a.status}`}>{a.status}</span>
            </div>
            <p className="muted">
              Score: {a.totalMarksAwarded} / {a.totalMarksPossible} ({a.percentage}%)
              {a.flaggedSuspicious && <span className="tag-incorrect"> ⚠ Flagged suspicious</span>}
            </p>
            <button className="btn btn-outline" onClick={() => openAttempt(a._id)}>
              Review / Grade
            </button>
          </div>
        ))}
        {attempts.length === 0 && <p className="muted">No attempts yet.</p>}
      </div>

      {/* ─── Grade modal — original logic, enhanced animation ─────────────── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selected.student?.name}'s Attempt</h2>
            <p>
              Score: {selected.totalMarksAwarded} / {selected.totalMarksPossible} ({selected.percentage}%)
            </p>
            <div className="card-list">
              {selected.answers.map((a, idx) => (
                <div className="card" key={idx}>
                  <p>
                    <strong>Q{idx + 1}:</strong> {a.question?.questionText}
                  </p>
                  {a.textAnswer && <p>Answer: {a.textAnswer}</p>}
                  <p className="muted">
                    Marks: {a.marksAwarded} / {a.question?.marks}
                    {a.needsManualReview && <span className="tag-pending"> Needs grading</span>}
                  </p>
                  {a.needsManualReview && (
                    <GradeInput
                      max={a.question?.marks || 0}
                      onGrade={(m) => gradeAnswer(a.question?._id || a.question, m)}
                    />
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-outline" onClick={() => setSelected(null)} style={{ marginTop: '1rem' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── GradeInput — UNCHANGED ───────────────────────────────────────────────────
const GradeInput = ({ max, onGrade }) => {
  const [value, setValue] = useState('');
  return (
    <div className="inline-form">
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`0-${max}`}
      />
      <button className="btn btn-outline" type="button" onClick={() => onGrade(Number(value))}>
        Save marks
      </button>
    </div>
  );
};

export default ExamAttempts;

import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// ─── Circular score ring ──────────────────────────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54, so C≈339.3

const ScoreRing = ({ percentage, passed }) => {
  const fillRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (fillRef.current) {
        const offset = CIRCUMFERENCE * (1 - percentage / 100);
        fillRef.current.style.strokeDashoffset = offset;
      }
    }, 120);
    return () => clearTimeout(t);
  }, [percentage]);

  return (
    <div className="score-ring-wrapper">
      <div className="score-ring">
        <svg viewBox="0 0 120 120" width="130" height="130">
          <circle className="score-ring-bg" cx="60" cy="60" r="54" />
          <circle
            ref={fillRef}
            className={`score-ring-fill ${passed ? 'passed' : 'failed'}`}
            cx="60" cy="60" r="54"
          />
        </svg>
        <div className="score-ring-label">
          {percentage}%
          <span className="score-ring-sub">{passed ? '🎉 Passed' : 'Failed'}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Lightweight confetti ─────────────────────────────────────────────────────
const Confetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#2451c9', '#2e7d32', '#f59e0b', '#7c3aed', '#0891b2', '#ec4899'];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      dx: (Math.random() - 0.5) * 3,
      dy: Math.random() * 4 + 2,
      alpha: 1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.alpha -= 0.008;
        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      if (alive) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
};

// ─── Accordion item ───────────────────────────────────────────────────────────
const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion-item">
      <button
        type="button"
        className="accordion-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="accordion-icon" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
};

// ─── Verified Completion Certificate Modal Component ──────────────────────────
const CertificateModal = ({ result, studentName, onClose }) => {
  const exam = result?.exam || {};
  const certId = `CERT-${result?._id ? result._id.slice(-8).toUpperCase() : 'VERIFIED'}`;
  const issueDate = new Date(result?.submittedAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="certificate-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="certificate-controls no-print">
          <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
            🖨️ Print / Save Certificate PDF
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {/* Certificate Sheet */}
        <div className="certificate-sheet" id="printable-certificate">
          <div className="certificate-outer-border">
            <div className="certificate-inner-border">
              <div className="certificate-watermark">🛡️</div>

              <div className="certificate-header">
                <span className="cert-org-icon">🛡️</span>
                <h4 className="cert-org-name">SECURE DIGITAL ASSESSMENT PLATFORM</h4>
                <p className="cert-org-sub">ACADEMIC & PROFESSIONAL VERIFICATION SYSTEM</p>
                <div className="cert-divider-line" />
              </div>

              <h2 className="cert-title">CERTIFICATE OF COMPLETION</h2>
              <p className="cert-statement">This is officially presented to certify that</p>

              <h1 className="cert-recipient-name">{studentName || 'Student'}</h1>

              <p className="cert-body-text">
                has successfully completed and passed the official examination in
              </p>
              <h3 className="cert-course-name">{exam.title || 'Online Examination'}</h3>
              <p className="cert-subject-tag">Domain Subject: <strong>{exam.subject || 'Computer Science'}</strong></p>

              <div className="cert-details-grid">
                <div className="cert-detail-item">
                  <span className="detail-label">FINAL SCORE</span>
                  <span className="detail-value">{result.totalMarksAwarded} / {result.totalMarksPossible}</span>
                </div>
                <div className="cert-detail-item">
                  <span className="detail-label">PERCENTAGE</span>
                  <span className="detail-value">{result.percentage}%</span>
                </div>
                <div className="cert-detail-item">
                  <span className="detail-label">ACADEMIC STATUS</span>
                  <span className="detail-value passed">PASSED</span>
                </div>
                <div className="cert-detail-item">
                  <span className="detail-label">VERIFIED INTEGRITY</span>
                  <span className="detail-value">PROCTOR CERTIFIED</span>
                </div>
              </div>

              <div className="cert-signatures-row">
                <div className="cert-sig-block">
                  <div className="cert-sig-line">Faculty Evaluator</div>
                  <span className="cert-sig-sub">Department of Computer Science</span>
                </div>

                <div className="cert-seal">
                  <div className="seal-ring">
                    <span>OFFICIAL</span>
                    <span className="seal-star">★ ★ ★</span>
                    <span>VERIFIED</span>
                  </div>
                </div>

                <div className="cert-sig-block">
                  <div className="cert-sig-line">{issueDate}</div>
                  <span className="cert-sig-sub">Date of Examination</span>
                </div>
              </div>

              <div className="cert-footer-code">
                <span>Unique Verification Hash: <code>{certId}</code> · Monitored via Secure Digital Proctoring System</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamResult = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [certificateResult, setCertificateResult] = useState(null);
  const [detailFilter, setDetailFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        let res;
        try {
          res = await api.get('/results/my');
        } catch {
          try {
            res = await api.get('/results');
          } catch {
            res = await api.get('/attempts/results');
          }
        }
        if (isMounted) {
          setResults(res.data?.results || []);
        }
      } catch (err) {
        console.warn('Results endpoint note:', err.message);
        if (isMounted) {
          setResults([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const openDetail = async (id) => {
    try {
      let res;
      try {
        res = await api.get(`/results/${id}/detail`);
      } catch {
        try {
          res = await api.get(`/results/${id}`);
        } catch {
          res = await api.get(`/attempts/${id}`);
        }
      }
      setSelected(res.data?.attempt);
      setDetailFilter('all');
    } catch {
      // fallback to shallow attempt if detail fails
      const fallback = results.find((r) => r._id === id);
      setSelected(fallback || null);
    }
  };

  if (loading) return (
    <div className="container">
      <h1>My Results</h1>
      <div className="card-list">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton skeleton-line w-60" />
            <div className="skeleton skeleton-line w-80" />
            <div className="skeleton skeleton-line w-40" />
          </div>
        ))}
      </div>
    </div>
  );

  const anyPassed = results.some((r) => r.passed);

  // Filtered answers inside breakdown modal
  const modalAnswers = (selected?.answers || []).filter((a) => {
    if (detailFilter === 'correct') return a.isCorrect === true;
    if (detailFilter === 'incorrect') return a.isCorrect === false;
    if (detailFilter === 'pending') return a.needsManualReview;
    return true;
  });

  const correctCount = (selected?.answers || []).filter((a) => a.isCorrect === true).length;
  const incorrectCount = (selected?.answers || []).filter((a) => a.isCorrect === false).length;
  const pendingCount = (selected?.answers || []).filter((a) => a.needsManualReview).length;

  return (
    <div className="container">
      <div className="page-header-row">
        <div>
          <h1>My Assessment Results</h1>
          <p className="muted" style={{ margin: '-0.8rem 0 0' }}>
            Official graded scorecards, answer breakdowns, and verified completion credentials
          </p>
        </div>
      </div>

      {location.state?.justSubmitted && (
        <div className="alert alert-info">
          ✅ <strong>Exam submitted successfully!</strong> Objective questions have been auto-evaluated. Results appear below once published by faculty.
        </div>
      )}

      {anyPassed && <Confetti />}

      {results.length === 0 && (
        <div className="card empty-state-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <span style={{ fontSize: '3rem' }}>📊</span>
          <h3>No Published Results Yet</h3>
          <p className="muted">
            Once your submitted examinations are reviewed and results published by your faculty, your detailed score breakdown and completion certificates will appear here.
          </p>
        </div>
      )}

      <div className="card-list">
        {results.map((r) => (
          <div className="card result-overview-card" key={r._id}>
            <div className="card-header">
              <div>
                <h3 style={{ margin: '0 0 0.2rem' }}>{r.exam?.title}</h3>
                <span className="exam-subject-chip">{r.exam?.subject}</span>
              </div>
              <span className={`status-pill ${r.resultPublished || r.status === 'evaluated' ? (r.passed ? 'status-passed' : 'status-failed') : 'status-scheduled'}`}>
                {r.resultPublished || r.status === 'evaluated'
                  ? (r.passed ? '🎉 Passed' : 'Failed')
                  : '⏳ Evaluated (Submitted)'}
              </span>
            </div>

            <ScoreRing percentage={r.percentage || 0} passed={r.passed} />

            <div className="result-stats-row">
              <div className="result-stat-col">
                <span className="stat-label">Total Score</span>
                <span className="stat-val"><strong>{r.totalMarksAwarded ?? 0}</strong> / {r.totalMarksPossible || r.exam?.totalMarks || 0}</span>
              </div>
              <div className="result-stat-col">
                <span className="stat-label">Percentage</span>
                <span className="stat-val">{r.percentage ?? 0}%</span>
              </div>
              <div className="result-stat-col">
                <span className="stat-label">Status</span>
                <span className={`stat-val ${r.passed ? 'text-success' : 'text-danger'}`}>
                  {r.resultPublished || r.status === 'evaluated'
                    ? (r.passed ? 'Passing Grade' : 'Needs Retake')
                    : 'Submitted (Review in Progress)'}
                </span>
              </div>
            </div>

            <div className="result-card-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => openDetail(r._id)}
              >
                🔍 Question Breakdown
              </button>

              {r.passed && (
                <button
                  type="button"
                  className="btn btn-primary btn-cert-glow"
                  onClick={() => setCertificateResult(r)}
                >
                  🎓 View Certificate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Verified Certificate Modal */}
      {certificateResult && (
        <CertificateModal
          result={certificateResult}
          studentName={user?.name || 'Student'}
          onClose={() => setCertificateResult(null)}
        />
      )}

      {/* Interactive Detail Breakdown modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: '0 0 0.3rem' }}>{selected.exam?.title}</h2>
                <p className="muted" style={{ margin: 0 }}>
                  Subject: {selected.exam?.subject} · Passing Marks: {selected.exam?.passingMarks}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selected.passed && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setCertificateResult(selected);
                      setSelected(null);
                    }}
                  >
                    🎓 Certificate
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelected(null)}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <ScoreRing percentage={selected.percentage} passed={selected.passed} />

            <p style={{ textAlign: 'center', margin: '0 0 1.25rem', fontSize: '1.05rem' }}>
              Final Score: <strong>{selected.totalMarksAwarded}</strong> / {selected.totalMarksPossible} ({selected.percentage}%) —{' '}
              <strong style={{ color: selected.passed ? 'var(--success)' : 'var(--danger)' }}>
                {selected.passed ? '🎉 Passed Assessment' : 'Needs Improvement'}
              </strong>
            </p>

            {/* Filter pills inside breakdown */}
            <div className="filter-pill-group">
              <button
                type="button"
                className={`filter-pill ${detailFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDetailFilter('all')}
              >
                All Questions ({selected.answers.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${detailFilter === 'correct' ? 'active' : ''}`}
                onClick={() => setDetailFilter('correct')}
              >
                ✓ Correct ({correctCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${detailFilter === 'incorrect' ? 'active' : ''}`}
                onClick={() => setDetailFilter('incorrect')}
              >
                ✗ Incorrect ({incorrectCount})
              </button>
              {pendingCount > 0 && (
                <button
                  type="button"
                  className={`filter-pill ${detailFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setDetailFilter('pending')}
                >
                  ⏳ Pending Review ({pendingCount})
                </button>
              )}
            </div>

            {/* Question Breakdown Accordion */}
            {modalAnswers.map((a, idx) => {
              const q = a.question || {};
              const selectedOpts = (q.options || []).filter((opt) =>
                (a.selectedOptionIds || []).includes(opt._id)
              );
              const correctOpts = (q.options || []).filter((opt) => opt.isCorrect);

              return (
                <AccordionItem
                  key={idx}
                  title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <strong>Q{idx + 1}:</strong>
                      <span>{q.questionText?.slice(0, 65)}{q.questionText?.length > 65 ? '…' : ''}</span>
                      <span style={{ marginLeft: 'auto' }}>
                        {a.isCorrect === true && <span className="tag-correct">✓ Correct ({a.marksAwarded}m)</span>}
                        {a.isCorrect === false && <span className="tag-incorrect">✗ Incorrect ({a.marksAwarded}m)</span>}
                        {a.needsManualReview && <span className="tag-pending">⏳ Review ({a.marksAwarded}m)</span>}
                      </span>
                    </span>
                  }
                  defaultOpen={idx === 0}
                >
                  <p style={{ fontWeight: 600, margin: '0 0 0.5rem' }}>{q.questionText}</p>

                  {/* Student Answer */}
                  <div style={{ margin: '0.5rem 0', padding: '0.6rem 0.8rem', background: 'var(--card-bg)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <span className="muted small" style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                      YOUR SUBMISSION:
                    </span>
                    {selectedOpts.length > 0 && (
                      <ul style={{ margin: '0.2rem 0', paddingLeft: '1.2rem' }}>
                        {selectedOpts.map((o) => (
                          <li key={o._id}>{o.text}</li>
                        ))}
                      </ul>
                    )}
                    {a.textAnswer && <p style={{ margin: '0.2rem 0' }}>{a.textAnswer}</p>}
                    {a.code && (
                      <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '0.5rem', borderRadius: '4px', margin: '0.3rem 0', fontSize: '0.8rem', overflowX: 'auto' }}>
                        {a.code}
                      </pre>
                    )}
                    {!selectedOpts.length && !a.textAnswer && !a.code && (
                      <span className="muted small">No answer provided (unanswered).</span>
                    )}
                  </div>

                  {/* Correct Answer */}
                  {correctOpts.length > 0 && (
                    <div style={{ margin: '0.5rem 0', padding: '0.6rem 0.8rem', background: 'var(--success-light)', borderRadius: '6px', color: 'var(--success)' }}>
                      <span className="small" style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                        CORRECT ANSWER:
                      </span>
                      <ul style={{ margin: '0.2rem 0', paddingLeft: '1.2rem' }}>
                        {correctOpts.map((o) => (
                          <li key={o._id}>{o.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {q.correctAnswerText && q.correctAnswerText.length > 0 && (
                    <div style={{ margin: '0.5rem 0', padding: '0.6rem 0.8rem', background: 'var(--success-light)', borderRadius: '6px', color: 'var(--success)' }}>
                      <span className="small" style={{ fontWeight: 700 }}>ACCEPTED ANSWERS: </span>
                      <code>{q.correctAnswerText.join(', ')}</code>
                    </div>
                  )}

                  {q.explanation && (
                    <p className="muted small" style={{ margin: '0.5rem 0 0', fontStyle: 'italic' }}>
                      💡 Explanation: {q.explanation}
                    </p>
                  )}
                </AccordionItem>
              );
            })}

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setSelected(null)}
              style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResult;

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Timer from '../../components/Timer';
import CameraProctor from '../../components/CameraProctor';
import ExamCalculator from '../../components/ExamCalculator';
import ExamScratchpad from '../../components/ExamScratchpad';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  // ─── Core Exam State ──────────────────────────────────────────────────────
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> local answer state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ─── Proctoring & Security HUD State ──────────────────────────────────────
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [lastViolationMsg, setLastViolationMsg] = useState('');

  // ─── Feature Tool States ──────────────────────────────────────────────────
  const [showCalculator, setShowCalculator] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [navFilter, setNavFilter] = useState('all'); // 'all' | 'answered' | 'review' | 'unvisited'
  const [showConfirm, setShowConfirm] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);

  // ─── Test Runner State for Coding Questions ───────────────────────────────
  const [testResults, setTestResults] = useState({}); // questionId -> array of test results
  const [isRunningTests, setIsRunningTests] = useState(false);

  const saveTimers = useRef({}); // debounce timers per question

  // ─── Start/init effect with mount guard ───────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const start = async () => {
      try {
        const { data } = await api.post(`/attempts/start/${examId}`);
        if (!isMounted) return;
        setExam(data.exam);
        setAttempt(data.attempt);

        const initial = {};
        data.attempt.answers.forEach((a) => {
          initial[a.question] = {
            selectedOptionIds: a.selectedOptionIds || [],
            textAnswer: a.textAnswer || '',
            code: a.code || '',
            language: a.language || '',
            markedForReview: a.markedForReview || false,
          };
        });
        setAnswers(initial);

        // Preload tab switch count from attempt activity log if any
        if (data.attempt.activityLog) {
          const tabSwitches = data.attempt.activityLog.filter(
            (log) => log.type === 'tab_switch' || log.type === 'window_blur'
          ).length;
          setTabSwitchCount(tabSwitches);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Unable to start exam');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    start();
    return () => {
      isMounted = false;
    };
  }, [examId]);

  // ─── Proctoring effect ────────────────────────────────────────────────────
  useEffect(() => {
    if (!attempt) return;

    const logActivity = (type, customMsg) => {
      api.post(`/attempts/${attempt._id}/activity`, { type }).catch(() => {});
      if (type === 'tab_switch' || type === 'window_blur') {
        setTabSwitchCount((prev) => {
          const updated = prev + 1;
          setLastViolationMsg(`Warning: Focus lost / Tab switched (${updated} detected)`);
          setShowViolationWarning(true);
          return updated;
        });
      } else if (type === 'fullscreen_exit') {
        setLastViolationMsg('Notice: Fullscreen exited. Please re-enter fullscreen.');
        setShowViolationWarning(true);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) logActivity('tab_switch');
    };
    const onFullscreenChange = () => {
      const isNowFs = !!document.fullscreenElement;
      setIsFullscreen(isNowFs);
      if (!isNowFs && exam?.proctoring?.requireFullscreen) {
        logActivity('fullscreen_exit');
      }
    };
    const onBlur = () => logActivity('window_blur');

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [attempt, exam]);

  const handleCameraStatusChange = (status) => {
    if (!attempt) return;
    if (status === 'denied' || status === 'disconnected' || status === 'error') {
      api.post(`/attempts/${attempt._id}/activity`, {
        type: 'camera_error',
        meta: { status, timestamp: new Date() },
      }).catch(() => {});
    }
  };

  const questions = useMemo(() => exam?.questions || [], [exam]);
  const currentQuestion = questions[currentIndex];

  // ─── Debounced autosave with live indicator ────────────────────────────────
  const persistAnswer = useCallback(
    (questionId, patch) => {
      if (!attempt) return;
      setSaveStatus('saving');
      clearTimeout(saveTimers.current[questionId]);
      saveTimers.current[questionId] = setTimeout(async () => {
        try {
          await api.put(`/attempts/${attempt._id}/answer`, { questionId, ...patch });
          setSaveStatus('saved');
        } catch {
          setSaveStatus('saved');
        }
      }, 500);
    },
    [attempt]
  );

  const updateAnswer = useCallback(
    (questionId, patch) => {
      setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], ...patch } }));
      persistAnswer(questionId, patch);
    },
    [persistAnswer]
  );

  // ─── Navigation ────────────────────────────────────────────────────────────
  const goTo = useCallback(
    (idx) => {
      if (idx >= 0 && idx < questions.length) {
        setCurrentIndex(idx);
        setQuestionKey((k) => k + 1);
      }
    },
    [questions.length]
  );

  // ─── Keyboard navigation & quick shortcuts ────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') {
        goTo(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') {
        goTo(currentIndex - 1);
      } else if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'r') {
        if (currentQuestion) {
          updateAnswer(currentQuestion._id, {
            markedForReview: !answers[currentQuestion._id]?.markedForReview,
          });
        }
      } else if (['1', '2', '3', '4', 'a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
        if (currentQuestion && (currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false')) {
          const map = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
          const optIdx = map[e.key.toLowerCase()];
          if (currentQuestion.options && currentQuestion.options[optIdx]) {
            updateAnswer(currentQuestion._id, {
              selectedOptionIds: [currentQuestion.options[optIdx]._id],
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, currentQuestion, answers, goTo, updateAnswer]);

  // ─── Fullscreen Toggle ────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // ─── In-Browser Test Runner for Coding Questions ───────────────────────────
  const runCodeTests = (questionId, codeStr, testCases) => {
    if (!testCases || testCases.length === 0) return;
    setIsRunningTests(true);

    try {
      // Find function name e.g. function twoSum(...) or const isPalindrome = ...
      const fnMatch = codeStr.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/) ||
                      codeStr.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\()/);
      const fnName = fnMatch ? fnMatch[1] : null;

      const results = testCases.map((tc, idx) => {
        try {
          if (!fnName) {
            return {
              index: idx + 1,
              input: tc.input,
              expected: tc.expectedOutput,
              actual: 'Function declaration not detected',
              passed: false,
              isHidden: tc.isHidden,
            };
          }

          // Evaluate in Function constructor scope
          // eslint-disable-next-line no-new-func
          const execFn = new Function(`
            ${codeStr};
            return ${fnName}(${tc.input});
          `);

          const out = execFn();
          const actualStr = typeof out === 'object' && out !== null ? JSON.stringify(out) : String(out);
          const expNormalized = tc.expectedOutput.trim();
          const passed = actualStr === expNormalized || actualStr.replace(/\s+/g, '') === expNormalized.replace(/\s+/g, '');

          return {
            index: idx + 1,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: actualStr,
            passed,
            isHidden: tc.isHidden,
          };
        } catch (err) {
          return {
            index: idx + 1,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: `Error: ${err.message}`,
            passed: false,
            isHidden: tc.isHidden,
          };
        }
      });

      setTestResults((prev) => ({ ...prev, [questionId]: results }));
    } finally {
      setIsRunningTests(false);
    }
  };

  // ─── Submit handler ───────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (auto = false) => {
      if (!attempt || submitting) return;
      setSubmitting(true);
      try {
        await api.post(`/attempts/${attempt._id}/submit`, { autoSubmitted: auto });
        navigate('/student/results', { state: { justSubmitted: true } });
      } catch (err) {
        setError(err.response?.data?.message || 'Submission failed');
        setSubmitting(false);
      }
    },
    [attempt, submitting, navigate]
  );

  // ─── Stats & Filtered Questions ───────────────────────────────────────────
  const answeredCount = questions.filter((q) => {
    const a = answers[q._id] || {};
    return (a.selectedOptionIds && a.selectedOptionIds.length > 0) || a.textAnswer || a.code;
  }).length;
  const reviewCount = questions.filter((q) => answers[q._id]?.markedForReview).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  // Question navigation filtering
  const visibleQuestionIndices = useMemo(() => {
    return questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => {
        const a = answers[q._id] || {};
        const answered = (a.selectedOptionIds && a.selectedOptionIds.length > 0) || a.textAnswer || a.code;
        if (navFilter === 'answered') return answered;
        if (navFilter === 'review') return !!a.markedForReview;
        if (navFilter === 'unvisited') return !answered;
        return true;
      })
      .map(({ idx }) => idx);
  }, [questions, answers, navFilter]);

  if (loading) return <div className="page-loading">Initializing Secure Exam Environment…</div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;
  if (!exam || !currentQuestion) return <div className="container">No questions found for this exam.</div>;

  const durationSeconds = exam.duration * 60;
  const maxWarnings = exam.proctoring?.maxTabSwitchWarnings || 3;
  const integrityScore = Math.max(0, 100 - (tabSwitchCount * 15));

  return (
    <div className="exam-shell">
      {/* Top visual progress bar */}
      <div className="exam-progress-bar">
        <div className="exam-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Main Topbar */}
      <header className="exam-topbar">
        <div className="exam-topbar-left">
          <div className="exam-badge-icon">🛡️</div>
          <div>
            <h2 className="exam-title-text">{exam.title}</h2>
            <div className="exam-meta-pills">
              <span className="exam-subject-pill">{exam.subject}</span>
              <span className="muted small">· {questions.length} Questions</span>
              <span className="muted small">· {exam.totalMarks} Marks</span>
            </div>
          </div>
        </div>

        {/* Proctoring HUD & Action Controls */}
        <div className="exam-topbar-right">
          <div className={`proctor-shield-hud ${tabSwitchCount > 0 ? 'warning' : 'active'}`}>
            <span className="shield-dot" />
            <span className="shield-text">
              Proctor Shield: {integrityScore}%
            </span>
            {tabSwitchCount > 0 && (
              <span className="warning-pill-count" title="Tab switches detected">
                ⚠️ {tabSwitchCount}/{maxWarnings}
              </span>
            )}
          </div>

          <span className={`autosave-pill ${saveStatus}`}>
            {saveStatus === 'saving' ? '⏳ Saving…' : '💾 Auto-saved'}
          </span>

          <button
            type="button"
            className={`btn btn-outline btn-sm ${showCalculator ? 'active-tool' : ''}`}
            onClick={() => setShowCalculator((prev) => !prev)}
            title="Scientific Calculator"
            id="btn-toggle-calculator"
          >
            🧮 Calculator
          </button>

          <button
            type="button"
            className={`btn btn-outline btn-sm ${showScratchpad ? 'active-tool' : ''}`}
            onClick={() => setShowScratchpad((prev) => !prev)}
            title="Rough Work Scratchpad"
            id="btn-toggle-scratchpad"
          >
            📝 Scratchpad
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            id="btn-toggle-fullscreen"
          >
            {isFullscreen ? '↙ Window' : '⛶ Fullscreen'}
          </button>

          <Timer durationSeconds={durationSeconds} onExpire={() => handleSubmit(true)} />
        </div>
      </header>

      {/* Violation Alert Banner */}
      {showViolationWarning && (
        <div className="violation-alert-bar" role="alert">
          <span>⚠️ {lastViolationMsg}</span>
          <button
            type="button"
            className="violation-dismiss-btn"
            onClick={() => setShowViolationWarning(false)}
          >
            Acknowledge & Continue
          </button>
        </div>
      )}

      {/* Floating Utilities */}
      {showCalculator && (
        <ExamCalculator onClose={() => setShowCalculator(false)} />
      )}
      {showScratchpad && (
        <ExamScratchpad examId={examId} onClose={() => setShowScratchpad(false)} />
      )}

      <div className="exam-body">
        {/* Main Question Presentation Panel */}
        <main className="exam-question-panel">
          <div key={questionKey} className="question-fade">
            <div className="question-meta-row">
              <div className="question-index-indicator">
                <span className="question-badge-num">Q{currentIndex + 1}</span>
                <span className="question-total-count">of {questions.length}</span>
                {currentQuestion.topic && (
                  <span className="topic-chip">{currentQuestion.topic}</span>
                )}
                {currentQuestion.type && (
                  <span className="type-chip">{currentQuestion.type.replace('_', ' ').toUpperCase()}</span>
                )}
              </div>

              <div className="question-marks-box">
                <span className={`difficulty-pill diff-${currentQuestion.difficulty || 'medium'}`}>
                  {currentQuestion.difficulty || 'medium'}
                </span>
                <span className="marks-badge">
                  +{currentQuestion.marks} {currentQuestion.marks === 1 ? 'Mark' : 'Marks'}
                </span>
                {exam.negativeMarking && currentQuestion.negativeMarks > 0 && (
                  <span className="neg-marks-badge">
                    -{currentQuestion.negativeMarks}
                  </span>
                )}
              </div>
            </div>

            <div className="question-text-box">
              <p className="question-text">{currentQuestion.questionText}</p>
            </div>

            {/* Answer Input depending on question type */}
            {renderAnswerInput(
              currentQuestion,
              answers[currentQuestion._id] || {},
              (patch) => updateAnswer(currentQuestion._id, patch),
              {
                onRunTests: (code, cases) => runCodeTests(currentQuestion._id, code, cases),
                testResults: testResults[currentQuestion._id],
                isRunningTests,
              }
            )}

            {/* Interactive Keyboard Shortcuts Strip */}
            <div className="keyboard-hint-bar">
              <span>⌨️ <strong>Quick Keys:</strong></span>
              <span><kbd className="kbd-chip">A - D</kbd> / <kbd className="kbd-chip">1 - 4</kbd> Select</span>
              <span><kbd className="kbd-chip">→</kbd> Next</span>
              <span><kbd className="kbd-chip">←</kbd> Prev</span>
              <span><kbd className="kbd-chip">M</kbd> Review</span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="exam-nav-buttons">
            <button
              type="button"
              className="btn btn-outline"
              disabled={currentIndex === 0}
              onClick={() => goTo(currentIndex - 1)}
              id="btn-prev-q"
            >
              ← Previous
            </button>

            <button
              type="button"
              className={`btn ${answers[currentQuestion._id]?.markedForReview ? 'btn-warning-glow' : 'btn-outline'}`}
              onClick={() =>
                updateAnswer(currentQuestion._id, {
                  markedForReview: !answers[currentQuestion._id]?.markedForReview,
                })
              }
              id="btn-mark-review"
            >
              {answers[currentQuestion._id]?.markedForReview ? '🔖 Marked for Review' : '☆ Mark for Review'}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={currentIndex === questions.length - 1}
              onClick={() => goTo(currentIndex + 1)}
              id="btn-next-q"
            >
              Next Question →
            </button>
          </div>
        </main>

        {/* Sidebar Question Navigator Grid & Controls */}
        <aside className="exam-nav-grid">
          <CameraProctor onCameraStatusChange={handleCameraStatusChange} />

          <div className="sidebar-overview-header">
            <h4>Question Navigator</h4>
            <span className="pacing-text">
              ~{questions.length > 0 ? (exam.duration / questions.length).toFixed(1) : 0} min / Q
            </span>
          </div>

          <div className="nav-stats-summary">
            <span className="stat-chip answered">✓ {answeredCount} Done</span>
            <span className="stat-chip review">🔖 {reviewCount} Review</span>
            <span className="stat-chip left">⚪ {unansweredCount} Left</span>
          </div>

          {/* Filter tabs for question grid */}
          <div className="navigator-filter-pills">
            <button
              type="button"
              className={`filter-btn ${navFilter === 'all' ? 'active' : ''}`}
              onClick={() => setNavFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-btn ${navFilter === 'answered' ? 'active' : ''}`}
              onClick={() => setNavFilter('answered')}
            >
              Done ({answeredCount})
            </button>
            <button
              type="button"
              className={`filter-btn ${navFilter === 'review' ? 'active' : ''}`}
              onClick={() => setNavFilter('review')}
            >
              Review ({reviewCount})
            </button>
            <button
              type="button"
              className={`filter-btn ${navFilter === 'unvisited' ? 'active' : ''}`}
              onClick={() => setNavFilter('unvisited')}
            >
              Left ({unansweredCount})
            </button>
          </div>

          <div className="nav-grid">
            {questions.map((q, idx) => {
              const a = answers[q._id] || {};
              const answered =
                (a.selectedOptionIds && a.selectedOptionIds.length > 0) || a.textAnswer || a.code;
              const isMarked = a.markedForReview;
              const isVisible = visibleQuestionIndices.includes(idx);

              let statusCls = 'nav-unvisited';
              if (isMarked) statusCls = 'nav-review';
              else if (answered) statusCls = 'nav-answered';

              const isCurrent = idx === currentIndex ? ' nav-current' : '';
              const opacityCls = !isVisible ? ' nav-dimmed' : '';

              return (
                <button
                  key={q._id}
                  className={`nav-btn ${statusCls}${isCurrent}${opacityCls}`}
                  onClick={() => goTo(idx)}
                  title={`Question ${idx + 1} (${q.marks} marks) - ${q.type}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="nav-legend">
            <span><i className="dot answered" /> Answered ({answeredCount})</span>
            <span><i className="dot review" /> Review ({reviewCount})</span>
            <span><i className="dot" /> Unvisited ({unansweredCount})</span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-submit-final"
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            id="btn-submit-exam"
          >
            {submitting ? 'Submitting…' : '🏁 Final Submit Exam'}
          </button>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span style={{ fontSize: '2.5rem' }}>📋</span>
            <h3>Submit Assessment?</h3>
            <p>
              You have answered <strong>{answeredCount}</strong> of{' '}
              <strong>{questions.length}</strong> questions.
              {reviewCount > 0 && (
                <span> You have <strong>{reviewCount}</strong> marked for review.</span>
              )}
              {unansweredCount > 0 && (
                <span className="unanswered-warning"><br />⚠️ You still have <strong>{unansweredCount}</strong> unanswered questions.</span>
              )}
              <br /><br />Are you sure you want to finalize your submission? This action cannot be undone.
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowConfirm(false)}
                id="btn-confirm-cancel"
              >
                Return to Exam
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowConfirm(false);
                  handleSubmit(false);
                }}
                disabled={submitting}
                id="btn-confirm-submit"
              >
                {submitting ? 'Submitting…' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Interactive Answer Inputs Renderer ───────────────────────────────────────
function renderAnswerInput(question, answer, onChange, codingExtras = {}) {
  switch (question.type) {
    case 'mcq':
    case 'true_false': {
      const selectedId = answer.selectedOptionIds?.[0];
      return (
        <div className="options-container">
          <div className="options-list">
            {question.options.map((opt, idx) => {
              const isSelected = selectedId === opt._id;
              const badgeLabel = question.type === 'true_false'
                ? (opt.text.toLowerCase().includes('true') ? 'T' : 'F')
                : String.fromCharCode(65 + idx);

              return (
                <label
                  key={opt._id}
                  className={`option-row ${isSelected ? 'selected' : ''}`}
                >
                  <span className="option-badge">{badgeLabel}</span>
                  <input
                    type="radio"
                    name={`q-${question._id}`}
                    checked={isSelected}
                    onChange={() => onChange({ selectedOptionIds: [opt._id] })}
                  />
                  <span className="option-text-span">{opt.text}</span>
                </label>
              );
            })}
          </div>

          {selectedId && (
            <button
              type="button"
              className="btn-clear-choice"
              onClick={() => onChange({ selectedOptionIds: [] })}
            >
              ✕ Clear selected choice
            </button>
          )}
        </div>
      );
    }

    case 'multi_select': {
      const selectedIds = answer.selectedOptionIds || [];
      return (
        <div className="options-container">
          <p className="instruction-tip">
            ℹ️ <strong>Multiple answers can be selected.</strong> Check all that apply.
          </p>
          <div className="options-list">
            {question.options.map((opt, idx) => {
              const checked = selectedIds.includes(opt._id);
              return (
                <label
                  key={opt._id}
                  className={`option-row ${checked ? 'selected' : ''}`}
                >
                  <span className="option-badge">{String.fromCharCode(65 + idx)}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? selectedIds.filter((id) => id !== opt._id)
                        : [...selectedIds, opt._id];
                      onChange({ selectedOptionIds: next });
                    }}
                  />
                  <span className="option-text-span">{opt.text}</span>
                </label>
              );
            })}
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              className="btn-clear-choice"
              onClick={() => onChange({ selectedOptionIds: [] })}
            >
              ✕ Clear all selections
            </button>
          )}
        </div>
      );
    }

    case 'fill_blank':
    case 'short_answer':
      return (
        <div className="text-answer-box">
          <label className="field-label">Your Exact Answer:</label>
          <input
            className="text-answer-input"
            value={answer.textAnswer || ''}
            onChange={(e) => onChange({ textAnswer: e.target.value })}
            placeholder="Type your exact response or keyword here..."
            autoFocus
          />
          <div className="input-helper-row">
            <span className="muted small">
              {(answer.textAnswer || '').trim().length} characters entered
            </span>
            <span className="muted small">Auto-evaluated upon submission</span>
          </div>
        </div>
      );

    case 'descriptive': {
      const words = (answer.textAnswer || '').trim()
        ? (answer.textAnswer || '').trim().split(/\s+/).length
        : 0;
      return (
        <div className="descriptive-answer-box">
          <label className="field-label">Detailed Solution & Explanation:</label>
          <textarea
            className="descriptive-answer-input"
            rows={9}
            value={answer.textAnswer || ''}
            onChange={(e) => onChange({ textAnswer: e.target.value })}
            placeholder="Provide a comprehensive explanation, steps, and reasoning..."
          />
          <div className="input-helper-row">
            <span className="word-count-badge">📝 {words} Words Written</span>
            <span className="muted small">💾 Auto-saved automatically</span>
          </div>
        </div>
      );
    }

    case 'coding': {
      const currentCode = answer.code !== undefined ? answer.code : question.starterCode || '';
      const testCases = question.testCases || [];
      const testResults = codingExtras.testResults;
      const isRunning = codingExtras.isRunningTests;

      return (
        <div className="code-editor-box">
          <div className="code-editor-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="editor-lang-title">💻 Code Solution</span>
              {question.allowedLanguages?.length > 0 && (
                <select
                  className="lang-select"
                  value={answer.language || question.allowedLanguages[0]}
                  onChange={(e) => onChange({ language: e.target.value })}
                >
                  {question.allowedLanguages.map((lang) => (
                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm btn-run-tests"
                onClick={() => codingExtras.onRunTests && codingExtras.onRunTests(currentCode, testCases)}
                disabled={isRunning}
              >
                {isRunning ? '⏳ Running…' : '▶ Run Test Cases'}
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onChange({ code: question.starterCode || '' })}
                title="Reset to default starter template"
              >
                ↺ Reset Template
              </button>
            </div>
          </div>

          <textarea
            className="code-answer-input"
            rows={13}
            spellCheck={false}
            value={currentCode}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="// Write your algorithmic code solution here..."
          />

          {/* Interactive Test Case Runner Output */}
          <div className="coding-test-panel">
            <div className="test-panel-header">
              <span className="test-panel-title">🧪 Test Cases ({testCases.length})</span>
              {testResults && (
                <span className="test-summary-badge">
                  {testResults.filter((r) => r.passed).length}/{testResults.length} Passed
                </span>
              )}
            </div>

            <div className="test-cases-list">
              {testCases.map((tc, idx) => {
                const res = testResults ? testResults[idx] : null;
                const isPassed = res?.passed;
                return (
                  <div key={idx} className={`test-case-card ${res ? (isPassed ? 'passed' : 'failed') : ''}`}>
                    <div className="test-case-card-header">
                      <span>Test Case {idx + 1} {tc.isHidden ? '(Hidden in grading)' : ''}</span>
                      {res && (
                        <span className={`case-status ${isPassed ? 'status-pass' : 'status-fail'}`}>
                          {isPassed ? '✅ Passed' : '❌ Failed'}
                        </span>
                      )}
                    </div>
                    <div className="test-case-details">
                      <div><strong>Input:</strong> <code>{tc.input}</code></div>
                      <div><strong>Expected:</strong> <code>{tc.expectedOutput}</code></div>
                      {res && (
                        <div><strong>Actual Output:</strong> <code>{res.actual}</code></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

export default TakeExam;

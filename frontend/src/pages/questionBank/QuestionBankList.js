import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import QuestionForm from './QuestionForm';

const QuestionBankList = () => {
  const [banks, setBanks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBank, setNewBank] = useState({ name: '', subject: '', description: '' });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [banksRes, questionsRes] = await Promise.all([
        api.get('/question-banks'),
        api.get('/questions'),
      ]);
      setBanks(banksRes.data.banks || []);
      setQuestions(questionsRes.data.questions || []);
    } catch (err) {
      console.error('Failed to load question banks and questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createBank = async (e) => {
    e.preventDefault();
    try {
      await api.post('/question-banks', newBank);
      setNewBank({ name: '', subject: '', description: '' });
      loadAll();
    } catch (err) {
      console.error('Failed to create question bank:', err);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      q.questionText?.toLowerCase().includes(term) ||
      q.subject?.toLowerCase().includes(term) ||
      q.topic?.toLowerCase().includes(term) ||
      q.tags?.some((t) => t.toLowerCase().includes(term));
    const matchesDifficulty =
      selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchesType =
      selectedType === 'all' || q.type === selectedType;
    return matchesSearch && matchesDifficulty && matchesType;
  });

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'easy':
        return <span className="status-pill status-passed">Easy</span>;
      case 'hard':
        return <span className="status-pill status-failed">Hard</span>;
      case 'medium':
      default:
        return <span className="status-pill status-active">Medium</span>;
    }
  };

  const toggleExpand = (id) => {
    setExpandedQuestionId((prev) => (prev === id ? null : id));
  };

  const questionTypes = [
    { label: 'All Types', value: 'all' },
    { label: 'MCQ', value: 'mcq' },
    { label: 'Multi-Select', value: 'multi_select' },
    { label: 'True/False', value: 'true_false' },
    { label: 'Fill in Blank', value: 'fill_blank' },
    { label: 'Short Answer', value: 'short_answer' },
    { label: 'Descriptive', value: 'descriptive' },
    { label: 'Coding', value: 'coding' },
  ];

  return (
    <div className="container">
      <div className="page-header-row">
        <div>
          <h1>Question Bank</h1>
          <p className="muted" style={{ margin: '-0.8rem 0 0' }}>
            Manage reusable question repositories, interactive filters, topics, and difficulties
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowQuestionForm(true)}
          id="btn-create-question"
        >
          <span>+</span> New Question
        </button>
      </div>

      <div className="grid-2col">
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <h3 style={{ margin: 0 }}>Question Banks ({banks.length})</h3>
          </div>

          <form className="inline-form" onSubmit={createBank} style={{ gap: '0.6rem', marginBottom: '1.2rem' }}>
            <input
              placeholder="Bank name (e.g. Algorithms)"
              value={newBank.name}
              onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
              required
              style={{ flex: 1.2 }}
            />
            <input
              placeholder="Subject"
              value={newBank.subject}
              onChange={(e) => setNewBank({ ...newBank, subject: e.target.value })}
              required
              style={{ flex: 1 }}
            />
            <button className="btn btn-outline" type="submit" style={{ whiteSpace: 'nowrap' }}>
              Create Bank
            </button>
          </form>

          {loading ? (
            <div className="card-list">
              {[1, 2, 3].map((i) => (
                <div className="skeleton-card" key={i}>
                  <div className="skeleton skeleton-line w-60" />
                  <div className="skeleton skeleton-line w-40" />
                  <div className="skeleton skeleton-line w-80" />
                </div>
              ))}
            </div>
          ) : (
            <div className="card-list">
              {banks.map((b) => (
                <div className="card" key={b._id}>
                  <div className="card-header">
                    <h4 style={{ margin: 0 }}>📁 {b.name}</h4>
                    <span className="status-pill status-scheduled">{b.subject}</span>
                  </div>
                  {b.description && (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem' }}>{b.description}</p>
                  )}
                </div>
              ))}
              {banks.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p className="muted" style={{ margin: 0 }}>No question banks created yet. Add one above to organize questions.</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <h3 style={{ margin: 0 }}>
              Questions ({filteredQuestions.length} of {questions.length})
            </h3>
          </div>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              placeholder="🔍 Search questions, topics, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 2, padding: '0.5rem 0.8rem' }}
            />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{ flex: 1, padding: '0.5rem 0.8rem' }}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {searchTerm && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </button>
            )}
          </div>

          {/* Interactive Type Filter Pills */}
          <div className="filter-pill-group">
            {questionTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`filter-pill ${selectedType === t.value ? 'active' : ''}`}
                onClick={() => setSelectedType(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="card-list">
              {[1, 2, 3].map((i) => (
                <div className="skeleton-card" key={i}>
                  <div className="skeleton skeleton-line w-80" />
                  <div className="skeleton skeleton-line w-40" />
                </div>
              ))}
            </div>
          ) : (
            <div className="card-list">
              {filteredQuestions.map((q) => {
                const isExpanded = expandedQuestionId === q._id;
                return (
                  <div
                    className="card"
                    key={q._id}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={() => toggleExpand(q._id)}
                  >
                    <div className="card-header" style={{ alignItems: 'flex-start', gap: '0.6rem' }}>
                      <strong style={{ fontSize: '0.92rem', lineHeight: 1.4, flex: 1 }}>
                        {q.questionText}
                      </strong>
                      <span className="status-pill status-draft" style={{ whiteSpace: 'nowrap' }}>
                        {q.type}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                      {getDifficultyBadge(q.difficulty)}
                      <span className="status-pill status-completed">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
                      <span className="muted small" style={{ marginLeft: 'auto' }}>
                        {q.subject}{q.topic ? ` · ${q.topic}` : ''}
                      </span>
                      <span className="muted small" style={{ marginLeft: '0.3rem' }}>
                        {isExpanded ? '▲ Hide' : '▼ Details'}
                      </span>
                    </div>

                    {/* Interactive Expanded Preview */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid var(--border)',
                          fontSize: '0.85rem',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Options preview for objective questions */}
                        {q.options && q.options.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
                            <strong className="muted small">Options:</strong>
                            {q.options.map((opt, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.35rem 0.6rem',
                                  borderRadius: '6px',
                                  background: opt.isCorrect ? 'var(--success-light)' : 'var(--muted-bg)',
                                  color: opt.isCorrect ? 'var(--success)' : 'inherit',
                                  fontWeight: opt.isCorrect ? 600 : 'normal',
                                }}
                              >
                                <span>{String.fromCharCode(65 + idx)}.</span>
                                <span>{opt.text}</span>
                                {opt.isCorrect && <span style={{ marginLeft: 'auto' }}>✓ Correct</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Fill blank / short answer accepted texts */}
                        {q.correctAnswerText && q.correctAnswerText.length > 0 && (
                          <p style={{ margin: '0.4rem 0' }}>
                            <strong className="muted small">Accepted answers: </strong>
                            <code style={{ background: 'var(--muted-bg)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                              {q.correctAnswerText.join(', ')}
                            </code>
                          </p>
                        )}

                        {/* Coding test cases */}
                        {q.type === 'coding' && (
                          <div style={{ marginTop: '0.4rem' }}>
                            <strong className="muted small">Starter Code:</strong>
                            <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '0.6rem', borderRadius: '6px', margin: '0.3rem 0', overflowX: 'auto', fontSize: '0.8rem' }}>
                              {q.starterCode || '// No starter code'}
                            </pre>
                            {q.testCases && q.testCases.length > 0 && (
                              <span className="muted small">
                                🧪 {q.testCases.length} test case{q.testCases.length === 1 ? '' : 's'} defined
                              </span>
                            )}
                          </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                          <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)', fontStyle: 'italic' }}>
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredQuestions.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p className="muted" style={{ margin: 0 }}>
                    {questions.length === 0
                      ? 'No questions created yet. Click "+ New Question" to add one.'
                      : 'No questions match the selected filter.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {showQuestionForm && (
        <div className="modal-overlay" onClick={() => setShowQuestionForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <QuestionForm
              banks={banks}
              onCreated={() => {
                setShowQuestionForm(false);
                loadAll();
              }}
              onCancel={() => setShowQuestionForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankList;

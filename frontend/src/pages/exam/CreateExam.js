import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const CreateExam = () => {
  const navigate = useNavigate();
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    course: '',
    department: '',
    totalMarks: '',
    passingMarks: '',
    duration: 60,
    startTime: '',
    endTime: '',
    negativeMarking: false,
    randomizeQuestions: false,
    instructions: '',
  });

  useEffect(() => {
    api
      .get('/questions')
      .then(({ data }) => setAvailableQuestions(data.questions || []))
      .catch((err) => console.error('Failed to fetch questions:', err))
      .finally(() => setLoadingQuestions(false));
  }, []);

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const toggleQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredQuestions.map((q) => q._id);
    setSelectedQuestions((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const clearSelected = () => {
    setSelectedQuestions([]);
  };

  const computedTotal = availableQuestions
    .filter((q) => selectedQuestions.includes(q._id))
    .reduce((sum, q) => sum + (q.marks || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (selectedQuestions.length === 0) {
      setError('Please select at least one question for this exam.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/exams', {
        ...form,
        totalMarks: Number(form.totalMarks) || computedTotal,
        passingMarks: Number(form.passingMarks),
        duration: Number(form.duration),
        questions: selectedQuestions,
      });
      navigate('/faculty');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuestions = availableQuestions.filter((q) => {
    const qText = q.questionText?.toLowerCase() || '';
    const qSubj = q.subject?.toLowerCase() || '';
    const query = filterQuery.toLowerCase();
    return qText.includes(query) || qSubj.includes(query);
  });

  return (
    <div className="container">
      <div className="page-header-row">
        <div>
          <h1>Create New Assessment</h1>
          <p className="muted" style={{ margin: '-0.8rem 0 0' }}>
            Configure exam metadata, schedule, proctoring options, and question paper
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <form className="form-card" onSubmit={handleSubmit} style={{ gap: '1.5rem' }}>
        {/* Section 1: Basic Information */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.2rem' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--primary)' }}>1. Basic Information</h3>
          
          <label>Exam Title</label>
          <input
            placeholder="e.g. Mid-Term Examination - Data Structures"
            value={form.title}
            onChange={update('title')}
            required
          />

          <label>Description</label>
          <textarea
            placeholder="Brief overview or topics covered in this examination..."
            value={form.description}
            onChange={update('description')}
            rows={2}
          />

          <div className="form-grid">
            <div>
              <label>Subject</label>
              <input
                placeholder="e.g. Computer Science"
                value={form.subject}
                onChange={update('subject')}
                required
              />
            </div>
            <div>
              <label>Course / Program</label>
              <input
                placeholder="e.g. B.Tech CS"
                value={form.course}
                onChange={update('course')}
              />
            </div>
            <div>
              <label>Department</label>
              <input
                placeholder="e.g. School of Computing"
                value={form.department}
                onChange={update('department')}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Timing & Scoring */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.2rem' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--primary)' }}>2. Timing & Marks Allocation</h3>

          <div className="form-grid">
            <div>
              <label>Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                value={form.duration}
                onChange={update('duration')}
                required
              />
            </div>
            <div>
              <label>Passing Marks</label>
              <input
                type="number"
                min="0"
                value={form.passingMarks}
                onChange={update('passingMarks')}
                required
              />
            </div>
            <div>
              <label>
                Total Marks{' '}
                <span className="muted small">
                  (Auto-computed: {computedTotal})
                </span>
              </label>
              <input
                type="number"
                value={form.totalMarks}
                onChange={update('totalMarks')}
                placeholder={`Auto: ${computedTotal}`}
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div>
              <label>Start Window</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={update('startTime')}
                required
              />
            </div>
            <div>
              <label>End Window</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={update('endTime')}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Assessment Rules */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.2rem' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--primary)' }}>3. Assessment Integrity & Instructions</h3>

          <div className="checkbox-row" style={{ background: 'var(--muted-bg)', padding: '0.8rem 1rem', borderRadius: '8px' }}>
            <label>
              <input
                type="checkbox"
                checked={form.negativeMarking}
                onChange={update('negativeMarking')}
              />
              Enable Negative Marking
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.randomizeQuestions}
                onChange={update('randomizeQuestions')}
              />
              Shuffle Question Sequence
            </label>
          </div>

          <label style={{ marginTop: '0.8rem' }}>Student Instructions</label>
          <textarea
            value={form.instructions}
            onChange={update('instructions')}
            placeholder="e.g. Do not switch tabs or exit fullscreen mode during the examination..."
            rows={3}
          />
        </div>

        {/* Section 4: Question Selection */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>
              4. Question Paper ({selectedQuestions.length} selected · {computedTotal} marks)
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={selectAllFiltered}
                disabled={filteredQuestions.length === 0}
              >
                Select Filtered
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={clearSelected}
                disabled={selectedQuestions.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <input
              placeholder="Search available questions by text or subject..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            />
          </div>

          {loadingQuestions ? (
            <div className="skeleton-card" style={{ padding: '1.5rem' }}>
              <div className="skeleton skeleton-line w-80" />
              <div className="skeleton skeleton-line w-60" />
            </div>
          ) : (
            <div className="question-picker" style={{ maxHeight: '340px' }}>
              {filteredQuestions.map((q) => {
                const isSelected = selectedQuestions.includes(q._id);
                return (
                  <label
                    key={q._id}
                    className="question-picker-row"
                    style={{
                      background: isSelected ? 'var(--primary-glow)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                      padding: '0.6rem 0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      borderRadius: '6px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleQuestion(q._id)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span className="status-pill status-draft small">{q.type}</span>
                        <span className="status-pill status-completed small">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
                        <span className="muted small">{q.subject}</span>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                        {q.questionText}
                      </span>
                    </div>
                  </label>
                );
              })}
              {filteredQuestions.length === 0 && (
                <p className="muted" style={{ padding: '1rem', textAlign: 'center' }}>
                  {availableQuestions.length === 0
                    ? 'No questions available. Please create some in the Question Bank first.'
                    : 'No questions match your search filter.'}
                </p>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/faculty')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting || selectedQuestions.length === 0}
            style={{ padding: '0.65rem 1.6rem' }}
          >
            {submitting ? 'Creating Exam...' : 'Create Exam'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;

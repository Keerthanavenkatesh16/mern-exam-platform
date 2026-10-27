import React, { useState } from 'react';
import api from '../../api/axios';

const emptyOption = () => ({ text: '', isCorrect: false });

const QuestionForm = ({ banks, onCreated, onCancel }) => {
  const [form, setForm] = useState({
    questionText: '',
    type: 'mcq',
    subject: '',
    topic: '',
    difficulty: 'medium',
    marks: 1,
    negativeMarks: 0,
    explanation: '',
    questionBank: '',
  });
  const [options, setOptions] = useState([emptyOption(), emptyOption()]);
  const [correctAnswerText, setCorrectAnswerText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const updateOption = (idx, patch) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  };

  const setSingleCorrect = (idx) => {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
  };

  const removeOption = (idx) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const needsOptions = ['mcq', 'multi_select', 'true_false'].includes(form.type);
  const needsTextAnswer = ['fill_blank', 'short_answer'].includes(form.type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        marks: Number(form.marks),
        negativeMarks: Number(form.negativeMarks),
      };
      if (needsOptions) payload.options = options.filter((o) => o.text.trim());
      if (needsTextAnswer) payload.correctAnswerText = correctAnswerText.split(',').map((s) => s.trim());
      if (!payload.questionBank) delete payload.questionBank;

      await api.post('/questions', payload);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} style={{ border: 'none', padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Create New Question</h2>
          <p className="muted small" style={{ margin: '0.2rem 0 0' }}>
            Add an item to the assessment question pool
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--muted)' }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <label>Question Prompt / Text</label>
      <textarea
        value={form.questionText}
        onChange={update('questionText')}
        rows={3}
        placeholder="Enter the full question statement..."
        required
      />

      <div className="form-grid">
        <div>
          <label>Question Type</label>
          <select value={form.type} onChange={update('type')}>
            <option value="mcq">Multiple Choice (Single)</option>
            <option value="multi_select">Multiple Select (Checkboxes)</option>
            <option value="true_false">True / False</option>
            <option value="fill_blank">Fill in the Blank</option>
            <option value="short_answer">Short Answer</option>
            <option value="descriptive">Descriptive (Manual)</option>
            <option value="coding">Programming / Coding</option>
          </select>
        </div>
        <div>
          <label>Difficulty Level</label>
          <select value={form.difficulty} onChange={update('difficulty')}>
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>
        </div>
        <div>
          <label>Question Bank (Optional)</label>
          <select value={form.questionBank} onChange={update('questionBank')}>
            <option value="">— Unassigned —</option>
            {banks.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-grid">
        <div>
          <label>Subject</label>
          <input
            placeholder="e.g. Computer Networks"
            value={form.subject}
            onChange={update('subject')}
            required
          />
        </div>
        <div>
          <label>Topic / Unit</label>
          <input
            placeholder="e.g. OSI Model"
            value={form.topic}
            onChange={update('topic')}
          />
        </div>
        <div>
          <label>Marks</label>
          <input
            type="number"
            min="1"
            value={form.marks}
            onChange={update('marks')}
            required
          />
        </div>
        <div>
          <label>Negative Marks</label>
          <input
            type="number"
            step="0.25"
            min="0"
            value={form.negativeMarks}
            onChange={update('negativeMarks')}
          />
        </div>
      </div>

      {needsOptions && (
        <div style={{ marginTop: '0.8rem', padding: '1rem', background: 'var(--muted-bg)', borderRadius: '10px' }}>
          <label style={{ margin: '0 0 0.5rem', display: 'block' }}>
            Answer Options (Mark correct answer{form.type === 'multi_select' ? 's' : ''}):
          </label>
          {options.map((opt, idx) => (
            <div className="option-edit-row" key={idx} style={{ gap: '0.6rem' }}>
              <input
                type={form.type === 'multi_select' ? 'checkbox' : 'radio'}
                name="correct-option-group"
                checked={opt.isCorrect}
                onChange={() =>
                  form.type === 'multi_select'
                    ? updateOption(idx, { isCorrect: !opt.isCorrect })
                    : setSingleCorrect(idx)
                }
                style={{ width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer' }}
                title="Mark as correct answer"
              />
              <input
                placeholder={`Option ${idx + 1}`}
                value={opt.text}
                onChange={(e) => updateOption(idx, { text: e.target.value })}
                required={idx < 2}
                style={{ flex: 1 }}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--danger)', padding: '0.2rem 0.5rem' }}
                  title="Remove option"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {form.type !== 'true_false' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setOptions([...options, emptyOption()])}
              style={{ marginTop: '0.5rem' }}
            >
              + Add Option
            </button>
          )}
        </div>
      )}

      {needsTextAnswer && (
        <div style={{ marginTop: '0.8rem' }}>
          <label>Accepted Answers (Comma-separated for variations)</label>
          <input
            placeholder="e.g. TCP, Transmission Control Protocol"
            value={correctAnswerText}
            onChange={(e) => setCorrectAnswerText(e.target.value)}
          />
        </div>
      )}

      {form.type === 'descriptive' && (
        <div className="alert alert-info" style={{ marginTop: '0.8rem' }}>
          ℹ️ Descriptive questions will require faculty evaluation in the Exam Attempts tab.
        </div>
      )}
      {form.type === 'coding' && (
        <div className="alert alert-info" style={{ marginTop: '0.8rem' }}>
          ℹ️ Students will receive a code editor to write their solution.
        </div>
      )}

      <div style={{ marginTop: '0.8rem' }}>
        <label>Solution Explanation (Shown to students after results are published)</label>
        <textarea
          value={form.explanation}
          onChange={update('explanation')}
          rows={2}
          placeholder="Detailed reasoning or reference..."
        />
      </div>

      <div className="card-actions" style={{ justifyContent: 'flex-end', marginTop: '1.2rem', gap: '0.8rem' }}>
        <button className="btn btn-outline" type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Question'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;

import React, { useState, useEffect } from 'react';

const ExamScratchpad = ({ examId, onClose }) => {
  const storageKey = `scratchpad_${examId || 'general'}`;
  const [content, setContent] = useState(() => {
    return sessionStorage.getItem(storageKey) || '';
  });
  const [savedTime, setSavedTime] = useState('Saved locally');

  useEffect(() => {
    sessionStorage.setItem(storageKey, content);
    setSavedTime('Auto-saved to session');
  }, [content, storageKey]);

  const handleClear = () => {
    if (window.confirm('Clear all scratchpad notes?')) {
      setContent('');
      sessionStorage.removeItem(storageKey);
    }
  };

  return (
    <div className="exam-scratchpad-drawer" role="dialog" aria-label="Scratchpad & Notes">
      <div className="scratchpad-header">
        <div className="scratchpad-title">
          <span>📝 Rough Work & Scratchpad</span>
          <span className="scratchpad-subtitle">{savedTime}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleClear}
            title="Clear all text"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          >
            Clear
          </button>
          <button
            type="button"
            className="calculator-close-btn"
            onClick={onClose}
            aria-label="Close scratchpad"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="scratchpad-body">
        <textarea
          className="scratchpad-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Use this space for rough calculations, variable tracking, formulas, or draft code... (Private to your session and not graded)"
          rows={14}
        />
      </div>

      <div className="scratchpad-footer">
        <span>💡 Notes remain accessible between questions and are auto-saved.</span>
      </div>
    </div>
  );
};

export default ExamScratchpad;

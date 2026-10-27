import React, { useEffect, useState, useRef } from 'react';

// ─── SAFETY-CRITICAL: countdown logic and onExpire callback are UNCHANGED ────
// Only the CSS class applied to the container changes based on remaining time.
// durationSeconds: total time allotted; onExpire fires exactly once when time runs out.
const Timer = ({ durationSeconds, onExpire }) => {
  const [remaining, setRemaining] = useState(durationSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hrs  = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  const pad  = (n) => String(n).padStart(2, '0');

  // ─── PURELY VISUAL class selection — no logic change ─────────────────────
  // isLow   = last 60 s  → red pulse  (was: exam-timer-low)
  // isWarn  = last 5 min → amber      (new amber state, no behavioural effect)
  // neutral otherwise
  const isLow  = remaining <= 60;
  const isWarn = !isLow && remaining <= 300; // 5 minutes

  const timerClass = `exam-timer${isLow ? ' exam-timer-low' : isWarn ? ' exam-timer-warn' : ''}`;

  return (
    <div className={timerClass} aria-live="polite" aria-label={`Time remaining: ${pad(hrs)}:${pad(mins)}:${pad(secs)}`}>
      ⏱ {hrs > 0 ? `${pad(hrs)}:` : ''}
      {pad(mins)}:{pad(secs)}
    </div>
  );
};

export default Timer;

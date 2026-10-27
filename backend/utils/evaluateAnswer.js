/**
 * Evaluates a single student answer against a question's stored correct answer(s).
 * Supports: mcq, multi_select, true_false, fill_blank, short_answer.
 * descriptive -> always flagged for manual review.
 * coding -> evaluated separately via test case runner (see runCodeTestCases stub below).
 *
 * Returns: { isCorrect, marksAwarded, needsManualReview }
 */
function evaluateObjectiveAnswer(question, studentAnswer) {
  const { type, marks, negativeMarks = 0, options = [], correctAnswerText = [] } = question;

  switch (type) {
    case 'mcq':
    case 'true_false': {
      const correctOption = options.find((o) => o.isCorrect);
      const selected = studentAnswer.selectedOptionIds || [];
      if (!correctOption || selected.length === 0) {
        return { isCorrect: false, marksAwarded: selected.length ? -negativeMarks : 0, needsManualReview: false };
      }
      const isCorrect = selected.length === 1 && String(selected[0]) === String(correctOption._id);
      return {
        isCorrect,
        marksAwarded: isCorrect ? marks : -negativeMarks,
        needsManualReview: false,
      };
    }

    case 'multi_select': {
      const correctIds = options.filter((o) => o.isCorrect).map((o) => String(o._id)).sort();
      const selected = (studentAnswer.selectedOptionIds || []).map(String).sort();
      if (selected.length === 0) {
        return { isCorrect: false, marksAwarded: 0, needsManualReview: false };
      }
      const isCorrect =
        correctIds.length === selected.length && correctIds.every((id, i) => id === selected[i]);
      return {
        isCorrect,
        marksAwarded: isCorrect ? marks : -negativeMarks,
        needsManualReview: false,
      };
    }

    case 'fill_blank':
    case 'short_answer': {
      const given = (studentAnswer.textAnswer || '').trim().toLowerCase();
      if (!given) {
        return { isCorrect: false, marksAwarded: 0, needsManualReview: false };
      }
      const accepted = correctAnswerText.map((a) => a.trim().toLowerCase());
      const isCorrect = accepted.includes(given);
      return {
        isCorrect,
        marksAwarded: isCorrect ? marks : -negativeMarks,
        needsManualReview: false,
      };
    }

    case 'descriptive':
      return { isCorrect: null, marksAwarded: 0, needsManualReview: true };

    default:
      return { isCorrect: null, marksAwarded: 0, needsManualReview: true };
  }
}

/**
 * Placeholder for a sandboxed code execution / test-case runner.
 * In production this should call an isolated execution service (Docker/Judge0/etc).
 * Here we only provide the interface + a trivial exact-match simulation so the
 * rest of the platform (marks aggregation, results, analytics) works end-to-end.
 */
async function runCodeTestCases(question, studentAnswer) {
  const testCases = question.testCases || [];
  if (!studentAnswer.code || testCases.length === 0) {
    return { passedCount: 0, total: testCases.length, results: [], marksAwarded: 0, needsManualReview: testCases.length === 0 };
  }

  // NOTE: Replace this block with a real sandboxed execution call.
  // This stub cannot actually execute arbitrary code; it exists purely
  // to keep the data flow (test case results -> marks) consistent.
  const results = testCases.map(() => ({ passed: false, actualOutput: '' }));
  const passedCount = 0;

  const marksAwarded = testCases.length > 0 ? Math.round((passedCount / testCases.length) * question.marks) : 0;

  return { passedCount, total: testCases.length, results, marksAwarded, needsManualReview: false };
}

module.exports = { evaluateObjectiveAnswer, runCodeTestCases };

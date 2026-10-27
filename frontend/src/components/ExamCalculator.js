import React, { useState } from 'react';

const ExamCalculator = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [clearOnNext, setClearOnNext] = useState(false);

  const handleDigit = (digit) => {
    if (display === '0' || clearOnNext) {
      setDisplay(String(digit));
      setClearOnNext(false);
    } else {
      if (display.length < 14) {
        setDisplay(display + String(digit));
      }
    }
  };

  const handleDecimal = () => {
    if (clearOnNext) {
      setDisplay('0.');
      setClearOnNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op) => {
    const current = parseFloat(display);
    if (prevValue === null) {
      setPrevValue(current);
    } else if (operation && !clearOnNext) {
      const result = compute(prevValue, current, operation);
      setPrevValue(result);
      setDisplay(String(result));
    }
    setOperation(op);
    setClearOnNext(true);
  };

  const compute = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 'Error' : a / b;
      case '%': return a % b;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && prevValue !== null) {
      const current = parseFloat(display);
      const result = compute(prevValue, current, operation);
      setDisplay(String(result));
      setPrevValue(null);
      setOperation(null);
      setClearOnNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setClearOnNext(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleSqrt = () => {
    const val = parseFloat(display);
    if (val < 0) {
      setDisplay('Error');
    } else {
      setDisplay(String(Math.sqrt(val)));
    }
    setClearOnNext(true);
  };

  const handleSquare = () => {
    const val = parseFloat(display);
    setDisplay(String(val * val));
    setClearOnNext(true);
  };

  const handleSign = () => {
    const val = parseFloat(display);
    setDisplay(String(-val));
  };

  return (
    <div className="exam-calculator-modal" role="dialog" aria-label="Scientific Calculator">
      <div className="calculator-header">
        <div className="calculator-title">
          <span>🧮 Exam Scientific Tool</span>
          <span className="calculator-subtitle">Standard Arithmetic</span>
        </div>
        <button
          type="button"
          className="calculator-close-btn"
          onClick={onClose}
          aria-label="Close calculator"
        >
          ✕
        </button>
      </div>

      <div className="calculator-screen">
        <div className="calculator-history">
          {prevValue !== null ? `${prevValue} ${operation || ''}` : ''}
        </div>
        <div className="calculator-display">{display}</div>
      </div>

      <div className="calculator-keypad">
        <button type="button" className="calc-btn fn" onClick={handleClear}>AC</button>
        <button type="button" className="calc-btn fn" onClick={handleBackspace}>⌫</button>
        <button type="button" className="calc-btn fn" onClick={handleSqrt}>√x</button>
        <button type="button" className="calc-btn fn" onClick={handleSquare}>x²</button>

        <button type="button" className="calc-btn op" onClick={() => handleOperator('÷')}>÷</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit(7)}>7</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit(8)}>8</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit(9)}>9</button>

        <button type="button" className="calc-btn op" onClick={() => handleOperator('×')}>×</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit(4)}>4</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit(5)}>5</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit(6)}>6</button>

        <button type="button" className="calc-btn op" onClick={() => handleOperator('-')}>−</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit(1)}>1</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit(2)}>2</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit(3)}>3</button>

        <button type="button" className="calc-btn op" onClick={() => handleOperator('+')}>+</button>
        <button type="button" className="calc-btn fn" onClick={handleSign}>±</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit(0)}>0</button>
        <button type="button" className="calc-btn" onClick={handleDecimal}>.</button>
        <button type="button" className="calc-btn equals" onClick={handleEquals}>=</button>
      </div>
    </div>
  );
};

export default ExamCalculator;

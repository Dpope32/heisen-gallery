import React, { useState, useEffect } from 'react';
import './AutoScrollDialog.css';

const AutoScrollDialog = ({ onContinue, onStop, timeRemaining }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          onStop();
          return 0;
        }
        return prev - (100 / (timeRemaining * 10)); // Update every 100ms
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timeRemaining, onStop]);

  return (
    <div className="auto-scroll-dialog">
      <div className="auto-scroll-content">
        <h3>Continue Auto-scroll?</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="dialog-buttons">
          <button onClick={onContinue}>Continue</button>
          <button onClick={onStop}>Stop</button>
        </div>
      </div>
    </div>
  );
};

export default AutoScrollDialog; 
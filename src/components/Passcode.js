import React, { useState } from 'react';
import './Passcode.css';

const Passcode = ({ onUnlock }) => {
  const [input, setInput] = useState('');
  const correctPasscode = process.env.REACT_APP_PASSCODE || '000000';

  const handleButtonClick = (value) => {
    if (input.length < 9) {
      setInput(input + value);
    }
  };

  const handleDelete = () => {
    setInput(input.slice(0, -1));
  };

  const handleUnlock = () => {
    if (input === correctPasscode) {
      localStorage.setItem('lastActivity', Date.now().toString());
      onUnlock();
    } else {
      alert('Incorrect passcode!');
      setInput('');
    }
  };

  return (
    <div className="passcode-container">
      <h2>Enter Passcode</h2>
      <div className="passcode-display">{input.padEnd(9, '•')}</div>
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
          <button key={num} onClick={() => handleButtonClick(num)}>{num}</button>
        ))}
        <button onClick={handleDelete}>⌫</button>
        <button onClick={handleUnlock}>✔</button>
      </div>
    </div>
  );
};

export default Passcode;

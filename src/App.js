// App.js

import React, { useState, Suspense, lazy } from 'react';
import useInactivityTimer from './hooks/useInactivityTimer';
import Passcode from './components/Passcode';
import './App.css';
import './HackerTheme.css';

// Dynamically import ImageGallery
const ImageGallery = lazy(() => import('./components/ImageGallery/ImageGallery'));

const INACTIVITY_TIMEOUT = 60 * 60 * 1000;

function App() {
  const [darkMode] = useState(true);
  const [defaultFolder] = useState(() => {
  const saved = localStorage.getItem('favorites');
    const favCount = saved ? JSON.parse(saved).length : 0;
    return favCount > 1 ? "Favorites" : "Home";
  });
  const [isLocked, setIsLocked] = useState(() => {
    const locked = localStorage.getItem('isLocked');
    return locked === null ? true : JSON.parse(locked);
  });
  
  const { updateLastActivity } = useInactivityTimer({
    timeout: INACTIVITY_TIMEOUT,
    onInactive: () => handleLock(true),
    isEnabled: !isLocked
  });

  const handleUnlock = () => {
    setIsLocked(false);
    localStorage.setItem('isLocked', 'false');
    updateLastActivity();
  };

  const handleLock = (lock) => {
    setIsLocked(lock);
    localStorage.setItem('isLocked', lock.toString());
    if (lock) {
      localStorage.removeItem('lastActivity');
    }
  };

  if (isLocked) {
    return <Passcode onUnlock={handleUnlock} />;
  }

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header">
        <h1>Image Gallery</h1>
        <button className="lock-button" onClick={() => handleLock(true)}>LOCK</button>
      </div>
      <div className="main-content">
        <Suspense fallback={<div>Loading Gallery...</div>}>
          <ImageGallery defaultFolder={defaultFolder} />
        </Suspense>
      </div>
    </div>
  );
}

export default App;

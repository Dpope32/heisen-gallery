// App.js

import React, { useState, Suspense, lazy, useRef, useCallback } from 'react';
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
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const imageGalleryRef = useRef(null);
  const [autoScrollCommand, setAutoScrollCommand] = useState(null);
  
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



  const handleAutoScrollClick = useCallback(() => {
    if (imageGalleryRef.current && imageGalleryRef.current.isAutoScrolling && imageGalleryRef.current.isAutoScrolling()) {
      setAutoScrollCommand('stop');
    } else {
      setAutoScrollCommand('start');
    }
  }, []);

  const handleAutoScrollStateChange = useCallback((state) => {
    setIsAutoScrolling(state);
  }, []);

  if (isLocked) {
    return <Passcode onUnlock={handleUnlock} />;
  }

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header">
        <h1>Image Gallery</h1>
        <div className="header-buttons">
          <button 
            className={`auto-scroll-button ${isAutoScrolling ? 'active' : ''}`}
            onClick={handleAutoScrollClick}
          >
            {isAutoScrolling ? '⏹️ Stop Auto-scroll' : '▶️ Auto-scroll'}
          </button>
          <button className="lock-button" onClick={() => handleLock(true)}>LOCK</button>
        </div>
      </div>
      <div className="main-content">
        <Suspense fallback={<div>Loading Gallery...</div>}>
          <ImageGallery
            ref={imageGalleryRef}
            defaultFolder={defaultFolder}
            autoScrollCommand={autoScrollCommand}
            onAutoScrollStateChange={handleAutoScrollStateChange}
          />
        </Suspense>
      </div>

    </div>
  );
}

export default App;

// App.js

import React, { useState, Suspense, lazy, useRef, useCallback } from 'react';
import useInactivityTimer from './hooks/useInactivityTimer';
import Passcode from './components/Passcode';
import AutoScrollDialog from './components/AutoScrollDialog/AutoScrollDialog';
import './App.css';
import './HackerTheme.css';

// Dynamically import ImageGallery
const ImageGallery = lazy(() => import('./components/ImageGallery/ImageGallery'));

const INACTIVITY_TIMEOUT = 60 * 60 * 1000;
const AUTO_SCROLL_DURATION = 10 * 60 * 1000; // 10 minutes
const AUTO_SCROLL_INTERVAL = 50; // 50ms for smooth scrolling
const AUTO_SCROLL_STEP = 2; // pixels per scroll

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
  const [showAutoScrollDialog, setShowAutoScrollDialog] = useState(false);
  const [autoScrollStartTime, setAutoScrollStartTime] = useState(null);
  const galleryRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const scrollDirectionRef = useRef(1); // 1 for down, -1 for up
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

  const startAutoScroll = useCallback(() => {
    if (!galleryRef.current) return;

    setIsAutoScrolling(true);
    setAutoScrollStartTime(Date.now());
    setShowAutoScrollDialog(false);

    const scroll = () => {
      const gallery = galleryRef.current;
      if (!gallery) return;

      const { scrollTop, scrollHeight, clientHeight } = gallery;
      
      // Change direction if we reach the bottom or top
      if (scrollTop + clientHeight >= scrollHeight) {
        scrollDirectionRef.current = -1;
      } else if (scrollTop <= 0) {
        scrollDirectionRef.current = 1;
      }

      gallery.scrollTop += AUTO_SCROLL_STEP * scrollDirectionRef.current;
    };

    scrollIntervalRef.current = setInterval(scroll, AUTO_SCROLL_INTERVAL);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsAutoScrolling(false);
    setShowAutoScrollDialog(false);
  }, []);

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

  // Check if we need to show the continue dialog
  React.useEffect(() => {
    if (!isAutoScrolling || !autoScrollStartTime) return;

    const checkTime = () => {
      const elapsed = Date.now() - autoScrollStartTime;
      if (elapsed >= AUTO_SCROLL_DURATION) {
        setShowAutoScrollDialog(true);
      }
    };

    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [isAutoScrolling, autoScrollStartTime]);

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
            showAutoScrollDialog={showAutoScrollDialog}
            onAutoScrollDialogContinue={() => setAutoScrollCommand('start')}
            onAutoScrollDialogStop={() => setAutoScrollCommand('stop')}
            onAutoScrollStateChange={handleAutoScrollStateChange}
          />
        </Suspense>
      </div>
      {showAutoScrollDialog && (
        <AutoScrollDialog
          onContinue={() => {
            setAutoScrollStartTime(Date.now());
            setShowAutoScrollDialog(false);
            setAutoScrollCommand('start');
          }}
          onStop={() => {
            setShowAutoScrollDialog(false);
            setAutoScrollCommand('stop');
          }}
          timeRemaining={10} // 10 seconds to decide
        />
      )}
    </div>
  );
}

export default App;

import { useEffect, useCallback } from 'react';

const useInactivityTimer = ({
  timeout = 60 * 60 * 1000, // Default 1 hour
  onInactive,
  isEnabled = true
}) => {
  const updateLastActivity = useCallback(() => {
    localStorage.setItem('lastActivity', Date.now().toString());
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const inactiveTime = Date.now() - parseInt(lastActivity);
        if (inactiveTime > timeout) {
          onInactive?.();
        }
      }
    };

    const inactivityTimer = setInterval(checkInactivity, 60000); // Check every minute
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      if (isEnabled) {
        updateLastActivity();
      }
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize last activity on mount
    updateLastActivity();

    return () => {
      clearInterval(inactivityTimer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isEnabled, timeout, onInactive, updateLastActivity]);

  return {
    updateLastActivity
  };
};

export default useInactivityTimer;

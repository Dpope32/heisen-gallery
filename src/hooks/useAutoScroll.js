import { useState, useCallback, useRef, useEffect } from 'react';

const AUTO_SCROLL_INTERVAL = 50;
const AUTO_SCROLL_STEP = 2;
const AUTO_SCROLL_DURATION = 10 * 60 * 1000;

export const useAutoScroll = (galleryRef, onStateChange, onDialogStop) => {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollStartTime, setAutoScrollStartTime] = useState(null);
  const scrollIntervalRef = useRef(null);
  const scrollDirectionRef = useRef(1);

  const startAutoScroll = useCallback(() => {
    if (!galleryRef.current) return;
    
    setIsAutoScrolling(true);
    onStateChange?.(true);
    setAutoScrollStartTime(Date.now());
    
    const scroll = () => {
      const gallery = galleryRef.current;
      if (!gallery) return;
      
      const { scrollTop, scrollHeight, clientHeight } = gallery;
      if (scrollTop + clientHeight >= scrollHeight) {
        scrollDirectionRef.current = -1;
      } else if (scrollTop <= 0) {
        scrollDirectionRef.current = 1;
      }
      gallery.scrollTop += AUTO_SCROLL_STEP * scrollDirectionRef.current;
    };
    
    scrollIntervalRef.current = setInterval(scroll, AUTO_SCROLL_INTERVAL);
  }, [galleryRef, onStateChange]);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsAutoScrolling(false);
    onStateChange?.(false);
  }, [onStateChange]);

  useEffect(() => {
    if (!isAutoScrolling || !autoScrollStartTime) return;
    
    const checkTime = () => {
      const elapsed = Date.now() - autoScrollStartTime;
      if (elapsed >= AUTO_SCROLL_DURATION) {
        stopAutoScroll();
        onDialogStop?.();
      }
    };
    
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [isAutoScrolling, autoScrollStartTime, stopAutoScroll, onDialogStop]);

  return {
    isAutoScrolling,
    startAutoScroll,
    stopAutoScroll
  };
}; 
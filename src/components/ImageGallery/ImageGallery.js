// ImageGallery.js
import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import useKeyNavigation from '../../hooks/useKeyNavigation';
import './ImageGallery.css';
import images from '../imageImports';
import Masonry from 'react-masonry-css';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const imageMap = images;
const getAvailableFolders = () => {
  const baseFolders = ["Favorites", "Home"];
  const dynamicFolders = Object.keys(imageMap);
  return [...baseFolders, ...dynamicFolders.filter(folder => folder !== "Home")];
};
const folders = getAvailableFolders();

const AUTO_SCROLL_INTERVAL = 50;
const AUTO_SCROLL_STEP = 2;
const AUTO_SCROLL_DURATION = 10 * 60 * 1000;

const ImageGallery = forwardRef(({ defaultFolder, autoScrollCommand, showAutoScrollDialog, onAutoScrollDialogContinue, onAutoScrollDialogStop, onAutoScrollStateChange }, ref) => {
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [selectedFolder, setSelectedFolder] = useState(favorites.length > 0 ? defaultFolder : "Home");
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFirstConfirm, setShowFirstConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState(new Set());
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollStartTime, setAutoScrollStartTime] = useState(null);
  const scrollIntervalRef = useRef(null);
  const scrollDirectionRef = useRef(1);
  const galleryContainerRef = useRef(null);

  // Add video refs and logging
  const videoRefs = useRef({});

  const folderImages = useMemo(() => {
    if (selectedFolder === "Favorites") {
      const allImages = Object.values(imageMap).flat();
      const uniqueFavorites = [...new Set(favorites)];
      return uniqueFavorites.map(src => allImages.find(img => img.src === src)).filter(Boolean);
    }
    return imageMap[selectedFolder] || [];
  }, [selectedFolder, favorites]);

  const preloadImage = useCallback((src) => {
    const img = new Image();
    img.src = src;
  }, []);

  useEffect(() => {
    if (selectedImage) {
      preloadImage(selectedImage.src);
    }
  }, [selectedImage, preloadImage]);

  useEffect(() => {
    // Log when videos are mounted/unmounted
    console.log('Current video refs:', Object.keys(videoRefs.current));
  }, [folderImages]);

  const handleVideoRef = (video, index) => {
    if (video) {
      videoRefs.current[index] = video;
      console.log(`Video ${index} mounted:`, {
        src: video.src,
        muted: video.muted,
        loop: video.loop,
        autoplay: video.autoplay,
        readyState: video.readyState,
        error: video.error
      });

      // Add event listeners for debugging
      video.addEventListener('play', () => console.log(`Video ${index} started playing`));
      video.addEventListener('pause', () => console.log(`Video ${index} paused`));
      video.addEventListener('error', (e) => console.error(`Video ${index} error:`, e));
      video.addEventListener('loadeddata', () => console.log(`Video ${index} data loaded`));
    }
  };

  const handleVideoLoad = (index) => {
    setLoadedVideos(prev => new Set([...prev, index]));
    console.log(`Video ${index} loaded and ready to play`);
  };

  // Dark mode is always enabled
  document.body.className = 'dark-mode';

  const handleFolderChange = folder => {
    setSelectedFolder(folder);
    setSearchTerm('');
  };
  const handleImageClick = (image, index) => setSelectedImage({ ...image, index });
  const toggleFavorite = image => setFavorites(prev => prev.includes(image.src) ? prev.filter(src => src !== image.src) : [...prev, image.src]);
  const filteredImages = folderImages.filter(image => (image.caption || "").toLowerCase().includes(searchTerm.toLowerCase()));

  const navigateNext = useCallback(() => {
    setSelectedImage(prev => {
      if (!prev) return prev;
      const nextIndex = (prev.index + 1) % filteredImages.length;
      return { ...filteredImages[nextIndex], index: nextIndex };
    });
  }, [filteredImages]);
  const navigatePrevious = useCallback(() => {
    setSelectedImage(prev => {
      if (!prev) return prev;
      const prevIndex = (prev.index - 1 + filteredImages.length) % filteredImages.length;
      return { ...filteredImages[prevIndex], index: prevIndex };
    });
  }, [filteredImages]);
  const closeFullScreen = useCallback(() => setSelectedImage(null), []);
  useKeyNavigation({
    onNext: navigateNext,
    onPrevious: navigatePrevious,
    onClose: closeFullScreen,
    isEnabled: !!selectedImage
  });

  const confirmDownload = () => {
    setShowFirstConfirm(false);
    setShowSecondConfirm(true);
  };
  const proceedDownload = () => {
    const link = document.createElement('a');
    link.href = selectedImage.src;
    link.download = selectedImage.caption || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowSecondConfirm(false);
  };
  const cancelDownload = () => {
    setShowFirstConfirm(false);
    setShowSecondConfirm(false);
  };
  const breakpointColumnsObj = { default: 5, 1600: 4, 1200: 3, 800: 2, 600: 1 };

  // Auto-scroll logic
  const startAutoScroll = useCallback(() => {
    if (!galleryContainerRef.current) {
      console.log('AutoScroll: galleryContainerRef is null');
      return;
    }
    console.log('AutoScroll: Starting');
    setIsAutoScrolling(true);
    if (onAutoScrollStateChange) onAutoScrollStateChange(true);
    setAutoScrollStartTime(Date.now());
    const scroll = () => {
      const gallery = galleryContainerRef.current;
      if (!gallery) {
        console.log('AutoScroll: galleryContainerRef is null in scroll');
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = gallery;
      if (scrollTop + clientHeight >= scrollHeight) {
        scrollDirectionRef.current = -1;
        console.log('AutoScroll: Bouncing up');
      } else if (scrollTop <= 0) {
        scrollDirectionRef.current = 1;
        console.log('AutoScroll: Bouncing down');
      }
      gallery.scrollTop += AUTO_SCROLL_STEP * scrollDirectionRef.current;
    };
    scrollIntervalRef.current = setInterval(scroll, AUTO_SCROLL_INTERVAL);
  }, [onAutoScrollStateChange]);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsAutoScrolling(false);
    if (onAutoScrollStateChange) onAutoScrollStateChange(false);
    console.log('AutoScroll: Stopped');
  }, [onAutoScrollStateChange]);

  useEffect(() => {
    if (galleryContainerRef.current) {
      console.log('AutoScroll: galleryContainerRef attached', galleryContainerRef.current);
    }
  }, [galleryContainerRef]);

  useImperativeHandle(ref, () => ({
    startAutoScroll,
    stopAutoScroll,
    isAutoScrolling: () => isAutoScrolling
  }), [startAutoScroll, stopAutoScroll, isAutoScrolling]);

  // Listen for autoScrollCommand from parent
  useEffect(() => {
    if (autoScrollCommand === 'start') startAutoScroll();
    if (autoScrollCommand === 'stop') stopAutoScroll();
    // eslint-disable-next-line
  }, [autoScrollCommand]);

  // Show dialog after 10 minutes
  useEffect(() => {
    if (!isAutoScrolling || !autoScrollStartTime) return;
    const checkTime = () => {
      const elapsed = Date.now() - autoScrollStartTime;
      if (elapsed >= AUTO_SCROLL_DURATION) {
        stopAutoScroll();
        if (onAutoScrollDialogStop) onAutoScrollDialogStop();
      }
    };
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [isAutoScrolling, autoScrollStartTime, stopAutoScroll, onAutoScrollDialogStop]);

  return (
    <div className="gallery-container dark" ref={galleryContainerRef}>
      <div className="folder-tabs">
        {folders.map(folder => (
          <button key={folder} onClick={() => handleFolderChange(folder)} className={`folder-tab ${selectedFolder === folder ? 'active' : ''}`}>
            {folder}
          </button>
        ))}
      </div>
      <Masonry breakpointCols={breakpointColumnsObj} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
        {filteredImages.map((image, index) => (
          <div key={index} className="mondrian-item" onClick={() => handleImageClick(image, index)}>
            {image.isVideo ? (
              <video 
                ref={(el) => {
                  if (el) {
                    el.muted = true;
                    el.loop = true;
                    el.autoplay = true;
                    el.playsInline = true;
                    el.play().catch(e => console.error('Video play error:', e));
                  }
                }}
                src={image.src} 
                controls 
                preload="auto" 
                onClick={e => e.stopPropagation()} 
              />
            ) : (
              <img src={image.src} alt={`From ${selectedFolder}`} loading="lazy" onError={e => { e.target.src = '/path/to/placeholder.jpg'; }} />
            )}
            <div className={`favorite-icon ${favorites.includes(image.src) ? 'active' : ''}`} onClick={e => { e.stopPropagation(); toggleFavorite(image); }}>
              {favorites.includes(image.src) ? '❤️' : '🤍'}
            </div>
            {image.caption && <div className="image-caption">{image.caption}</div>}
          </div>
        ))}
      </Masonry>
      {selectedImage && (
        <div className="image-viewer-overlay" onClick={closeFullScreen}>
          <div className="image-viewer-content" onClick={e => e.stopPropagation()}>
            <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit>
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="image-viewer-controls">
                    <button onClick={zoomIn}>🔍+</button>
                    <button onClick={zoomOut}>🔍-</button>
                    <button onClick={resetTransform}>Reset</button>
                    <button onClick={navigatePrevious}>←</button>
                    <button onClick={navigateNext}>→</button>
                    <button onClick={closeFullScreen}>✕</button>
                  </div>
                  <TransformComponent>
                    {selectedImage.isVideo ? (
                      <video 
                        ref={(el) => {
                          if (el) {
                            el.muted = true;
                            el.loop = true;
                            el.autoplay = true;
                            el.playsInline = true;
                            el.play().catch(e => console.error('Fullscreen video play error:', e));
                          }
                        }}
                        src={selectedImage.src} 
                        controls 
                        style={{ maxHeight: '90vh', maxWidth: '90vw' }} 
                      />
                    ) : (
                      <img src={selectedImage.src} alt={selectedImage.caption || "Gallery image"} style={{ maxHeight: '90vh', maxWidth: '90vw' }} />
                    )}
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
            {selectedImage.caption && <div className="image-viewer-caption">{selectedImage.caption}</div>}
          </div>
        </div>
      )}
      {showFirstConfirm && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <p>ARE YOU SURE?</p>
            <button onClick={confirmDownload}>Yes</button>
            <button onClick={cancelDownload}>No</button>
          </div>
        </div>
      )}
      {showSecondConfirm && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <p>...there's not a gun to your head, right? 😉</p>
            <button onClick={proceedDownload}>Absolutely!</button>
            <button onClick={cancelDownload}>Nah</button>
          </div>
        </div>
      )}
    </div>
  );
});
export default ImageGallery;

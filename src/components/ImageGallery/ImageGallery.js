// ImageGallery.js
import React, { useState, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import useKeyNavigation from '../../hooks/useKeyNavigation';
import ImageViewer from './ImageViewer';
import GalleryItem from './GalleryItem';
import ConfirmationModal from './ConfirmationModal';
import './ImageGallery.css';
import images from '../imageImports';
import Masonry from 'react-masonry-css';

const imageMap = images;
const getAvailableFolders = () => {
  const baseFolders = ["Favorites", "Home"];
  const dynamicFolders = Object.keys(imageMap);
  return [...baseFolders, ...dynamicFolders.filter(folder => folder !== "Home")];
};
const folders = getAvailableFolders();

const ImageGallery = forwardRef(({ defaultFolder, autoScrollCommand, onAutoScrollStateChange }, ref) => {
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [selectedFolder, setSelectedFolder] = useState(favorites.length > 0 ? defaultFolder : "Home");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFirstConfirm, setShowFirstConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const galleryContainerRef = useRef(null);

  const { isAutoScrolling, startAutoScroll, stopAutoScroll } = useAutoScroll(
    galleryContainerRef, 
    onAutoScrollStateChange
  );

  const folderImages = useMemo(() => {
    if (selectedFolder === "Favorites") {
      const allImages = Object.values(imageMap).flat();
      const uniqueFavorites = [...new Set(favorites)];
      return uniqueFavorites.map(src => allImages.find(img => img.src === src)).filter(Boolean);
    }
    return imageMap[selectedFolder] || [];
  }, [selectedFolder, favorites]);

  // Dark mode is always enabled
  document.body.className = 'dark-mode';

  const handleFolderChange = folder => setSelectedFolder(folder);
  const handleImageClick = (image, index) => setSelectedImage({ ...image, index });
  const toggleFavorite = image => setFavorites(prev => 
    prev.includes(image.src) ? prev.filter(src => src !== image.src) : [...prev, image.src]
  );

  const navigateNext = useCallback(() => {
    setSelectedImage(prev => {
      if (!prev) return prev;
      const nextIndex = (prev.index + 1) % folderImages.length;
      return { ...folderImages[nextIndex], index: nextIndex };
    });
  }, [folderImages]);
  
  const navigatePrevious = useCallback(() => {
    setSelectedImage(prev => {
      if (!prev) return prev;
      const prevIndex = (prev.index - 1 + folderImages.length) % folderImages.length;
      return { ...folderImages[prevIndex], index: prevIndex };
    });
  }, [folderImages]);
  
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

  useImperativeHandle(ref, () => ({
    startAutoScroll,
    stopAutoScroll,
    isAutoScrolling: () => isAutoScrolling
  }), [startAutoScroll, stopAutoScroll, isAutoScrolling]);

  // Listen for autoScrollCommand from parent  
  React.useEffect(() => {
    if (autoScrollCommand === 'start') startAutoScroll();
    if (autoScrollCommand === 'stop') stopAutoScroll();
  }, [autoScrollCommand, startAutoScroll, stopAutoScroll]);

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
        {folderImages.map((image, index) => (
          <GalleryItem
            key={index}
            image={image}
            index={index}
            selectedFolder={selectedFolder}
            favorites={favorites}
            onImageClick={handleImageClick}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </Masonry>
      <ImageViewer
        selectedImage={selectedImage}
        onClose={closeFullScreen}
        onNext={navigateNext}
        onPrevious={navigatePrevious}
      />
      
      <ConfirmationModal
        show={showFirstConfirm}
        message="ARE YOU SURE?"
        onConfirm={confirmDownload}
        onCancel={cancelDownload}
      />
      
      <ConfirmationModal
        show={showSecondConfirm}
        message="...there's not a gun to your head, right? 😉"
        confirmText="Absolutely!"
        cancelText="Nah"
        onConfirm={proceedDownload}
        onCancel={cancelDownload}
      />
    </div>
  );
});
export default ImageGallery;

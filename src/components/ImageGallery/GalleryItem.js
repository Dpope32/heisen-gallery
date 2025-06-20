import React from 'react';

const GalleryItem = ({ 
  image, 
  index, 
  selectedFolder, 
  favorites, 
  onImageClick, 
  onToggleFavorite 
}) => {
  return (
    <div key={index} className="mondrian-item" onClick={() => onImageClick(image, index)}>
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
        <img 
          src={image.src} 
          alt={`From ${selectedFolder}`} 
          loading="lazy" 
          onError={e => { e.target.src = '/path/to/placeholder.jpg'; }} 
        />
      )}
      <div 
        className={`favorite-icon ${favorites.includes(image.src) ? 'active' : ''}`} 
        onClick={e => { 
          e.stopPropagation(); 
          onToggleFavorite(image); 
        }}
      >
        {favorites.includes(image.src) ? '❤️' : '🤍'}
      </div>
      {image.caption && <div className="image-caption">{image.caption}</div>}
    </div>
  );
};

export default GalleryItem; 
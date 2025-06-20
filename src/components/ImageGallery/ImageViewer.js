import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ImageViewer = ({ 
  selectedImage, 
  onClose, 
  onNext, 
  onPrevious 
}) => {
  if (!selectedImage) return null;

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-content" onClick={e => e.stopPropagation()}>
        <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="image-viewer-controls">
                <button onClick={zoomIn}>🔍+</button>
                <button onClick={zoomOut}>🔍-</button>
                <button onClick={resetTransform}>Reset</button>
                <button onClick={onPrevious}>←</button>
                <button onClick={onNext}>→</button>
                <button onClick={onClose}>✕</button>
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
                  <img 
                    src={selectedImage.src} 
                    alt={selectedImage.caption || "Gallery image"} 
                    style={{ maxHeight: '90vh', maxWidth: '90vw' }} 
                  />
                )}
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
        {selectedImage.caption && (
          <div className="image-viewer-caption">{selectedImage.caption}</div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer; 
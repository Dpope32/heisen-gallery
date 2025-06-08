import { useEffect, useCallback } from 'react';

const useKeyNavigation = ({
  onNext,
  onPrevious,
  onClose,
  isEnabled = true
}) => {
  const handleKeyDown = useCallback((e) => {
    if (!isEnabled) return;

    switch (e.key) {
      case 'ArrowRight':
        onNext?.();
        break;
      case 'ArrowLeft':
        onPrevious?.();
        break;
      case 'Escape':
        onClose?.();
        break;
      default:
        break;
    }
  }, [isEnabled, onNext, onPrevious, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyNavigation;

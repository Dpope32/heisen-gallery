import React, { useState, useRef, useEffect, useCallback } from 'react';
import './DropZone.css';

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.mp4'];

const DropZone = ({ folders, currentFolder, onImport }) => {
  const [visible, setVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(currentFolder || '');
  const [newFolderName, setNewFolderName] = useState('');
  const [useNewFolder, setUseNewFolder] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    setSelectedFolder(currentFolder || '');
  }, [currentFolder]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setVisible(true);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setVisible(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setVisible(false);

    const files = Array.from(e.dataTransfer.files);
    const imagePaths = files
      .filter((file) => {
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        return ALLOWED_EXTENSIONS.includes(ext);
      })
      .map((file) => file.path);

    if (imagePaths.length === 0) return;

    const targetFolder = useNewFolder && newFolderName.trim()
      ? newFolderName.trim()
      : selectedFolder;

    if (!targetFolder) return;

    onImport(imagePaths, targetFolder);
  }, [onImport, selectedFolder, newFolderName, useNewFolder]);

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

  if (!visible) return null;

  return (
    <div className="dropzone-overlay">
      <div className="dropzone-content">
        <div className="dropzone-border">
          <div className="dropzone-icon">+</div>
          <p className="dropzone-text">Drop images here to import</p>
          <p className="dropzone-subtext">Supported: .png, .jpg, .jpeg, .svg, .mp4</p>

          <div className="dropzone-folder-select">
            <label className="dropzone-label">
              <input
                type="radio"
                name="folderChoice"
                checked={!useNewFolder}
                onChange={() => setUseNewFolder(false)}
              />
              Existing folder:
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              disabled={useNewFolder}
              className="dropzone-select"
            >
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>

          <div className="dropzone-folder-select">
            <label className="dropzone-label">
              <input
                type="radio"
                name="folderChoice"
                checked={useNewFolder}
                onChange={() => setUseNewFolder(true)}
              />
              New folder:
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              disabled={!useNewFolder}
              placeholder="Enter new folder name"
              className="dropzone-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropZone;

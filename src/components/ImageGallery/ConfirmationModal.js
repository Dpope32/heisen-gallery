import React from 'react';

const ConfirmationModal = ({ 
  show, 
  message, 
  confirmText = 'Yes', 
  cancelText = 'No', 
  onConfirm, 
  onCancel 
}) => {
  if (!show) return null;

  return (
    <div className="confirmation-modal">
      <div className="confirmation-content">
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmText}</button>
        <button onClick={onCancel}>{cancelText}</button>
      </div>
    </div>
  );
};

export default ConfirmationModal; 
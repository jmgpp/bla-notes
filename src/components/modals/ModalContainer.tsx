import React, { ReactNode } from 'react';
import './ModalContainer.scss';

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

const ModalContainer: React.FC<ModalContainerProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = '500px'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth }}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalContainer; 
import React, { useRef, useEffect } from 'react';
import './NotesPanel.scss';

interface NotesPanelProps {
  orientation: 'landscape' | 'portrait';
  showWidgets: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

function NotesPanel({ orientation, showWidgets, textareaRef }: NotesPanelProps) {
  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [textareaRef]);

  // Refocus the textarea when widgets are toggled
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showWidgets, textareaRef]);

  // Handle clicks on the panel to ensure focus stays in the textarea
  const handlePanelClick = (e: React.MouseEvent) => {
    // Only focus if the click was directly on the panel (not on a child element that might need focus)
    if (e.target === e.currentTarget) {
      textareaRef.current?.focus();
    }
  };

  return (
    <div 
      className={`notes-panel ${orientation} ${showWidgets ? 'with-widgets' : 'full-width'}`}
      onClick={handlePanelClick}
    >
      <div className="card h-100">
        <div className="card-header">Notes</div>
        <div className="card-body">
          <textarea 
            ref={textareaRef}
            className="notes-area" 
            placeholder="Take your notes here... (This area will be improved with rich text editing capabilities)"
          />
        </div>
      </div>
    </div>
  );
}

export default NotesPanel; 
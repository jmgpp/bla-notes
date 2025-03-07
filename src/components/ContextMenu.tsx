import React, { useEffect, useRef, forwardRef } from 'react';
import './ContextMenu.scss';

// Define the type for context menu options
interface ContextOption {
  id: string;
  label: string;
  description: string;
  action: string;
}

// Sample context options - will be expanded later
const CONTEXT_OPTIONS: ContextOption[] = [
  { id: 'google', label: 'Look up', description: 'Search in Google', action: 'google' },
  { id: 'translate', label: 'Translate', description: 'Google Translate', action: 'translate' },
  { id: 'webster', label: 'Define', description: 'Merriam-Webster Dictionary', action: 'webster' },
  { id: 'dictionary', label: 'Dictionary', description: 'Search in internal dictionary', action: 'dictionary' },
];

interface ContextMenuProps {
  position: { top: number; left: number } | null;
  visible: boolean;
  selectedText: string;
  selectedIndex: number;
  onSelect: (action: string) => void;
}

const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(({ 
  position, 
  visible, 
  selectedText,
  selectedIndex,
  onSelect
}, ref) => {
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current && containerRef.current) {
      const container = containerRef.current;
      const selectedItem = selectedItemRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selectedItem.getBoundingClientRect();
      
      const itemTop = selectedRect.top - containerRect.top;
      const itemBottom = selectedRect.bottom - containerRect.top;
      
      if (itemBottom > container.clientHeight) {
        // Scroll down if selected item is below viewport
        container.scrollTop += itemBottom - container.clientHeight;
      } else if (itemTop < 0) {
        // Scroll up if selected item is above viewport
        container.scrollTop += itemTop;
      }
    }
  }, [selectedIndex]);

  if (!visible || !position) return null;

  const renderContextOptions = () => {
    // Filter or modify options based on selectedText if needed
    const availableOptions = CONTEXT_OPTIONS;

    if (availableOptions.length === 0) return null;

    return (
      <div className="option-list">
        {availableOptions.map((option, index) => (
          <div 
            key={option.id} 
            ref={index === selectedIndex ? selectedItemRef : null}
            className={`option-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onSelect(option.action)}
          >
            <div className="option-content">
              <span className="option-label">{option.label}</span>
              <span className="option-description">{option.description}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      ref={ref || containerRef}
      className="context-menu"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {selectedText ? (
        <div className="selected-text">
          <span className="text">{selectedText.length > 25 ? `${selectedText.substring(0, 25)}...` : selectedText}</span>
        </div>
      ) : null}
      {renderContextOptions()}
    </div>
  );
});

export default ContextMenu; 
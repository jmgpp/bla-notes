import React, { useEffect, useRef, forwardRef } from 'react';
import './ContextMenu.scss';

// Define the type for context menu options
interface ContextOption {
  id: string;
  label: string;
  description: string;
  action: string;
}

// Context menu options with updated order and labels
const CONTEXT_OPTIONS: ContextOption[] = [
  { id: 'dictionary', label: 'Dictionary', description: 'Search in internal dictionary', action: 'dictionary' },
  { id: 'google', label: 'Google', description: 'Search in Google', action: 'google' },
  { id: 'translate', label: 'Translate', description: 'Google Translate', action: 'translate' },
  { id: 'webster', label: 'Webster', description: 'Merriam-Webster Dictionary', action: 'webster' },
  { id: 'zip', label: 'ZIP code', description: 'Look up ZIP code info', action: 'zip' },
  { id: 'alphabet', label: 'Alphabet', description: 'Show in alphabet widget', action: 'alphabet' },
];

interface ContextMenuProps {
  position: { top: number; left: number } | null;
  visible: boolean;
  selectedText: string;
  selectedIndex: number;
  onSelect: (action: string) => void;
  onClose: () => void;
}

// Determine the recommended option based on the selected text
export const getRecommendedOptionIndex = (text: string): number => {
  // If no text is selected, return the index of the Google option
  if (!text || !text.trim()) {
    return CONTEXT_OPTIONS.findIndex(option => option.id === 'google');
  }
  
  // For 5-digit numbers, recommend ZIP lookup
  if (/^\d{5}$/.test(text.trim())) {
    return CONTEXT_OPTIONS.findIndex(option => option.id === 'zip');
  }
  
  // For single words, recommend Dictionary
  if (/^[a-zA-Z]+$/.test(text.trim())) {
    return CONTEXT_OPTIONS.findIndex(option => option.id === 'dictionary');
  }
  
  // For anything else, recommend Google search
  return CONTEXT_OPTIONS.findIndex(option => option.id === 'google');
};

const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(({ 
  position, 
  visible, 
  selectedText,
  selectedIndex,
  onSelect,
  onClose
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

  // Modify the Space key handler to only insert a space if no text is selected
  useEffect(() => {
    // Add a flag to track if the menu was just opened
    let menuJustOpened = false;
    let menuOpenedTimer: number | null = null;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process events when the menu is visible
      if (!visible) return;

      // Handle Alt+Space for menu opening
      if (e.code === 'Space' && e.altKey) {
        e.preventDefault();
        menuJustOpened = true;
        
        if (menuOpenedTimer) {
          window.clearTimeout(menuOpenedTimer);
        }
        menuOpenedTimer = window.setTimeout(() => {
          menuJustOpened = false;
          menuOpenedTimer = null;
        }, 100); // Reduced time to be more responsive
        
        return;
      }
      
      // Handle Space for selection
      if (e.code === 'Space' && !e.altKey && !menuJustOpened) {
        e.preventDefault();
        e.stopPropagation(); // Prevent the event from reaching the textarea
        
        // Get the selected option
        const selectedOption = CONTEXT_OPTIONS[selectedIndex];
        if (selectedOption) {
          // Execute the action
          onSelect(selectedOption.action);
          // Close menu
          onClose();
          
          // Handle space insertion in textarea if needed
          const textarea = document.activeElement as HTMLTextAreaElement;
          if (textarea && textarea.tagName === 'TEXTAREA') {
            const start = textarea.selectionStart || 0;
            const end = textarea.selectionEnd || 0;
            
            // Only insert space if no text is selected
            if (start === end) {
              const value = textarea.value;
              textarea.value = value.substring(0, start) + ' ' + value.substring(end);
              textarea.selectionStart = textarea.selectionEnd = start + 1;
            }
          }
        }
      }
    };

    // Only add the event listener when the menu is visible
    if (visible) {
      window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
      return () => {
        window.removeEventListener('keydown', handleKeyDown, true);
        if (menuOpenedTimer) {
          window.clearTimeout(menuOpenedTimer);
        }
      };
    }
  }, [visible, selectedIndex, onSelect, onClose]);

  if (!visible || !position) return null;

  const renderContextOptions = () => {
    // Use all available options
    const availableOptions = CONTEXT_OPTIONS;

    if (availableOptions.length === 0) return null;

    return (
      <div className="option-list" ref={containerRef}>
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
      ref={ref}
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
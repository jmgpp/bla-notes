import React, { useState, useRef, useEffect } from 'react';
import './NotesPanel.scss';
import CommandSuggestions from './CommandSuggestions';
import CommandResults from './CommandResults';

interface NotesPanelProps {
  orientation: 'landscape' | 'portrait';
  showWidgets: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const PLACEHOLDER_COMMANDS = [
  { command: 'zip', description: 'Search ZIP code information' },
  { command: 'dic', description: 'Look up word in dictionary' },
  { command: 'med', description: 'Medical terminology search' },
  { command: 'leg', description: 'Legal terminology search' },
  { command: 'fin', description: 'Financial terminology search' },
];

interface ZipResult {
  'post code': string;
  country: string;
  'country abbreviation': string;
  places: {
    'place name': string;
    state: string;
    'state abbreviation': string;
    latitude: string;
    longitude: string;
  }[];
}

const lookupZipCode = async (zipCode: string) => {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (!response.ok) {
      throw new Error(`ZIP code ${zipCode} not found`);
    }
    const data: ZipResult = await response.json();
    return {
      zipCode,
      city: data.places[0]['place name'],
      state: data.places[0]['state']
    };
  } catch (err) {
    console.error('ZIP lookup error:', err);
    throw err;
  }
};

const NotesPanel: React.FC<NotesPanelProps> = ({ orientation, showWidgets, textareaRef }) => {
  const [suggestionsPosition, setSuggestionsPosition] = useState<{ top: number; left: number } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commandFilter, setCommandFilter] = useState('');
  const [commandResults, setCommandResults] = useState<Array<{ type: 'zip', data: { zipCode: string; city: string; state: string; } }>>([]);
  const commandStartPosRef = useRef<number>(-1);
  const currentCommandRef = useRef<string | null>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    const filteredCommands = PLACEHOLDER_COMMANDS.filter(
      ({ command }) => command.startsWith(commandFilter.toLowerCase())
    );

    if (filteredCommands.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        break;
      case 'Enter':
        e.preventDefault();
        handleCommandSelect(filteredCommands[selectedIndex].command);
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Escape') {
      return;
    }

    const textarea = e.currentTarget;
    const value = textarea.value;
    const cursorPosition = textarea.selectionStart;
    
    // Find the last '#' before cursor
    let hashPosition = cursorPosition - 1;
    while (hashPosition >= 0 && value[hashPosition] !== '#') {
      hashPosition--;
    }

    // If we found a '#' and there's no space between it and cursor
    if (hashPosition >= 0 && !value.substring(hashPosition, cursorPosition).includes(' ')) {
      const currentWord = value.substring(hashPosition, cursorPosition);
      
      // Update the command filter
      const commandText = currentWord.substring(1); // Remove '#'
      setCommandFilter(commandText);
      commandStartPosRef.current = hashPosition;
      
      // Check for ZIP command completion (all 5 digits)
      if (commandText.match(/^zip\d{5}$/i)) {
        const zipCode = commandText.substring(3);
        lookupZipCode(zipCode)
          .then(zipData => {
            setCommandResults(prev => [...prev, { type: 'zip', data: zipData }]);
            currentCommandRef.current = null;
            commandStartPosRef.current = -1;
            setShowSuggestions(false);
          })
          .catch(err => {
            console.error('Failed to lookup ZIP:', err);
            // Optionally show an error message to the user
          });
        setShowSuggestions(false);
        return;
      }
      
      // Only initialize suggestions position if they're not already showing
      if (!showSuggestions) {
        const cursorCoords = getCursorCoordinates(textarea, cursorPosition);
        if (cursorCoords) {
          setSuggestionsPosition(cursorCoords);
          setShowSuggestions(true);
          setSelectedIndex(0);
        }
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCommandSelect = (command: string) => {
    if (!textareaRef.current || commandStartPosRef.current === -1) return;

    const textarea = textareaRef.current;
    const start = commandStartPosRef.current;
    const end = textarea.selectionStart;
    
    const newValue = 
      textarea.value.substring(0, start) + 
      '#' + command +
      textarea.value.substring(end);
    
    textarea.value = newValue;
    const newCursorPos = start + command.length + 1;
    textarea.selectionStart = newCursorPos;
    textarea.selectionEnd = newCursorPos;
    
    setShowSuggestions(false);
    currentCommandRef.current = command;
  };

  const handleDismissResult = (index: number) => {
    setCommandResults(prev => prev.filter((_, i) => i !== index));
  };

  const getCursorCoordinates = (textarea: HTMLTextAreaElement, cursorPosition: number): { top: number; left: number } | null => {
    const div = document.createElement('div');
    const styles = window.getComputedStyle(textarea);
    
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.font = styles.font;
    div.style.padding = styles.padding;
    div.style.width = styles.width;
    div.style.lineHeight = styles.lineHeight;
    
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    div.textContent = textBeforeCursor;
    
    const span = document.createElement('span');
    span.textContent = '';
    div.appendChild(span);
    
    document.body.appendChild(div);
    
    const rect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    
    document.body.removeChild(div);
    
    const lineHeight = parseInt(styles.lineHeight) || 20;
    
    return {
      top: rect.top + spanRect.top - textarea.scrollTop + lineHeight,
      left: rect.left + spanRect.left - textarea.scrollLeft
    };
  };

  // Handle clicks on the panel to ensure focus stays in the textarea
  const handlePanelClick = (e: React.MouseEvent) => {
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
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            spellCheck={false}
          />
          <CommandSuggestions
            position={suggestionsPosition}
            visible={showSuggestions}
            filter={commandFilter}
            selectedIndex={selectedIndex}
            onSelect={handleCommandSelect}
          />
          <CommandResults
            results={commandResults}
            onDismiss={handleDismissResult}
          />
        </div>
      </div>
    </div>
  );
};

export default NotesPanel; 
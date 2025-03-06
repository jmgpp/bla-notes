import React, { useState, useRef, useEffect } from 'react';
import './NotesPanel.scss';
import CommandSuggestions from './CommandSuggestions';
import CommandResults from './CommandResults';
import { brands, Brand } from '../data/brands';

interface NotesPanelProps {
  orientation: string;
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

interface SuggestionItem {
  type: 'command' | 'brand';
  text: string;
  description?: string;
}

interface Command {
  command: string;
  description: string;
  syntax: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ orientation, showWidgets, textareaRef }) => {
  const [suggestionsPosition, setSuggestionsPosition] = useState<{ top: number; left: number } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commandFilter, setCommandFilter] = useState('');
  const [suggestionType, setSuggestionType] = useState<'command' | 'brand'>('command');
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

  const getCursorCoordinates = (textarea: HTMLTextAreaElement, cursorPosition: number): { top: number; left: number } | null => {
    // Create a mirror div to measure text
    const div = document.createElement('div');
    const styles = window.getComputedStyle(textarea);
    
    // Copy styles from textarea
    const properties = [
      'fontFamily',
      'fontSize',
      'fontWeight',
      'letterSpacing',
      'lineHeight',
      'padding',
      'border',
      'boxSizing'
    ];

    properties.forEach(prop => {
      // @ts-ignore
      div.style[prop] = styles[prop];
    });
    
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.width = textarea.offsetWidth + 'px';
    div.style.height = 'auto';
    
    // Get text before cursor and replace spaces with nbsp to preserve them
    const textBeforeCursor = textarea.value.substring(0, cursorPosition).replace(/ /g, '\u00a0');
    
    // Create a span for the last line
    const lines = textBeforeCursor.split('\n');
    const lastLine = lines[lines.length - 1];
    
    // Add all lines before the last one
    if (lines.length > 1) {
      div.textContent = lines.slice(0, -1).join('\n') + '\n';
    }
    
    // Add the last line in a span
    const span = document.createElement('span');
    span.textContent = lastLine;
    div.appendChild(span);
    
    document.body.appendChild(div);
    
    const { offsetLeft: spanLeft, offsetTop: spanTop } = span;
    const { top: textareaTop, left: textareaLeft } = textarea.getBoundingClientRect();
    
    document.body.removeChild(div);
    
    // Calculate coordinates relative to viewport
    const top = textareaTop + spanTop - textarea.scrollTop + parseInt(styles.lineHeight);
    const left = textareaLeft + spanLeft - textarea.scrollLeft;
    
    return { top, left };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Ctrl/Cmd + Space
    if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      
      // Get the word around the cursor
      const text = textarea.value;
      let start = cursorPosition;
      let end = cursorPosition;

      // Find word boundaries
      while (start > 0 && /[\w\-]/.test(text[start - 1])) {
        start--;
      }
      while (end < text.length && /[\w\-]/.test(text[end])) {
        end++;
      }
      
      // Get the current word up to cursor position
      const currentWord = text.substring(start, cursorPosition);
      
      // Show brand suggestions
      const cursorCoords = getCursorCoordinates(textarea, cursorPosition);
      if (cursorCoords) {
        setSuggestionsPosition(cursorCoords);
        setShowSuggestions(true);
        setSelectedIndex(0);
        setCommandFilter(currentWord);
        setSuggestionType('brand');
        commandStartPosRef.current = start;
      }
      return;
    }

    if (!showSuggestions) return;

    const suggestions = suggestionType === 'command' 
      ? PLACEHOLDER_COMMANDS.filter(({ command }) => command.startsWith(commandFilter.toLowerCase()))
      : brands.filter(brand => brand.name.toLowerCase().includes(commandFilter.toLowerCase()));

    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestionType === 'command') {
          handleCommandSelect((suggestions[selectedIndex] as Command).command);
        } else {
          handleBrandSelect(suggestions[selectedIndex] as Brand);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't process key up for Ctrl/Cmd + Space
    if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Escape') {
      return;
    }

    const textarea = e.currentTarget;
    const value = textarea.value;
    const cursorPosition = textarea.selectionStart;

    if (suggestionType === 'brand' && showSuggestions) {
      // Update filter for brand suggestions
      let start = commandStartPosRef.current;
      const currentWord = value.substring(start, cursorPosition);
      setCommandFilter(currentWord);
      
      // Update position if needed
      const cursorCoords = getCursorCoordinates(textarea, cursorPosition);
      if (cursorCoords) {
        setSuggestionsPosition(cursorCoords);
      }

      // Hide suggestions if we've typed a space
      if (currentWord.includes(' ')) {
        setShowSuggestions(false);
      }
      return;
    }
    
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
      setSuggestionType('command');
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
      
      // Update suggestions position and show them
      const cursorCoords = getCursorCoordinates(textarea, cursorPosition);
      if (cursorCoords) {
        setSuggestionsPosition(cursorCoords);
        setShowSuggestions(true);
        setSelectedIndex(0);
      }
    } else {
      // Only hide suggestions if we're in command mode
      if (suggestionType === 'command') {
        setShowSuggestions(false);
      }
    }
  };

  const handleBrandSelect = (brand: Brand) => {
    if (!textareaRef.current || commandStartPosRef.current === -1) return;

    const textarea = textareaRef.current;
    const start = commandStartPosRef.current;
    const end = textarea.selectionStart;
    
    const newValue = 
      textarea.value.substring(0, start) + 
      brand.name + ' ' +
      textarea.value.substring(end);
    
    textarea.value = newValue;
    const newCursorPos = start + brand.name.length + 1; // +1 for the space
    textarea.selectionStart = newCursorPos;
    textarea.selectionEnd = newCursorPos;
    
    setShowSuggestions(false);
    textarea.focus();
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
    const newCursorPos = start + command.length + 1; // +1 for the #
    textarea.selectionStart = newCursorPos;
    textarea.selectionEnd = newCursorPos;
    
    setShowSuggestions(false);
    currentCommandRef.current = command;
    textarea.focus();
  };

  const handleDismissResult = (index: number) => {
    setCommandResults(prev => prev.filter((_, i) => i !== index));
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
        {orientation === 'landscape' && <div className="card-header">Notes</div>}
        <div className="card-body">
          <textarea 
            ref={textareaRef}
            className="notes-area" 
            placeholder="Take your notes here... Press Ctrl/Cmd+Space for brand suggestions"
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            spellCheck={false}
          />
          <CommandSuggestions
            position={suggestionsPosition}
            visible={showSuggestions}
            filter={commandFilter}
            selectedIndex={selectedIndex}
            onSelect={suggestionType === 'command' 
              ? handleCommandSelect
              : (text: string) => {
                const brand = brands.find(b => b.name === text);
                if (brand) handleBrandSelect(brand);
              }
            }
            type={suggestionType}
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
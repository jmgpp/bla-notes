import React, { useState, useRef, useEffect, useCallback } from 'react';
import './NotesPanel.scss';
import CommandSuggestions from './CommandSuggestions';
import ContextMenu, { getRecommendedOptionIndex } from './ContextMenu';
import { brands, Brand } from '../data/brands';
import { dictionaryData } from '../data/dictionaryData';
import { userDataService } from '../services/UserDataService';

interface NotesPanelProps {
  orientation: string;
  showWidgets: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onContextMenuChange: (isOpen: boolean) => void;
  onAddCard: (card: { 
    type: 'zip' | 'brand-snippet' | 'dictionary',
    data: {
      zipCode?: string;
      city?: string;
      state?: string;
      brandName?: string;
      snippet?: string;
      category?: string;
      searchTerm?: string;
      dictionaryResults?: any[];
    }
  }) => void;
  onToggleWidgets: (isVisible: boolean) => void;
  setActiveWidget: (widget: string) => void;
  setSelectedText: (text: string) => void;
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

// Updated dictionary search function to be async and use chunks
const searchDictionary = async (query: string) => {
  if (!query || query.trim() === '') return null;
  
  const normalizedQuery = query.toLowerCase().trim();
  // Get terms from userDataService to include both default and user-added terms
  const terms = userDataService.getAllTerms() as Array<{
    id: string;
    categoryId: number;
    subcategoryId: number;
    englishTerm: string;
    spanishTerm: string;
    notes: string;
    tags: string[];
  }>;

  // Process the search in chunks to avoid blocking the UI
  const chunkSize = 500;
  const results: typeof terms = [];

  // Return a promise that resolves with the search results
  return new Promise<any[]>((resolve) => {
    let currentIndex = 0;

    function processNextChunk() {
      const chunk = terms.slice(currentIndex, currentIndex + chunkSize);
      
      // Filter this chunk - only search in english, spanish and tags
      const chunkResults = chunk.filter(term => 
        term.englishTerm.toLowerCase().includes(normalizedQuery) ||
        term.spanishTerm.toLowerCase().includes(normalizedQuery) ||
        term.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
      );
      
      results.push(...chunkResults);
      currentIndex += chunkSize;

      if (currentIndex < terms.length) {
        // Process next chunk in the next microtask
        queueMicrotask(processNextChunk);
      } else {
        // All chunks processed, sort and resolve with results
        if (results.length > 0) {
          // Sort results: exact matches first, then partial matches
          const sortedResults = results.sort((a, b) => {
            const aEngExact = a.englishTerm.toLowerCase() === normalizedQuery;
            const aSpanExact = a.spanishTerm.toLowerCase() === normalizedQuery;
            const bEngExact = b.englishTerm.toLowerCase() === normalizedQuery;
            const bSpanExact = b.spanishTerm.toLowerCase() === normalizedQuery;
            
            // If one has an exact match and the other doesn't
            if ((aEngExact || aSpanExact) && !(bEngExact || bSpanExact)) return -1;
            if (!(aEngExact || aSpanExact) && (bEngExact || bSpanExact)) return 1;
            
            // If both have exact matches or neither has exact matches,
            // sort by length (shorter terms first)
            return Math.min(a.englishTerm.length, a.spanishTerm.length) - 
                   Math.min(b.englishTerm.length, b.spanishTerm.length);
          });

          resolve(sortedResults.map(term => ({
            term: term.englishTerm,
            definition: term.spanishTerm,
            examples: term.notes ? [term.notes] : undefined
          })));
        } else {
          resolve([]);
        }
      }
    }

    // Start processing chunks
    processNextChunk();
  });
};

const NotesPanel: React.FC<NotesPanelProps> = ({ 
  orientation, 
  showWidgets, 
  textareaRef, 
  onContextMenuChange,
  onAddCard,
  onToggleWidgets,
  setActiveWidget,
  setSelectedText
}) => {
  const [suggestionsPosition, setSuggestionsPosition] = useState<{ top: number; left: number } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commandFilter, setCommandFilter] = useState('');
  const [suggestionType, setSuggestionType] = useState<'command' | 'brand'>('command');
  const commandStartPosRef = useRef<number>(-1);
  const currentCommandRef = useRef<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // New state variables for context menu
  const [contextMenuPosition, setContextMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuIndex, setContextMenuIndex] = useState(0);
  const [contextMenuSelectedText, setContextMenuSelectedText] = useState('');
  const contextMenuRef = useRef<HTMLDivElement>(null);

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

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showSuggestions &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        textareaRef.current && 
        !textareaRef.current.contains(event.target as Node)
      ) {
        updateShowSuggestions(false);
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions, textareaRef]);

  // Notify parent component when either suggestions or context menu state changes
  useEffect(() => {
    onContextMenuChange(showSuggestions || showContextMenu);
  }, [showSuggestions, showContextMenu, onContextMenuChange]);

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
    // Alt+Space (or Option+Space on Mac) to show context menu
    if ((e.altKey) && e.code === 'Space') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      
      // Get selected text or word at cursor
      const text = textarea.value;
      const selectedText = textarea.selectionStart !== textarea.selectionEnd 
        ? text.substring(textarea.selectionStart, textarea.selectionEnd)
        : getWordAtPosition(text, cursorPosition);
        
      setContextMenuSelectedText(selectedText);
      
      // Show context menu at cursor position
      const cursorCoords = getCursorCoordinates(textarea, cursorPosition);
      if (cursorCoords) {
        // First show the context menu
        setContextMenuPosition(cursorCoords);
        setShowContextMenu(true);
        
        // Then set the recommended index (after a short delay to ensure the menu is rendered first)
        setTimeout(() => {
          const recommendedIndex = getRecommendedOptionIndex(selectedText);
          setContextMenuIndex(recommendedIndex);
        }, 10);
      }
      return;
    }
    
    // Handle keys when context menu is open
    if (showContextMenu) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setContextMenuIndex(prev => (prev + 1) % 6); // Updated to 6 options
          break;
        case 'ArrowUp':
          e.preventDefault();
          setContextMenuIndex(prev => (prev - 1 + 6) % 6); // Updated to 6 options
          break;
        case 'Enter':
          e.preventDefault();
          handleContextMenuSelect(['dictionary', 'google', 'translate', 'webster', 'zip', 'alphabet'][contextMenuIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          setShowContextMenu(false);
          break;
      }
      return;
    }
    
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
        updateShowSuggestions(true);
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
      : brands.filter(brand => {
          const matchesSearch = 
            brand.name.toLowerCase().includes(commandFilter.toLowerCase()) ||
            (brand.category && brand.category.toLowerCase().includes(commandFilter.toLowerCase())) ||
            (brand.translation && brand.translation.toLowerCase().includes(commandFilter.toLowerCase()));
          
          return matchesSearch;
        })
        // Sort brands by how closely they match the filter
        .sort((a, b) => {
          // Exact matches at the start of the name come first
          const aStartsWithExact = a.name.toLowerCase().startsWith(commandFilter.toLowerCase());
          const bStartsWithExact = b.name.toLowerCase().startsWith(commandFilter.toLowerCase());
          
          if (aStartsWithExact && !bStartsWithExact) return -1;
          if (!aStartsWithExact && bStartsWithExact) return 1;
          
          // Then matches that start with the filter (case insensitive)
          const aStartsWith = a.name.toLowerCase().startsWith(commandFilter.toLowerCase());
          const bStartsWith = b.name.toLowerCase().startsWith(commandFilter.toLowerCase());
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Then sort by alphabetical order
          return a.name.localeCompare(b.name);
        });

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
        updateShowSuggestions(false);
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
        updateShowSuggestions(false);
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
            onAddCard({
              type: 'zip',
              data: {
                zipCode: zipData.zipCode,
                city: zipData.city,
                state: zipData.state
              }
            });
            currentCommandRef.current = null;
            commandStartPosRef.current = -1;
            updateShowSuggestions(false);
          })
          .catch(err => {
            console.error('Failed to lookup ZIP:', err);
            // Optionally show an error message to the user
          });
        updateShowSuggestions(false);
        return;
      }
      
      // Update suggestions position and show them
      const cursorCoords = getCursorCoordinates(textarea, cursorPosition);
      if (cursorCoords) {
        setSuggestionsPosition(cursorCoords);
        updateShowSuggestions(true);
        setSelectedIndex(0);
      }
    } else {
      // Only hide suggestions if we're in command mode
      if (suggestionType === 'command') {
        updateShowSuggestions(false);
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
    
    // Get the most up-to-date brand information from userDataService
    const allBrands = userDataService.getAllBrands();
    const updatedBrand = allBrands.find(b => b.name === brand.name) || brand;
    
    // Check if the brand has snippets and create cards for each one
    if (updatedBrand.snippets && updatedBrand.snippets.length > 0) {
      updatedBrand.snippets.forEach(snippet => {
        onAddCard({
          type: 'brand-snippet',
          data: {
            brandName: updatedBrand.name,
            snippet: snippet,
            category: updatedBrand.category
          }
        });
      });
    }
    
    updateShowSuggestions(false);
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
    
    updateShowSuggestions(false);
    currentCommandRef.current = command;
    textarea.focus();
  };

  // Handle clicks on the panel to ensure focus stays in the textarea
  const handlePanelClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      textareaRef.current?.focus();
    }
  };

  // Handle clicks in the textarea that might change cursor position
  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      updateShowSuggestions(false);
    }
    if (showContextMenu) {
      setShowContextMenu(false);
    }
  };

  // Handle mouseup in the textarea to detect final cursor position changes
  const handleTextareaMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      const textarea = e.currentTarget;
      const currentSelectionStart = textarea.selectionStart;
      
      // If the cursor position is now different from where the command/suggestion started,
      // close the suggestions panel
      if (commandStartPosRef.current !== -1 && 
          Math.abs(currentSelectionStart - commandStartPosRef.current) > 1) {
        updateShowSuggestions(false);
        commandStartPosRef.current = -1;
      }
    }
    
    // Auto-show context menu when text is selected
    // Uncomment if you want the context menu to appear automatically on selection
    /*
    const textarea = e.currentTarget;
    if (textarea.selectionStart !== textarea.selectionEnd) {
      const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      if (selectedText.length > 0) {
        setContextMenuSelectedText(selectedText);
        const cursorCoords = getCursorCoordinates(textarea, textarea.selectionEnd);
        if (cursorCoords) {
          setContextMenuPosition(cursorCoords);
          setShowContextMenu(true);
          setContextMenuIndex(0);
        }
      }
    } else {
      setShowContextMenu(false);
    }
    */
  };

  // Update the existing setShowSuggestions calls to also notify the parent
  const updateShowSuggestions = (value: boolean) => {
    setShowSuggestions(value);
  };

  // Function to get word at cursor position
  const getWordAtPosition = (text: string, position: number): string => {
    let startPos = position;
    let endPos = position;
    
    // Find word boundaries
    while (startPos > 0 && /[\w\-']/.test(text[startPos - 1])) {
      startPos--;
    }
    
    while (endPos < text.length && /[\w\-']/.test(text[endPos])) {
      endPos++;
    }
    
    return text.substring(startPos, endPos);
  };

  // Handler for context menu option selection
  const handleContextMenuSelect = (action: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const selectedText = contextMenuSelectedText; // Store the text before hiding menu
    
    // Hide menu first for better responsiveness
    setShowContextMenu(false);
    textarea.focus();
    
    // Perform different actions based on selection
    switch(action) {
      case 'google':
        // Open search for the selected text
        window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedText)}`, '_blank');
        break;
      case 'translate':
        // Open Google Translate
        window.open(`https://translate.google.com/?sl=auto&tl=es&text=${encodeURIComponent(selectedText)}`, '_blank');
        break;
      case 'webster':
        // Open dictionary definition
        window.open(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(selectedText)}`, '_blank');
        break;
      case 'dictionary':
        // Search internal dictionary asynchronously in chunks
        searchDictionary(selectedText).then(results => {
          onAddCard({
            type: 'dictionary',
            data: {
              searchTerm: selectedText,
              dictionaryResults: results || []
            }
          });
        });
        break;
      case 'zip':
        // Handle ZIP code lookup
        if (/^\d{5}$/.test(selectedText.trim())) {
          lookupZipCode(selectedText.trim())
            .then(zipData => {
              onAddCard({
                type: 'zip',
                data: {
                  zipCode: zipData.zipCode,
                  city: zipData.city,
                  state: zipData.state
                }
              });
            })
            .catch(err => {
              console.error('Failed to lookup ZIP:', err);
            });
        }
        break;
      case 'alphabet':
        // Open alphabet widget with the selected text
        if (orientation === 'portrait') {
          // In portrait mode, we need to make widgets visible first
          onToggleWidgets(true);
        }
        // Set alphabet as active widget and pass the selected text
        setActiveWidget('alphabet');
        setSelectedText(selectedText);
        break;
    }
  };

  // Add click outside handler for context menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showContextMenu &&
        contextMenuRef.current && 
        !contextMenuRef.current.contains(event.target as Node) &&
        textareaRef.current && 
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowContextMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContextMenu, textareaRef]);

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
            placeholder="Take your notes here... Press Ctrl/Cmd+Space for brand suggestions or Alt/Option+Space for context menu"
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onClick={handleTextareaClick}
            onMouseUp={handleTextareaMouseUp}
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
            ref={suggestionsRef}
          />
          <ContextMenu
            position={contextMenuPosition}
            visible={showContextMenu}
            selectedText={contextMenuSelectedText}
            selectedIndex={contextMenuIndex}
            onSelect={handleContextMenuSelect}
            onClose={() => setShowContextMenu(false)}
            ref={contextMenuRef}
          />
        </div>
      </div>
    </div>
  );
};

export default NotesPanel; 
import React, { useEffect } from 'react';
import './AlphabetWidget.scss';

// NATO phonetic alphabet with simple recognizable words
const natoAlphabet = [
  { letter: 'A', nato: 'Alpha', simple: 'Apple' },
  { letter: 'B', nato: 'Bravo', simple: 'Banana' },
  { letter: 'C', nato: 'Charlie', simple: 'Cat' },
  { letter: 'D', nato: 'Delta', simple: 'Dog' },
  { letter: 'E', nato: 'Echo', simple: 'Elephant' },
  { letter: 'F', nato: 'Foxtrot', simple: 'Fish' },
  { letter: 'G', nato: 'Golf', simple: 'Grape' },
  { letter: 'H', nato: 'Hotel', simple: 'House' },
  { letter: 'I', nato: 'India', simple: 'Ice cream' },
  { letter: 'J', nato: 'Juliett', simple: 'Juice' },
  { letter: 'K', nato: 'Kilo', simple: 'Kite' },
  { letter: 'L', nato: 'Lima', simple: 'Lemon' },
  { letter: 'M', nato: 'Mike', simple: 'Monkey' },
  { letter: 'N', nato: 'November', simple: 'Nest' },
  { letter: 'O', nato: 'Oscar', simple: 'Orange' },
  { letter: 'P', nato: 'Papa', simple: 'Pizza' },
  { letter: 'Q', nato: 'Quebec', simple: 'Queen' },
  { letter: 'R', nato: 'Romeo', simple: 'Rainbow' },
  { letter: 'S', nato: 'Sierra', simple: 'Sun' },
  { letter: 'T', nato: 'Tango', simple: 'Tomato' },
  { letter: 'U', nato: 'Uniform', simple: 'Umbrella' },
  { letter: 'V', nato: 'Victor', simple: 'Violin' },
  { letter: 'W', nato: 'Whiskey', simple: 'Water' },
  { letter: 'X', nato: 'X-ray', simple: 'Xylophone' },
  { letter: 'Y', nato: 'Yankee', simple: 'Yogurt' },
  { letter: 'Z', nato: 'Zulu', simple: 'Zebra' }
];

// Create a lookup map for faster access
const letterMap = new Map(
  natoAlphabet.map(item => [item.letter.toLowerCase(), item])
);

interface AlphabetWidgetProps {
  orientation: 'landscape' | 'portrait';
  selectedText?: string;
  onClose?: () => void;
  onClearText?: () => void;
}

const AlphabetWidget: React.FC<AlphabetWidgetProps> = ({ 
  orientation, 
  selectedText,
  onClose,
  onClearText
}) => {
  // Function to convert text to simple word representation
  const getTextRepresentation = (text: string) => {
    if (!text) return null;
    
    // Clean and limit the text
    const cleanText = text.trim().slice(0, 30);
    if (cleanText.length === 0) return null;
    
    return (
      <div className="selected-text-representation">
        <div className="text-header">
          <h6>Selected Text: "{cleanText}"</h6>
          {onClearText && (
            <button 
              className="alphabet-clear-button"
              onClick={onClearText}
              aria-label="Clear selected text"
            >
              Clear
            </button>
          )}
        </div>
        <div className="word-representation">
          {cleanText.split('').map((char, index) => {
            const letter = char.toLowerCase();
            const item = letterMap.get(letter);
            
            // Skip spaces and characters not in the alphabet
            if (letter === ' ' || !item) {
              return letter === ' ' ? (
                <span key={index} className="space"> </span>
              ) : (
                <span key={index} className="unknown-char">{char}</span>
              );
            }
            
            return (
              <div key={index} className="word-item">
                <span className="letter-char">{char.toUpperCase()}</span>
                <span className="simple-word">{item.simple}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render close button only in portrait mode
  const renderCloseButton = () => {
    if (orientation !== 'portrait' || !onClose) return null;
    
    return (
      <button 
        className="alphabet-close-button" 
        onClick={onClose}
        aria-label="Close alphabet widget"
      >
        ×
      </button>
    );
  };
  
  useEffect(() => {
    // Only add the listener in portrait mode and when onClose is provided
    if (orientation !== 'portrait' || !onClose) {
      return; // Don't set up the listener
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [orientation, onClose]);

  return (
    <div className={`alphabet-widget ${orientation}`} tabIndex={-1}>
      {selectedText && getTextRepresentation(selectedText)}
      
      <div className={`alphabet-grid ${orientation}`}>
        {natoAlphabet.map((item) => (
          <div key={item.letter} className="alphabet-item" tabIndex={-1}>
            <div className="letter">{item.letter}</div>
            <div className="words">
              <div className="nato">{item.nato}</div>
              <div className="simple">{item.simple}</div>
            </div>
          </div>
        ))}
      </div>
      
      {renderCloseButton()}
    </div>
  );
};

export default AlphabetWidget; 
import React, { useEffect } from 'react';
import './AlphabetWidget.scss';

// NATO phonetic alphabet with simple recognizable words
const natoAlphabet = [
  { letter: 'A', nato: 'Apple', simple: 'Amigo' },
  { letter: 'B', nato: 'Banana', simple: 'Banana' },
  { letter: 'C', nato: 'Cat', simple: 'Carlos' },
  { letter: 'D', nato: 'Dog', simple: 'Domingo' },
  { letter: 'E', nato: 'Elephant', simple: 'España' },
  { letter: 'F', nato: 'Formula', simple: 'Fernando' },
  { letter: 'G', nato: 'Grape', simple: 'Gato' },
  { letter: 'H', nato: 'House', simple: 'Huevo' },
  { letter: 'I', nato: 'Ice cream', simple: 'India' },
  { letter: 'J', nato: 'Juliett', simple: 'Jarra' },
  { letter: 'K', nato: 'Kite', simple: 'Kilo' },
  { letter: 'L', nato: 'Lemon', simple: 'Limón' },
  { letter: 'M', nato: 'Monkey', simple: 'Mamá' },
  { letter: 'N', nato: 'November', simple: 'Nicolás' },
  { letter: 'O', nato: 'Orange', simple: 'Oso' },
  { letter: 'P', nato: 'Pizza', simple: 'Pintura' },
  { letter: 'Q', nato: 'Queen', simple: 'Quiero' },
  { letter: 'R', nato: 'Rainbow', simple: 'Raúl' },
  { letter: 'S', nato: 'Sierra', simple: 'Sapo' },
  { letter: 'T', nato: 'Tango', simple: 'Tomate' },
  { letter: 'U', nato: 'Umbrella', simple: 'Ulises' },
  { letter: 'V', nato: 'Victor', simple: 'Vaca' },
  { letter: 'W', nato: 'Water', simple: 'Walter' },
  { letter: 'X', nato: 'Xylophone', simple: 'Xilófono' },
  { letter: 'Y', nato: 'Yankee', simple: 'Yogurt' },
  { letter: 'Z', nato: 'Zebra', simple: 'Zapato' }
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
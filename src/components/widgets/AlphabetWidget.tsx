import React, { useEffect } from 'react';
import './AlphabetWidget.scss';

// NATO phonetic alphabet with simple recognizable words
const natoAlphabet = [
  { letter: 'A', eng: 'Apple', spa: 'Amigo' },
  { letter: 'B', eng: 'Banana', spa: 'Banana' },
  { letter: 'C', eng: 'Cat', spa: 'Carlos' },
  { letter: 'D', eng: 'Dog', spa: 'Domingo' },
  { letter: 'E', eng: 'Elephant', spa: 'España' },
  { letter: 'F', eng: 'Formula', spa: 'Fernando' },
  { letter: 'G', eng: 'Grape', spa: 'Gato' },
  { letter: 'H', eng: 'House', spa: 'Huevo' },
  { letter: 'I', eng: 'Ice cream', spa: 'India' },
  { letter: 'J', eng: 'Juliett', spa: 'Jarra' },
  { letter: 'K', eng: 'Kite', spa: 'Kilo' },
  { letter: 'L', eng: 'Lemon', spa: 'Limón' },
  { letter: 'M', eng: 'Monkey', spa: 'Mamá' },
  { letter: 'N', eng: 'November', spa: 'Nicolás' },
  { letter: 'O', eng: 'Orange', spa: 'Oso' },
  { letter: 'P', eng: 'Pizza', spa: 'Pintura' },
  { letter: 'Q', eng: 'Queen', spa: 'Quiero' },
  { letter: 'R', eng: 'Rainbow', spa: 'Raúl' },
  { letter: 'S', eng: 'Sierra', spa: 'Sapo' },
  { letter: 'T', eng: 'Tango', spa: 'Tomate' },
  { letter: 'U', eng: 'Umbrella', spa: 'Ulises' },
  { letter: 'V', eng: 'Victor', spa: 'Vaca' },
  { letter: 'W', eng: 'Water', spa: 'Walter' },
  { letter: 'X', eng: 'Xylophone', spa: 'Xilófono' },
  { letter: 'Y', eng: 'Yankee', spa: 'Yogurt' },
  { letter: 'Z', eng: 'Zebra', spa: 'Zapato' }
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
                <span className="simple-word">{item.eng}</span>
                <span className="simple-word-spa">{item.spa}</span>
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
              <div className="nato">{item.eng}</div>
              <div className="simple">{item.spa}</div>
            </div>
          </div>
        ))}
      </div>
      
      {renderCloseButton()}
    </div>
  );
};

export default AlphabetWidget; 
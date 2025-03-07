import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import './WidgetsPanel.scss';
import AlphabetWidget from './widgets/AlphabetWidget';
import DictionaryWidget from './widgets/DictionaryWidget';
import ZipWidget from './widgets/ZipWidget';
import SuffixesWidget from './widgets/SuffixesWidget';
import BrandsWidget from './widgets/BrandsWidget';
import DictionaryCard from './DictionaryCard';

// Define DictionaryEntry interface
interface DictionaryEntry {
  term: string;
  definition: string;
  examples?: string[];
}

interface WidgetsPanelProps {
  orientation: 'landscape' | 'portrait';
  showWidgets: boolean;
  activeWidget: string;
  setActiveWidget: (widget: string) => void;
  selectedText?: string;
  cards?: any[];
  onRemoveCard?: (id: string) => void;
  onToggleWidgets?: (show: boolean) => void;
  setSelectedText?: (text: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

function WidgetsPanel({ 
  orientation, 
  showWidgets, 
  activeWidget, 
  setActiveWidget, 
  selectedText,
  cards = [],
  onRemoveCard = () => {},
  onToggleWidgets,
  setSelectedText,
  textareaRef
}: WidgetsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeLowerTab, setActiveLowerTab] = useState<'cards' | 'diagrams'>('cards');
  
  // Add refs for scrolling
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const lastCardRef = useRef<HTMLDivElement>(null);

  // Track previous card count to detect when cards are added
  const [prevCardCount, setPrevCardCount] = useState(cards.length);

  // Add global escape key handler for portrait mode
  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && orientation === 'portrait' && showWidgets && onToggleWidgets) {
      e.preventDefault();
      onToggleWidgets(false);
    }
  }, [orientation, showWidgets, onToggleWidgets]);

  // Set up global Escape key handler
  useEffect(() => {
    if (orientation === 'portrait' && showWidgets && onToggleWidgets) {
      // Add event listener
      document.addEventListener('keydown', handleEscapeKey);
      
      // Clean up
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [orientation, showWidgets, onToggleWidgets, handleEscapeKey]);

  // Add function to truncate text
  const getTruncatedText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Function to insert snippet text at the current cursor position
  const insertSnippet = (text: string) => {
    if (!textareaRef || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const value = textarea.value;
    
    // Insert the snippet at the cursor position with a space after it
    textarea.value = value.substring(0, start) + text + " " + value.substring(end);
    
    // Set the cursor position after the inserted text and the added space
    const newPosition = start + text.length + 1;
    textarea.selectionStart = newPosition;
    textarea.selectionEnd = newPosition;
    
    // Focus the textarea
    textarea.focus();
  };

  useEffect(() => {
    if (!panelRef.current) return;
    
    const updateHeight = () => {
      if (orientation === 'portrait' && showWidgets) {
        const height = panelRef.current?.offsetHeight || 0;
        document.documentElement.style.setProperty('--widget-actual-height', `${height}px`);
      } else {
        document.documentElement.style.setProperty('--widget-actual-height', '0px');
      }
    };
    
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    
    resizeObserver.observe(panelRef.current);
    updateHeight(); // Initial measurement
    
    return () => {
      if (panelRef.current) {
        resizeObserver.unobserve(panelRef.current);
      }
    };
  }, [orientation, showWidgets]);

  // Effect to toggle widgets-visible class
  useEffect(() => {
    if (orientation === 'portrait') {
      const notesPanel = document.querySelector('.notes-panel');
      if (notesPanel) {
        if (showWidgets) {
          notesPanel.classList.add('widgets-visible');
        } else {
          notesPanel.classList.remove('widgets-visible');
        }
      }
    }
    
    return () => {
      const notesPanel = document.querySelector('.notes-panel');
      notesPanel?.classList.remove('widgets-visible');
    };
  }, [orientation, showWidgets]);

  // Effect to scroll to bottom when new cards are added
  useLayoutEffect(() => {
    if (cards.length > prevCardCount) {
      // Use a series of attempts to ensure the scroll happens
      const scrollToBottom = () => {
        if (lastCardRef.current) {
          lastCardRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end'
          });
        } else if (cardsGridRef.current) {
          cardsGridRef.current.scrollTop = cardsGridRef.current.scrollHeight;
        }
      };
      
      // Multiple attempts at different times
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
      setTimeout(scrollToBottom, 600);
    }
    
    // Update previous count
    setPrevCardCount(cards.length);
  }, [cards.length]);

  // Handle keydown on the panel element
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && orientation === 'portrait' && showWidgets && onToggleWidgets) {
      e.preventDefault();
      onToggleWidgets(false);
    }
  };

  const panelClasses = `widgets-panel ${orientation} ${showWidgets ? 'visible' : 'hidden'} ${orientation === 'portrait' ? 'content-sized' : ''}`;
  
  // Content for each widget type
  const renderWidgetContent = () => {
    switch (activeWidget) {
      case 'alphabet':
        return (
          <AlphabetWidget 
            orientation={orientation} 
            selectedText={selectedText}
            onClose={orientation === 'portrait' && onToggleWidgets ? 
              () => onToggleWidgets(false) : undefined}
            onClearText={setSelectedText ? () => setSelectedText('') : undefined}
          />
        );
      case 'dictionary':
        return <DictionaryWidget orientation={orientation} showWidgets={showWidgets} selectedText={selectedText} />;
      case 'zip':
        return <ZipWidget orientation={orientation} showWidgets={showWidgets} selectedText={selectedText} />;
      case 'suffixes':
        return <SuffixesWidget orientation={orientation} showWidgets={showWidgets} selectedText={selectedText} />;
      case 'brands':
        return <BrandsWidget orientation={orientation} showWidgets={showWidgets} selectedText={selectedText} />;
      default:
        return null;
    }
  };

  // Updated renderCardsContent to match SlidingPanel
  const renderCardsContent = () => {
    if (!cards || cards.length === 0) {
      return (
        <div className="empty-cards-message">
          <p>No cards yet. Try using the <code>#zip12345</code> command in your notes or select a word and use Alt+Space to search.</p>
        </div>
      );
    }

    return (
      <div className="cards-grid" ref={cardsGridRef}>
        {cards.map((card, index) => {
          const isLastCard = index === cards.length - 1;
          const cardRef = isLastCard ? lastCardRef : null;
          
          // Special case for dictionary cards - render them directly in the grid
          if (card.type === 'dictionary' && card.data.searchTerm) {
            return (
              <div key={card.id} ref={cardRef}>
                <DictionaryCard 
                  searchTerm={card.data.searchTerm} 
                  results={card.data.dictionaryResults || null}
                  cardId={card.id}
                  onRemove={onRemoveCard}
                />
              </div>
            );
          }
          
          // All other card types with the standard card-item wrapper
          return (
            <div 
              key={card.id} 
              className="card-item"
              ref={cardRef}
            >
              <button 
                className="close-button"
                onClick={() => onRemoveCard(card.id)}
                aria-label="Close"
              >
                ×
              </button>
              
              {card.type === 'zip' && card.data.zipCode && (
                <div className="zip-card">
                  <div className="zip-code">{card.data.zipCode}</div>
                  {card.data.city && card.data.state && (
                    <div className="location">
                      {card.data.city}, {card.data.state}
                    </div>
                  )}
                </div>
              )}
              
              {card.type === 'brand-snippet' && card.data.brandName && card.data.snippet && (
                <div className="brand-snippet-card">
                  <div className="brand-header">
                    <div className="brand-name">{card.data.brandName}</div>
                    <button 
                      className="insert-button"
                      onClick={(e) => {
                        e.stopPropagation(); // Still prevent event bubbling
                        insertSnippet(card.data.snippet || '');
                      }}
                      aria-label="Insert snippet into notes"
                      title="Insert into notes"
                    >
                      Insert
                    </button>
                  </div>
                  <div 
                    className="snippet-content"
                  >
                    {card.data.snippet}
                    {card.data.city && card.data.state && (
                      <div className="location">
                        {card.data.city}, {card.data.state}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render Diagrams panel content (placeholder)
  const renderDiagramsContent = () => {
    return (
      <div className="diagrams-content">
        <h4>Diagrams Panel</h4>
        <p>This is placeholder content for the Diagrams panel.</p>
        <p>You would typically see your diagrams content here.</p>
      </div>
    );
  };
  
  return (
    <div ref={panelRef} className={panelClasses} tabIndex={0} onKeyDown={handleKeyDown}>
      {orientation === 'landscape' ? (
        <div className="card h-100">
          <div className="card-body d-flex flex-column">
            {/* Upper section - Widget Tabs */}
            <div className="upper-section">
              <div className="widget-tabs">
                {/* Tab buttons */}
                <button
                  className={`tab-button ${activeWidget === 'alphabet' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('alphabet')}
                >
                  Alphabet
                </button>
                <button
                  className={`tab-button ${activeWidget === 'dictionary' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('dictionary')}
                >
                  Dictionary
                </button>
                <button
                  className={`tab-button ${activeWidget === 'zip' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('zip')}
                >
                  ZIP
                </button>
                <button
                  className={`tab-button ${activeWidget === 'suffixes' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('suffixes')}
                >
                  Suffixes
                </button>
                <button
                  className={`tab-button ${activeWidget === 'brands' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('brands')}
                >
                  Brands
                </button>
              </div>
              
              {/* Widget content */}
              <div className="widget-content">
                {renderWidgetContent()}
              </div>
            </div>
            
            {/* Lower section - Cards and Diagrams */}
            <div className="lower-section">
              <div className="lower-tabs">
                <button
                  className={`tab-button ${activeLowerTab === 'cards' ? 'active' : ''}`}
                  onClick={() => setActiveLowerTab('cards')}
                >
                  Cards
                </button>
                <button
                  className={`tab-button ${activeLowerTab === 'diagrams' ? 'active' : ''}`}
                  onClick={() => setActiveLowerTab('diagrams')}
                >
                  Diagrams
                </button>
              </div>
              
              {/* Lower content */}
              <div className="lower-content">
                {activeLowerTab === 'cards' ? renderCardsContent() : renderDiagramsContent()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // In portrait mode, show only the content
        <div className="card h-100">
          <div className="card-body">
            {renderWidgetContent()}
          </div>
        </div>
      )}
    </div>
  );
}

export default WidgetsPanel; 
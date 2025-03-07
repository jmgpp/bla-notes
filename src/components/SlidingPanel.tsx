import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import './SlidingPanel.scss';
import DictionaryCard from './DictionaryCard';

// Define DictionaryEntry interface locally to avoid import issues
interface DictionaryEntry {
  term: string;
  definition: string;
  examples?: string[];
}

interface CardData {
  id: string;
  type: 'zip' | 'brand-snippet' | 'dictionary';
  data: {
    zipCode?: string;
    city?: string;
    state?: string;
    brandName?: string;
    snippet?: string;
    category?: string;
    searchTerm?: string;
    dictionaryResults?: DictionaryEntry[];
  };
}

interface SlidingPanelProps {
  orientation: 'landscape' | 'portrait';
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  contextMenuOpen?: boolean;
  cards?: CardData[];
  onRemoveCard?: (id: string) => void;
}

// Storage key for panel expanded state
const PANEL_EXPANDED_STORAGE_KEY = 'sliding-panel-expanded-state';

const SlidingPanel: React.FC<SlidingPanelProps> = ({ 
  orientation, 
  textareaRef, 
  contextMenuOpen = false,
  cards = [],
  onRemoveCard = () => {}
}) => {
  // Get initial expanded state from localStorage if available
  const getInitialExpandedState = () => {
    try {
      const savedState = localStorage.getItem(PANEL_EXPANDED_STORAGE_KEY);
      return savedState === 'true'; // Convert string to boolean
    } catch (e) {
      // If there's an error (e.g., localStorage disabled), return default
      return false;
    }
  };

  // Set expanded state with localStorage persistence
  const [isExpanded, setIsExpanded] = useState(getInitialExpandedState());
  
  // Track previous orientation
  const prevOrientationRef = useRef<'landscape' | 'portrait'>(orientation);
  
  const [activeTab, setActiveTab] = useState<'cards' | 'diagrams'>('cards');
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});
  const [isPanelFixed, setIsPanelFixed] = useState(false);
  
  // Track previous card count to detect when cards are added
  const [prevCardCount, setPrevCardCount] = useState(cards.length);
  
  // Refs for scrolling
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const lastCardRef = useRef<HTMLDivElement>(null);
  
  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PANEL_EXPANDED_STORAGE_KEY, isExpanded.toString());
    } catch (e) {
      // Silently fail if localStorage is disabled
      console.warn('Could not save panel state to localStorage', e);
    }
  }, [isExpanded]);
  
  // Handle orientation changes
  useEffect(() => {
    // Skip if this is the first render or no change in orientation
    if (prevOrientationRef.current === orientation) {
      return;
    }
    
    if (prevOrientationRef.current === 'landscape' && orientation === 'portrait') {
      // When returning to portrait, get the saved state from localStorage
      const savedState = localStorage.getItem(PANEL_EXPANDED_STORAGE_KEY) === 'true';
      
      // Only update if needed to avoid unnecessary rerenders
      if (isExpanded !== savedState) {
        setIsExpanded(savedState);
      }
    }
    
    // Update previous orientation reference
    prevOrientationRef.current = orientation;
  }, [orientation, isExpanded]);
  
  // Create a more robust scroll to bottom function
  const scrollToBottom = () => {
    const attemptScroll = (attemptCount = 1) => {
      if (attemptCount > 5) return; // Give up after 5 attempts

      if (lastCardRef.current) {
        // Scroll the last card into view with smooth behavior
        lastCardRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end'
        });
      } else if (cardsGridRef.current) {
        // Fallback: scroll the grid to the bottom
        const gridElement = cardsGridRef.current;
        gridElement.scrollTop = gridElement.scrollHeight;
      } else if (cardsContainerRef.current) {
        // Fallback: scroll the container to the bottom
        const containerElement = cardsContainerRef.current;
        containerElement.scrollTop = containerElement.scrollHeight;
      } else {
        // Retry after a short delay
        setTimeout(() => attemptScroll(attemptCount + 1), 100);
      }
    };

    // Start scrolling attempts, with an initial delay
    setTimeout(attemptScroll, 50);
  };
  
  // Effect to auto-expand panel when cards are added (unless fixed)
  useEffect(() => {
    // If cards increased and we're not fixed and in portrait mode
    if (cards.length > prevCardCount && !isPanelFixed && orientation === 'portrait') {
      setIsExpanded(true);
    }
    
    // Update previous count
    setPrevCardCount(cards.length);
  }, [cards.length, isPanelFixed, orientation, prevCardCount]);
  
  // Effect to scroll to bottom when new cards are added, using a layout effect for timing
  useLayoutEffect(() => {
    if (cards.length > prevCardCount) {
      // Small initial delay to let the DOM update
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [cards.length, prevCardCount]);

  // Modified togglePanel function to save state immediately
  const togglePanel = () => {
    const newExpandedState = !isExpanded;
    
    // Update the state
    setIsExpanded(newExpandedState);
    
    // Also save to localStorage immediately
    try {
      localStorage.setItem(PANEL_EXPANDED_STORAGE_KEY, newExpandedState.toString());
    } catch (e) {
      // Silently fail if localStorage is disabled
    }
    
    // If expanding the panel, scroll to bottom after a delay
    if (newExpandedState && activeTab === 'cards') {
      setTimeout(scrollToBottom, 300);
    }
    
    // Restore the textarea focus
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleTabChange = (tab: 'cards' | 'diagrams') => {
    setActiveTab(tab);
    
    // If panel is collapsed in portrait mode, expand it
    if (orientation === 'portrait' && !isExpanded) {
      setIsExpanded(true);
    }
    
    // Focus the textarea after changing the tab
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  // Handle Escape key to collapse panel in portrait mode (only if no contextual menus are open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only collapse in portrait mode, only when expanded, and only when no contextual menus are open
      if (orientation === 'portrait' && isExpanded && !contextMenuOpen && e.key === 'Escape') {
        setIsExpanded(false);
        textareaRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [orientation, isExpanded, contextMenuOpen, textareaRef]);

  useEffect(() => {
    if (orientation === 'portrait') {
      const element = document.querySelector('.sliding-panel.portrait .footer-toolbar');
      if (element) {
        element.classList.add('force-visible');
      }
    }
  }, [orientation]);
  
  useEffect(() => {
    if (orientation === 'portrait') {
      const notesPanel = document.querySelector('.notes-panel.portrait');
      if (notesPanel) {
        if (isExpanded) {
          notesPanel.setAttribute('style', 'bottom: 40vh !important; transition: bottom 0.3s ease;');
        } else {
          notesPanel.setAttribute('style', 'bottom: 40px !important; transition: bottom 0.3s ease;');
        }
      }
    }
  }, [isExpanded, orientation]);

  // Toggle snippet expansion
  const toggleSnippetExpansion = (cardId: string) => {
    setExpandedSnippets(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Helper to get truncated text
  const getTruncatedText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Render cards in a grid layout
  const renderCards = () => {
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
              <div 
                key={card.id}
                ref={cardRef}
                className="card-wrapper"
              >
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
              ref={cardRef}
              className="card-item"
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
                  <div className="brand-name">{card.data.brandName}</div>
                  <div 
                    className={`snippet-content ${expandedSnippets[card.id] ? 'expanded' : ''}`}
                    onClick={() => toggleSnippetExpansion(card.id)}
                  >
                    {expandedSnippets[card.id] 
                      ? card.data.snippet 
                      : getTruncatedText(card.data.snippet, 100)
                    }
                    <div className="expand-indicator">
                      {expandedSnippets[card.id] ? '▲ Less' : '▼ More'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`sliding-panel ${orientation} ${isExpanded ? 'expanded' : ''}`}>
      {orientation === 'portrait' && (
        <>
          <div className={`footer-toolbar ${contextMenuOpen ? 'force-visible' : ''}`}>
            <div className="tab-labels">
              <span 
                className={activeTab === 'cards' ? 'active' : ''}
                onClick={() => handleTabChange('cards')}
              >
                Cards
              </span>
              <span 
                className={activeTab === 'diagrams' ? 'active' : ''}
                onClick={() => handleTabChange('diagrams')}
              >
                Diagrams
              </span>
            </div>
            <div className="toolbar-actions">
              <button 
                className={`fix-toggle ${isPanelFixed ? 'active' : ''}`}
                onClick={() => setIsPanelFixed(!isPanelFixed)}
                title={isPanelFixed ? "Panel auto-expand disabled" : "Panel auto-expand enabled"}
                aria-label="Toggle panel fix"
              >
                <span className="fix-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={isPanelFixed ? "#4dabf7" : "#6c757d"} stroke="none">
                    <path d="M12 2a4 4 0 0 0-4 4v8a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4zm0 18v-2" />
                  </svg>
                </span>
              </button>
              <button 
                className="toggle-button"
                onClick={togglePanel}
                aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
              />
            </div>
          </div>
          <div className="panel-content">
            <div className="tab-content">
              {activeTab === 'cards' ? (
                <div className="cards-content" ref={cardsContainerRef}>
                  {renderCards()}
                </div>
              ) : (
                <div className="diagrams-content">
                  <h4>Diagrams Panel</h4>
                  <p>This is placeholder content for the Diagrams panel. It has a light green background for visualization.</p>
                  <p>You would typically see your diagrams content here.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {orientation === 'landscape' && (
        <>
          <div className="panel-content">
            <div className="panel-tabs">
              <button 
                className={`tab-button ${activeTab === 'cards' ? 'active' : ''}`}
                onClick={() => handleTabChange('cards')}
              >
                Cards
              </button>
              <button 
                className={`tab-button ${activeTab === 'diagrams' ? 'active' : ''}`}
                onClick={() => handleTabChange('diagrams')}
              >
                Diagrams
              </button>
            </div>
            <div className="tab-content">
              {activeTab === 'cards' ? (
                <div className="cards-content" ref={cardsContainerRef}>
                  {renderCards()}
                </div>
              ) : (
                <div className="diagrams-content">
                  <h4>Diagrams Panel</h4>
                  <p>This is placeholder content for the Diagrams panel. It has a light green background for visualization.</p>
                  <p>You would typically see your diagrams content here.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SlidingPanel; 
import React, { useState, useEffect } from 'react';
import './SlidingPanel.scss';
import DictionaryCard from './DictionaryCard';
import { DictionaryEntry } from '../data/dictionary';

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

const SlidingPanel: React.FC<SlidingPanelProps> = ({ 
  orientation, 
  textareaRef, 
  contextMenuOpen = false,
  cards = [],
  onRemoveCard = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'diagrams'>('cards');
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
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
      <div className="cards-grid">
        {cards.map(card => (
          <div key={card.id} className="card-item">
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
            
            {card.type === 'dictionary' && card.data.searchTerm && (
              <DictionaryCard 
                searchTerm={card.data.searchTerm} 
                results={card.data.dictionaryResults || null} 
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`sliding-panel ${orientation} ${isExpanded ? 'expanded' : ''}`}>
      {orientation === 'portrait' ? (
        <>
          <div className="footer-toolbar force-visible">
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
            <button 
              className="toggle-button"
              onClick={togglePanel}
              aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
            />
          </div>
          <div className="panel-content">
            <div className="tab-content">
              {activeTab === 'cards' ? (
                <div className="cards-content">
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
      ) : (
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
                <div className="cards-content">
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
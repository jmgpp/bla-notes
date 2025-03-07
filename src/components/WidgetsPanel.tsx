import React, { useRef, useEffect, useState } from 'react';
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
}

function WidgetsPanel({ 
  orientation, 
  showWidgets, 
  activeWidget, 
  setActiveWidget, 
  selectedText,
  cards = [],
  onRemoveCard = () => {}
}: WidgetsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeLowerTab, setActiveLowerTab] = useState<'cards' | 'diagrams'>('cards');
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});
  
  // Add function to toggle snippet expansion
  const toggleSnippetExpansion = (cardId: string) => {
    setExpandedSnippets(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };
  
  // Add function to truncate text
  const getTruncatedText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

  const panelClasses = `widgets-panel ${orientation} ${showWidgets ? 'visible' : 'hidden'} ${orientation === 'portrait' ? 'content-sized' : ''}`;
  
  // Content for each widget type
  const renderWidgetContent = () => {
    switch (activeWidget) {
      case 'alphabet':
        return <AlphabetWidget orientation={orientation} selectedText={selectedText} />;
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
      <div className="cards-grid">
        {cards.map(card => {
          // Special case for dictionary cards - render them directly in the grid
          if (card.type === 'dictionary' && card.data.searchTerm) {
            return (
              <DictionaryCard 
                key={card.id}
                searchTerm={card.data.searchTerm} 
                results={card.data.dictionaryResults || null}
                cardId={card.id}
                onRemove={onRemoveCard}
              />
            );
          }
          
          // All other card types with the standard card-item wrapper
          return (
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
    <div ref={panelRef} className={panelClasses} tabIndex={-1}>
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
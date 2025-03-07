import React from 'react';
import './DictionaryCard.scss';

// Define DictionaryEntry interface locally to avoid import issues
interface DictionaryEntry {
  term: string;
  definition: string;
  examples?: string[];
}

interface DictionaryCardProps {
  searchTerm: string;
  results: DictionaryEntry[] | null;
  cardId?: string; // Optional card ID for removal
  onRemove?: (id: string) => void; // Optional callback for card removal
}

const DictionaryCard: React.FC<DictionaryCardProps> = ({ 
  searchTerm, 
  results,
  cardId,
  onRemove 
}) => {
  // Handle external search buttons
  const handleExternalSearch = (type: 'google' | 'translate' | 'webster') => {
    const encodedTerm = encodeURIComponent(searchTerm);
    
    switch (type) {
      case 'google':
        window.open(`https://www.google.com/search?q=${encodedTerm}`, '_blank');
        break;
      case 'translate':
        window.open(`https://translate.google.com/?sl=auto&tl=es&text=${encodedTerm}`, '_blank');
        break;
      case 'webster':
        window.open(`https://www.merriam-webster.com/dictionary/${encodedTerm}`, '_blank');
        break;
    }
  };

  // Render action buttons with either full text or initial letter based on hasResults
  const renderActionButtons = (hasResults: boolean) => (
    <div className={`external-search-buttons ${hasResults ? 'mini' : ''}`}>
      <button 
        onClick={() => handleExternalSearch('google')} 
        className="search-button google"
        title="Search Google"
      >
        {hasResults ? 'G' : 'Search Google'}
      </button>
      <button 
        onClick={() => handleExternalSearch('translate')} 
        className="search-button translate"
        title="Translate"
      >
        {hasResults ? 'T' : 'Translate'}
      </button>
      <button 
        onClick={() => handleExternalSearch('webster')} 
        className="search-button webster"
        title="Merriam-Webster"
      >
        {hasResults ? 'W' : 'Merriam-Webster'}
      </button>
    </div>
  );

  return (
    <div className="dictionary-card card-item">
      {cardId && onRemove && (
        <button 
          className="close-button"
          onClick={() => onRemove(cardId)}
          aria-label="Close"
        >
          ×
        </button>
      )}
      
      <div className="search-term">
        <span className="term">{searchTerm}</span>
      </div>
      
      {results && results.length > 0 ? (
        <div className="results-container">
          <div className="scrollable-results">
            {results.map((entry, index) => (
              <div key={index} className="dictionary-entry">
                <div className="entry-term">{entry.term}</div>
                <div className="entry-definition">{entry.definition}</div>
                {entry.examples && entry.examples.length > 0 && (
                  <div className="entry-examples">
                    {entry.examples.map((example: string, i: number) => (
                      <div key={i} className="example">"{example}"</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {renderActionButtons(true)}
        </div>
      ) : (
        <div className="no-results">
          <p className="no-entries-message">No entries found</p>
          {renderActionButtons(false)}
        </div>
      )}
    </div>
  );
};

export default DictionaryCard; 
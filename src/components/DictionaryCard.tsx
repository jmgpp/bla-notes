import React from 'react';
import './DictionaryCard.scss';
import { DictionaryEntry } from '../data/dictionary';

interface DictionaryCardProps {
  searchTerm: string;
  results: DictionaryEntry[] | null;
}

const DictionaryCard: React.FC<DictionaryCardProps> = ({ searchTerm, results }) => {
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

  return (
    <div className="dictionary-card">
      <div className="search-term">
        <span className="term">{searchTerm}</span>
      </div>
      
      {results && results.length > 0 ? (
        <div className="results-container">
          {results.map((entry, index) => (
            <div key={index} className="dictionary-entry">
              <div className="entry-term">{entry.term}</div>
              <div className="entry-definition">{entry.definition}</div>
              {entry.examples && entry.examples.length > 0 && (
                <div className="entry-examples">
                  {entry.examples.map((example, i) => (
                    <div key={i} className="example">"{example}"</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No dictionary entries found for "{searchTerm}"</p>
          <div className="external-search-buttons">
            <button onClick={() => handleExternalSearch('google')} className="search-button google">
              Search Google
            </button>
            <button onClick={() => handleExternalSearch('translate')} className="search-button translate">
              Translate
            </button>
            <button onClick={() => handleExternalSearch('webster')} className="search-button webster">
              Merriam-Webster
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryCard; 
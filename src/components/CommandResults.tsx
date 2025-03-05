import React from 'react';
import './CommandResults.scss';

interface CommandResult {
  type: 'zip';
  data: {
    zipCode: string;
    city: string;
    state: string;
  };
}

interface CommandResultsProps {
  results: CommandResult[];
  onDismiss: (index: number) => void;
}

const CommandResults: React.FC<CommandResultsProps> = ({ results, onDismiss }) => {
  if (results.length === 0) return null;

  return (
    <div className="command-results">
      {results.map((result, index) => (
        <div key={`${result.type}-${index}`} className="result-card">
          <button 
            className="close-button"
            onClick={() => onDismiss(index)}
            aria-label="Close"
          >
            ×
          </button>
          {result.type === 'zip' && (
            <div className="zip-result">
              <div className="zip-code">{result.data.zipCode}</div>
              <div className="location">
                {result.data.city}, {result.data.state}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommandResults; 
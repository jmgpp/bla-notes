import React, { useState, useRef, useEffect } from 'react';
import './ZipWidget.scss';

interface ZipWidgetProps {
  orientation: 'landscape' | 'portrait';
  showWidgets?: boolean;
  selectedText?: string;
}

// Updated interface to match the actual API response structure
interface ZipResult {
  'post code': string;
  country: string;
  'country abbreviation': string;
  places: {
    'place name': string;
    state: string;
    'state abbreviation': string;
    latitude: string;
    longitude: string;
  }[];
}

const ZipWidget: React.FC<ZipWidgetProps> = ({ orientation, showWidgets, selectedText }) => {
  const [zipCode, setZipCode] = useState('');
  const [result, setResult] = useState<ZipResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when widget becomes visible
  useEffect(() => {
    if (showWidgets && inputRef.current) {
      // Small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [showWidgets]);

  // Process selected text when it changes
  useEffect(() => {
    if (selectedText) {
      // Extract 5 digits from the selected text (ignoring spaces and other characters)
      const digits = selectedText.replace(/\D/g, '');
      if (digits.length >= 5) {
        // Use the first 5 digits
        const zipFromSelection = digits.substring(0, 5);
        setZipCode(zipFromSelection);
        // Automatically search with the extracted ZIP code
        searchZipCode(zipFromSelection);
      }
    }
  }, [selectedText]);

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 5 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipCode(value);
    
    // Clear previous results when input changes
    if (value.length < 5) {
      setResult(null);
      setError(null);
    }
  };

  const searchZipCode = async (zipToSearch = zipCode) => {
    if (zipToSearch.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipToSearch}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(`ZIP code ${zipToSearch} not found`);
        } else {
          setError(`Error: ${response.status}`);
        }
        setResult(null);
        return;
      }

      const data = await response.json();
      console.log('ZIP data:', data); // Log the data to see its structure
      setResult(data);
    } catch (err) {
      setError('Failed to fetch ZIP code information');
      console.error('ZIP code lookup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchZipCode();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Auto-search when 5 digits are entered
    if (zipCode.length === 5 && e.key !== 'Backspace' && e.key !== 'Delete') {
      searchZipCode();
    }
  };

  return (
    <div className={`zip-widget ${orientation}`} tabIndex={-1}>
      <div className="zip-search-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter 5-digit ZIP code"
            value={zipCode}
            onChange={handleZipChange}
            onKeyDown={handleKeyDown}
            className="zip-input"
            ref={inputRef}
            tabIndex={-1}
            aria-label="ZIP code input"
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={zipCode.length !== 5 || loading}
            tabIndex={-1}
          >
            {loading ? '...' : 'Go'}
          </button>
        </form>
      </div>

      <div className="zip-result-container">
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && !loading && !error && (
          <div className="zip-results">
            {result.places && result.places.length > 0 ? (
              result.places.map((place, index) => (
                <div key={index} className="place-info">
                  <div className="location-display">
                    {place['place name']}, {place.state}
                  </div>
                </div>
              ))
            ) : (
              <div className="error-message">No location data found</div>
            )}
          </div>
        )}

        {!result && !loading && !error && (
          <div className="instructions">
            <p>Enter a 5-digit US ZIP code</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZipWidget; 
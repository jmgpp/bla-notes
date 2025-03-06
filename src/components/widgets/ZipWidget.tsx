import React, { useState, useRef, useEffect } from 'react';
import './ZipWidget.scss';

interface ZipWidgetProps {
  orientation: 'landscape' | 'portrait';
  showWidgets?: boolean;
  selectedText?: string;
  mini?: boolean;
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

const ZipWidget: React.FC<ZipWidgetProps> = ({ orientation, showWidgets, selectedText, mini }) => {
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
    <div className={`zip-widget ${orientation} ${mini ? 'mini' : ''}`}>
      <div className="zip-search-container">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="zip-input"
            value={zipCode}
            onChange={handleZipChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter ZIP code"
            maxLength={5}
            pattern="[0-9]*"
          />
          <button 
            type="submit" 
            className="search-button" 
            disabled={loading || zipCode.length !== 5}
          >
            {loading ? '...' : '→'}
          </button>
        </form>
      </div>
      
      {(loading || error || result) && (
        <div className="zip-result-container">
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
            </div>
          )}
          
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          {result && !loading && !error && (
            <div className="zip-results">
              <div className="place-info">
                <div>
                  <div className="zip-code">{result['post code']}</div>
                  <div className="location">
                    {result.places[0]['place name']}, {result.places[0]['state abbreviation']}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ZipWidget; 
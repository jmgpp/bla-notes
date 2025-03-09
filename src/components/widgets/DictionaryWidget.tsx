import React, { useState, useEffect, useRef } from 'react';
import './DictionaryWidget.scss';
import dictionaryData from '../../data/dictionary.json';

interface DictionaryWidgetProps {
  orientation: 'landscape' | 'portrait';
  showWidgets?: boolean;
  selectedText?: string;
}

interface Term {
  id: string;
  categoryId: number;
  subcategoryId: number;
  englishTerm: string;
  spanishTerm: string;
  notes: string;
  tags: string[];
  showTags?: boolean;
}

const DictionaryWidget: React.FC<DictionaryWidgetProps> = ({ orientation, showWidgets, selectedText }) => {
  // STATE MANAGEMENT
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const [enterPressed, setEnterPressed] = useState(false);
  
  // Key state for filtering - with forced rerender key
  const [visibleTerms, setVisibleTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // This key forces a complete re-render when filters change
  const [rerenderKey, setRerenderKey] = useState(0);
  
  // REFS
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastEnterPressRef = useRef<number | null>(null);
  const enterPressTimeoutRef = useRef<number | null>(null);
  const filterUpdateCountRef = useRef(0);
  const widgetActiveRef = useRef<boolean>(false);

  // CATEGORIES DATA
  const categories = dictionaryData.categories;
  
  // SUBCATEGORIES for selected category
  const subcategories = selectedCategory !== null 
    ? (categories.find(cat => cat.id === selectedCategory)?.subcategories || [])
    : [];

  // Sort terms alphabetically by English term
  const sortTermsAlphabetically = (terms: Term[]): Term[] => {
    return [...terms].sort((a, b) => 
      a.englishTerm.toLowerCase().localeCompare(b.englishTerm.toLowerCase())
    );
  };

  // Sort terms with best matches first, then alphabetically
  const sortTermsByRelevance = (terms: Term[], query: string): Term[] => {
    if (!query.trim()) {
      return sortTermsAlphabetically(terms);
    }

    const queryLower = query.toLowerCase().trim();
    
    return [...terms].sort((a, b) => {
      // Check for exact matches (case insensitive)
      const aEnglishExact = a.englishTerm.toLowerCase() === queryLower;
      const bEnglishExact = b.englishTerm.toLowerCase() === queryLower;
      const aSpanishExact = a.spanishTerm.toLowerCase() === queryLower;
      const bSpanishExact = b.spanishTerm.toLowerCase() === queryLower;
      
      // Exact matches go to the top
      if (aEnglishExact && !bEnglishExact) return -1;
      if (bEnglishExact && !aEnglishExact) return 1;
      if (aSpanishExact && !bSpanishExact) return -1;
      if (bSpanishExact && !aSpanishExact) return 1;
      
      // Check for starts with matches
      const aEnglishStarts = a.englishTerm.toLowerCase().startsWith(queryLower);
      const bEnglishStarts = b.englishTerm.toLowerCase().startsWith(queryLower);
      const aSpanishStarts = a.spanishTerm.toLowerCase().startsWith(queryLower);
      const bSpanishStarts = b.spanishTerm.toLowerCase().startsWith(queryLower);
      
      // "Starts with" matches come next
      if (aEnglishStarts && !bEnglishStarts) return -1;
      if (bEnglishStarts && !aEnglishStarts) return 1;
      if (aSpanishStarts && !bSpanishStarts) return -1;
      if (bSpanishStarts && !aSpanishStarts) return 1;
      
      // Finally, sort alphabetically by English term
      return a.englishTerm.toLowerCase().localeCompare(b.englishTerm.toLowerCase());
    });
  };

  // INITIALIZATION
  useEffect(() => {
    setIsLoading(true);
    
    // Set initial data after a brief delay, sorted alphabetically
    setTimeout(() => {
      const sortedTerms = sortTermsAlphabetically(dictionaryData.terms);
      setVisibleTerms(sortedTerms);
      setIsLoading(false);
    }, 100);
  }, []);
  
  // CRITICAL: APPLY FILTERS
  useEffect(() => {
    // Skip if still loading
    if (isLoading) {
      return;
    }
    
    const updateCounter = ++filterUpdateCountRef.current;
    
    try {
      // Start with all terms
      let results = [...dictionaryData.terms];
      
      // Apply category filter
      if (selectedCategory !== null) {
        results = results.filter((term: Term) => term.categoryId === selectedCategory);
      }
      
      // Apply subcategory filter
      if (selectedSubcategory !== null) {
        results = results.filter((term: Term) => term.subcategoryId === selectedSubcategory);
      }
      
      // Apply search term filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        results = results.filter((term: Term) => 
          term.englishTerm.toLowerCase().includes(searchLower) || 
          term.spanishTerm.toLowerCase().includes(searchLower) || 
          term.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
        
        // Sort by relevance when there's a search term
        results = sortTermsByRelevance(results, searchTerm);
      } else {
        // Sort alphabetically when there's no search term
        results = sortTermsAlphabetically(results);
      }
      
      // Update state with filtered and sorted results
      setVisibleTerms(results);
      
    } catch (error) {
      console.error("Error in filter application:", error);
    }
  }, [searchTerm, selectedCategory, selectedSubcategory, isLoading]);
  
  // Focus search when widget becomes visible
  useEffect(() => {
    if (showWidgets) {
      widgetActiveRef.current = true;
      
      // Focus the search input when the widget becomes visible
      setTimeout(() => {
        if (searchInputRef.current && widgetActiveRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    } else {
      widgetActiveRef.current = false;
    }
  }, [showWidgets]);
  
  // Set search term when selectedText changes and focus the search input
  useEffect(() => {
    if (selectedText && widgetActiveRef.current) {
      setSearchTerm(selectedText);
      
      // Focus the search input when text is selected
      setTimeout(() => {
        if (searchInputRef.current && widgetActiveRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [selectedText]);
  
  // Handle term click (expand/collapse)
  const handleTermClick = (termId: string) => {
    setExpandedTermId(expandedTermId === termId ? null : termId);
  };
  
  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value ? Number(value) : null);
    setSelectedSubcategory(null); // Reset subcategory when category changes
    
    // Return focus to search input
    setTimeout(() => {
      if (searchInputRef.current && widgetActiveRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);
  };
  
  // Handle subcategory change
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSubcategory(value ? Number(value) : null);
    
    // Return focus to search input
    setTimeout(() => {
      if (searchInputRef.current && widgetActiveRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };
  
  // Handle search input focus
  const handleSearchFocus = () => {
    widgetActiveRef.current = true;
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    
    // Reset to all terms immediately, sorted alphabetically
    setVisibleTerms(sortTermsAlphabetically(dictionaryData.terms));
    
    // Focus the search input
    setTimeout(() => {
      if (searchInputRef.current && widgetActiveRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };
  
  // Handle key press for double-enter detection
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const now = Date.now();
      
      if (lastEnterPressRef.current && now - lastEnterPressRef.current < 500) {
        // Double-Enter detected
        const encodedTerm = encodeURIComponent(searchTerm.trim());
        window.open(`https://dictionary.cambridge.org/dictionary/english-spanish/${encodedTerm}`, '_blank');
        
        lastEnterPressRef.current = null;
        setEnterPressed(false);
        
        if (enterPressTimeoutRef.current) {
          window.clearTimeout(enterPressTimeoutRef.current);
          enterPressTimeoutRef.current = null;
        }
      } else {
        // First Enter - start timer
        lastEnterPressRef.current = now;
        setEnterPressed(true);
        
        if (enterPressTimeoutRef.current) {
          window.clearTimeout(enterPressTimeoutRef.current);
        }
        
        enterPressTimeoutRef.current = window.setTimeout(() => {
          setEnterPressed(false);
          lastEnterPressRef.current = null;
          enterPressTimeoutRef.current = null;
        }, 1000);
      }
    }
  };
  
  return (
    <div className={`dictionary-widget ${orientation}`} tabIndex={-1}>
      {/* SEARCH INPUT */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search terms, translations, or tags..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyPress}
          onFocus={handleSearchFocus}
          className={`search-input ${enterPressed ? 'enter-pressed' : ''}`}
          ref={searchInputRef}
          autoFocus={showWidgets}
        />
        {searchTerm && (
          <button 
            className="clear-search" 
            onClick={() => {
              setSearchTerm('');
              setTimeout(() => {
                if (searchInputRef.current && widgetActiveRef.current) {
                  searchInputRef.current.focus();
                }
              }, 0);
            }}
          >
            ×
          </button>
        )}
        <div className={`search-hint ${enterPressed ? 'active' : ''}`}>
          {enterPressed ? 'Press Enter again to search in Cambridge Dictionary' : 'Press Enter twice to search in Cambridge Dictionary'}
        </div>
      </div>
      
      {/* FILTER CONTROLS */}
      <div className="filter-container">
        <select 
          value={selectedCategory === null ? '' : selectedCategory}
          onChange={handleCategoryChange}
          className="category-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        {selectedCategory !== null && (
          <select 
            value={selectedSubcategory === null ? '' : selectedSubcategory}
            onChange={handleSubcategoryChange}
            className="subcategory-select"
          >
            <option value="">All Subcategories</option>
            {subcategories.map(subcategory => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        )}
        
        {(selectedCategory !== null || selectedSubcategory !== null || searchTerm.trim() !== '') && (
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* RESULTS COUNT */}
      <div className="results-count">
        {isLoading 
          ? 'Loading...' 
          : `${visibleTerms.length} ${visibleTerms.length === 1 ? 'result' : 'results'}`
        }
      </div>
      
      {/* TERMS LIST */}
      <div className="terms-list">
        {isLoading ? (
          <div className="loading">Loading dictionary...</div>
        ) : visibleTerms.length > 0 ? (
          visibleTerms.map(term => (
            <div 
              key={term.id} 
              className={`term-item ${expandedTermId === term.id ? 'expanded' : ''}`}
              onClick={() => handleTermClick(term.id)}
            >
              <div className="term-header">
                <div className="term-content">
                  <span className="english-term">{term.englishTerm}</span>
                  <span className="arrow-separator">→</span>
                  <span className="spanish-term">{term.spanishTerm}</span>
                </div>
              </div>
              
              {expandedTermId === term.id && (
                <div className="term-details">
                  {term.notes && <div className="notes">{term.notes}</div>}
                  {term.tags && term.tags.length > 0 && (
                    <div className="tags">
                      {term.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="tag"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchTerm(tag);
                            setTimeout(() => {
                              if (searchInputRef.current && widgetActiveRef.current) {
                                searchInputRef.current.focus();
                              }
                            }, 0);
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-results">No matching terms found</div>
        )}
      </div>
    </div>
  );
};

export default DictionaryWidget; 
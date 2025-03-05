import React, { useState, useEffect, useMemo, useRef } from 'react';
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

interface Category {
  id: number;
  name: string;
  order: number;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
}

const DictionaryWidget: React.FC<DictionaryWidgetProps> = ({ orientation, showWidgets, selectedText }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>(dictionaryData.terms);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [enterPressed, setEnterPressed] = useState(false);
  const termsListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastEnterPressRef = useRef<number | null>(null);
  const enterPressTimeoutRef = useRef<number | null>(null);
  
  const categories = useMemo(() => dictionaryData.categories, []);
  
  // Focus search input when widget becomes visible
  useEffect(() => {
    if (showWidgets && searchInputRef.current) {
      // Small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [showWidgets]);
  
  // Set search term when selectedText changes
  useEffect(() => {
    if (selectedText) {
      setSearchTerm(selectedText);
    }
  }, [selectedText]);
  
  // Ensure proper scrolling when component mounts
  useEffect(() => {
    if (termsListRef.current) {
      termsListRef.current.style.overflow = 'auto';
    }
  }, []);
  
  // Get subcategories for the selected category
  const subcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.subcategories : [];
  }, [selectedCategory, categories]);

  // Filter terms based on search input and selected category/subcategory
  const filteredTerms = useMemo(() => {
    let filtered = terms;
    
    // Filter by category if selected
    if (selectedCategory !== null) {
      filtered = filtered.filter(term => term.categoryId === selectedCategory);
    }
    
    // Filter by subcategory if selected
    if (selectedSubcategory !== null) {
      filtered = filtered.filter(term => term.subcategoryId === selectedSubcategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(term => 
        term.englishTerm.toLowerCase().includes(searchLower) || 
        term.spanishTerm.toLowerCase().includes(searchLower) || 
        term.notes.toLowerCase().includes(searchLower) ||
        term.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [searchTerm, terms, selectedCategory, selectedSubcategory]);

  const handleTermClick = (termId: string) => {
    setExpandedTermId(expandedTermId === termId ? null : termId);
  };
  
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when category changes
  };
  
  const handleSubcategoryChange = (subcategoryId: number | null) => {
    setSelectedSubcategory(subcategoryId);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  // Handle key press for double-enter detection
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const now = Date.now();
      
      // Check if this is a second Enter press within 500ms
      if (lastEnterPressRef.current && now - lastEnterPressRef.current < 500) {
        // Open Cambridge Dictionary in a new tab
        const encodedTerm = encodeURIComponent(searchTerm.trim());
        window.open(`https://dictionary.cambridge.org/dictionary/english-spanish/${encodedTerm}`, '_blank');
        
        // Reset the timer and visual indicator
        lastEnterPressRef.current = null;
        setEnterPressed(false);
        
        // Clear any existing timeout
        if (enterPressTimeoutRef.current) {
          window.clearTimeout(enterPressTimeoutRef.current);
          enterPressTimeoutRef.current = null;
        }
      } else {
        // First Enter press - start the timer
        lastEnterPressRef.current = now;
        setEnterPressed(true);
        
        // Set a timeout to reset the visual indicator after 1 second
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

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (enterPressTimeoutRef.current) {
        window.clearTimeout(enterPressTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`dictionary-widget ${orientation}`} tabIndex={-1}>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search terms, translations, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
          className={`search-input ${enterPressed ? 'enter-pressed' : ''}`}
          ref={searchInputRef}
          tabIndex={-1}
        />
        {searchTerm && (
          <button 
            className="clear-search" 
            onClick={() => setSearchTerm('')}
            tabIndex={-1}
          >
            ×
          </button>
        )}
        <div className={`search-hint ${enterPressed ? 'active' : ''}`}>
          {enterPressed ? 'Press Enter again to search in Cambridge Dictionary' : 'Press Enter twice to search in Cambridge Dictionary'}
        </div>
      </div>
      
      <div className="filter-container">
        <select 
          value={selectedCategory || ''}
          onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
          className="category-select"
          tabIndex={-1}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        {selectedCategory && (
          <select 
            value={selectedSubcategory || ''}
            onChange={(e) => handleSubcategoryChange(e.target.value ? Number(e.target.value) : null)}
            className="subcategory-select"
            tabIndex={-1}
          >
            <option value="">All Subcategories</option>
            {subcategories.map(subcategory => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        )}
        
        {(selectedCategory || selectedSubcategory || searchTerm) && (
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
            tabIndex={-1}
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="results-count">
        {filteredTerms.length} {filteredTerms.length === 1 ? 'result' : 'results'}
      </div>
      
      <div className="terms-list" ref={termsListRef}>
        {filteredTerms.length > 0 ? (
          filteredTerms.map(term => (
            <div 
              key={term.id} 
              className={`term-item ${expandedTermId === term.id ? 'expanded' : ''}`}
              onClick={() => handleTermClick(term.id)}
              tabIndex={-1}
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
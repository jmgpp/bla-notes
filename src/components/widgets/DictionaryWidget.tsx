import React, { useState, useEffect, useRef } from 'react';
import './DictionaryWidget.scss';
import { dictionaryData } from '../../data/dictionaryData';
import { userDataService } from '../../services/UserDataService';
import TermEditorModal from '../modals/TermEditorModal';
import ImportExportModal from '../modals/ImportExportModal';
import { FaPlus, FaEdit, FaTrash, FaFileExport } from 'react-icons/fa';

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
  subcategories: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
}

const DictionaryWidget: React.FC<DictionaryWidgetProps> = ({ orientation, showWidgets, selectedText }) => {
  // STATE MANAGEMENT
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const [enterPressed, setEnterPressed] = useState(false);
  
  // State for CRUD operations
  const [isTermEditorOpen, setIsTermEditorOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<Term | undefined>(undefined);
  
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
  const categories: Category[] = (dictionaryData as any).categories || [];
  
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
      // Use userDataService to get all terms (including user-added ones)
      const sortedTerms = sortTermsAlphabetically(userDataService.getAllTerms());
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
      // Start with all terms including user terms
      let results = [...userDataService.getAllTerms()];
      
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
  }, [searchTerm, selectedCategory, selectedSubcategory, isLoading, rerenderKey]);
  
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
    setVisibleTerms(sortTermsAlphabetically(userDataService.getAllTerms()));
    
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
      
      // Clear any pending timeout
      if (enterPressTimeoutRef.current !== null) {
        window.clearTimeout(enterPressTimeoutRef.current);
      }
      
      if (lastEnterPressRef.current !== null && now - lastEnterPressRef.current < 500) {
        // Double Enter press detected
        setEnterPressed(true);
        
        // Auto-expand the first match
        if (visibleTerms.length > 0) {
          setExpandedTermId(visibleTerms[0].id);
        }
        
        lastEnterPressRef.current = null;
      } else {
        // Single Enter press
        lastEnterPressRef.current = now;
        setEnterPressed(false);
        
        // Reset after a delay
        enterPressTimeoutRef.current = window.setTimeout(() => {
          lastEnterPressRef.current = null;
        }, 500);
      }
    }
  };

  // CRUD Operations
  const handleAddTerm = () => {
    setSelectedTerm(undefined);
    setIsTermEditorOpen(true);
  };

  const handleEditTerm = (term: Term) => {
    setSelectedTerm(term);
    setIsTermEditorOpen(true);
  };

  const handleDeleteTerm = (termId: string) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      userDataService.deleteTerm(termId);
      // Force re-render by incrementing key
      setRerenderKey(prev => prev + 1);
    }
  };

  const handleTermEditorClose = () => {
    setIsTermEditorOpen(false);
    // Force re-render after editing
    setRerenderKey(prev => prev + 1);
  };

  const handleImportExportOpen = () => {
    setIsImportExportOpen(true);
  };

  const handleImportExportClose = () => {
    setIsImportExportOpen(false);
    // Force re-render after import/export
    setRerenderKey(prev => prev + 1);
  };

  // Check if a term is a user-added one
  const isUserTerm = (termId: string) => {
    return userDataService.isUserTerm(termId);
  };
  
  // RENDERING
  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-message">Loading dictionary...</div>;
    }
    
    if (visibleTerms.length === 0) {
      return <div className="no-results">No terms found. Try adjusting your filters.</div>;
    }
    
    return (
      <div className="dictionary-results">
        <div className="results-count">
          {visibleTerms.length} {visibleTerms.length === 1 ? 'term' : 'terms'} found
        </div>
        
        <div className="terms-list">
          {visibleTerms.map((term) => {
            const isExpanded = expandedTermId === term.id;
            const userTerm = isUserTerm(term.id);
            
            return (
              <div 
                key={term.id} 
                className={`term-item ${isExpanded ? 'expanded' : ''} ${userTerm ? 'user-term' : ''}`}
              >
                <div className="term-header" onClick={() => handleTermClick(term.id)}>
                  <div className="term-title">
                    <span className="english-term">{term.englishTerm}</span>
                    {term.spanishTerm && (
                      <span className="spanish-term">{term.spanishTerm}</span>
                    )}
                  </div>
                  
                  <div className="term-actions">
                    {userTerm ? (
                      <>
                        <button 
                          className="action-button edit-button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTerm(term);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="action-button delete-button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTerm(term.id);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </>
                    ) : (
                      <button 
                        className="action-button edit-button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTerm(term);
                        }}
                      >
                        <FaEdit />
                      </button>
                    )}
                    <div className="expand-icon">{isExpanded ? '−' : '+'}</div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="term-details">
                    {term.notes && (
                      <div className="term-notes">{term.notes}</div>
                    )}
                    
                    {term.tags && term.tags.length > 0 && (
                      <div className="term-tags">
                        {term.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="term-meta">
                      <div className="term-category">
                        {categories.find(cat => cat.id === term.categoryId)?.name || 'Unknown Category'}
                        {term.subcategoryId !== 0 && (
                          <> › {categories
                            .find(cat => cat.id === term.categoryId)
                            ?.subcategories.find(sub => sub.id === term.subcategoryId)
                            ?.name || 'Unknown Subcategory'}</>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`dictionary-widget ${orientation === 'landscape' ? 'landscape' : 'portrait'}`}>
      <div className="dictionary-filters">
        <div className="filter-row search-row">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search terms..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onKeyDown={handleKeyPress}
            className="search-input"
          />
          
          <div className="action-buttons">
            <button 
              className="action-button add-button" 
              onClick={handleAddTerm}
              title="Add New Term"
            >
              <FaPlus />
            </button>
            <button 
              className="action-button import-export-button" 
              onClick={handleImportExportOpen}
              title="Import/Export Terms"
            >
              <FaFileExport />
            </button>
            <button
              className="action-button clear-button"
              onClick={clearFilters}
              title="Clear All Filters"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="filter-row categories">
          <select
            value={selectedCategory === null ? '' : selectedCategory.toString()}
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          
          {selectedCategory !== null && (
            <select
              value={selectedSubcategory === null ? '' : selectedSubcategory.toString()}
              onChange={handleSubcategoryChange}
              className="subcategory-select"
            >
              <option value="">All Subcategories</option>
              {subcategories.map(subcat => (
                <option key={subcat.id} value={subcat.id}>
                  {subcat.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      <div className="dictionary-content">
        {renderContent()}
      </div>

      {/* Modals */}
      <TermEditorModal 
        isOpen={isTermEditorOpen}
        onClose={handleTermEditorClose}
        term={selectedTerm}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={handleImportExportClose}
      />
    </div>
  );
};

export default DictionaryWidget; 
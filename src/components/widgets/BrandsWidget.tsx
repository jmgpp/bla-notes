import React, { useState, useEffect, useRef } from 'react';
import './BrandsWidget.scss';
import { 
  brands as brandData, 
  Brand,
  getCategoryGroupMap, 
  getGroupColorMap, 
  getCategoryColorMap 
} from '../../data/brands';
import { userDataService } from '../../services/UserDataService';
import BrandEditorModal from '../modals/BrandEditorModal';
import ImportExportModal from '../modals/ImportExportModal';
import { FaPlus, FaEdit, FaTrash, FaFileExport } from 'react-icons/fa';

interface BrandsWidgetProps {
  orientation: 'landscape' | 'portrait';
  showWidgets?: boolean;
  selectedText?: string;
}

export const BrandsWidget = ({ orientation, showWidgets, selectedText }: BrandsWidgetProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // State for CRUD operations
  const [isBrandEditorOpen, setIsBrandEditorOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>(undefined);
  const [rerenderKey, setRerenderKey] = useState(0);

  // Load brands with user data on mount and when rerenderKey changes
  useEffect(() => {
    // Get combined brands from default and user data
    const combinedBrands = userDataService.getAllBrands();
    setAllBrands(combinedBrands);
  }, [rerenderKey]);

  // Focus on search input when widget becomes visible
  useEffect(() => {
    if (showWidgets && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showWidgets]);

  // Process selected text
  useEffect(() => {
    if (selectedText) {
      setSearchTerm(selectedText);
    }
  }, [selectedText]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    // Reset expanded brand when search changes
    setExpandedBrand(null);
    
    // Reset active filter if clearing search
    if (newSearchTerm === '') {
      setActiveFilter(null);
    }
    
    // Update search term
    setSearchTerm(newSearchTerm);
  };

  const toggleBrandExpansion = (brandName: string) => {
    setExpandedBrand(expandedBrand === brandName ? null : brandName);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setExpandedBrand(null);
    setActiveFilter(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const toggleFilter = (category: string) => {
    if (activeFilter === category) {
      setActiveFilter(null); // Turn off filter if clicking the same category
    } else {
      setActiveFilter(category); // Set new filter
    }
    setExpandedBrand(null); // Collapse any expanded brand when filter changes
  };

  // Function to get the main group for a category
  const getCategoryGroup = (category: string): string => {
    const categoryToGroupMap = getCategoryGroupMap();
    return categoryToGroupMap[category] || category;
  };

  // Filter brands based on search term and active filter
  const filteredBrands = allBrands.filter(brand => {
    const matchesSearch = 
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.category && brand.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (brand.translation && brand.translation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If there's an active filter, show brands from categories that map to that group
    // or if filtering by a specific category, show only that category
    const matchesFilter = activeFilter 
      ? getCategoryGroup(brand.category) === activeFilter || brand.category === activeFilter
      : true;
    
    return matchesSearch && matchesFilter;
  });

  // Get unique categories for filter buttons
  const brandCategories = Array.from(new Set(allBrands.map(brand => brand.category))).sort((a, b) => {
    // Custom sort order for main categories
    const categoryOrder = [
      'Hospitals', 'Clinics', 'Pharmacies', 'Health Insurance',
      'Banks', 'Credit Unions', 'Investment Firms', 'Debt',
      'Pain', 'Chronic', 'Antibiotics', 'Mental Health', 'Diabetes', 'Cholesterol',
      'Blood Thinners', 'Hypertension', 'Respiratory', 'Gastrointestinal',
      'Government', 'Healthcare'
    ];
    
    // Always put "Other" at the end
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    } else if (indexA !== -1) {
      return -1;
    } else if (indexB !== -1) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });

  // Get unique groups for filter buttons
  const groups = Array.from(new Set(
    allBrands.map(brand => getCategoryGroup(brand.category))
  )).sort((a, b) => {
    // Custom sort order for main groups
    const groupOrder = [
      'Hospitals', 'Pharmacies', 'Health Insurance', 'Financial', 'Medication', 'Government', 'Healthcare'
    ];
    
    // Always put "Other" at the end
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    
    const indexA = groupOrder.indexOf(a);
    const indexB = groupOrder.indexOf(b);
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    } else if (indexA !== -1) {
      return -1;
    } else if (indexB !== -1) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });

  // Group brands by their display group (not by their original category)
  const groupedBrands = filteredBrands.reduce((acc, brand) => {
    const group = getCategoryGroup(brand.category);
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(brand);
    return acc;
  }, {} as Record<string, Brand[]>);

  // Sort category groups
  const sortedGroups = Object.keys(groupedBrands).sort((a, b) => {
    // Custom sort order for main groups
    const groupOrder = [
      'Hospitals', 'Pharmacies', 'Health Insurance', 'Financial', 'Medication', 'Government', 'Healthcare'
    ];
    
    // Always put "Other" at the end
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    
    const indexA = groupOrder.indexOf(a);
    const indexB = groupOrder.indexOf(b);
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    } else if (indexA !== -1) {
      return -1;
    } else if (indexB !== -1) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });

  // Get color for category tag based on its parent group
  const getCategoryColor = (category: string): string => {
    const group = getCategoryGroup(category);
    const categoryColorMap = getCategoryColorMap();
    const groupColorMap = getGroupColorMap();
    
    // If the category has a specific color in its group
    if (categoryColorMap[group] && categoryColorMap[group][category]) {
      return categoryColorMap[group][category];
    }
    
    // Fallback to the group color
    return groupColorMap[group] || '#6c757d'; // Default gray if no color is found
  };

  // Get color for group tag
  const getGroupColor = (group: string): string => {
    const groupColorMap = getGroupColorMap();
    return groupColorMap[group] || '#6c757d'; // Default gray
  };

  // CRUD Operations
  const handleAddBrand = () => {
    setSelectedBrand(undefined);
    setIsBrandEditorOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsBrandEditorOpen(true);
  };

  const handleDeleteBrand = (brandName: string) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      userDataService.deleteBrand(brandName);
      // Force re-render by incrementing key
      setRerenderKey(prev => prev + 1);
    }
  };

  const handleBrandEditorClose = () => {
    setIsBrandEditorOpen(false);
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

  // Check if a brand is user-added
  const isUserBrand = (brandName: string) => {
    return userDataService.isUserBrand(brandName);
  };

  return (
    <div className={`brands-widget ${orientation}`}>
      <div className="search-container">
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Search brands, institutions, or medications..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="action-buttons">
          <button 
            className="action-button add-button" 
            onClick={handleAddBrand}
            title="Add New Brand"
          >
            <FaPlus />
          </button>
          <button 
            className="action-button import-export-button" 
            onClick={handleImportExportOpen}
            title="Import/Export Brands"
          >
            <FaFileExport />
          </button>
          {searchTerm && (
            <button className="action-button clear-button" onClick={clearSearch}>
              ×
            </button>
          )}
        </div>
      </div>
      
      <div className="filters-container">
        <div className="filters-scroll">
          {groups.map((group) => (
            <button
              key={group}
              className={`filter-button ${activeFilter === group ? 'active' : ''}`}
              onClick={() => toggleFilter(group)}
              style={activeFilter === group ? { backgroundColor: getGroupColor(group) } : {}}
            >
              {group}
            </button>
          ))}
        </div>
        {activeFilter && (
          <button className="clear-filter" onClick={() => setActiveFilter(null)}>
            Clear Filter
          </button>
        )}
      </div>
      
      <div className="brands-list">
        {filteredBrands.length === 0 ? (
          <div className="no-results">No matches found</div>
        ) : (
          sortedGroups.map((group) => (
            <div key={`group-${group}-${searchTerm}-${rerenderKey}`} className="category-section">
              <div className="category-header" style={{ backgroundColor: getGroupColor(group) }}>
                {group} <span className="category-count">({groupedBrands[group].length})</span>
              </div>
              {groupedBrands[group].map((brand) => {
                const isUserData = isUserBrand(brand.name);
                return (
                  <div 
                    key={`${brand.category}-${brand.name}-${searchTerm}-${rerenderKey}`} 
                    className={`brand-item ${expandedBrand === brand.name ? 'expanded' : ''} ${isUserData ? 'user-brand' : ''}`}
                  >
                    <div className="brand-header" onClick={() => toggleBrandExpansion(brand.name)}>
                      <div className="brand-name">
                        {brand.name}
                      </div>
                      <div className="brand-actions">
                        <button 
                          className="action-button edit-button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBrand(brand);
                          }}
                        >
                          <FaEdit />
                        </button>
                        {isUserData && (
                          <button 
                            className="action-button delete-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBrand(brand.name);
                            }}
                          >
                            <FaTrash />
                          </button>
                        )}
                        <div className="expand-icon">{expandedBrand === brand.name ? '−' : '+'}</div>
                      </div>
                    </div>
                    
                    {expandedBrand === brand.name && (
                      <div className="brand-details">
                        <div className="brand-category">
                          <span 
                            className="category-tag"
                            style={{ backgroundColor: getCategoryColor(brand.category) }}
                          >
                            {brand.category}
                          </span>
                        </div>
                        
                        {brand.translation && brand.translation !== brand.name && (
                          <div className="brand-translation">
                            <strong>Translation:</strong> {brand.translation}
                          </div>
                        )}
                        
                        {brand.notes && (
                          <div className="brand-notes">
                            {brand.notes}
                          </div>
                        )}
                        
                        {brand.snippets && brand.snippets.length > 0 && (
                          <div className="brand-snippets">
                            <div className="snippets-header">Snippets:</div>
                            <ul>
                              {brand.snippets.map((snippet, idx) => (
                                <li key={idx} className="snippet-item">"{snippet}"</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
      
      {/* Modals */}
      <BrandEditorModal 
        isOpen={isBrandEditorOpen}
        onClose={handleBrandEditorClose}
        brand={selectedBrand}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={handleImportExportClose}
      />
    </div>
  );
};

export default BrandsWidget; 
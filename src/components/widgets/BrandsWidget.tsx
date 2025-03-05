import React, { useState, useEffect, useRef } from 'react';
import './BrandsWidget.scss';
import { 
  brands as brandData, 
  Brand,
  getCategoryGroupMap, 
  getGroupColorMap, 
  getCategoryColorMap 
} from '../../data/brands';

interface BrandsWidgetProps {
  orientation: 'landscape' | 'portrait';
  showWidgets?: boolean;
  selectedText?: string;
}

export const BrandsWidget = ({ orientation, showWidgets, selectedText }: BrandsWidgetProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brands] = useState<Brand[]>(brandData);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    setSearchTerm(e.target.value);
    setExpandedBrand(null); // Collapse any expanded brand when search changes
  };

  const toggleBrandExpansion = (brandName: string) => {
    setExpandedBrand(expandedBrand === brandName ? null : brandName);
  };

  const clearSearch = () => {
    setSearchTerm('');
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
  const filteredBrands = brands.filter(brand => {
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
  const brandCategories = Array.from(new Set(brands.map(brand => brand.category))).sort((a, b) => {
    // Custom sort order for main categories
    const categoryOrder = [
      'Hospitals', 'Clinics', 'Pharmacies', 'Health Insurance',
      'Banks', 'Credit Unions', 'Investment Firms', 'Debt',
      'Pain Relievers', 'Chronic Medications', 'Antibiotics', 'Mental Health Medications'
    ];
    
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
    brands.map(brand => getCategoryGroup(brand.category))
  )).sort((a, b) => {
    // Custom sort order for main groups
    const groupOrder = [
      'Hospitals', 'Pharmacies', 'Health Insurance', 'Financial', 'Medication'
    ];
    
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
      'Hospitals', 'Pharmacies', 'Health Insurance', 'Financial', 'Medication'
    ];
    
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
        {searchTerm && (
          <button className="clear-search" onClick={clearSearch}>
            ×
          </button>
        )}
      </div>
      
      <div className="filters-container">
        <div className="filters-scroll">
          {groups.map(group => (
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
          sortedGroups.map(group => (
            <div key={group} className="category-section">
              <div className="category-header" style={{ backgroundColor: getGroupColor(group) }}>
                {group}
              </div>
              {groupedBrands[group].map(brand => (
                <div 
                  key={brand.name} 
                  className={`brand-item ${expandedBrand === brand.name ? 'expanded' : ''}`}
                  onClick={() => toggleBrandExpansion(brand.name)}
                >
                  <div className="brand-header">
                    <div className="brand-name">
                      {brand.name}
                    </div>
                    <div 
                      className="category-tag"
                      style={{ backgroundColor: getCategoryColor(brand.category) }}
                    >
                      {brand.category}
                    </div>
                  </div>
                  {expandedBrand === brand.name && brand.notes && (
                    <div className="brand-notes">{brand.notes}</div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrandsWidget; 
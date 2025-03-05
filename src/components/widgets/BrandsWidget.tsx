import React, { useState, useEffect, useRef } from 'react';
import './BrandsWidget.scss';

interface BrandsWidgetProps {
  orientation: 'landscape' | 'portrait';
  showWidgets?: boolean;
  selectedText?: string;
}

interface Brand {
  name: string;
  category: string;
  translation?: string;
  notes?: string;
}

const BrandsWidget: React.FC<BrandsWidgetProps> = ({ orientation, showWidgets, selectedText }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize brands data
  useEffect(() => {
    setBrands([
      // Hospitals (Known Internationally)
      { name: 'Mayo Clinic', category: 'Hospitals', translation: 'Clínica Mayo', notes: 'Renowned medical center with locations in Minnesota, Arizona, and Florida' },
      { name: 'Johns Hopkins Hospital', category: 'Hospitals', translation: 'Hospital Johns Hopkins', notes: 'Leading academic medical center in Baltimore, Maryland' },
      { name: 'Cleveland Clinic', category: 'Hospitals', translation: 'Clínica Cleveland', notes: 'Multispecialty academic hospital in Cleveland, Ohio' },
      { name: 'Massachusetts General Hospital', category: 'Hospitals', translation: 'Hospital General de Massachusetts', notes: 'Harvard Medical School teaching hospital in Boston' },
      { name: 'Mount Sinai Hospital', category: 'Hospitals', translation: 'Hospital Mount Sinai', notes: 'Academic medical center in New York City' },
      { name: 'Stanford Health Care', category: 'Hospitals', translation: 'Stanford Health Care', notes: 'Academic medical center in Stanford, California' },
      { name: 'UCLA Medical Center', category: 'Hospitals', translation: 'Centro Médico UCLA', notes: 'University of California Los Angeles medical facility' },
      { name: 'New York Presbyterian Hospital', category: 'Hospitals', translation: 'Hospital Presbiteriano de Nueva York', notes: 'Academic medical center affiliated with Columbia and Cornell' },
      { name: 'MD Anderson Cancer Center', category: 'Hospitals', translation: 'Centro de Cáncer MD Anderson', notes: 'Cancer treatment and research center in Houston, Texas' },
      { name: 'Cedars-Sinai Medical Center', category: 'Hospitals', translation: 'Centro Médico Cedars-Sinai', notes: 'Nonprofit hospital in Los Angeles, California' },
      
      // Clinics
      { name: 'Kaiser Permanente Clinics', category: 'Clinics', translation: 'Clínicas Kaiser Permanente', notes: 'Integrated managed care consortium' },
      { name: 'MinuteClinic (CVS)', category: 'Clinics', translation: 'MinuteClinic (CVS)', notes: 'Retail health clinic inside CVS Pharmacy locations' },
      { name: 'Urgent Care Centers', category: 'Clinics', translation: 'Centros de Atención Urgente', notes: 'Walk-in clinics for non-emergency medical care' },
      { name: 'Community Health Clinics', category: 'Clinics', translation: 'Clínicas de Salud Comunitaria', notes: 'Nonprofit clinics serving underserved populations' },
      { name: 'Planned Parenthood Clinics', category: 'Clinics', translation: 'Clínicas de Planned Parenthood', notes: 'Reproductive health care provider' },
      { name: 'Veterans Affairs (VA) Clinics', category: 'Clinics', translation: 'Clínicas de Asuntos de Veteranos (VA)', notes: 'Healthcare facilities for military veterans' },
      { name: 'University Health Clinics', category: 'Clinics', translation: 'Clínicas de Salud Universitarias', notes: 'Medical clinics affiliated with universities' },
      { name: 'Wellness Centers', category: 'Clinics', translation: 'Centros de Bienestar', notes: 'Facilities focused on preventive healthcare and wellness' },
      { name: 'Family Practice Clinics', category: 'Clinics', translation: 'Clínicas de Medicina Familiar', notes: 'Primary care clinics for all ages' },
      { name: 'Specialized Medical Centers', category: 'Clinics', translation: 'Centros Médicos Especializados', notes: 'Clinics focused on specific medical specialties' },
      
      // Pharmacies
      { name: 'CVS Pharmacy', category: 'Pharmacies', translation: 'Farmacia CVS', notes: 'Major retail pharmacy chain in the US' },
      { name: 'Walgreens', category: 'Pharmacies', translation: 'Walgreens', notes: 'Second largest pharmacy store chain in the US' },
      { name: 'Rite Aid', category: 'Pharmacies', translation: 'Rite Aid', notes: 'Retail pharmacy chain primarily on the East Coast' },
      { name: 'Walmart Pharmacy', category: 'Pharmacies', translation: 'Farmacia Walmart', notes: 'Pharmacy department within Walmart stores' },
      { name: 'Kroger Pharmacy', category: 'Pharmacies', translation: 'Farmacia Kroger', notes: 'Pharmacy within Kroger grocery stores' },
      { name: 'Target Pharmacy', category: 'Pharmacies', translation: 'Farmacia Target', notes: 'Now operated by CVS within Target stores' },
      { name: 'Costco Pharmacy', category: 'Pharmacies', translation: 'Farmacia Costco', notes: 'Pharmacy within Costco wholesale clubs' },
      { name: "Sam's Club Pharmacy", category: 'Pharmacies', translation: "Farmacia Sam's Club", notes: "Pharmacy within Sam's Club wholesale clubs" },
      { name: 'Safeway Pharmacy', category: 'Pharmacies', translation: 'Farmacia Safeway', notes: 'Pharmacy within Safeway grocery stores' },
      
      // Health Insurance Companies
      { name: 'Blue Cross Blue Shield', category: 'Health Insurance', translation: 'Blue Cross Blue Shield', notes: 'Federation of 35 independent health insurance organizations' },
      { name: 'UnitedHealthcare', category: 'Health Insurance', translation: 'UnitedHealthcare', notes: 'Largest health insurance company in the US' },
      { name: 'Aetna', category: 'Health Insurance', translation: 'Aetna', notes: 'Major health insurance provider, now part of CVS Health' },
      { name: 'Cigna', category: 'Health Insurance', translation: 'Cigna', notes: 'Global health service company' },
      { name: 'Humana', category: 'Health Insurance', translation: 'Humana', notes: 'Health insurance company focused on Medicare plans' },
      { name: 'Kaiser Permanente', category: 'Health Insurance', translation: 'Kaiser Permanente', notes: 'Integrated managed care consortium' },
      { name: 'Anthem', category: 'Health Insurance', translation: 'Anthem', notes: 'Largest for-profit managed health care company in the Blue Cross Blue Shield Association' },
      { name: 'Medicare', category: 'Health Insurance', translation: 'Medicare', notes: 'Federal health insurance program for people 65+ or with certain disabilities' },
      { name: 'Medicaid', category: 'Health Insurance', translation: 'Medicaid', notes: 'Federal and state program that helps with medical costs for people with limited income' },
      { name: 'Tricare', category: 'Health Insurance', translation: 'Tricare', notes: 'Health care program for uniformed service members and their families' },
      
      // Banks
      { name: 'JPMorgan Chase', category: 'Banks', translation: 'JPMorgan Chase', notes: 'Largest bank in the US by assets' },
      { name: 'Bank of America', category: 'Banks', translation: 'Bank of America', notes: 'Second largest bank in the US' },
      { name: 'Wells Fargo', category: 'Banks', translation: 'Wells Fargo', notes: 'American multinational financial services company' },
      { name: 'Citibank', category: 'Banks', translation: 'Citibank', notes: 'Consumer division of financial services multinational Citigroup' },
      { name: 'US Bank', category: 'Banks', translation: 'US Bank', notes: 'Fifth largest banking institution in the US' },
      { name: 'Capital One', category: 'Banks', translation: 'Capital One', notes: 'Bank holding company specializing in credit cards and loans' },
      { name: 'PNC Bank', category: 'Banks', translation: 'PNC Bank', notes: 'Bank operating in 21 states and Washington, D.C.' },
      { name: 'Regions Bank', category: 'Banks', translation: 'Regions Bank', notes: 'Bank operating throughout the Southern US' },
      { name: 'SunTrust Bank', category: 'Banks', translation: 'SunTrust Bank', notes: 'Now part of Truist Financial after merging with BB&T' },
      { name: 'TD Bank', category: 'Banks', translation: 'TD Bank', notes: 'US subsidiary of Canadian Toronto-Dominion Bank' },
      
      // Credit Unions
      { name: 'Navy Federal Credit Union', category: 'Credit Unions', translation: 'Cooperativa de Crédito Navy Federal', notes: 'Largest credit union in the US, serving military members' },
      { name: 'Pentagon Federal Credit Union', category: 'Credit Unions', translation: 'Cooperativa de Crédito Federal Pentagon', notes: 'Credit union for military and defense community' },
      { name: 'State Employees Credit Union', category: 'Credit Unions', translation: 'Cooperativa de Crédito de Empleados Estatales', notes: 'Credit union for state employees' },
      { name: 'Teachers Credit Union', category: 'Credit Unions', translation: 'Cooperativa de Crédito para Maestros', notes: 'Credit union for educators' },
      { name: 'Boeing Employees Credit Union', category: 'Credit Unions', translation: 'Cooperativa de Crédito de Empleados de Boeing', notes: 'Credit union originally for Boeing employees' },
      
      // Investment Firms
      { name: 'Fidelity Investments', category: 'Investment Firms', translation: 'Fidelity Investments', notes: 'Financial services corporation managing retirement plans and funds' },
      { name: 'Charles Schwab', category: 'Investment Firms', translation: 'Charles Schwab', notes: 'Banking and brokerage firm' },
      { name: 'Vanguard', category: 'Investment Firms', translation: 'Vanguard', notes: 'Investment management company known for low-cost index funds' },
      { name: 'BlackRock', category: 'Investment Firms', translation: 'BlackRock', notes: "World's largest asset manager" },
      { name: 'Morgan Stanley', category: 'Investment Firms', translation: 'Morgan Stanley', notes: 'Investment bank and financial services company' },
      
      // Pain Relievers
      { name: 'Ibuprofen (Advil)', category: 'Pain Relievers', translation: 'Ibuprofeno (Advil)', notes: 'NSAID used to reduce fever and treat pain or inflammation' },
      { name: 'Acetaminophen (Tylenol)', category: 'Pain Relievers', translation: 'Acetaminofén (Tylenol)', notes: 'Pain reliever and fever reducer' },
      { name: 'Naproxen (Aleve)', category: 'Pain Relievers', translation: 'Naproxeno (Aleve)', notes: 'NSAID used to treat pain, inflammation, and fever' },
      { name: 'Aspirin', category: 'Pain Relievers', translation: 'Aspirina', notes: 'Pain reliever, fever reducer, and anti-inflammatory' },
      
      // Chronic Condition Medications
      { name: 'Metformin', category: 'Chronic Medications', translation: 'Metformina', notes: 'First-line medication for type 2 diabetes' },
      { name: 'Lisinopril', category: 'Chronic Medications', translation: 'Lisinopril', notes: 'ACE inhibitor used to treat high blood pressure and heart failure' },
      { name: 'Levothyroxine', category: 'Chronic Medications', translation: 'Levotiroxina', notes: 'Synthetic thyroid hormone for hypothyroidism' },
      { name: 'Atorvastatin', category: 'Chronic Medications', translation: 'Atorvastatina', notes: 'Statin medication used to prevent cardiovascular disease' },
      { name: 'Amlodipine', category: 'Chronic Medications', translation: 'Amlodipina', notes: 'Calcium channel blocker used to treat high blood pressure' },
      
      // Antibiotics
      { name: 'Amoxicillin', category: 'Antibiotics', translation: 'Amoxicilina', notes: 'Penicillin antibiotic used to treat bacterial infections' },
      { name: 'Azithromycin', category: 'Antibiotics', translation: 'Azitromicina', notes: 'Macrolide antibiotic used to treat bacterial infections' },
      { name: 'Ciprofloxacin', category: 'Antibiotics', translation: 'Ciprofloxacina', notes: 'Fluoroquinolone antibiotic used to treat bacterial infections' },
      { name: 'Doxycycline', category: 'Antibiotics', translation: 'Doxiciclina', notes: 'Tetracycline antibiotic used to treat bacterial infections' },
      
      // Mental Health Medications
      { name: 'Sertraline (Zoloft)', category: 'Mental Health Medications', translation: 'Sertralina (Zoloft)', notes: 'SSRI antidepressant' },
      { name: 'Fluoxetine (Prozac)', category: 'Mental Health Medications', translation: 'Fluoxetina (Prozac)', notes: 'SSRI antidepressant' },
      { name: 'Escitalopram (Lexapro)', category: 'Mental Health Medications', translation: 'Escitalopram (Lexapro)', notes: 'SSRI antidepressant' },
      { name: 'Alprazolam (Xanax)', category: 'Mental Health Medications', translation: 'Alprazolam (Xanax)', notes: 'Benzodiazepine used to treat anxiety and panic disorders' },
    ]);
  }, []);

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

  // Filter brands based on search term and active filter
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = 
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.category && brand.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (brand.translation && brand.translation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If there's an active filter, only show brands from that category
    const matchesFilter = activeFilter ? brand.category === activeFilter : true;
    
    return matchesSearch && matchesFilter;
  });

  // Get unique categories for filter buttons
  const categories = Array.from(new Set(brands.map(brand => brand.category))).sort((a, b) => {
    // Custom sort order for main categories
    const categoryOrder = [
      'Hospitals', 'Clinics', 'Pharmacies', 'Health Insurance',
      'Banks', 'Credit Unions', 'Investment Firms',
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

  // Group brands by category
  const groupedBrands = filteredBrands.reduce((acc, brand) => {
    if (!acc[brand.category]) {
      acc[brand.category] = [];
    }
    acc[brand.category].push(brand);
    return acc;
  }, {} as Record<string, Brand[]>);

  // Sort categories
  const sortedCategories = Object.keys(groupedBrands).sort((a, b) => {
    // Custom sort order for main categories
    const categoryOrder = [
      'Hospitals', 'Clinics', 'Pharmacies', 'Health Insurance',
      'Banks', 'Credit Unions', 'Investment Firms',
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

  // Get color for category tag
  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      'Hospitals': '#0d6efd', // Blue
      'Clinics': '#20c997', // Teal
      'Pharmacies': '#6f42c1', // Purple
      'Health Insurance': '#0dcaf0', // Cyan
      'Banks': '#198754', // Green
      'Credit Unions': '#fd7e14', // Orange
      'Investment Firms': '#ffc107', // Yellow
      'Pain Relievers': '#dc3545', // Red
      'Chronic Medications': '#d63384', // Pink
      'Antibiotics': '#6610f2', // Indigo
      'Mental Health Medications': '#6c757d', // Gray
    };
    
    return categoryColors[category] || '#007bff'; // Default blue
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
          {categories.map(category => (
            <button
              key={category}
              className={`filter-button ${activeFilter === category ? 'active' : ''}`}
              onClick={() => toggleFilter(category)}
              style={activeFilter === category ? { backgroundColor: getCategoryColor(category) } : {}}
            >
              {category}
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
          sortedCategories.map(category => (
            <div key={category} className="category-section">
              <div className="category-header" style={{ backgroundColor: getCategoryColor(category) }}>
                {category}
              </div>
              {groupedBrands[category].map(brand => (
                <div 
                  key={brand.name} 
                  className={`brand-item ${expandedBrand === brand.name ? 'expanded' : ''}`}
                  onClick={() => toggleBrandExpansion(brand.name)}
                >
                  <div className="brand-header">
                    <div className="brand-name">{brand.name}</div>
                    <div className="brand-category" style={{ backgroundColor: getCategoryColor(brand.category) }}>
                      {brand.category}
                    </div>
                  </div>
                  
                  {expandedBrand === brand.name && (
                    <div className="brand-details">
                      {brand.translation && (
                        <div className="brand-translation">
                          <span className="label">Translation: </span>
                          {brand.translation}
                        </div>
                      )}
                      {brand.notes && (
                        <div className="brand-notes">
                          <span className="label">Notes: </span>
                          {brand.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      {orientation === 'portrait' && filteredBrands.length > 5 && (
        <div className="scroll-hint">Scroll for more results</div>
      )}
    </div>
  );
};

export default BrandsWidget; 
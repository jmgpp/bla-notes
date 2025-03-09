import React, { useState, useEffect } from 'react';
import dictionaryData from '../data/dictionary.json';
import './DictionaryCleanupTool.scss';

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

interface DuplicateGroup {
  englishTerm: string;
  terms: Term[];
  selectedIndex: number; // Index of the term to keep
}

interface CategoryMapping {
  id: number;
  code: string;
  name: string;
}

interface DictionaryCleanupToolProps {
  className?: string;
}

// Category prefix mapping (for ID regeneration)
const CATEGORY_MAPPINGS: CategoryMapping[] = [
  { id: 1, code: 'med', name: 'Medical' },
  { id: 2, code: 'leg', name: 'Legal' },
  { id: 3, code: 'fin', name: 'Finance' },
  { id: 4, code: 'bus', name: 'Business' },
  { id: 5, code: 'tech', name: 'Technology' },
  { id: 6, code: 'edu', name: 'Education' },
  { id: 7, code: 'sci', name: 'Science' },
  { id: 8, code: 'art', name: 'Arts' },
  { id: 9, code: 'trv', name: 'Travel' },
  { id: 10, code: 'spt', name: 'Sports' },
  // Add more categories as needed
];

const DEFAULT_CATEGORY_CODE = 'gen'; // Default code for unknown categories

const DictionaryCleanupTool: React.FC<DictionaryCleanupToolProps> = ({ className = '' }) => {
  // State for the tool
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [duplicateStats, setDuplicateStats] = useState({ total: 0, groups: 0 });
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<'menu' | 'duplicates' | 'regenerate' | 'combined'>('menu');
  
  // ID regeneration state
  const [categoryCounters, setCategoryCounters] = useState<Record<string, number>>({});
  const [regeneratedIds, setRegeneratedIds] = useState<Record<string, string>>({});
  const [showRegeneratedPreview, setShowRegeneratedPreview] = useState(false);
  
  // Combined operations state
  const [combineOperations, setCombineOperations] = useState(false);
  const [purgedTerms, setPurgedTerms] = useState<Term[]>([]);

  // Find duplicate terms based on identical English terms
  const findDuplicateTerms = () => {
    setMessage('Analyzing dictionary for duplicates...');
    setIsProcessing(true);
    
    // Small delay to allow UI to update
    setTimeout(() => {
      try {
        // Group terms by English term (case insensitive)
        const termGroups: Record<string, Term[]> = {};
        dictionaryData.terms.forEach(term => {
          const lowerEnglishTerm = term.englishTerm.toLowerCase();
          if (!termGroups[lowerEnglishTerm]) {
            termGroups[lowerEnglishTerm] = [];
          }
          termGroups[lowerEnglishTerm].push(term);
        });
        
        // Filter groups with more than one term
        const duplicates: DuplicateGroup[] = Object.entries(termGroups)
          .filter(([_, terms]) => terms.length > 1)
          .map(([englishTerm, terms]) => ({
            englishTerm: terms[0].englishTerm, // Use the original case of the first term
            terms,
            selectedIndex: 0 // Default to keeping the first term
          }))
          .sort((a, b) => a.englishTerm.localeCompare(b.englishTerm));
        
        // Calculate stats
        const totalDuplicates = duplicates.reduce((sum, group) => sum + group.terms.length, 0) - duplicates.length;
        
        setDuplicateGroups(duplicates);
        setDuplicateStats({
          total: totalDuplicates,
          groups: duplicates.length
        });
        
        setMessage(`Found ${totalDuplicates} duplicate terms in ${duplicates.length} groups.`);
        setModalContent('duplicates');
      } catch (error) {
        setMessage(`Error analyzing dictionary: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  };
  
  // Change which duplicate to keep
  const handleSelectedTermChange = (groupIndex: number, termIndex: number) => {
    setDuplicateGroups(prevGroups => {
      const newGroups = [...prevGroups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        selectedIndex: termIndex
      };
      return newGroups;
    });
  };
  
  // Purge duplicates and return the cleaned terms
  const purgeTerms = (): Term[] => {
    if (duplicateGroups.length === 0) {
      return dictionaryData.terms;
    }
    
    // Create a set of term IDs to remove (keeping only the selected term from each group)
    const idsToRemove = new Set<string>();
    duplicateGroups.forEach(group => {
      // Keep only the selected term, mark all others for removal
      group.terms.forEach((term, index) => {
        if (index !== group.selectedIndex) {
          idsToRemove.add(term.id);
        }
      });
    });
    
    // Create a new terms array without the duplicates
    const cleanedTerms = dictionaryData.terms.filter(term => !idsToRemove.has(term.id));
    setPurgedTerms(cleanedTerms);
    
    return cleanedTerms;
  };
  
  // Generate purged dictionary JSON file for download
  const downloadPurgedDictionary = () => {
    if (duplicateGroups.length === 0) {
      setMessage('No duplicates to purge. Run "Find Duplicates" first.');
      return;
    }
    
    setMessage('Generating purged dictionary...');
    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        const cleanedTerms = purgeTerms();
        
        // Create the updated dictionary data
        const updatedDictionary = {
          ...dictionaryData,
          terms: cleanedTerms
        };
        
        // Generate download link
        const jsonString = JSON.stringify(updatedDictionary, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dictionary-purged.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const removedCount = dictionaryData.terms.length - cleanedTerms.length;
        setMessage(`Success! Generated purged dictionary with ${removedCount} duplicates removed. Download started.`);
        
        if (combineOperations) {
          setModalContent('regenerate');
        } else {
          setShowModal(false);
        }
      } catch (error) {
        setMessage(`Error generating purged dictionary: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  };
  
  // Fix the handler with proper MouseEvent type
  const handlePrepareIdRegeneration = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    prepareIdRegenerationForTerms(dictionaryData.terms);
  };
  
  // This function does the actual processing on the terms
  const prepareIdRegenerationForTerms = (terms: Term[]) => {
    setIsProcessing(true);
    setMessage('Preparing ID regeneration...');
    
    // Reset state
    setCategoryCounters({});
    setRegeneratedIds({});
    
    setTimeout(() => {
      try {
        // Initialize counters for each category
        const counters: Record<string, number> = {};
        
        // First pass - count terms in each category to show stats
        terms.forEach(term => {
          const categoryCode = getCategoryCode(term.categoryId);
          counters[categoryCode] = (counters[categoryCode] || 0) + 1;
        });
        
        setCategoryCounters(counters);
        
        // Generate new IDs for preview
        const newIds: Record<string, string> = {};
        const categoryCurrentCounts: Record<string, number> = {};
        
        terms.forEach(term => {
          const categoryCode = getCategoryCode(term.categoryId);
          categoryCurrentCounts[categoryCode] = (categoryCurrentCounts[categoryCode] || 0) + 1;
          
          // Format: xxx-000000 (3 letters for category, 6 digits for incremental number)
          const newId = `${categoryCode}-${categoryCurrentCounts[categoryCode].toString().padStart(6, '0')}`;
          newIds[term.id] = newId;
        });
        
        setRegeneratedIds(newIds);
        setShowRegeneratedPreview(true);
        
        setMessage(`Ready to regenerate ${terms.length} term IDs.`);
        setModalContent(combineOperations ? 'combined' : 'regenerate');
      } catch (error) {
        setMessage(`Error preparing ID regeneration: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  };
  
  // Download dictionary with regenerated IDs
  const downloadRegeneratedDictionary = (terms: Term[] = dictionaryData.terms) => {
    setIsProcessing(true);
    setMessage('Generating dictionary with new IDs...');
    
    setTimeout(() => {
      try {
        // Create a new terms array with regenerated IDs
        const updatedTerms = terms.map(term => ({
          ...term,
          id: regeneratedIds[term.id] || term.id
        }));
        
        // Create the updated dictionary data
        const updatedDictionary = {
          ...dictionaryData,
          terms: updatedTerms
        };
        
        // Generate download link
        const jsonString = JSON.stringify(updatedDictionary, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = combineOperations ? 'dictionary-optimized.json' : 'dictionary-regenerated.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const message = combineOperations
          ? `Success! Generated optimized dictionary with ${dictionaryData.terms.length - purgedTerms.length} duplicates removed and ${Object.keys(regeneratedIds).length} regenerated IDs.`
          : `Success! Generated dictionary with ${Object.keys(regeneratedIds).length} regenerated IDs.`;
        
        setMessage(message);
        setShowModal(false);
      } catch (error) {
        setMessage(`Error generating dictionary: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  };
  
  // Handle the combined operation flow with explicit event type
  const startCombinedOperation = (e: React.MouseEvent) => {
    e.preventDefault();
    setCombineOperations(true);
    findDuplicateTerms();
  };
  
  // Helper function to get category code
  const getCategoryCode = (categoryId: number): string => {
    const category = CATEGORY_MAPPINGS.find(cat => cat.id === categoryId);
    return category ? category.code : DEFAULT_CATEGORY_CODE;
  };
  
  // Helper function to get category name
  const getCategoryName = (categoryId: number): string => {
    const category = dictionaryData.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  // Process the purged terms and prepare for ID regeneration
  const proceedToIdRegeneration = () => {
    const cleanedTerms = purgeTerms();
    setPurgedTerms(cleanedTerms);
    prepareIdRegenerationForTerms(cleanedTerms);
  };
  
  // Finish the combined operation
  const finishCombinedOperation = () => {
    downloadRegeneratedDictionary(purgedTerms);
  };

  // Modal component
  const Modal = () => {
    if (!showModal) return null;
    
    return (
      <div className="dictionary-modal-overlay" onClick={() => setShowModal(false)}>
        <div className="dictionary-modal" onClick={e => e.stopPropagation()}>
          <div className="dictionary-modal-header">
            <h3>
              {modalContent === 'menu' && 'Dictionary Admin Tools'}
              {modalContent === 'duplicates' && 'Remove Duplicate Terms'}
              {modalContent === 'regenerate' && 'Regenerate Term IDs'}
              {modalContent === 'combined' && 'Dictionary Optimization'}
            </h3>
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
          </div>
          
          <div className="dictionary-modal-content">
            {modalContent === 'menu' && (
              // Main menu content
              <div className="menu-container">
                <p className="menu-description">
                  Select an operation to perform on the dictionary data:
                </p>
                
                <div className="menu-options">
                  <button 
                    className="menu-option"
                    onClick={findDuplicateTerms}
                    disabled={isProcessing}
                  >
                    <span className="option-icon">🔍</span>
                    <div className="option-details">
                      <h4>Remove Duplicate Terms</h4>
                      <p>Find and remove duplicate terms with identical English text</p>
                    </div>
                  </button>
                  
                  <button 
                    className="menu-option"
                    onClick={handlePrepareIdRegeneration}
                    disabled={isProcessing}
                  >
                    <span className="option-icon">🔄</span>
                    <div className="option-details">
                      <h4>Regenerate Term IDs</h4>
                      <p>Create structured IDs based on category (xxx-000000 format)</p>
                    </div>
                  </button>
                  
                  <button 
                    className="menu-option"
                    onClick={startCombinedOperation}
                    disabled={isProcessing}
                  >
                    <span className="option-icon">⚙️</span>
                    <div className="option-details">
                      <h4>Complete Optimization</h4>
                      <p>Remove duplicates and regenerate IDs in a single operation</p>
                    </div>
                  </button>
                </div>
                
                {message && (
                  <div className="modal-message">
                    {message}
                  </div>
                )}
              </div>
            )}
            
            {modalContent === 'duplicates' && (
              // Duplicates content
              <div className="duplicates-container">
                <p className="stats-info">
                  Found {duplicateStats.total} duplicate terms in {duplicateStats.groups} groups.
                  Select which term to keep in each group:
                </p>
                
                <div className="duplicates-list">
                  {duplicateGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="duplicate-group">
                      <h4>{group.englishTerm}</h4>
                      <table className="duplicate-terms-table">
                        <thead>
                          <tr>
                            <th className="keep-col">Keep</th>
                            <th className="id-col">ID</th>
                            <th className="translation-col">Spanish</th>
                            <th className="category-col">Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.terms.map((term, termIndex) => (
                            <tr 
                              key={term.id} 
                              className={termIndex === group.selectedIndex ? 'selected-term' : ''}
                              onClick={() => handleSelectedTermChange(groupIndex, termIndex)}
                            >
                              <td className="keep-col">
                                <input
                                  type="radio"
                                  name={`group-${groupIndex}`}
                                  checked={termIndex === group.selectedIndex}
                                  onChange={() => handleSelectedTermChange(groupIndex, termIndex)}
                                />
                              </td>
                              <td className="id-col">{term.id}</td>
                              <td className="translation-col">{term.spanishTerm}</td>
                              <td className="category-col">{getCategoryName(term.categoryId)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
                
                <div className="modal-actions">
                  {combineOperations ? (
                    <button 
                      className="download-button"
                      onClick={proceedToIdRegeneration}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Continue to ID Regeneration'}
                    </button>
                  ) : (
                    <button 
                      className="download-button"
                      onClick={downloadPurgedDictionary}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Download Purged Dictionary'}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {(modalContent === 'regenerate' || modalContent === 'combined') && (
              // ID Regeneration content
              <div className="regenerate-container">
                <p className="stats-info">
                  Ready to regenerate IDs for {modalContent === 'combined' ? purgedTerms.length : dictionaryData.terms.length} terms using the format:
                  <br />
                  <code>xxx-000000</code> (3 letters for category, 6 digits for incremental number)
                </p>
                
                <div className="category-counters">
                  <h4>Terms by Category:</h4>
                  <ul>
                    {Object.entries(categoryCounters).map(([code, count]) => (
                      <li key={code}>
                        <strong>{code}</strong>: {count} terms
                      </li>
                    ))}
                  </ul>
                </div>
                
                {showRegeneratedPreview && (
                  <div className="id-preview">
                    <h4>ID Preview (first 10 terms):</h4>
                    <table className="id-preview-table">
                      <thead>
                        <tr>
                          <th>Current ID</th>
                          <th>New ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(modalContent === 'combined' ? purgedTerms : dictionaryData.terms).slice(0, 10).map(term => (
                          <tr key={term.id}>
                            <td><code>{term.id}</code></td>
                            <td><code>{regeneratedIds[term.id]}</code></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(modalContent === 'combined' ? purgedTerms : dictionaryData.terms).length > 10 && (
                      <div className="more-items">
                        ... and {(modalContent === 'combined' ? purgedTerms : dictionaryData.terms).length - 10} more
                      </div>
                    )}
                  </div>
                )}
                
                <div className="modal-actions">
                  <button 
                    className="download-button"
                    onClick={modalContent === 'combined' ? finishCombinedOperation : downloadRegeneratedDictionary}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : modalContent === 'combined' ? 'Download Optimized Dictionary' : 'Download Dictionary with New IDs'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`dictionary-cleanup-tool ${className}`}>
      <button 
        onClick={() => {
          setModalContent('menu');
          setShowModal(true);
          setCombineOperations(false);
          setMessage('');
        }}
        className="tool-toggle-button"
      >
        Dictionary Admin Tools
      </button>
      
      {message && !showModal && (
        <div className="tool-message">
          {message}
        </div>
      )}
      
      <Modal />
    </div>
  );
};

export default DictionaryCleanupTool; 
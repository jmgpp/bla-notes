import React, { useState, useEffect, useMemo } from 'react';
import ModalContainer from './ModalContainer';
import { Brand } from '../../data/types';
import { userDataService } from '../../services/UserDataService';
import { getCategoryGroupMap } from '../../data/brands';
import './EditorModals.scss';

interface BrandEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand; // If provided, we're editing; otherwise, creating
}

const BrandEditorModal: React.FC<BrandEditorModalProps> = ({ isOpen, onClose, brand }) => {
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: '',
    category: '',
    translation: '',
    notes: '',
    snippets: []
  });

  // Snippets as an array of strings in the UI
  const [snippets, setSnippets] = useState<string[]>([]);
  const [currentSnippet, setCurrentSnippet] = useState('');
  const [editingSnippetIndex, setEditingSnippetIndex] = useState<number | null>(null);

  // Get available categories from the category map - memoize to prevent infinite renders
  const categoryGroupMap = useMemo(() => getCategoryGroupMap(), []);
  
  // Sort categories and ensure "Other" is at the end
  const availableCategories = useMemo(() => {
    const categories = Object.keys(categoryGroupMap).sort();
    
    // Remove "Other" if it exists
    const otherIndex = categories.indexOf('Other');
    if (otherIndex !== -1) {
      categories.splice(otherIndex, 1);
    }
    
    // Add "Other" at the end
    categories.push('Other');
    
    return categories;
  }, [categoryGroupMap]);

  useEffect(() => {
    if (!isOpen) return;
    
    if (brand) {
      setFormData({
        name: brand.name,
        category: brand.category,
        translation: brand.translation || '',
        notes: brand.notes || '',
        snippets: brand.snippets ? [...brand.snippets] : []
      });
      setSnippets(brand.snippets || []);
    } else {
      // Reset form for new brand
      setFormData({
        name: '',
        category: availableCategories.length > 0 ? availableCategories[0] : '',
        translation: '',
        notes: '',
        snippets: []
      });
      setSnippets([]);
    }
    setCurrentSnippet('');
    setEditingSnippetIndex(null);
  }, [brand, isOpen, availableCategories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSnippetChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentSnippet(e.target.value);
  };

  const addSnippet = () => {
    if (currentSnippet.trim()) {
      let newSnippets;
      
      if (editingSnippetIndex !== null) {
        // Update existing snippet
        newSnippets = [...snippets];
        newSnippets[editingSnippetIndex] = currentSnippet.trim();
      } else {
        // Add new snippet
        newSnippets = [...snippets, currentSnippet.trim()];
      }
      
      setSnippets(newSnippets);
      setFormData(prev => ({
        ...prev,
        snippets: newSnippets
      }));
      setCurrentSnippet('');
      setEditingSnippetIndex(null);
    }
  };

  const editSnippet = (index: number) => {
    setCurrentSnippet(snippets[index]);
    setEditingSnippetIndex(index);
  };

  const cancelEdit = () => {
    setCurrentSnippet('');
    setEditingSnippetIndex(null);
  };

  const removeSnippet = (index: number) => {
    const newSnippets = snippets.filter((_, i) => i !== index);
    setSnippets(newSnippets);
    setFormData(prev => ({
      ...prev,
      snippets: newSnippets
    }));
    
    // If currently editing this snippet, clear the edit state
    if (editingSnippetIndex === index) {
      setCurrentSnippet('');
      setEditingSnippetIndex(null);
    } else if (editingSnippetIndex !== null && index < editingSnippetIndex) {
      // Adjust the editing index if removing a snippet that comes before the one being edited
      setEditingSnippetIndex(editingSnippetIndex - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      alert('Name and category are required');
      return;
    }
    
    // Process and save the brand
    const brandToSave = formData as Brand;
    userDataService.addOrUpdateBrand(brandToSave);
    onClose();
  };

  return (
    <ModalContainer 
      isOpen={isOpen} 
      onClose={onClose} 
      title={brand ? 'Edit Brand' : 'Add New Brand'}
    >
      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Brand Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category || ''}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>Select Category</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="translation">Translation</label>
          <input
            type="text"
            id="translation"
            name="translation"
            value={formData.translation || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label>Snippets</label>
          <div className="snippets-container">
            {snippets.length === 0 ? (
              <p className="no-snippets">No snippets added yet.</p>
            ) : (
              snippets.map((snippet, index) => (
                <div key={index} className="snippet-item">
                  <p>{snippet}</p>
                  <div className="snippet-actions">
                    <button 
                      type="button" 
                      className="snippet-edit" 
                      onClick={() => editSnippet(index)}
                      title="Edit snippet"
                    >
                      ✎
                    </button>
                    <button 
                      type="button" 
                      className="snippet-remove" 
                      onClick={() => removeSnippet(index)}
                      title="Remove snippet"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="add-snippet">
            <textarea
              value={currentSnippet}
              onChange={handleSnippetChange}
              placeholder={editingSnippetIndex !== null ? "Edit snippet" : "Enter a new snippet"}
              rows={2}
            />
            <div className="snippet-form-actions">
              {editingSnippetIndex !== null && (
                <button 
                  type="button" 
                  className="button-tertiary"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
              <button 
                type="button" 
                className="button-secondary"
                onClick={addSnippet}
              >
                {editingSnippetIndex !== null ? 'Update Snippet' : 'Add Snippet'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button-primary">
            {brand ? 'Update' : 'Add'} Brand
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

export default BrandEditorModal; 
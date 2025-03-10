import React, { useState, useEffect } from 'react';
import ModalContainer from './ModalContainer';
import { Term } from '../../data/types';
import { userDataService } from '../../services/UserDataService';
import { dictionaryData } from '../../data/dictionaryData';
import './EditorModals.scss';

interface TermEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  term?: Term; // If provided, we're editing; otherwise, creating
}

interface Category {
  id: number;
  name: string;
  subcategories: { id: number; name: string }[];
}

const TermEditorModal: React.FC<TermEditorModalProps> = ({ isOpen, onClose, term }) => {
  const [formData, setFormData] = useState<Partial<Term>>({
    englishTerm: '',
    spanishTerm: '',
    categoryId: 0,
    subcategoryId: 0,
    notes: '',
    tags: []
  });

  // Tags as string for easier editing
  const [tagsInput, setTagsInput] = useState('');
  
  // Get categories from dictionary data
  const categories: Category[] = (dictionaryData as any).categories || [];
  
  // Get subcategories for the selected category
  const subcategories = formData.categoryId
    ? categories.find(cat => cat.id === formData.categoryId)?.subcategories || []
    : [];

  useEffect(() => {
    if (term) {
      setFormData({
        id: term.id,
        englishTerm: term.englishTerm,
        spanishTerm: term.spanishTerm,
        categoryId: term.categoryId,
        subcategoryId: term.subcategoryId,
        notes: term.notes || '',
        tags: [...term.tags] // Clone to avoid reference issues
      });
      setTagsInput(term.tags.join(', '));
    } else {
      // Reset form for new term
      setFormData({
        englishTerm: '',
        spanishTerm: '',
        categoryId: categories.length > 0 ? categories[0].id : 0,
        subcategoryId: 0,
        notes: '',
        tags: []
      });
      setTagsInput('');
    }
  }, [term, isOpen, categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'categoryId') {
      // When category changes, reset subcategory
      setFormData({
        ...formData,
        [name]: parseInt(value, 10),
        subcategoryId: 0
      });
    } else if (name === 'subcategoryId') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    const tagsArray = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    setFormData({
      ...formData,
      tags: tagsArray
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.englishTerm || formData.categoryId === undefined) {
      alert('English term and category are required');
      return;
    }
    
    // Process and save the term
    const termToSave = formData as Term;
    userDataService.addOrUpdateTerm(termToSave);
    onClose();
  };

  return (
    <ModalContainer 
      isOpen={isOpen} 
      onClose={onClose} 
      title={term ? 'Edit Term' : 'Add New Term'}
    >
      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="englishTerm">English Term *</label>
          <input
            type="text"
            id="englishTerm"
            name="englishTerm"
            value={formData.englishTerm || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="spanishTerm">Spanish Term</label>
          <input
            type="text"
            id="spanishTerm"
            name="spanishTerm"
            value={formData.spanishTerm || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="categoryId">Category *</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId || 0}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group half">
            <label htmlFor="subcategoryId">Subcategory</label>
            <select
              id="subcategoryId"
              name="subcategoryId"
              value={formData.subcategoryId || 0}
              onChange={handleInputChange}
            >
              <option value="0">None</option>
              {subcategories.map(subcategory => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
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
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={tagsInput}
            onChange={handleTagsChange}
            placeholder="tag1, tag2, tag3"
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button-primary">
            {term ? 'Update' : 'Add'} Term
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

export default TermEditorModal; 
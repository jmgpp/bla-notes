import React, { useState } from 'react';
import ModalContainer from './ModalContainer';
import { userDataService, UserData } from '../../services/UserDataService';
import './ImportExportModal.scss';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose }) => {
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleExport = () => {
    const userData = userDataService.exportData();
    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `bla-notes-user-data-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleImport = () => {
    if (!importFile) {
      setMessage('Please select a file to import');
      setMessageType('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const userData = JSON.parse(event.target?.result as string) as Partial<UserData>;
        
        // Validate the imported data
        if (!userData.userBrands && !userData.userTerms && !userData.userSnippets) {
          throw new Error('Invalid file format: missing user data');
        }
        
        userDataService.importData(userData, importMode === 'replace');
        
        setMessage('Data imported successfully');
        setMessageType('success');
        setTimeout(() => {
          onClose();
          // Force page reload to reflect changes
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Import error:', error);
        setMessage(`Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setMessageType('error');
      }
    };
    
    reader.readAsText(importFile);
  };

  return (
    <ModalContainer 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Import/Export User Data"
    >
      <div className="import-export-container">
        <div className="section export-section">
          <h4>Export Your Data</h4>
          <p>Download your custom dictionary terms, brands, and snippets as a JSON file.</p>
          <button className="button-primary" onClick={handleExport}>
            Export Data
          </button>
        </div>
        
        <div className="divider"></div>
        
        <div className="section import-section">
          <h4>Import Data</h4>
          <p>Import previously exported data or share data with others.</p>
          
          <div className="import-options">
            <label className="radio-label">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
              />
              <span>Merge with existing data (only add new items)</span>
            </label>
            
            <label className="radio-label">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
              />
              <span>Replace all existing data</span>
            </label>
          </div>
          
          <div className="file-input">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFileChange}
              id="import-file"
            />
            <label htmlFor="import-file">
              {importFile ? importFile.name : 'Choose a file'}
            </label>
          </div>
          
          <button 
            className="button-primary" 
            onClick={handleImport}
            disabled={!importFile}
          >
            Import Data
          </button>
          
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </ModalContainer>
  );
};

export default ImportExportModal; 
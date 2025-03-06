import React, { useState, useEffect } from 'react';
import './SlidingPanel.scss';

interface SlidingPanelProps {
  orientation: 'landscape' | 'portrait';
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const SlidingPanel: React.FC<SlidingPanelProps> = ({ orientation, textareaRef }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'diagrams'>('cards');

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleTabChange = (tab: 'cards' | 'diagrams') => {
    setActiveTab(tab);
    
    // If panel is collapsed in portrait mode, expand it
    if (orientation === 'portrait' && !isExpanded) {
      setIsExpanded(true);
    }
    
    // Focus the textarea after changing the tab
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (orientation === 'portrait') {
      const element = document.querySelector('.sliding-panel.portrait .footer-toolbar');
      if (element) {
        element.classList.add('force-visible');
      }
    }
  }, [orientation]);
  
  useEffect(() => {
    if (orientation === 'portrait') {
      const notesPanel = document.querySelector('.notes-panel.portrait');
      if (notesPanel) {
        if (isExpanded) {
          notesPanel.setAttribute('style', 'bottom: 40vh !important; transition: bottom 0.3s ease;');
        } else {
          notesPanel.setAttribute('style', 'bottom: 40px !important; transition: bottom 0.3s ease;');
        }
      }
    }
  }, [isExpanded, orientation]);

  return (
    <div className={`sliding-panel ${orientation} ${isExpanded ? 'expanded' : ''}`}>
      {orientation === 'portrait' ? (
        <>
          <div className="footer-toolbar force-visible">
            <div className="tab-labels">
              <span 
                className={activeTab === 'cards' ? 'active' : ''}
                onClick={() => handleTabChange('cards')}
              >
                Cards
              </span>
              <span 
                className={activeTab === 'diagrams' ? 'active' : ''}
                onClick={() => handleTabChange('diagrams')}
              >
                Diagrams
              </span>
            </div>
            <button 
              className="toggle-button"
              onClick={togglePanel}
              aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
            />
          </div>
          <div className="panel-content">
            <div className="tab-content">
              {activeTab === 'cards' ? (
                <div className="cards-content">
                  <h4>Cards Panel</h4>
                  <p>This is placeholder content for the Cards panel. It has a light red background for visualization.</p>
                  <p>You would typically see your cards content here.</p>
                </div>
              ) : (
                <div className="diagrams-content">
                  <h4>Diagrams Panel</h4>
                  <p>This is placeholder content for the Diagrams panel. It has a light green background for visualization.</p>
                  <p>You would typically see your diagrams content here.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="panel-content">
            <div className="panel-tabs">
              <button 
                className={`tab-button ${activeTab === 'cards' ? 'active' : ''}`}
                onClick={() => handleTabChange('cards')}
              >
                Cards
              </button>
              <button 
                className={`tab-button ${activeTab === 'diagrams' ? 'active' : ''}`}
                onClick={() => handleTabChange('diagrams')}
              >
                Diagrams
              </button>
            </div>
            <div className="tab-content">
              {activeTab === 'cards' ? (
                <div className="cards-content">
                  <h4>Cards Panel</h4>
                  <p>This is placeholder content for the Cards panel. It has a light red background for visualization.</p>
                  <p>You would typically see your cards content here.</p>
                </div>
              ) : (
                <div className="diagrams-content">
                  <h4>Diagrams Panel</h4>
                  <p>This is placeholder content for the Diagrams panel. It has a light green background for visualization.</p>
                  <p>You would typically see your diagrams content here.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SlidingPanel; 
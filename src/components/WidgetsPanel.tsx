import React from 'react';
import './WidgetsPanel.scss';
import AlphabetWidget from './widgets/AlphabetWidget';
import DictionaryWidget from './widgets/DictionaryWidget';
import ZipWidget from './widgets/ZipWidget';
import SuffixesWidget from './widgets/SuffixesWidget';
import BrandsWidget from './widgets/BrandsWidget';

interface WidgetsPanelProps {
  orientation: 'landscape' | 'portrait';
  showWidgets: boolean;
  activeWidget: string;
  setActiveWidget: (widget: string) => void;
  selectedText?: string;
}

function WidgetsPanel({ orientation, showWidgets, activeWidget, setActiveWidget, selectedText }: WidgetsPanelProps) {
  const panelClasses = [
    'widgets-panel',
    orientation,
    orientation === 'portrait' && showWidgets ? 'visible' : ''
  ].filter(Boolean).join(' ');
  
  // Content for each widget type
  const renderWidgetContent = () => {
    switch (activeWidget) {
      case 'alphabet':
        return <AlphabetWidget orientation={orientation} selectedText={selectedText} />;
      case 'dictionary':
        return <DictionaryWidget orientation={orientation} showWidgets={showWidgets} selectedText={selectedText} />;
      case 'zip':
        return <ZipWidget orientation={orientation} showWidgets={showWidgets} selectedText={selectedText} />;
      case 'suffixes':
        return <SuffixesWidget orientation={orientation} showWidgets={showWidgets} selectedText={selectedText} />;
      case 'brands':
        return <BrandsWidget orientation={orientation} showWidgets={showWidgets} selectedText={selectedText} />;
      default:
        return null;
    }
  };
  
  return (
    <div className={panelClasses} tabIndex={-1}>
      {orientation === 'landscape' ? (
        // In landscape mode, show tabs
        <div className="card h-100">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs widget-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeWidget === 'alphabet' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('alphabet')}
                  tabIndex={-1}
                >
                  Alphabet
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeWidget === 'dictionary' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('dictionary')}
                  tabIndex={-1}
                >
                  Dictionary
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeWidget === 'zip' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('zip')}
                  tabIndex={-1}
                >
                  ZIP
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeWidget === 'suffixes' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('suffixes')}
                  tabIndex={-1}
                >
                  Suffixes
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeWidget === 'brands' ? 'active' : ''}`}
                  onClick={() => setActiveWidget('brands')}
                  tabIndex={-1}
                >
                  Brands
                </button>
              </li>
            </ul>
          </div>
          <div className="card-body">
            {renderWidgetContent()}
          </div>
        </div>
      ) : (
        // In portrait mode, show only the content
        <div className="card h-100">
          <div className="card-body">
            {renderWidgetContent()}
          </div>
        </div>
      )}
    </div>
  );
}

export default WidgetsPanel; 
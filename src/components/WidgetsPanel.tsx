import React, { useRef, useEffect } from 'react';
import './WidgetsPanel.scss';
import AlphabetWidget from './widgets/AlphabetWidget';
import DictionaryWidget from './widgets/DictionaryWidget';
import ZipWidget from './widgets/ZipWidget';
import SuffixesWidget from './widgets/SuffixesWidget';
import BrandsWidget from './widgets/BrandsWidget';
import SlidingPanel from './SlidingPanel';

interface WidgetsPanelProps {
  orientation: 'landscape' | 'portrait';
  showWidgets: boolean;
  activeWidget: string;
  setActiveWidget: (widget: string) => void;
  selectedText?: string;
}

function WidgetsPanel({ orientation, showWidgets, activeWidget, setActiveWidget, selectedText }: WidgetsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!panelRef.current) return;
    
    const updateHeight = () => {
      if (orientation === 'portrait' && showWidgets) {
        const height = panelRef.current?.offsetHeight || 0;
        document.documentElement.style.setProperty('--widget-actual-height', `${height}px`);
      } else {
        document.documentElement.style.setProperty('--widget-actual-height', '0px');
      }
    };
    
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    
    resizeObserver.observe(panelRef.current);
    updateHeight(); // Initial measurement
    
    return () => {
      if (panelRef.current) {
        resizeObserver.unobserve(panelRef.current);
      }
    };
  }, [orientation, showWidgets]);

  // Effect to toggle widgets-visible class
  useEffect(() => {
    if (orientation === 'portrait') {
      const notesPanel = document.querySelector('.notes-panel');
      if (notesPanel) {
        if (showWidgets) {
          notesPanel.classList.add('widgets-visible');
        } else {
          notesPanel.classList.remove('widgets-visible');
        }
      }
    }
    
    return () => {
      const notesPanel = document.querySelector('.notes-panel');
      notesPanel?.classList.remove('widgets-visible');
    };
  }, [orientation, showWidgets]);

  const panelClasses = `widgets-panel ${orientation} ${showWidgets ? 'visible' : 'hidden'} ${orientation === 'portrait' ? 'content-sized' : ''}`;
  
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
    <div ref={panelRef} className={panelClasses} tabIndex={-1}>
      {orientation === 'landscape' ? (
        <div className="card h-100">
          <div className="card-body d-flex flex-column">
            <div className="widget-tabs">
              {/* Tab buttons */}
              <button
                className={`tab-button ${activeWidget === 'alphabet' ? 'active' : ''}`}
                onClick={() => setActiveWidget('alphabet')}
              >
                Alphabet
              </button>
              <button
                className={`tab-button ${activeWidget === 'dictionary' ? 'active' : ''}`}
                onClick={() => setActiveWidget('dictionary')}
              >
                Dictionary
              </button>
              <button
                className={`tab-button ${activeWidget === 'zip' ? 'active' : ''}`}
                onClick={() => setActiveWidget('zip')}
              >
                ZIP
              </button>
              <button
                className={`tab-button ${activeWidget === 'suffixes' ? 'active' : ''}`}
                onClick={() => setActiveWidget('suffixes')}
              >
                Suffixes
              </button>
            </div>
            
            {/* Widget content */}
            <div className="widget-content flex-grow-1">
              {renderWidgetContent()}
            </div>

            {/* Sliding Panel only in landscape mode */}
            <SlidingPanel orientation={orientation} />
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
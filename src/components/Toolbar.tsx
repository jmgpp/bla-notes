import React from 'react';

interface ToolbarProps {
  orientation: 'landscape' | 'portrait';
  onToggleWidgets: () => void;
  showWidgets: boolean;
  activeWidget: string;
  setActiveWidget: (widget: string) => void;
}

function Toolbar({ orientation, onToggleWidgets, showWidgets, activeWidget, setActiveWidget }: ToolbarProps) {
  const handleWidgetClick = (widget: string) => {
    // Always set the active widget first - this will capture any selected text
    setActiveWidget(widget);
    
    if (orientation === 'portrait') {
      if (activeWidget === widget && showWidgets) {
        // If clicking the same active widget, toggle off
        onToggleWidgets();
      } else if (!showWidgets) {
        // If widgets panel is hidden, show it
        onToggleWidgets();
      }
      // No need to call setActiveWidget again since we did it above
    }
  };

  // Helper function to determine button class
  const getButtonClass = (widget: string) => {
    if (orientation === 'portrait' && activeWidget === widget && showWidgets) {
      return 'btn-primary';
    }
    return 'btn-outline-light';
  };

  return (
    <nav className="navbar navbar-dark bg-dark toolbar">
      <div className="container-fluid">
        <span className="navbar-brand">BLA Notes</span>
        <div className="d-flex">
          {orientation === 'portrait' && (
            <>
              <button 
                className={`btn btn-sm mx-1 ${getButtonClass('alphabet')}`}
                onClick={() => handleWidgetClick('alphabet')}
                tabIndex={-1}
              >
                Alphabet
              </button>
              <button 
                className={`btn btn-sm mx-1 ${getButtonClass('dictionary')}`}
                onClick={() => handleWidgetClick('dictionary')}
                tabIndex={-1}
              >
                Dictionary
              </button>
              <button 
                className={`btn btn-sm mx-1 ${getButtonClass('zip')}`}
                onClick={() => handleWidgetClick('zip')}
                tabIndex={-1}
              >
                ZIP
              </button>
              <button 
                className={`btn btn-sm mx-1 ${getButtonClass('suffixes')}`}
                onClick={() => handleWidgetClick('suffixes')}
                tabIndex={-1}
              >
                Suffixes
              </button>
              <button 
                className={`btn btn-sm mx-1 ${getButtonClass('brands')}`}
                onClick={() => handleWidgetClick('brands')}
                tabIndex={-1}
              >
                Brands
              </button>
            </>
          )}
          {/* Additional toolbar items can be added here */}
        </div>
      </div>
    </nav>
  );
}

export default Toolbar; 
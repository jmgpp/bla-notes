import { useState, useEffect, useRef } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.scss'
import Toolbar from './components/Toolbar'
import NotesPanel from './components/NotesPanel'
import WidgetsPanel from './components/WidgetsPanel'
import SlidingPanel from './components/SlidingPanel'

// Define types for card data
interface CardData {
  id: string;
  type: 'zip' | 'brand-snippet' | 'dictionary';
  data: {
    zipCode?: string;
    city?: string;
    state?: string;
    brandName?: string;
    snippet?: string;
    category?: string;
    searchTerm?: string;
    dictionaryResults?: any[]; // Dictionary search results
  };
}

function App() {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  )
  const [showWidgets, setShowWidgets] = useState(orientation === 'landscape')
  const [activeWidget, setActiveWidget] = useState('alphabet')
  const [selectedText, setSelectedText] = useState<string>('')
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const [cards, setCards] = useState<CardData[]>([])
  const widgetsPanelRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const appContainerRef = useRef<HTMLDivElement>(null)
  const mouseLeaveTimerRef = useRef<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [preventAutoHide, setPreventAutoHide] = useState(false)

  // Handle orientation changes
  useEffect(() => {
    const handleResize = () => {
      const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      
      // Only update if orientation actually changed
      if (newOrientation !== orientation) {
        setOrientation(newOrientation)
        
        // In landscape, widgets panel is always visible
        if (newOrientation === 'landscape') {
          setShowWidgets(true)
        } else {
          // In portrait, widgets panel is hidden by default
          setShowWidgets(false)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [orientation])

  const toggleWidgets = () => {
    setShowWidgets(!showWidgets)
  }

  // Methods for cards management
  const addCard = (card: Omit<CardData, 'id'>) => {
    const id = Date.now().toString(); // Generate a unique ID
    setCards(prev => [...prev, { ...card, id }]);
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
  };

  // Handle mouse leave for widgets panel in portrait mode
  const handleMouseLeave = (event: React.MouseEvent) => {
    // Skip auto-hide if it's explicitly prevented
    if (preventAutoHide) {
      return;
    }

    // Only apply in portrait mode
    if (orientation !== 'portrait') return;
    
    // Get mouse position and toolbar bottom position
    const mouseY = event.clientY;
    const toolbarRect = toolbarRef.current?.getBoundingClientRect() || { bottom: 0 };
    
    // Check if mouse is moving toward the toolbar
    const isMovingToToolbar = mouseY <= toolbarRect.bottom;
    
    // Only hide if not moving toward toolbar
    if (!isMovingToToolbar) {
      // Clear any existing timer
      if (mouseLeaveTimerRef.current !== null) {
        window.clearTimeout(mouseLeaveTimerRef.current);
      }
      
      // Set a small delay to prevent accidental hiding
      mouseLeaveTimerRef.current = window.setTimeout(() => {
        setShowWidgets(false);
        // Return focus to the textarea when widgets are hidden
        textareaRef.current?.focus();
        mouseLeaveTimerRef.current = null;
      }, 150);
    }
  };
  
  // Handle mouse enter to cancel any pending hide
  const handleMouseEnter = () => {
    // Clear any pending hide timer
    if (mouseLeaveTimerRef.current !== null) {
      window.clearTimeout(mouseLeaveTimerRef.current);
      mouseLeaveTimerRef.current = null;
    }
  };

  // Function to get selected text from the textarea
  const getSelectedText = () => {
    const textarea = textareaRef.current;
    if (!textarea) return '';
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) return ''; // No selection
    
    // Get the full selection without limiting to 30 characters
    return textarea.value.substring(start, end);
  };

  // Handle widget button click
  const handleWidgetButtonClick = (widget: string) => {
    // Get selected text for the widget
    const text = getSelectedText();
    if (text) {
      setSelectedText(text);
    }
    
    // Set the active widget
    setActiveWidget(widget);
    
    // If it's the alphabet widget being opened via context menu,
    // prevent auto-hiding
    if (widget === 'alphabet' && selectedText) {
      setPreventAutoHide(true);
      // Reset preventAutoHide after a delay
      setTimeout(() => setPreventAutoHide(false), 5000);
    }
    
    // Show widgets if they're hidden
    if (!showWidgets) {
      setShowWidgets(true);
    } else if (activeWidget === widget && orientation === 'portrait' && !preventAutoHide) {
      // Toggle off if clicking the same widget in portrait mode
      // (but only if auto-hide is not prevented)
      setShowWidgets(false);
      // Return focus to the textarea when widgets are hidden
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="app-container" ref={appContainerRef}>
      <div ref={toolbarRef}>
        <Toolbar 
          orientation={orientation} 
          onToggleWidgets={toggleWidgets} 
          showWidgets={showWidgets}
          activeWidget={activeWidget}
          setActiveWidget={handleWidgetButtonClick}
        />
      </div>
      
      <div className="content-container">
        <NotesPanel 
          orientation={orientation} 
          showWidgets={showWidgets} 
          textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
          onContextMenuChange={setContextMenuOpen}
          onAddCard={addCard}
          onToggleWidgets={toggleWidgets}
          setActiveWidget={handleWidgetButtonClick}
          setSelectedText={setSelectedText}
        />
        {(orientation === 'landscape' || showWidgets) && (
          <div 
            ref={widgetsPanelRef} 
            className="widgets-container"
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
          >
            <WidgetsPanel 
              orientation={orientation} 
              showWidgets={showWidgets}
              activeWidget={activeWidget}
              setActiveWidget={handleWidgetButtonClick}
              selectedText={selectedText}
              cards={cards}
              onRemoveCard={removeCard}
              onToggleWidgets={toggleWidgets}
              setSelectedText={setSelectedText}
              textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
            />
          </div>
        )}
      </div>
      
      {/* Only render the SlidingPanel in portrait mode */}
      {orientation === 'portrait' && <SlidingPanel 
        orientation={orientation} 
        textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
        contextMenuOpen={contextMenuOpen}
        cards={cards}
        onRemoveCard={removeCard}
      />}
    </div>
  )
}

export default App

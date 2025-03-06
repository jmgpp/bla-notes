import { useState, useEffect, useRef } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.scss'
import Toolbar from './components/Toolbar'
import NotesPanel from './components/NotesPanel'
import WidgetsPanel from './components/WidgetsPanel'
import SlidingPanel from './components/SlidingPanel'

function App() {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  )
  const [showWidgets, setShowWidgets] = useState(orientation === 'landscape')
  const [activeWidget, setActiveWidget] = useState('alphabet')
  const [selectedText, setSelectedText] = useState<string>('')
  const widgetsPanelRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const appContainerRef = useRef<HTMLDivElement>(null)
  const mouseLeaveTimerRef = useRef<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [orientation])

  const toggleWidgets = () => {
    setShowWidgets(!showWidgets)
  }

  // Handle mouse leave for widgets panel in portrait mode
  const handleMouseLeave = (e: React.MouseEvent) => {
    if (orientation !== 'portrait' || !showWidgets) return;
    
    const widgetsRect = widgetsPanelRef.current?.getBoundingClientRect();
    const toolbarRect = toolbarRef.current?.getBoundingClientRect();
    
    if (!widgetsRect || !toolbarRect) return;
    
    const mouseY = e.clientY;
    const mouseX = e.clientX;
    
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
    
    const selection = textarea.value.substring(start, end);
    return selection.length > 30 ? selection.substring(0, 30) : selection;
  };

  // Handle widget button click
  const handleWidgetButtonClick = (widget: string) => {
    // Get selected text for widgets that use it
    if (widget === 'alphabet' || widget === 'dictionary' || widget === 'zip' || widget === 'suffixes' || widget === 'brands') {
      const text = getSelectedText();
      setSelectedText(text);
    }
    
    // Set the active widget
    setActiveWidget(widget);
    
    // Show widgets if they're hidden
    if (!showWidgets) {
      setShowWidgets(true);
    } else if (activeWidget === widget && orientation === 'portrait') {
      // Toggle off if clicking the same widget in portrait mode
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
            />
          </div>
        )}
      </div>
      
      {/* Always render the SlidingPanel in portrait mode */}
      {orientation === 'portrait' && <SlidingPanel orientation={orientation} textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>} />}
      {orientation === 'landscape' && <SlidingPanel orientation={orientation} textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>} />}
    </div>
  )
}

export default App

import React, { useEffect, useRef, forwardRef } from 'react';
import './CommandSuggestions.scss';
import { brands, Brand } from '../data/brands';

interface Command {
  command: string;
  description: string;
  syntax: string;
}

interface CommandSuggestionsProps {
  position: { top: number; left: number } | null;
  visible: boolean;
  filter: string;
  selectedIndex: number;
  type: 'command' | 'brand';
  onSelect: (value: string) => void;
}

const PLACEHOLDER_COMMANDS: Command[] = [
  { command: 'zip', description: 'Search ZIP code', syntax: '#zip-----' },
  { command: 'dic', description: 'Look up word in dictionary', syntax: '#dic' },
  { command: 'med', description: 'Medical terminology search', syntax: '#med' },
  { command: 'leg', description: 'Legal terminology search', syntax: '#leg' },
  { command: 'fin', description: 'Financial terminology search', syntax: '#fin' },
];

const CommandSuggestions = forwardRef<HTMLDivElement, CommandSuggestionsProps>(({ 
  position, 
  visible, 
  filter,
  selectedIndex,
  onSelect,
  type
}, ref) => {
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current && containerRef.current) {
      const container = containerRef.current;
      const selectedItem = selectedItemRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selectedItem.getBoundingClientRect();
      
      const itemTop = selectedRect.top - containerRect.top;
      const itemBottom = selectedRect.bottom - containerRect.top;
      
      if (itemBottom > container.clientHeight) {
        // Scroll down if selected item is below viewport
        container.scrollTop += itemBottom - container.clientHeight;
      } else if (itemTop < 0) {
        // Scroll up if selected item is above viewport
        container.scrollTop += itemTop;
      }
    }
  }, [selectedIndex]);

  if (!visible || !position) return null;

  const renderCommandSuggestions = () => {
    // Check if we have a complete ZIP command
    if (filter.match(/^zip\d{5,}$/i)) {
      return null; // Hide suggestions when ZIP has 5+ digits
    }

    // Separate command name from any parameters (like digits in zip12345)
    const filterBase = filter.match(/^([a-z]+)/i)?.[1] || filter;
    
    // Filter commands based only on the command name part
    const filteredCommands = PLACEHOLDER_COMMANDS.filter(
      ({ command }) => command.startsWith(filterBase.toLowerCase())
    );

    if (filteredCommands.length === 0) return null;

    return (
      <div className="command-list">
        {filteredCommands.map(({ command, description, syntax }, index) => (
          <div 
            key={command} 
            ref={index === selectedIndex ? selectedItemRef : null}
            className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onSelect(command)}
          >
            {renderCommandSyntax(command, syntax, filter)}
            <span className="description">{description}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderBrandSuggestions = () => {
    const filteredBrands = brands.filter(brand => 
      brand.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredBrands.length === 0) return null;

    return (
      <div className="command-list">
        {filteredBrands.map((brand, index) => {
          const name = brand.name;
          const lowerName = name.toLowerCase();
          const lowerFilter = filter.toLowerCase();
          const matchStart = lowerName.indexOf(lowerFilter);
          
          return (
            <div 
              key={brand.name}
              ref={index === selectedIndex ? selectedItemRef : null}
              className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => onSelect(brand.name)}
            >
              <span className="brand-name">
                {matchStart >= 0 ? (
                  <>
                    {name.slice(0, matchStart)}
                    <span className="highlight">{name.slice(matchStart, matchStart + filter.length)}</span>
                    {name.slice(matchStart + filter.length)}
                  </>
                ) : name}
              </span>
              <span className={`brand-category category-${brand.category.toLowerCase().replace(/[\s&]+/g, '-')}`}>
                {brand.category}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      ref={ref || containerRef}
      className={`command-suggestions ${type}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {type === 'command' ? renderCommandSuggestions() : renderBrandSuggestions()}
    </div>
  );
});

const renderCommandSyntax = (command: string, syntax: string, typedText: string) => {
  // For ZIP command - handle special case with number placeholders
  if (command === 'zip') {
    if (typedText.length <= 3) {
      // Still typing the command part (z, i, p)
      return (
        <span className="command">
          <span className="typed-part">#{typedText}</span>
          <span className="remaining-part">{syntax.slice(1 + typedText.length)}</span>
        </span>
      );
    } else {
      // For numbers part: Show typed digits (up to 5) and remaining placeholders
      const typedNumbers = typedText.slice(3);
      const displayNumbers = typedNumbers.slice(0, 5); // Limit to 5 digits
      const remainingDigits = 5 - displayNumbers.length;
      
      return (
        <span className="command">
          <span className="typed-part">#zip{displayNumbers}</span>
          <span className="remaining-part">{remainingDigits > 0 ? '-'.repeat(remainingDigits) : ''}</span>
        </span>
      );
    }
  } else {
    // For other commands
    return (
      <span className="command">
        <span className="typed-part">#{typedText}</span>
        <span className="remaining-part">{syntax.slice(1 + typedText.length)}</span>
      </span>
    );
  }
};

export default CommandSuggestions; 
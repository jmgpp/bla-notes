import React from 'react';
import './CommandSuggestions.scss';

interface CommandSuggestionsProps {
  position: { top: number; left: number } | null;
  visible: boolean;
  filter: string;
  selectedIndex: number;
  onSelect: (command: string) => void;
}

const PLACEHOLDER_COMMANDS = [
  { command: 'zip', description: 'Search ZIP code', syntax: '#zip-----' },
  { command: 'dic', description: 'Look up word in dictionary', syntax: '#dic' },
  { command: 'med', description: 'Medical terminology search', syntax: '#med' },
  { command: 'leg', description: 'Legal terminology search', syntax: '#leg' },
  { command: 'fin', description: 'Financial terminology search', syntax: '#fin' },
];

const CommandSuggestions: React.FC<CommandSuggestionsProps> = ({ 
  position, 
  visible, 
  filter,
  selectedIndex,
  onSelect,
}) => {
  if (!visible || !position) return null;

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

  return (
    <div 
      className="command-suggestions"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="command-list">
        {filteredCommands.map(({ command, description, syntax }, index) => (
          <div 
            key={command} 
            className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onSelect(command)}
          >
            {renderCommandSyntax(command, syntax, filter)}
            <span className="description">{description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommandSuggestions; 
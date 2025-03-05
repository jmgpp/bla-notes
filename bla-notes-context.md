# PROJECT_CONTEXT.md

## App Overview
A specialized tool for English-Spanish interpreters who work over the phone. The application focuses on efficient note-taking and quick information retrieval (translations, domain-specific terminology) to support interpreters during live interpretation sessions.

## Target Users
Professional interpreters who provide English-Spanish translation services via telephone. These users need to quickly take notes while interpreting and access specialized vocabulary without disrupting their workflow. They typically work with the application in a reduced window alongside other tools.

## Core Features
- **Ephemeral Note Taking**: Clean slate for each call with no persistent notes
- **Smart Pattern Detection**: Automatic detection of specific patterns (e.g., zip codes) to provide relevant information
- **Advanced Dictionary Search**: Cross-language search with tag-based filtering and related results
- **Terminology Lookup**: Quick access to translations and specialized vocabulary
- **Custom Dictionaries**: Import/export functionality for personalized terminology collections
- **Adaptive Layout**: Optimized for both portrait (primary use) and landscape orientations

## Technical Specifications
- Frontend: React 18+
- UI Framework: Bootstrap 5
- State Management: React Context API (or Redux if complexity increases)
- Data Storage: Local storage with JSON files for dictionaries
- Styling: SCSS/Bootstrap customization
- Deployment: Web-based, potentially as PWA for offline capability

## Architecture Overview
Single-page application with modular components. The app will use a lightweight state management approach with React Context for shared state. External dictionary data will be loaded from JSON files that can be exported, modified, and imported by users. Notes are ephemeral and not persisted between sessions.

## Data Models
- **Notes**: Rich text format, ephemeral (not saved between sessions)
- **Dictionary Entries**: 
  ```
  {
    "term": "string",
    "translation": "string",
    "domain": ["string"], // e.g., ["medical", "legal", "financial"]
    "tags": ["string"], // for related term discovery
    "context": "string", // example usage
    "notes": "string"
  }
  ```
- **User Preferences**: Layout, theme, dictionary prioritization

## UI/UX Guidelines
- Color scheme: Neutral base with high contrast for readability
- Component style: Minimal, clean interface with focus on functionality over aesthetics
- Responsive considerations: 
  - Portrait mode (primary): Single-panel focused with slide-in/modal auxiliary features
  - Landscape mode: Two-panel layout with note-taking and reference panels
- Font: Readable at small sizes, supports both English and Spanish characters
- Controls: Optimized for keyboard shortcuts and mouse efficiency

## Smart Pattern Detection
The app will monitor text input for specific patterns and automatically trigger relevant features:
- Zip code format (zip+5 digits) → Show city/state information
- [Add other patterns as needed]

## Search Functionality
- Cross-language search (find terms in both English and Spanish)
- Tag-based filtering
- Related term suggestions (show terms with similar tags)
- Fuzzy matching for typo tolerance
- Prioritized results based on frequency of use or domain relevance

## Development Priorities
1. Core note-taking functionality with responsive design and pattern detection
2. Advanced dictionary search implementation
3. Import/export capabilities for dictionaries
4. UI optimization for compact display
5. Performance optimization for large dictionaries

## Known Constraints
- Must function efficiently in a small window (portrait orientation)
- UI elements must be compact but accessible with mouse
- Text must remain readable at smaller sizes
- Must support rapid typing without lag
- Needs to handle potentially large dictionary files
- Search must return results instantly

## Future Considerations
- Offline functionality via PWA
- Additional smart pattern detection features
- AI-assisted translation suggestions
- Voice-to-text capabilities for hands-free note taking
- Additional language pair support

## User Workflows
1. **During Call**: 
   - Quick note-taking while listening
   - Rapid terminology lookup without disrupting call flow
   - Automatic information display based on detected patterns

2. **Between Calls**:
   - Clear slate for next call
   - Updating personal dictionaries
   - Customizing pattern detection rules

## Performance Goals
- Initial load under 2 seconds
- Dictionary searches complete in under 200ms
- No typing lag during rapid note-taking
- Smooth transitions between views

import React, { useState, useRef, useEffect } from 'react';
import './SuffixesWidget.scss';

interface SuffixesWidgetProps {
  orientation: 'landscape' | 'portrait';
  showWidgets?: boolean;
  selectedText?: string;
}

interface Suffix {
  code: string;
  name: string;
}

const SuffixesWidget: React.FC<SuffixesWidgetProps> = ({ orientation, showWidgets, selectedText }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suffixes, setSuffixes] = useState<Suffix[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize suffixes data
  useEffect(() => {
    const suffixesData: Suffix[] = [
      { code: 'ALY', name: 'Alley' },
      { code: 'ANX', name: 'Annex' },
      { code: 'ARC', name: 'Arcade' },
      { code: 'AVE', name: 'Avenue' },
      { code: 'YU', name: 'Bayou' },
      { code: 'BCH', name: 'Beach' },
      { code: 'BND', name: 'Bend' },
      { code: 'BLF', name: 'Bluff' },
      { code: 'BTM', name: 'Bottom' },
      { code: 'BLVD', name: 'Boulevard' },
      { code: 'BR', name: 'Branch' },
      { code: 'BRG', name: 'Bridge' },
      { code: 'BRK', name: 'Brook' },
      { code: 'BG', name: 'Burg' },
      { code: 'BYP', name: 'Bypass' },
      { code: 'CP', name: 'Camp' },
      { code: 'CYN', name: 'Canyon' },
      { code: 'CPE', name: 'Cape' },
      { code: 'CSWY', name: 'Causeway' },
      { code: 'CTR', name: 'Center' },
      { code: 'CIR', name: 'Circle' },
      { code: 'CLFS', name: 'Cliffs' },
      { code: 'CLB', name: 'Club' },
      { code: 'COR', name: 'Corner' },
      { code: 'CORS', name: 'Corners' },
      { code: 'CRSE', name: 'Course' },
      { code: 'CT', name: 'Court' },
      { code: 'CTS', name: 'Courts' },
      { code: 'CV', name: 'Cove' },
      { code: 'CRK', name: 'Creek' },
      { code: 'CRES', name: 'Crescent' },
      { code: 'XING', name: 'Crossing' },
      { code: 'DL', name: 'Dale' },
      { code: 'DM', name: 'Dam' },
      { code: 'DV', name: 'Divide' },
      { code: 'DR', name: 'Drive' },
      { code: 'EST', name: 'Estates' },
      { code: 'EXPY', name: 'Expressway' },
      { code: 'EXT', name: 'Extension' },
      { code: 'FALL', name: 'Fall' },
      { code: 'FLS', name: 'Falls' },
      { code: 'FRY', name: 'Ferry' },
      { code: 'FLD', name: 'Field' },
      { code: 'FLDS', name: 'Fields' },
      { code: 'FLT', name: 'Flats' },
      { code: 'FOR', name: 'Ford' },
      { code: 'FRST', name: 'Forest' },
      { code: 'FGR', name: 'Forge' },
      { code: 'FORK', name: 'Fork' },
      { code: 'FRKS', name: 'Forks' },
      { code: 'FT', name: 'Fort' },
      { code: 'FWY', name: 'Freeway' },
      { code: 'GDNS', name: 'Gardens' },
      { code: 'GTWY', name: 'Gateway' },
      { code: 'GLN', name: 'Glen' },
      { code: 'GN', name: 'Green' },
      { code: 'GRV', name: 'Grove' },
      { code: 'HBR', name: 'Harbor' },
      { code: 'HVN', name: 'Haven' },
      { code: 'HTS', name: 'Heights' },
      { code: 'HWY', name: 'Highway' },
      { code: 'HL', name: 'Hill' },
      { code: 'HLS', name: 'Hills' },
      { code: 'HOLW', name: 'Hollow' },
      { code: 'INLT', name: 'Inlet' },
      { code: 'IS', name: 'Island' },
      { code: 'ISS', name: 'Islands' },
      { code: 'ISLE', name: 'Isle' },
      { code: 'JCT', name: 'Junction' },
      { code: 'CY', name: 'Key' },
      { code: 'KNLS', name: 'Knolls' },
      { code: 'LK', name: 'Lake' },
      { code: 'LKS', name: 'Lakes' },
      { code: 'LNDG', name: 'Landing' },
      { code: 'LN', name: 'Lane' },
      { code: 'LGT', name: 'Light' },
      { code: 'LF', name: 'Loaf' },
      { code: 'LCKS', name: 'Locks' },
      { code: 'LDG', name: 'Lodge' },
      { code: 'LOOP', name: 'Loop' },
      { code: 'MALL', name: 'Mall' },
      { code: 'MNR', name: 'Manor' },
      { code: 'MDWS', name: 'Meadows' },
      { code: 'ML', name: 'Mill' },
      { code: 'MLS', name: 'Mills' },
      { code: 'MSN', name: 'Mission' },
      { code: 'MT', name: 'Mount' },
      { code: 'MTN', name: 'Mountain' },
      { code: 'NCK', name: 'Neck' },
      { code: 'ORCH', name: 'Orchard' },
      { code: 'OVAL', name: 'Oval' },
      { code: 'PARK', name: 'Park' },
      { code: 'PKY', name: 'Parkway' },
      { code: 'PASS', name: 'Pass' },
      { code: 'PATH', name: 'Path' },
      { code: 'PIKE', name: 'Pike' },
      { code: 'PNES', name: 'Pines' },
      { code: 'PL', name: 'Place' },
      { code: 'PLN', name: 'Plain' },
      { code: 'PLNS', name: 'Plains' },
      { code: 'PLZ', name: 'Plaza' },
      { code: 'PT', name: 'Point' },
      { code: 'PRT', name: 'Port' },
      { code: 'PR', name: 'Prairie' },
      { code: 'RADL', name: 'Radial' },
      { code: 'RNCH', name: 'Ranch' },
      { code: 'RPDS', name: 'Rapids' },
      { code: 'RST', name: 'Rest' },
      { code: 'RDG', name: 'Ridge' },
      { code: 'RIV', name: 'River' },
      { code: 'RD', name: 'Road' },
      { code: 'ROW', name: 'Row' },
      { code: 'RUN', name: 'Run' },
      { code: 'SHL', name: 'Shoal' },
      { code: 'SHLS', name: 'Shoals' },
      { code: 'SHR', name: 'Shore' },
      { code: 'SHRS', name: 'Shores' },
      { code: 'SPG', name: 'Spring' },
      { code: 'SPGS', name: 'Springs' },
      { code: 'SPUR', name: 'Spur' },
      { code: 'SQ', name: 'Square' },
      { code: 'STA', name: 'Station' },
      { code: 'STRA', name: 'Stravenues' },
      { code: 'STRM', name: 'Stream' },
      { code: 'ST', name: 'Street' },
      { code: 'SMT', name: 'Summit' },
      { code: 'TER', name: 'Terrace' },
      { code: 'TRCE', name: 'Trace' },
      { code: 'TRAK', name: 'Track' },
      { code: 'TRL', name: 'Trail' },
      { code: 'TRLR', name: 'Trailer' },
      { code: 'TUNL', name: 'Tunnel' },
      { code: 'TPKE', name: 'Turnpike' },
      { code: 'UN', name: 'Union' },
      { code: 'VLY', name: 'Valley' },
      { code: 'VIA', name: 'Viaduct' },
      { code: 'VW', name: 'View' },
      { code: 'VLG', name: 'Village' },
      { code: 'VL', name: 'Ville' },
      { code: 'VIS', name: 'Vista' },
      { code: 'WALK', name: 'Walk' },
      { code: 'WAY', name: 'Way' },
      { code: 'WLS', name: 'Wells' }
    ];
    
    setSuffixes(suffixesData);
  }, []);

  // Focus input when widget becomes visible
  useEffect(() => {
    if (showWidgets && inputRef.current) {
      // Small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [showWidgets]);

  // Process selected text when it changes
  useEffect(() => {
    if (selectedText) {
      // Trim and uppercase the selected text for searching
      const trimmedText = selectedText.trim().toUpperCase();
      if (trimmedText) {
        setSearchTerm(trimmedText);
      }
    }
  }, [selectedText]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter suffixes based on search term
  const filteredSuffixes = suffixes.filter(suffix => 
    suffix.code.includes(searchTerm.toUpperCase()) || 
    suffix.name.toUpperCase().includes(searchTerm.toUpperCase())
  );

  return (
    <div className={`suffixes-widget ${orientation}`} tabIndex={-1}>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search street suffixes..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          ref={inputRef}
          tabIndex={-1}
        />
        {searchTerm && (
          <button 
            className="clear-search" 
            onClick={() => setSearchTerm('')}
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>

      <div className="suffixes-list">
        {filteredSuffixes.length > 0 ? (
          filteredSuffixes.map((suffix) => (
            <div key={suffix.code} className="suffix-item">
              <span className="suffix-code">{suffix.code}</span>
              <span className="suffix-name">{suffix.name}</span>
            </div>
          ))
        ) : (
          <div className="no-results">No matching suffixes found</div>
        )}
      </div>
      
      {orientation === 'portrait' && filteredSuffixes.length > 5 && (
        <div className="scroll-hint">Scroll for more results</div>
      )}
    </div>
  );
};

export default SuffixesWidget; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the dictionary.json file
const dictionaryPath = path.join(__dirname, 'src', 'data', 'dictionary.json');

// Read the dictionary file
console.log(`Reading dictionary file from ${dictionaryPath}...`);
const dictionaryData = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));

// Create a map to track ID occurrences
const idCounts = new Map();

// Count of terms processed and fixed
let totalTerms = 0;
let fixedTerms = 0;

// Process each term and fix duplicate IDs
console.log('Processing terms and fixing duplicate IDs...');
dictionaryData.terms = dictionaryData.terms.map(term => {
    totalTerms++;
    
    // Get the original ID
    const originalId = term.id;
    
    // Check if this ID has been seen before
    if (idCounts.has(originalId)) {
        // Increment the count for this ID
        const count = idCounts.get(originalId) + 1;
        idCounts.set(originalId, count);
        
        // Create a new ID with the count appended
        const newId = `${originalId}-${count}`;
        console.log(`Fixing duplicate ID: ${originalId} -> ${newId}`);
        
        // Update the term with the new ID
        term.id = newId;
        fixedTerms++;
    } else {
        // First occurrence of this ID
        idCounts.set(originalId, 0);
    }
    
    return term;
});

// Create a backup of the original file
const backupPath = `${dictionaryPath}.backup`;
console.log(`Creating backup at ${backupPath}...`);
fs.copyFileSync(dictionaryPath, backupPath);

// Write the updated dictionary back to the file
console.log('Writing updated dictionary to file...');
fs.writeFileSync(dictionaryPath, JSON.stringify(dictionaryData, null, 4));

console.log(`Done! Processed ${totalTerms} terms and fixed ${fixedTerms} duplicate IDs.`);
console.log(`Original file backed up to ${backupPath}`); 
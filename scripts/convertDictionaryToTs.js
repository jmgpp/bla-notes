import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON file
const jsonPath = path.join(__dirname, '../src/data/dictionary.json');
const dictionaryJson = fs.readFileSync(jsonPath, 'utf-8');

// Create the TypeScript content
const tsContent = `// This file is auto-generated. Do not edit directly.
import { Term } from './types';

export const dictionaryData: { terms: Term[] } = ${dictionaryJson};
`;

// Write the TypeScript file
const tsPath = path.join(__dirname, '../src/data/dictionaryData.ts');
fs.writeFileSync(tsPath, tsContent);

console.log(`Successfully converted JSON to TypeScript module at ${tsPath}`); 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON file
const jsonPath = path.join(__dirname, '../src/data/brands.json');
const brandsJson = fs.readFileSync(jsonPath, 'utf-8');

// Create the TypeScript content
const tsContent = `// This file is auto-generated. Do not edit directly.
import { Brand } from './types';

export const brandsData: Brand[] = ${brandsJson};
`;

// Write the TypeScript file
const tsPath = path.join(__dirname, '../src/data/brandsData.ts');
fs.writeFileSync(tsPath, tsContent);

console.log(`Successfully converted JSON to TypeScript module at ${tsPath}`); 
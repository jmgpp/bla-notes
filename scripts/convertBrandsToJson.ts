import fs from 'fs';
import path from 'path';
import { brands } from '../src/data/brands';

// Convert brands array to JSON string with pretty printing
const brandsJson = JSON.stringify(brands, null, 2);

// Write to brands.json in the src/data directory
const outputPath = path.join(__dirname, '../src/data/brands.json');
fs.writeFileSync(outputPath, brandsJson);

console.log(`Successfully wrote ${brands.length} brands to ${outputPath}`); 
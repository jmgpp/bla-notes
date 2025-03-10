import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the brands.ts file
const brandsFilePath = path.join(__dirname, '../src/data/brands.ts');
let brandsFileContent = fs.readFileSync(brandsFilePath, 'utf-8');

// Extract just the brands array
const brandsMatch = brandsFileContent.match(/export const brands: Brand\[\] = (\[[\s\S]*?\n\];)/);
if (!brandsMatch) {
    console.error('Could not find brands array in the file');
    process.exit(1);
}

try {
    // Get the brands array string and convert it to valid JavaScript
    let brandsArrayString = brandsMatch[1]
        .replace(/\/\/ .*$/gm, '') // Remove comments
        .replace(/,(\s*\n\s*[}\]])/g, '$1'); // Remove trailing commas

    // Evaluate the array (safe since we control the source code)
    const brands = eval(brandsArrayString);

    if (!Array.isArray(brands)) {
        throw new Error('brands is not an array');
    }

    // Convert brands array to JSON string with pretty printing
    const brandsJson = JSON.stringify(brands, null, 2);

    // Write to brands.json in the src/data directory
    const outputPath = path.join(__dirname, '../src/data/brands.json');
    fs.writeFileSync(outputPath, brandsJson);

    console.log(`Successfully wrote ${brands.length} brands to ${outputPath}`);
} catch (error) {
    console.error('Error processing brands:', error);
    process.exit(1);
} 
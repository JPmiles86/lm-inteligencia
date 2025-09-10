#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fix imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix relative imports that don't have .js extension
  const relativeImportRegex = /from\s+['"](\.[^'"]+)(?<!\.js)(?<!\.json)['"]/g;
  
  const newContent = content.replace(relativeImportRegex, (match, importPath) => {
    modified = true;
    return `from '${importPath}.js'`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed imports in: ${filePath}`);
    return true;
  }
  return false;
}

// Process all TypeScript files in server directory
function processDirectory(dir) {
  let filesFixed = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      filesFixed += processDirectory(fullPath);
    } else if (file.endsWith('.ts')) {
      if (fixImportsInFile(fullPath)) {
        filesFixed++;
      }
    }
  }
  
  return filesFixed;
}

// Main execution
console.log('Fixing ES module imports in server directory...\n');

const serverDir = path.join(__dirname, 'server');
const apiDir = path.join(__dirname, 'api');

let totalFixed = 0;

if (fs.existsSync(serverDir)) {
  console.log('Processing server directory...');
  totalFixed += processDirectory(serverDir);
}

if (fs.existsSync(apiDir)) {
  console.log('\nProcessing api directory...');
  totalFixed += processDirectory(apiDir);
}

console.log(`\n✅ Fixed imports in ${totalFixed} files`);
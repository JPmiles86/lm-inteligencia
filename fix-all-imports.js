#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let totalFixed = 0;
const fixedFiles = [];

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const originalContent = content;
  
  // Fix relative imports that don't have .js extension
  // Match: from './something' or from '../something' but NOT from 'package'
  content = content.replace(
    /from\s+['"](\.\.?\/[^'"]+?)(?<!\.js)(?<!\.json)(?<!\.css)(?<!\.svg)(?<!\.png)(?<!\.jpg)['"]/g,
    (match, importPath) => {
      // Skip if it's a package (shouldn't happen with relative paths but just in case)
      if (importPath.includes('node_modules')) return match;
      
      modified = true;
      return `from '${importPath}.js'`;
    }
  );
  
  // Also fix imports that are already .ts to be .js
  content = content.replace(
    /from\s+['"](\.\.?\/[^'"]+?)\.ts['"]/g,
    (match, importPath) => {
      modified = true;
      return `from '${importPath}.js'`;
    }
  );
  
  if (modified && content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath.replace(__dirname + '/', '')}`);
    fixedFiles.push(filePath);
    return true;
  }
  return false;
}

function processDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let filesFixed = 0;
  
  // Skip node_modules and other build directories
  if (dir.includes('node_modules') || 
      dir.includes('.next') || 
      dir.includes('dist') || 
      dir.includes('.vercel')) {
    return 0;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      filesFixed += processDirectory(fullPath, extensions);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      if (fixImportsInFile(fullPath)) {
        filesFixed++;
      }
    }
  }
  
  return filesFixed;
}

console.log('🔧 Comprehensive ES Module Import Fix\n');
console.log('Scanning for all imports that need .js extensions...\n');

// Process all relevant directories
const directories = [
  'src/services',
  'src/components',
  'src/utils',
  'src/db',
  'server',
  'api'
];

for (const dir of directories) {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`\n📁 Processing ${dir}/...`);
    const fixed = processDirectory(fullPath);
    totalFixed += fixed;
    if (fixed > 0) {
      console.log(`   Fixed ${fixed} files in ${dir}/`);
    } else {
      console.log(`   No changes needed in ${dir}/`);
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n✨ COMPLETE: Fixed ${totalFixed} files total\n`);

if (fixedFiles.length > 0) {
  console.log('Files that were modified:');
  fixedFiles.forEach(file => {
    console.log(`  - ${file.replace(__dirname + '/', '')}`);
  });
}
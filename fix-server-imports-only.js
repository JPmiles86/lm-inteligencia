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
  content = content.replace(
    /from\s+['"](\.\.?\/[^'"]+?)(?<!\.js)(?<!\.json)(?<!\.css)(?<!\.svg)(?<!\.png)(?<!\.jpg)['"]/g,
    (match, importPath) => {
      modified = true;
      return `from '${importPath}.js'`;
    }
  );
  
  // Fix .ts imports to .js
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

function processDirectory(dir) {
  let filesFixed = 0;
  
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
      filesFixed += processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      if (fixImportsInFile(fullPath)) {
        filesFixed++;
      }
    }
  }
  
  return filesFixed;
}

console.log('🔧 Server-Side ES Module Import Fix\n');
console.log('Fixing imports ONLY in server and API directories...\n');

// ONLY process server-side directories
const directories = [
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
console.log(`\n✨ COMPLETE: Fixed ${totalFixed} server-side files\n`);

if (fixedFiles.length > 0) {
  console.log('Files that were modified:');
  fixedFiles.forEach(file => {
    console.log(`  - ${file.replace(__dirname + '/', '')}`);
  });
}
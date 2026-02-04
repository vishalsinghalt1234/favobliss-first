#!/usr/bin/env node

/**
 * Automated Image Import Migration Script
 * 
 * This script automatically updates all Next.js Image imports to use
 * the custom optimized Image component.
 * 
 * Usage: node scripts/migrate-images.js
 */

const fs = require('fs');
const path = require('path');

// Directories to search
const SEARCH_DIRS = ['app', 'components', 'lib'];

// File extensions to process
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Statistics
let filesProcessed = 0;
let filesModified = 0;
let importChanges = 0;

/**
 * Recursively find all files in directory
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findFiles(filePath, fileList);
      }
    } else {
      // Check if file has valid extension
      const ext = path.extname(file);
      if (EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  filesProcessed++;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: import Image from 'next/image'
  const pattern1 = /import\s+Image\s+from\s+['"]next\/image['"]/g;
  if (pattern1.test(content)) {
    content = content.replace(
      pattern1,
      "import Image from '@/components/image'"
    );
    modified = true;
    importChanges++;
  }

  // Pattern 2: import { Image } from 'next/image' (less common)
  const pattern2 = /import\s+\{\s*Image\s*\}\s+from\s+['"]next\/image['"]/g;
  if (pattern2.test(content)) {
    content = content.replace(
      pattern2,
      "import Image from '@/components/image'"
    );
    modified = true;
    importChanges++;
  }

  // Pattern 3: import Image, { ImageProps } from 'next/image'
  const pattern3 = /import\s+Image,\s*\{\s*(\w+)\s*\}\s+from\s+['"]next\/image['"]/g;
  const matches3 = content.match(pattern3);
  if (matches3) {
    content = content.replace(
      pattern3,
      (match, props) => {
        return `import Image from '@/components/image';\nimport type { ${props} } from 'next/image';`;
      }
    );
    modified = true;
    importChanges++;
  }

  // Write back if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    console.log(`✅ Updated: ${filePath}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Starting Image import migration...\n');

  // Find all files
  let allFiles = [];
  SEARCH_DIRS.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      allFiles = allFiles.concat(findFiles(dirPath));
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  });

  console.log(`Found ${allFiles.length} files to check\n`);

  // Process each file
  allFiles.forEach(processFile);

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary');
  console.log('='.repeat(50));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files modified: ${filesModified}`);
  console.log(`Import statements changed: ${importChanges}`);
  console.log('='.repeat(50));

  if (filesModified > 0) {
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Review the changes with: git diff');
    console.log('2. Test your application: npm run dev');
    console.log('3. Update next.config.mjs to disable Vercel optimization');
    console.log('4. Commit the changes: git commit -am "feat: migrate to custom image optimization"');
  } else {
    console.log('\n✨ No files needed updating!');
  }
}

// Run the script
main();

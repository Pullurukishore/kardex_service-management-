const fs = require('fs');
const path = require('path');

console.log('🧹 Starting console cleanup...\n');

let processedCount = 0;
let modifiedCount = 0;

function removeConsoleStatements(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove console.log, console.error, console.warn, console.info, console.debug, console.trace
    // Handles single-line and multi-line console statements
    content = content.replace(/console\.(log|error|warn|info|debug|trace)\([^;]*\);?\s*\n?/g, '');
    
    // Handle console statements with template literals and complex expressions
    content = content.replace(/console\.(log|error|warn|info|debug|trace)\s*\(\s*[`'"][^`'"]*[`'"]\s*(?:,\s*[^)]*)*\)\s*;?\s*\n?/g, '');
    
    // Clean up extra blank lines created by removal
    content = content.replace(/(\r?\n){3,}/g, '\n\n');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip node_modules, dist, build, .next
    if (['node_modules', 'dist', 'build', '.next', '.git'].includes(file)) {
      return;
    }
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (['.ts', '.tsx', '.js'].includes(path.extname(file))) {
      callback(filePath);
    }
  });
}

// Process backend
console.log('📂 Processing backend files...');
walkDir('c:\\KardexCare\\backend', (filePath) => {
  processedCount++;
  if (processedCount % 50 === 0) {
    process.stdout.write(`  Processing... ${processedCount}\r`);
  }
  
  if (removeConsoleStatements(filePath)) {
    modifiedCount++;
    console.log(`  ✓ Cleaned: ${path.basename(filePath)}`);
  }
});

// Process frontend
console.log('\n📂 Processing frontend files...');
walkDir('c:\\KardexCare\\frontend', (filePath) => {
  processedCount++;
  if (processedCount % 50 === 0) {
    process.stdout.write(`  Processing... ${processedCount}\r`);
  }
  
  if (removeConsoleStatements(filePath)) {
    modifiedCount++;
    console.log(`  ✓ Cleaned: ${path.basename(filePath)}`);
  }
});

console.log('\n');
console.log('✅ Cleanup complete!');
console.log(`   Processed: ${processedCount} files`);
console.log(`   Modified: ${modifiedCount} files\n`);

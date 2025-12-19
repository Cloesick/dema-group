const fs = require('fs');
const path = require('path');

// Pattern to find and replace
const unsafePattern = /fetch\((['"`][^'"`]+\.json['"`])\)\s*\.then\(res\s*=>\s*res\.json\(\)\)/g;

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if file needs fixing
  if (!content.includes('.then(res => res.json())') && !content.includes('fetchJsonSafe')) {
    return false;
  }
  
  // Check if already using fetchJsonSafe
  if (content.includes('fetchJsonSafe')) {
    console.log(`✓ Already fixed: ${path.basename(path.dirname(filePath))}`);
    return false;
  }
  
  let fixed = content;
  
  // Add import if not present
  if (!fixed.includes("import { fetchJsonSafe } from '@/lib/fetchJson'")) {
    // Find the last import statement
    const importLines = fixed.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      importLines.splice(lastImportIndex + 1, 0, "import { fetchJsonSafe } from '@/lib/fetchJson';");
      fixed = importLines.join('\n');
    }
  }
  
  // Replace unsafe fetch calls with fetchJsonSafe
  fixed = fixed.replace(
    /fetch\((['"`][^'"`]+\.json['"`])\)\s*\.then\(res\s*=>\s*res\.json\(\)\)/g,
    (match, jsonPath) => `fetchJsonSafe(${jsonPath})`
  );
  
  // Write back
  fs.writeFileSync(filePath, fixed, 'utf-8');
  return true;
}

function findAndFixFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let fixedCount = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && entry.name.endsWith('-grouped')) {
      const pageFile = path.join(fullPath, 'page.tsx');
      if (fs.existsSync(pageFile)) {
        if (fixFile(pageFile)) {
          console.log(`✅ Fixed: ${entry.name}/page.tsx`);
          fixedCount++;
        }
      }
    }
  }
  
  return fixedCount;
}

// Main execution
const catalogDir = path.join(__dirname, 'src', 'app', 'catalog');
console.log('🔧 Fixing catalog grouped pages...\n');

const fixedCount = findAndFixFiles(catalogDir);

console.log(`\n✅ Fixed ${fixedCount} catalog pages!`);
console.log('🔄 Restart your dev server for changes to take effect.');

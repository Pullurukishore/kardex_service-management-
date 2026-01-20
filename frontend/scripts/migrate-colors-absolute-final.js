/**
 * Kardex Color - ABSOLUTE FINAL Cleanup
 * Fixes remaining specific patterns
 */

const fs = require('fs');
const path = require('path');

const colorReplacements = [
    // Remaining hover patterns
    ['hover:bg-orange-700', 'hover:bg-[#976E44]'],
    ['hover:bg-orange-900/50', 'hover:bg-[#976E44]/50'],
    ['dark:hover:bg-orange-900/50', 'dark:hover:bg-[#976E44]/50'],

    // Purple patterns
    ['bg-purple-300', 'bg-[#6F8A9D]/40'],
    ['bg-purple-400', 'bg-[#6F8A9D]'],
    ['bg-purple-400/20', 'bg-[#6F8A9D]/20'],
    ['disabled:bg-purple-400', 'disabled:bg-[#92A2A5]'],

    // Orange patterns  
    ['bg-orange-300', 'bg-[#CE9F6B]/40'],
    ['bg-orange-400', 'bg-[#CE9F6B]'],
    ['bg-orange-700', 'bg-[#976E44]'],

    // Any remaining amber patterns
    ['bg-amber-300', 'bg-[#CE9F6B]/40'],
    ['bg-amber-400', 'bg-[#CE9F6B]'],
    ['bg-amber-700', 'bg-[#976E44]'],

    // Any remaining indigo patterns  
    ['bg-indigo-300', 'bg-[#6F8A9D]/40'],
    ['bg-indigo-400', 'bg-[#6F8A9D]'],

    // Text patterns that might be remaining
    ['text-purple-400', 'text-[#6F8A9D]'],
    ['text-orange-400', 'text-[#CE9F6B]'],

    // Border remaining
    ['border-purple-400', 'border-[#6F8A9D]'],
    ['border-orange-400', 'border-[#CE9F6B]'],

    // Ring remaining
    ['ring-purple-400', 'ring-[#6F8A9D]'],
    ['ring-orange-400', 'ring-[#CE9F6B]'],
];

function findFiles(dir, files = []) {
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.')) {
                    findFiles(fullPath, files);
                } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
                    files.push(fullPath);
                }
            } catch (e) { }
        }
    } catch (e) { }
    return files;
}

function replaceColorsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const [oldColor, newColor] of colorReplacements) {
            const escaped = oldColor.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escaped, 'g');

            if (regex.test(content)) {
                content = content.replace(new RegExp(escaped, 'g'), newColor);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        }
    } catch (e) {
        console.log(`  ⚠️ Error: ${filePath}`);
    }
    return false;
}

console.log('🎨 Kardex ABSOLUTE FINAL Cleanup');
console.log('=================================\n');

const srcDir = path.join(__dirname, '../src');
let totalFiles = 0, modifiedFiles = 0;

const allFiles = findFiles(srcDir);
for (const file of allFiles) {
    if (replaceColorsInFile(file)) {
        console.log(`  ✅ ${path.relative(srcDir, file)}`);
        modifiedFiles++;
    }
    totalFiles++;
}

console.log('\n=================================');
console.log(`📊 Modified ${modifiedFiles} of ${totalFiles} files`);
console.log('🎨 ALL Kardex colors applied!');

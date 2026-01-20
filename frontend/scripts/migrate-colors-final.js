/**
 * Kardex Color FINAL Cleanup Script
 * 
 * This catches all remaining non-Kardex colors including *-900 variants
 * Run: node scripts/migrate-colors-final.js
 */

const fs = require('fs');
const path = require('path');

// Final cleanup replacements
const colorReplacements = [
    // Text -900 variants
    ['text-blue-900', 'text-[#546A7A]'],
    ['text-green-900', 'text-[#4F6A64]'],
    ['text-red-900', 'text-[#75242D]'],
    ['text-yellow-900', 'text-[#976E44]'],
    ['text-orange-900', 'text-[#976E44]'],
    ['text-purple-900', 'text-[#546A7A]'],
    ['text-indigo-900', 'text-[#546A7A]'],
    ['text-amber-900', 'text-[#976E44]'],
    ['text-emerald-900', 'text-[#4F6A64]'],
    ['text-gray-900', 'text-[#546A7A]'],
    ['text-slate-900', 'text-[#546A7A]'],
    ['text-cyan-900', 'text-[#546A7A]'],
    ['text-teal-900', 'text-[#4F6A64]'],
    ['text-pink-900', 'text-[#75242D]'],
    ['text-rose-900', 'text-[#75242D]'],

    // Text -100 variants (light text)
    ['text-blue-100', 'text-[#96AEC2]'],
    ['text-green-100', 'text-[#A2B9AF]'],
    ['text-purple-100', 'text-[#6F8A9D]'],
    ['text-indigo-100', 'text-[#6F8A9D]'],
    ['text-purple-300', 'text-[#6F8A9D]'],
    ['text-indigo-300', 'text-[#6F8A9D]'],

    // Gradient combinations with non-Kardex colors
    ['from-blue-500 via-blue-600 to-indigo-700', 'from-[#96AEC2] via-[#6F8A9D] to-[#546A7A]'],
    ['from-amber-500 via-orange-500 to-orange-700', 'from-[#EEC1BF] via-[#CE9F6B] to-[#976E44]'],
    ['from-purple-500 via-purple-600 to-pink-700', 'from-[#6F8A9D] via-[#546A7A] to-[#546A7A]'],
    ['from-gray-500 to-gray-600', 'from-[#92A2A5] to-[#5D6E73]'],
    ['from-slate-400 to-gray-500', 'from-[#92A2A5] to-[#757777]'],
    ['from-slate-500 to-slate-600', 'from-[#757777] to-[#5D6E73]'],

    // Ring colors
    ['ring-amber-500/30', 'ring-[#CE9F6B]/30'],
    ['ring-purple-500/30', 'ring-[#6F8A9D]/30'],
    ['ring-gray-500/30', 'ring-[#92A2A5]/30'],

    // Shadow colors
    ['shadow-blue-500/30', 'shadow-[#96AEC2]/30'],
    ['shadow-amber-500/30', 'shadow-[#CE9F6B]/30'],
    ['shadow-purple-500/30', 'shadow-[#6F8A9D]/30'],
    ['shadow-gray-500/30', 'shadow-[#92A2A5]/30'],

    // Dark mode variants with Tailwind colors
    ['dark:bg-blue-950/30', 'dark:bg-[#546A7A]/30'],
    ['dark:bg-amber-950/30', 'dark:bg-[#976E44]/30'],
    ['dark:bg-purple-950/30', 'dark:bg-[#546A7A]/30'],
    ['dark:bg-gray-950/30', 'dark:bg-[#5D6E73]/30'],
    ['dark:bg-amber-900/40', 'dark:bg-[#976E44]/40'],
    ['dark:bg-purple-900/40', 'dark:bg-[#546A7A]/40'],
    ['dark:bg-purple-900/30', 'dark:bg-[#546A7A]/30'],
    ['dark:bg-purple-900/20', 'dark:bg-[#546A7A]/20'],
    ['dark:bg-purple-900/10', 'dark:bg-[#546A7A]/10'],
    ['dark:bg-purple-900', 'dark:bg-[#546A7A]'],
    ['dark:bg-indigo-900/30', 'dark:bg-[#546A7A]/30'],
    ['dark:bg-indigo-900/20', 'dark:bg-[#546A7A]/20'],
    ['dark:bg-indigo-900/10', 'dark:bg-[#546A7A]/10'],
    ['dark:bg-yellow-900/20', 'dark:bg-[#976E44]/20'],
    ['dark:bg-yellow-900/10', 'dark:bg-[#976E44]/10'],
    ['dark:bg-orange-900/50', 'dark:bg-[#976E44]/50'],
    ['dark:bg-orange-900/30', 'dark:bg-[#976E44]/30'],
    ['dark:bg-slate-950', 'dark:bg-[#546A7A]'],

    // Dark mode text variants
    ['dark:text-purple-300', 'dark:text-[#6F8A9D]'],
    ['dark:text-indigo-300', 'dark:text-[#6F8A9D]'],
    ['dark:text-amber-300', 'dark:text-[#CE9F6B]'],

    // More bg specific patterns
    ['bg-slate-600', 'bg-[#5D6E73]'],
    ['bg-slate-400', 'bg-[#92A2A5]'],
    ['bg-slate-300', 'bg-[#92A2A5]'],
    ['bg-indigo-200', 'bg-[#6F8A9D]/30'],
    ['bg-indigo-200/5', 'bg-[#6F8A9D]/5'],
    ['bg-amber-700', 'bg-[#976E44]'],

    // Hover with specific colors still present
    ['hover:bg-indigo-200', 'hover:bg-[#6F8A9D]/30'],
    ['hover:bg-amber-700', 'hover:bg-[#976E44]'],

    // Border patterns  
    ['border-slate-300', 'border-[#92A2A5]'],
    ['border-slate-700', 'border-[#5D6E73]'],

    // Focus outline ring patterns
    ['focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500', 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#96AEC2]'],
];

/**
 * Recursively find all .tsx and .ts files
 */
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
            } catch (e) {
                // Skip files we can't access
            }
        }
    } catch (e) {
        // Skip directories we can't access
    }

    return files;
}

/**
 * Replace colors in a file
 */
function replaceColorsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const [oldColor, newColor] of colorReplacements) {
            // Escape special regex characters
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
        console.log(`  ⚠️ Error processing: ${filePath}`);
    }

    return false;
}

// Main execution
console.log('🎨 Kardex FINAL Color Cleanup Script');
console.log('=====================================\n');

const srcDir = path.join(__dirname, '../src');
let totalFiles = 0;
let modifiedFiles = 0;

console.log('📁 Processing all TypeScript/TSX files in src/...');
const allFiles = findFiles(srcDir);

for (const file of allFiles) {
    if (replaceColorsInFile(file)) {
        const relativePath = path.relative(srcDir, file);
        console.log(`  ✅ ${relativePath}`);
        modifiedFiles++;
    }
    totalFiles++;
}

console.log('\n=====================================');
console.log(`📊 Summary: Modified ${modifiedFiles} of ${totalFiles} files`);
console.log('🎨 Final cleanup complete!');

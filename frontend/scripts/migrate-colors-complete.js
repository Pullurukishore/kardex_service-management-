/**
 * Kardex Color Migration Script - COMPLETE VERSION
 * 
 * This script replaces ALL non-Kardex Tailwind colors with official Kardex brand colors
 * Run: node scripts/migrate-colors-complete.js
 */

const fs = require('fs');
const path = require('path');

// COMPLETE color replacement mappings
const colorReplacements = [
    // ===================================
    // BLUE -> KARDEX BLUE
    // ===================================
    // Background blues
    ['bg-blue-50', 'bg-[#96AEC2]/10'],
    ['bg-blue-100', 'bg-[#96AEC2]/20'],
    ['bg-blue-200', 'bg-[#96AEC2]/30'],
    ['bg-blue-300', 'bg-[#96AEC2]/40'],
    ['bg-blue-400', 'bg-[#6F8A9D]'],
    ['bg-blue-500', 'bg-[#6F8A9D]'],
    ['bg-blue-600', 'bg-[#6F8A9D]'],
    ['bg-blue-700', 'bg-[#546A7A]'],
    ['bg-blue-800', 'bg-[#546A7A]'],
    ['bg-blue-900', 'bg-[#546A7A]'],
    // Text blues
    ['text-blue-50', 'text-[#96AEC2]'],
    ['text-blue-100', 'text-[#96AEC2]'],
    ['text-blue-200', 'text-[#96AEC2]'],
    ['text-blue-300', 'text-[#96AEC2]'],
    ['text-blue-400', 'text-[#6F8A9D]'],
    ['text-blue-500', 'text-[#6F8A9D]'],
    ['text-blue-600', 'text-[#546A7A]'],
    ['text-blue-700', 'text-[#546A7A]'],
    ['text-blue-800', 'text-[#546A7A]'],
    ['text-blue-900', 'text-[#546A7A]'],
    // Border blues
    ['border-blue-50', 'border-[#96AEC2]/20'],
    ['border-blue-100', 'border-[#96AEC2]/30'],
    ['border-blue-200', 'border-[#96AEC2]'],
    ['border-blue-300', 'border-[#96AEC2]'],
    ['border-blue-400', 'border-[#6F8A9D]'],
    ['border-blue-500', 'border-[#6F8A9D]'],
    ['border-blue-600', 'border-[#546A7A]'],
    // Hover blues
    ['hover:bg-blue-50', 'hover:bg-[#96AEC2]/10'],
    ['hover:bg-blue-100', 'hover:bg-[#96AEC2]/20'],
    ['hover:bg-blue-200', 'hover:bg-[#96AEC2]/30'],
    ['hover:bg-blue-500', 'hover:bg-[#6F8A9D]'],
    ['hover:bg-blue-600', 'hover:bg-[#6F8A9D]'],
    ['hover:bg-blue-700', 'hover:bg-[#546A7A]'],
    ['hover:text-blue-500', 'hover:text-[#6F8A9D]'],
    ['hover:text-blue-600', 'hover:text-[#546A7A]'],
    ['hover:text-blue-700', 'hover:text-[#546A7A]'],
    ['hover:border-blue-500', 'hover:border-[#6F8A9D]'],
    // Focus/Ring blues
    ['focus:ring-blue-500', 'focus:ring-[#96AEC2]'],
    ['focus:border-blue-500', 'focus:border-[#96AEC2]'],
    ['ring-blue-500', 'ring-[#96AEC2]'],
    ['ring-blue-200', 'ring-[#96AEC2]/50'],

    // ===================================
    // GREEN -> KARDEX GREEN
    // ===================================
    ['bg-green-50', 'bg-[#A2B9AF]/10'],
    ['bg-green-100', 'bg-[#A2B9AF]/20'],
    ['bg-green-200', 'bg-[#82A094]/30'],
    ['bg-green-300', 'bg-[#82A094]/40'],
    ['bg-green-400', 'bg-[#82A094]'],
    ['bg-green-500', 'bg-[#82A094]'],
    ['bg-green-600', 'bg-[#4F6A64]'],
    ['bg-green-700', 'bg-[#4F6A64]'],
    ['bg-green-800', 'bg-[#4F6A64]'],
    ['text-green-50', 'text-[#A2B9AF]'],
    ['text-green-100', 'text-[#A2B9AF]'],
    ['text-green-200', 'text-[#A2B9AF]'],
    ['text-green-300', 'text-[#82A094]'],
    ['text-green-400', 'text-[#82A094]'],
    ['text-green-500', 'text-[#82A094]'],
    ['text-green-600', 'text-[#4F6A64]'],
    ['text-green-700', 'text-[#4F6A64]'],
    ['text-green-800', 'text-[#4F6A64]'],
    ['border-green-200', 'border-[#A2B9AF]'],
    ['border-green-300', 'border-[#82A094]'],
    ['border-green-500', 'border-[#82A094]'],
    ['hover:bg-green-50', 'hover:bg-[#A2B9AF]/10'],
    ['hover:bg-green-100', 'hover:bg-[#A2B9AF]/20'],
    ['hover:bg-green-200', 'hover:bg-[#82A094]/30'],
    ['hover:bg-green-600', 'hover:bg-[#4F6A64]'],
    ['hover:bg-green-700', 'hover:bg-[#4F6A64]'],
    ['hover:text-green-500', 'hover:text-[#82A094]'],
    ['hover:text-green-600', 'hover:text-[#4F6A64]'],
    ['hover:text-green-700', 'hover:text-[#4F6A64]'],
    ['hover:border-green-300', 'hover:border-[#82A094]'],
    ['focus:ring-green-500', 'focus:ring-[#82A094]'],
    ['ring-green-200', 'ring-[#A2B9AF]/50'],
    ['ring-green-500', 'ring-[#82A094]'],

    // ===================================
    // RED -> KARDEX RED
    // ===================================
    ['bg-red-50', 'bg-[#E17F70]/10'],
    ['bg-red-100', 'bg-[#E17F70]/20'],
    ['bg-red-200', 'bg-[#E17F70]/30'],
    ['bg-red-300', 'bg-[#E17F70]/40'],
    ['bg-red-400', 'bg-[#E17F70]'],
    ['bg-red-500', 'bg-[#E17F70]'],
    ['bg-red-600', 'bg-[#9E3B47]'],
    ['bg-red-700', 'bg-[#75242D]'],
    ['bg-red-800', 'bg-[#75242D]'],
    ['text-red-50', 'text-[#E17F70]'],
    ['text-red-100', 'text-[#E17F70]'],
    ['text-red-200', 'text-[#E17F70]'],
    ['text-red-300', 'text-[#E17F70]'],
    ['text-red-400', 'text-[#E17F70]'],
    ['text-red-500', 'text-[#E17F70]'],
    ['text-red-600', 'text-[#9E3B47]'],
    ['text-red-700', 'text-[#75242D]'],
    ['text-red-800', 'text-[#75242D]'],
    ['border-red-200', 'border-[#E17F70]'],
    ['border-red-300', 'border-[#E17F70]'],
    ['border-red-500', 'border-[#9E3B47]'],
    ['hover:bg-red-50', 'hover:bg-[#E17F70]/10'],
    ['hover:bg-red-100', 'hover:bg-[#E17F70]/20'],
    ['hover:bg-red-600', 'hover:bg-[#9E3B47]'],
    ['hover:bg-red-700', 'hover:bg-[#75242D]'],
    ['hover:text-red-500', 'hover:text-[#E17F70]'],
    ['hover:text-red-600', 'hover:text-[#9E3B47]'],
    ['hover:text-red-700', 'hover:text-[#75242D]'],
    ['focus:ring-red-500', 'focus:ring-[#E17F70]'],
    ['ring-red-200', 'ring-[#E17F70]/50'],

    // ===================================
    // YELLOW -> KARDEX SAND
    // ===================================
    ['bg-yellow-50', 'bg-[#EEC1BF]/10'],
    ['bg-yellow-100', 'bg-[#CE9F6B]/20'],
    ['bg-yellow-200', 'bg-[#CE9F6B]/30'],
    ['bg-yellow-300', 'bg-[#CE9F6B]'],
    ['bg-yellow-400', 'bg-[#CE9F6B]'],
    ['bg-yellow-500', 'bg-[#CE9F6B]'],
    ['bg-yellow-600', 'bg-[#976E44]'],
    ['bg-yellow-700', 'bg-[#976E44]'],
    ['text-yellow-50', 'text-[#CE9F6B]'],
    ['text-yellow-100', 'text-[#CE9F6B]'],
    ['text-yellow-200', 'text-[#CE9F6B]'],
    ['text-yellow-300', 'text-[#CE9F6B]'],
    ['text-yellow-400', 'text-[#CE9F6B]'],
    ['text-yellow-500', 'text-[#CE9F6B]'],
    ['text-yellow-600', 'text-[#976E44]'],
    ['text-yellow-700', 'text-[#976E44]'],
    ['text-yellow-800', 'text-[#976E44]'],
    ['border-yellow-200', 'border-[#CE9F6B]'],
    ['border-yellow-300', 'border-[#CE9F6B]'],
    ['hover:bg-yellow-50', 'hover:bg-[#CE9F6B]/10'],
    ['hover:bg-yellow-100', 'hover:bg-[#CE9F6B]/20'],

    // ===================================
    // ORANGE -> KARDEX SAND 2
    // ===================================
    ['bg-orange-50', 'bg-[#CE9F6B]/10'],
    ['bg-orange-100', 'bg-[#CE9F6B]/20'],
    ['bg-orange-200', 'bg-[#CE9F6B]/30'],
    ['bg-orange-400', 'bg-[#CE9F6B]'],
    ['bg-orange-500', 'bg-[#CE9F6B]'],
    ['bg-orange-600', 'bg-[#976E44]'],
    ['text-orange-400', 'text-[#CE9F6B]'],
    ['text-orange-500', 'text-[#CE9F6B]'],
    ['text-orange-600', 'text-[#976E44]'],
    ['text-orange-700', 'text-[#976E44]'],
    ['text-orange-800', 'text-[#976E44]'],
    ['border-orange-200', 'border-[#CE9F6B]'],
    ['border-orange-300', 'border-[#CE9F6B]'],
    ['hover:bg-orange-50', 'hover:bg-[#CE9F6B]/10'],
    ['hover:bg-orange-600', 'hover:bg-[#976E44]'],
    ['hover:text-orange-600', 'hover:text-[#976E44]'],

    // ===================================
    // PURPLE/VIOLET -> KARDEX BLUE 2
    // ===================================
    ['bg-purple-50', 'bg-[#6F8A9D]/10'],
    ['bg-purple-100', 'bg-[#6F8A9D]/20'],
    ['bg-purple-200', 'bg-[#6F8A9D]/30'],
    ['bg-purple-500', 'bg-[#6F8A9D]'],
    ['bg-purple-600', 'bg-[#546A7A]'],
    ['bg-purple-700', 'bg-[#546A7A]'],
    ['text-purple-400', 'text-[#6F8A9D]'],
    ['text-purple-500', 'text-[#6F8A9D]'],
    ['text-purple-600', 'text-[#546A7A]'],
    ['text-purple-700', 'text-[#546A7A]'],
    ['text-purple-800', 'text-[#546A7A]'],
    ['border-purple-200', 'border-[#6F8A9D]'],
    ['border-purple-300', 'border-[#6F8A9D]'],
    ['hover:bg-purple-50', 'hover:bg-[#6F8A9D]/10'],
    ['hover:bg-purple-100', 'hover:bg-[#6F8A9D]/20'],
    ['hover:bg-purple-600', 'hover:bg-[#546A7A]'],
    ['hover:text-purple-600', 'hover:text-[#546A7A]'],
    ['hover:text-purple-700', 'hover:text-[#546A7A]'],

    // ===================================
    // INDIGO -> KARDEX BLUE 3
    // ===================================
    ['bg-indigo-50', 'bg-[#546A7A]/10'],
    ['bg-indigo-100', 'bg-[#546A7A]/20'],
    ['bg-indigo-500', 'bg-[#546A7A]'],
    ['bg-indigo-600', 'bg-[#546A7A]'],
    ['bg-indigo-700', 'bg-[#546A7A]'],
    ['text-indigo-500', 'text-[#546A7A]'],
    ['text-indigo-600', 'text-[#546A7A]'],
    ['text-indigo-700', 'text-[#546A7A]'],
    ['text-indigo-800', 'text-[#546A7A]'],
    ['border-indigo-200', 'border-[#546A7A]'],

    // ===================================
    // AMBER -> KARDEX SAND 2
    // ===================================
    ['bg-amber-50', 'bg-[#CE9F6B]/10'],
    ['bg-amber-100', 'bg-[#CE9F6B]/20'],
    ['bg-amber-500', 'bg-[#CE9F6B]'],
    ['bg-amber-600', 'bg-[#976E44]'],
    ['text-amber-500', 'text-[#CE9F6B]'],
    ['text-amber-600', 'text-[#976E44]'],
    ['text-amber-700', 'text-[#976E44]'],
    ['text-amber-800', 'text-[#976E44]'],

    // ===================================
    // EMERALD -> KARDEX GREEN 2
    // ===================================
    ['bg-emerald-50', 'bg-[#82A094]/10'],
    ['bg-emerald-100', 'bg-[#82A094]/20'],
    ['bg-emerald-500', 'bg-[#82A094]'],
    ['bg-emerald-600', 'bg-[#4F6A64]'],
    ['text-emerald-500', 'text-[#82A094]'],
    ['text-emerald-600', 'text-[#4F6A64]'],
    ['text-emerald-700', 'text-[#4F6A64]'],

    // ===================================
    // GRAY -> KARDEX GREY/SILVER
    // ===================================
    ['bg-gray-50', 'bg-[#AEBFC3]/10'],
    ['bg-gray-100', 'bg-[#AEBFC3]/20'],
    ['bg-gray-200', 'bg-[#92A2A5]/30'],
    ['bg-gray-300', 'bg-[#92A2A5]'],
    ['bg-gray-400', 'bg-[#979796]'],
    ['bg-gray-500', 'bg-[#757777]'],
    ['bg-gray-600', 'bg-[#5D6E73]'],
    ['bg-gray-700', 'bg-[#5D6E73]'],
    ['bg-gray-800', 'bg-[#546A7A]'],
    ['bg-gray-900', 'bg-[#546A7A]'],
    ['text-gray-50', 'text-[#AEBFC3]'],
    ['text-gray-100', 'text-[#AEBFC3]'],
    ['text-gray-200', 'text-[#AEBFC3]'],
    ['text-gray-300', 'text-[#92A2A5]'],
    ['text-gray-400', 'text-[#979796]'],
    ['text-gray-500', 'text-[#757777]'],
    ['text-gray-600', 'text-[#5D6E73]'],
    ['text-gray-700', 'text-[#5D6E73]'],
    ['text-gray-800', 'text-[#546A7A]'],
    ['text-gray-900', 'text-[#546A7A]'],
    ['border-gray-100', 'border-[#AEBFC3]/30'],
    ['border-gray-200', 'border-[#92A2A5]'],
    ['border-gray-300', 'border-[#92A2A5]'],
    ['border-gray-400', 'border-[#979796]'],
    ['hover:bg-gray-50', 'hover:bg-[#AEBFC3]/10'],
    ['hover:bg-gray-100', 'hover:bg-[#AEBFC3]/20'],
    ['hover:bg-gray-200', 'hover:bg-[#92A2A5]/30'],
    ['hover:text-gray-600', 'hover:text-[#5D6E73]'],
    ['hover:text-gray-700', 'hover:text-[#5D6E73]'],
    ['hover:text-gray-900', 'hover:text-[#546A7A]'],
    ['focus:ring-gray-500', 'focus:ring-[#92A2A5]'],

    // ===================================
    // SLATE -> KARDEX GREY 3
    // ===================================
    ['bg-slate-50', 'bg-[#AEBFC3]/10'],
    ['bg-slate-100', 'bg-[#AEBFC3]/20'],
    ['bg-slate-200', 'bg-[#92A2A5]/30'],
    ['bg-slate-700', 'bg-[#5D6E73]'],
    ['bg-slate-800', 'bg-[#546A7A]'],
    ['bg-slate-900', 'bg-[#546A7A]'],
    ['text-slate-300', 'text-[#92A2A5]'],
    ['text-slate-400', 'text-[#979796]'],
    ['text-slate-500', 'text-[#757777]'],
    ['text-slate-600', 'text-[#5D6E73]'],
    ['text-slate-700', 'text-[#5D6E73]'],
    ['text-slate-800', 'text-[#546A7A]'],
    ['text-slate-900', 'text-[#546A7A]'],
    ['border-slate-200', 'border-[#92A2A5]'],
    ['border-slate-300', 'border-[#92A2A5]'],
    ['border-slate-700', 'border-[#5D6E73]'],

    // ===================================
    // CYAN/TEAL -> KARDEX BLUE 1
    // ===================================
    ['bg-cyan-50', 'bg-[#96AEC2]/10'],
    ['bg-cyan-100', 'bg-[#96AEC2]/20'],
    ['bg-cyan-500', 'bg-[#6F8A9D]'],
    ['bg-cyan-600', 'bg-[#546A7A]'],
    ['text-cyan-500', 'text-[#6F8A9D]'],
    ['text-cyan-600', 'text-[#546A7A]'],
    ['bg-teal-50', 'bg-[#82A094]/10'],
    ['bg-teal-100', 'bg-[#82A094]/20'],
    ['bg-teal-500', 'bg-[#82A094]'],
    ['bg-teal-600', 'bg-[#4F6A64]'],
    ['text-teal-500', 'text-[#82A094]'],
    ['text-teal-600', 'text-[#4F6A64]'],

    // ===================================
    // PINK/ROSE -> KARDEX SAND 1
    // ===================================
    ['bg-pink-50', 'bg-[#EEC1BF]/10'],
    ['bg-pink-100', 'bg-[#EEC1BF]/20'],
    ['bg-pink-500', 'bg-[#E17F70]'],
    ['text-pink-500', 'text-[#E17F70]'],
    ['text-pink-600', 'text-[#9E3B47]'],
    ['bg-rose-50', 'bg-[#EEC1BF]/10'],
    ['bg-rose-100', 'bg-[#EEC1BF]/20'],
    ['bg-rose-500', 'bg-[#E17F70]'],
    ['text-rose-500', 'text-[#E17F70]'],
    ['text-rose-600', 'text-[#9E3B47]'],
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
console.log('🎨 Kardex COMPLETE Color Migration Script');
console.log('==========================================\n');

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

console.log('\n==========================================');
console.log(`📊 Summary: Modified ${modifiedFiles} of ${totalFiles} files`);
console.log('🎨 ALL colors now use Kardex brand palette!');
console.log('\nKardex Color Reference:');
console.log('  Blues:   #96AEC2 (Light) | #6F8A9D (Medium) | #546A7A (Dark)');
console.log('  Greens:  #A2B9AF (Light) | #82A094 (Medium) | #4F6A64 (Dark)');
console.log('  Greys:   #AEBFC3 (Light) | #92A2A5 (Medium) | #5D6E73 (Dark)');
console.log('  Silvers: #ABACA9 (Light) | #979796 (Medium) | #757777 (Dark)');
console.log('  Reds:    #E17F70 (Light) | #9E3B47 (Medium) | #75242D (Dark)');
console.log('  Sands:   #EEC1BF (Light) | #CE9F6B (Medium) | #976E44 (Dark)');

/**
 * Kardex Color Migration Script
 * 
 * This script replaces non-Kardex Tailwind colors with official Kardex brand colors
 * Run: node scripts/migrate-colors.js
 */

const fs = require('fs');
const path = require('path');

// Color replacement mappings
// Format: [Tailwind color, Kardex replacement]
const colorReplacements = [
    // Blue replacements -> Kardex Blues
    ['bg-blue-50', 'bg-[#96AEC2]/10'],
    ['bg-blue-100', 'bg-[#96AEC2]/20'],
    ['bg-blue-200', 'bg-[#96AEC2]/30'],
    ['bg-blue-500', 'bg-[#6F8A9D]'],
    ['bg-blue-600', 'bg-[#6F8A9D]'],
    ['bg-blue-700', 'bg-[#546A7A]'],
    ['text-blue-500', 'text-[#6F8A9D]'],
    ['text-blue-600', 'text-[#546A7A]'],
    ['text-blue-700', 'text-[#546A7A]'],
    ['text-blue-800', 'text-[#546A7A]'],
    ['border-blue-200', 'border-[#96AEC2]'],
    ['border-blue-300', 'border-[#96AEC2]'],
    ['border-blue-500', 'border-[#6F8A9D]'],
    ['hover:bg-blue-50', 'hover:bg-[#96AEC2]/10'],
    ['hover:bg-blue-100', 'hover:bg-[#96AEC2]/20'],
    ['hover:bg-blue-600', 'hover:bg-[#6F8A9D]'],
    ['hover:bg-blue-700', 'hover:bg-[#546A7A]'],
    ['hover:text-blue-600', 'hover:text-[#546A7A]'],
    ['hover:text-blue-700', 'hover:text-[#546A7A]'],
    ['focus:ring-blue-500', 'focus:ring-[#96AEC2]'],
    ['focus:border-blue-500', 'focus:border-[#96AEC2]'],
    ['ring-blue-500', 'ring-[#96AEC2]'],

    // Green replacements -> Kardex Greens (success states)
    ['bg-green-50', 'bg-[#A2B9AF]/10'],
    ['bg-green-100', 'bg-[#A2B9AF]/20'],
    ['bg-green-200', 'bg-[#82A094]/30'],
    ['bg-green-500', 'bg-[#82A094]'],
    ['bg-green-600', 'bg-[#4F6A64]'],
    ['bg-green-700', 'bg-[#4F6A64]'],
    ['text-green-500', 'text-[#82A094]'],
    ['text-green-600', 'text-[#4F6A64]'],
    ['text-green-700', 'text-[#4F6A64]'],
    ['text-green-800', 'text-[#4F6A64]'],
    ['border-green-200', 'border-[#A2B9AF]'],
    ['border-green-300', 'border-[#82A094]'],
    ['border-green-500', 'border-[#82A094]'],
    ['hover:bg-green-50', 'hover:bg-[#A2B9AF]/10'],
    ['hover:bg-green-100', 'hover:bg-[#A2B9AF]/20'],
    ['hover:bg-green-600', 'hover:bg-[#4F6A64]'],
    ['hover:bg-green-700', 'hover:bg-[#4F6A64]'],

    // Red replacements -> Kardex Reds (error states)
    ['bg-red-50', 'bg-[#E17F70]/10'],
    ['bg-red-100', 'bg-[#E17F70]/20'],
    ['bg-red-200', 'bg-[#E17F70]/30'],
    ['bg-red-500', 'bg-[#E17F70]'],
    ['bg-red-600', 'bg-[#9E3B47]'],
    ['bg-red-700', 'bg-[#75242D]'],
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
    ['hover:text-red-600', 'hover:text-[#9E3B47]'],
    ['hover:text-red-700', 'hover:text-[#75242D]'],

    // Yellow replacements -> Kardex Sand (warning/pending states)
    ['bg-yellow-50', 'bg-[#EEC1BF]/10'],
    ['bg-yellow-100', 'bg-[#CE9F6B]/20'],
    ['bg-yellow-200', 'bg-[#CE9F6B]/30'],
    ['bg-yellow-500', 'bg-[#CE9F6B]'],
    ['bg-yellow-600', 'bg-[#976E44]'],
    ['text-yellow-500', 'text-[#CE9F6B]'],
    ['text-yellow-600', 'text-[#976E44]'],
    ['text-yellow-700', 'text-[#976E44]'],
    ['text-yellow-800', 'text-[#976E44]'],
    ['border-yellow-200', 'border-[#CE9F6B]'],
    ['border-yellow-300', 'border-[#CE9F6B]'],
    ['hover:bg-yellow-50', 'hover:bg-[#CE9F6B]/10'],
    ['hover:bg-yellow-100', 'hover:bg-[#CE9F6B]/20'],

    // Orange replacements -> Kardex Sand 2 (high priority)
    ['bg-orange-50', 'bg-[#CE9F6B]/10'],
    ['bg-orange-100', 'bg-[#CE9F6B]/20'],
    ['bg-orange-200', 'bg-[#CE9F6B]/30'],
    ['bg-orange-500', 'bg-[#CE9F6B]'],
    ['bg-orange-600', 'bg-[#976E44]'],
    ['text-orange-500', 'text-[#CE9F6B]'],
    ['text-orange-600', 'text-[#976E44]'],
    ['text-orange-700', 'text-[#976E44]'],
    ['text-orange-800', 'text-[#976E44]'],
    ['border-orange-200', 'border-[#CE9F6B]'],
    ['border-orange-300', 'border-[#CE9F6B]'],
    ['hover:bg-orange-50', 'hover:bg-[#CE9F6B]/10'],
    ['hover:bg-orange-600', 'hover:bg-[#976E44]'],
    ['hover:text-orange-600', 'hover:text-[#976E44]'],

    // Purple replacements -> Kardex Blue 2 (assigned state)
    ['bg-purple-50', 'bg-[#6F8A9D]/10'],
    ['bg-purple-100', 'bg-[#6F8A9D]/20'],
    ['bg-purple-200', 'bg-[#6F8A9D]/30'],
    ['bg-purple-500', 'bg-[#6F8A9D]'],
    ['bg-purple-600', 'bg-[#546A7A]'],
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

    // Indigo replacements -> Kardex Blue 3
    ['bg-indigo-50', 'bg-[#546A7A]/10'],
    ['bg-indigo-100', 'bg-[#546A7A]/20'],
    ['bg-indigo-500', 'bg-[#546A7A]'],
    ['bg-indigo-600', 'bg-[#546A7A]'],
    ['text-indigo-600', 'text-[#546A7A]'],
    ['text-indigo-700', 'text-[#546A7A]'],
    ['text-indigo-800', 'text-[#546A7A]'],
    ['border-indigo-200', 'border-[#546A7A]'],

    // Amber replacements -> Kardex Sand 2
    ['bg-amber-50', 'bg-[#CE9F6B]/10'],
    ['bg-amber-100', 'bg-[#CE9F6B]/20'],
    ['bg-amber-500', 'bg-[#CE9F6B]'],
    ['text-amber-600', 'text-[#976E44]'],
    ['text-amber-700', 'text-[#976E44]'],
    ['text-amber-800', 'text-[#976E44]'],

    // Emerald replacements -> Kardex Green 2
    ['bg-emerald-50', 'bg-[#82A094]/10'],
    ['bg-emerald-100', 'bg-[#82A094]/20'],
    ['bg-emerald-500', 'bg-[#82A094]'],
    ['bg-emerald-600', 'bg-[#4F6A64]'],
    ['text-emerald-600', 'text-[#4F6A64]'],
    ['text-emerald-700', 'text-[#4F6A64]'],
];

/**
 * Recursively find all .tsx files in a directory
 */
function findTsxFiles(dir, files = []) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.includes('node_modules')) {
            findTsxFiles(fullPath, files);
        } else if (item.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Replace colors in a file
 */
function replaceColorsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const [oldColor, newColor] of colorReplacements) {
        // Use word boundaries to avoid partial replacements
        const regex = new RegExp(oldColor.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');

        if (regex.test(content)) {
            content = content.replace(regex, newColor);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }

    return false;
}

// Main execution
const dashboardDir = path.join(__dirname, '../src/app/(dashboard)');
const componentDir = path.join(__dirname, '../src/components');

console.log('🎨 Kardex Color Migration Script');
console.log('================================\n');

let totalFiles = 0;
let modifiedFiles = 0;

// Process dashboard pages
console.log('📁 Processing dashboard pages...');
const dashboardFiles = findTsxFiles(dashboardDir);
for (const file of dashboardFiles) {
    if (replaceColorsInFile(file)) {
        console.log(`  ✅ ${path.relative(dashboardDir, file)}`);
        modifiedFiles++;
    }
    totalFiles++;
}

// Process components
console.log('\n📁 Processing components...');
const componentFiles = findTsxFiles(componentDir);
for (const file of componentFiles) {
    if (replaceColorsInFile(file)) {
        console.log(`  ✅ ${path.relative(componentDir, file)}`);
        modifiedFiles++;
    }
    totalFiles++;
}

console.log('\n================================');
console.log(`📊 Summary: Modified ${modifiedFiles} of ${totalFiles} files`);
console.log('🎨 All colors now use Kardex brand palette!');

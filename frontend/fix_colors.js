const fs = require('fs');
const path = require('path');

function replaceColors(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
        .replace(/text-gray-900/g, 'text-gray-100')
        .replace(/text-gray-800/g, 'text-gray-200')
        .replace(/text-gray-700/g, 'text-gray-300')
        .replace(/text-gray-600/g, 'text-gray-400')
        .replace(/text-gray-500/g, 'text-gray-400')
        .replace(/bg-gray-50/g, 'bg-white/5')
        .replace(/bg-gray-100/g, 'bg-white/10')
        .replace(/bg-white/g, 'bg-transparent')
        .replace(/text-black/g, 'text-white')
        .replace(/border-gray-200/g, 'border-white/10')
        .replace(/border-gray-300/g, 'border-white/20');
        
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Updated: ' + filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceColors(fullPath);
        }
    }
}

walkDir('/Users/msagastya/Desktop/Projects/raghhav-roadways/frontend/src/app/(dashboard)');
walkDir('/Users/msagastya/Desktop/Projects/raghhav-roadways/frontend/src/components');

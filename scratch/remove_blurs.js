const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('backdrop-blur-')) {
                const newContent = content.replace(/backdrop-blur-[^\s"'\`]+/g, '');
                fs.writeFileSync(fullPath, newContent);
                console.log('Processed', fullPath);
            }
        }
    }
}
processDir('e:/temp4/app');
processDir('e:/temp4/components');

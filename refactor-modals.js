const fs = require('fs');
const path = require('path');

const modalsDir = path.join(__dirname, 'components', 'modals');
// We will apply this to ALL modal files except KonohaModal and UserManagementModal
const files = fs.readdirSync(modalsDir).filter(f => f.endsWith('Modal.tsx') && f !== 'KonohaModal.tsx' && f !== 'UserManagementModal.tsx' && f !== 'ConstructionModal.tsx');

const colorMap = {
    'blue': { color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
    'orange': { color: '#F97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)' },
    'emerald': { color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
    'green': { color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
    'red': { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
    'purple': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
    'gold': { color: '#EAB308', bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.3)' },
    'yellow': { color: '#EAB308', bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.3)' },
    'cyan': { color: '#06B6D4', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)' },
    'amber': { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
    'steel': { color: '#6B7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)' },
    'slate': { color: '#64748b', bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)' },
    'violet': { color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)' },
    'crimson': { color: '#DC2626', bg: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.3)' },
    'pink': { color: '#EC4899', bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)' },
    'lavender': { color: '#A855F7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)' },
    'bronze': { color: '#D97706', bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.3)' },
    'sky': { color: '#0EA5E9', bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.3)' }
};

for (const file of files) {
    const filePath = path.join(modalsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has KonohaModal
    if (content.includes('import KonohaModal')) {
        console.log(`Skipping ${file} as it already has KonohaModal`);
        continue;
    }

    content = content.replace(/(import.*from 'lucide-react'.*\n)/, "$1import KonohaModal from './KonohaModal'\n");

    // Extract title
    const titleMatch = content.match(/<h2[^>]*>(.*?)<\/h2>/);
    let title = titleMatch ? titleMatch[1] : file.replace('Modal.tsx', '');
    title = title.replace(/\{.*?\}/g, '').trim();

    // Extract icon and color
    let iconName = 'Settings2';
    let iconColorStr = 'slate';
    const iconMatch = content.match(/<([A-Z][a-zA-Z0-9]+)\s+className="[^"]*text-([a-z]+)-[0-9]+[^"]*"/);
    if (iconMatch) {
        iconName = iconMatch[1];
        iconColorStr = iconMatch[2];
    } else {
        const altMatch = content.match(/<([A-Z][a-zA-Z0-9]+)\s+className="[^"]*w-[0-9]+\s+h-[0-9]+[^"]*text-([a-z]+)-/);
        if (altMatch) {
            iconName = altMatch[1];
            iconColorStr = altMatch[2];
        }
    }

    const cMap = colorMap[iconColorStr] || colorMap['slate'];

    // Extract save function name
    let saveFn = 'handleSave';
    if (content.includes('saveSettings')) saveFn = 'saveSettings';
    if (content.includes('onSave')) saveFn = 'onSave';

    // Extract inner content from scrollbar-thin
    // The previous regex was: /<div className="flex-1 overflow-y-auto overflow-x-hidden[^>]*>([\s\S]*?)<\/div>\s*\{\/\* Footer \*\/\}/
    // Let's make it robust by finding exactly where the "Footer" comment starts.
    const contentRegex = /<div className="flex-1 overflow-y-auto overflow-x-hidden[^>]*>([\s\S]*?)<\/div>\s*(?:\{\/\*\s*Footer\s*\*\/\})/;
    const contentMatch = content.match(contentRegex);
    if (!contentMatch) {
        console.log(`Could not find inner content in ${file}, skipping.`);
        continue;
    }
    
    let innerContent = contentMatch[1].trim();

    // Replace everything from the component's render "if (!iggId)" up to the end
    // Use a very specific regex so it doesn't match the inner if (!iggId) in loadSettings
    const returnRegex = /if \(!iggId\) \{\s*return \(\s*<AnimatePresence>[\s\S]*$/;
    
    const newReturn = `if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="${title}"
                iggId={iggId}
                icon={${iconName}}
                iconColor="${cMap.color}"
                iconBg="${cMap.bg}"
                iconBorder="${cMap.border}"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="${title}"
            iggId={iggId}
            icon={${iconName}}
            iconColor="${cMap.color}"
            iconBg="${cMap.bg}"
            iconBorder="${cMap.border}"
            saving={saving}
            onSave={${saveFn}}
            maxWidth="860px"
        >
            ${innerContent}
        </KonohaModal>
    )
}`;

    if (!returnRegex.test(content)) {
        console.log(`Could not find main return block in ${file}, skipping.`);
        continue;
    }

    content = content.replace(returnRegex, newReturn.trim());
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${file}`);
}

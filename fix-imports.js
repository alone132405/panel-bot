const fs = require('fs');
const path = require('path');

const modalsDir = path.join(__dirname, 'components', 'modals');
const files = fs.readdirSync(modalsDir).filter(f => f.endsWith('Modal.tsx') && f !== 'KonohaModal.tsx' && f !== 'UserManagementModal.tsx' && f !== 'ConstructionModal.tsx' && f !== 'HeroesModal.tsx');

for (const file of files) {
    const filePath = path.join(modalsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('import KonohaModal')) {
        content = content.replace(/(import \{ toast \} from 'sonner'\r?\n)/, "$1import KonohaModal from './KonohaModal'\n");
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Added import to ${file}`);
    }
}

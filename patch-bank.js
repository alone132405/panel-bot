const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/dashboard/bank/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Main Wrapper
content = content.replace('<div className="p-3 sm:p-6 space-y-4 sm:space-y-6">', '<div className="min-h-screen bg-[#07070E] p-7 md:p-8 space-y-5">');

// Replace Header Text
content = content.replace(
    /<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">\s*<div>\s*<h1[^>]*>Protocol Configuration<\/h1>\s*<p[^>]*>Configure guild bank commands and authorized users<\/p>\s*<\/div>/g,
    `<motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
        <div>
            <div className="flex items-center gap-2 mb-1.5">
                <div className="w-[3px] h-[16px] bg-[#00FFB2] rounded-sm"></div>
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#00FFB2] font-bold">BANK MODULE</span>
            </div>
            <h1 className="font-sans text-[24px] font-bold text-[#F0F4FF] tracking-[0.04em] mb-1">VAULT SYSTEMS</h1>
            <p className="font-sans text-[13px] text-[#6B7A99]">Configure guild bank commands and authorized access</p>
        </div>`
);

// Replace IggId Selector div
content = content.replace(
    /<div className="w-full md:w-80">/g,
    '<div className="w-full md:w-auto">'
);

// Close motion div for Header
content = content.replace(
    /<\/IggIdSelector>\s*<\/div>\s*<\/div>/g,
    `</IggIdSelector>\n                </div>\n            </motion.div>`
);

// Replace "Select an IGG ID"
content = content.replace(
    /<div className="bg-bg-surface border border-border rounded-\[14px\] p-12 text-center">[\s\S]*?<\/div>\s*\)\s*:\s*loading\s*\?\s*\(/g,
    `<motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0F0F1A] border border-[rgba(123,94,255,0.15)] rounded-[14px] p-12 text-center flex flex-col items-center justify-center"
    >
        <div className="w-16 h-16 bg-[rgba(123,94,255,0.06)] border border-[rgba(123,94,255,0.15)] rounded-[14px] flex items-center justify-center mb-5">
            <Database className="w-8 h-8 text-[#7B5EFF] opacity-80" />
        </div>
        <h3 className="font-sans text-[16px] font-bold text-[#F0F4FF] mb-2 tracking-wide">NO ID SELECTED</h3>
        <p className="font-sans text-[13px] text-[#6B7A99]">Select an IGG ID from the top menu to access Vault Systems</p>
    </motion.div>
) : loading ? (`
);

// Replace Enable Bank Card
content = content.replace(
    /\{\/\* Enable Bank Toggle Card \*\/\}[\s\S]*?<\/motion\.div>/,
    `{/* Enable Bank Toggle Card */}
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F0F1A] border border-[rgba(123,94,255,0.15)] rounded-[14px] p-4 md:p-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
        <div className="flex items-center gap-4">
            <div className="w-[40px] h-[40px] bg-[rgba(123,94,255,0.12)] border border-[rgba(123,94,255,0.25)] rounded-[10px] flex items-center justify-center flex-shrink-0">
                <Database className="w-[18px] h-[18px] text-[#7B5EFF]" />
            </div>
            <div>
                <h3 className="font-sans text-[15px] font-semibold text-[#F0F4FF]">Enable Guild Bank / Commands</h3>
                <p className="font-sans text-[12px] text-[#6B7A99] mt-0.5">Allow bank commands and resource transfers</p>
            </div>
        </div>
        <button
            onClick={toggleBankEnabled}
            className={\`relative w-[48px] h-[26px] rounded-[13px] transition-colors duration-[0.2s] flex-shrink-0\`}
            style={{ 
                background: settings.enableBank ? 'linear-gradient(135deg, #00FFB2, #7B5EFF)' : '#161626',
                border: settings.enableBank ? 'none' : '1px solid rgba(123,94,255,0.15)'
            }}
        >
            <motion.div 
                layout
                className="absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow-sm" 
                style={{
                    left: settings.enableBank ? 'auto' : '2px',
                    right: settings.enableBank ? '2px' : 'auto'
                }}
            />
        </button>
    </motion.div>`
);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched layout and header');

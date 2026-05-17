const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/dashboard/bank/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the unclosed motion.div
content = content.replace(
    /onSelect=\{setSelectedIggId\}\n\s*\/\>\n\s*<\/div>\n\s*<\/div>/g,
    `onSelect={setSelectedIggId}\n                    />\n                </div>\n            </motion.div>`
);

// Tabs
content = content.replace(
    /<div className="bg-bg-elevated rounded-\[10px\] p-1 flex gap-1 mb-6 relative">[\s\S]*?<\/div>/,
    `<div className="bg-[#161626] border border-[rgba(123,94,255,0.15)] rounded-[12px] p-1 flex gap-1 mb-5 relative">
    {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'users' | 'commands')}
                className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[9px] font-sans text-[13px] font-medium transition-all duration-200 z-10"
                style={{
                    color: isActive ? '#F0F4FF' : '#6B7A99',
                    background: isActive ? 'linear-gradient(135deg, rgba(123,94,255,0.2), rgba(0,255,178,0.10))' : 'transparent',
                    border: isActive ? '1px solid rgba(123,94,255,0.15)' : '1px solid transparent'
                }}
            >
                <Icon className="w-[14px] h-[14px]" />
                <span>{tab.label}</span>
            </button>
        )
    })}
</div>`
);

// Options Panel (Row 1, Row 2 chips and Row 3 parameters) is part of "Users" and "Commands" tab content.
// Since the instruction says "Vault Systems" design, I'll update the inner container classes for now.
content = content.replace(/bg-bg-surface border border-border rounded-\[14px\]/g, 'bg-[#0F0F1A] border border-[rgba(123,94,255,0.15)] rounded-[14px]');
content = content.replace(/bg-bg-elevated border-b border-border/g, 'bg-[#161626] border-b border-[rgba(123,94,255,0.15)]');
content = content.replace(/bg-bg-elevated\/50/g, 'bg-[#161626]/50');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed syntax and updated tabs');

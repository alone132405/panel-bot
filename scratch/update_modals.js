const fs = require('fs');
const path = require('path');

const modalsDir = path.join(__dirname, '..', 'components', 'modals');

const files = fs.readdirSync(modalsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(modalsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Modal Container
    content = content.replace(
        /className="fixed inset-1 sm:inset-2 md:inset-10 lg:inset-20 bg-background-secondary rounded-xl md:rounded-2xl border border-white\/10 shadow-2xl z-50 flex flex-col overflow-hidden"/g,
        'className="fixed inset-4 md:inset-10 lg:inset-20 bg-bg-base rounded-2xl border border-border shadow-2xl z-50 flex flex-col overflow-hidden"'
    );
    
    // 2. Header
    content = content.replace(
        /className="flex items-center justify-between px-3 md:px-6 py-2\.5 md:py-4 border-b border-white\/10 bg-background-tertiary\/50"/g,
        'className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-surface"'
    );

    // Header Title and Subtitle
    content = content.replace(
        /<h2 className="text-sm md:text-2xl font-bold text-white truncate">/g,
        '<h2 className="font-orbitron text-xl font-bold text-text-primary tracking-wide truncate">'
    );
    content = content.replace(
        /<p className="text-\[10px\] md:text-sm text-gray-400 truncate">/g,
        '<p className="font-mono text-xs text-text-muted truncate">'
    );

    // Header Icon
    content = content.replace(
        /<div className="hidden md:flex w-10 h-10 rounded-xl bg-primary-500\/20 items-center justify-center flex-shrink-0">/g,
        '<div className="hidden md:flex w-10 h-10 rounded-xl bg-accent-1/10 border border-accent-1/20 items-center justify-center flex-shrink-0">'
    );
    content = content.replace(
        /<Settings className="w-5 h-5 text-primary-400" \/>/g,
        '<Settings className="w-5 h-5 text-accent-1" />'
    );
    content = content.replace(
        /<div className="flex md:hidden w-8 h-8 rounded-lg bg-primary-500\/20 items-center justify-center flex-shrink-0">/g,
        '<div className="flex md:hidden w-8 h-8 rounded-lg bg-accent-1/10 border border-accent-1/20 items-center justify-center flex-shrink-0">'
    );

    // Close Button
    content = content.replace(
        /className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors flex-shrink-0"/g,
        'className="w-10 h-10 rounded-xl bg-bg-elevated hover:bg-accent-3/10 hover:text-accent-3 text-text-muted flex items-center justify-center transition-colors flex-shrink-0"'
    );

    // 3. Tabs
    content = content.replace(
        /<div[^>]*className="flex gap-1\.5 md:gap-2 px-2 md:px-6 py-2 md:py-3 border-b border-white\/5 bg-background-tertiary\/30 overflow-x-auto scrollbar-none md:scrollbar-thin"[^>]*>([\s\S]*?)<\/div>/,
        (match, inner) => {
            return `<div className="px-6 py-4 border-b border-border bg-bg-base shrink-0">
                            <div
                                ref={tabsContainerRef}
                                className="inline-flex gap-1 p-1 bg-bg-elevated rounded-xl border border-border overflow-x-auto scrollbar-none"
                            >
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        data-tab={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={\`px-4 py-2 rounded-[10px] text-[13px] font-medium whitespace-nowrap transition-all flex items-center gap-2 \${activeTab === tab
                                            ? 'bg-bg-surface border border-accent-1/20 text-accent-1 shadow-glow-mint'
                                            : 'text-text-muted hover:text-text-primary border border-transparent'
                                            }\`}
                                    >
                                        {activeTab === tab && <div className="w-1.5 h-1.5 rounded-full bg-accent-1" />}
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>`;
        }
    );

    // 4. Form Cards (Setting items)
    content = content.replace(
        /className={`flex items-center justify-between p-3 md:p-4 transition-all\s+glass-card md:bg-none md:rounded-xl md:border-none md:shadow-none md:\s+\${isDisabled\s+\? 'opacity-60 md:bg-surface\/20 md:opacity-50 cursor-not-allowed'\s+: 'md:bg-surface\/50 md:hover:bg-surface'\s+}`}/g,
        'className={`flex items-center justify-between p-4 bg-bg-surface border border-border rounded-xl mb-3 transition-colors ${isDisabled ? \'opacity-50 cursor-not-allowed\' : \'hover:border-accent-1/30\'}`}'
    );

    // Item label text
    content = content.replace(
        /className={`text-xs md:text-sm flex-1 pr-2 \${isDisabled \? 'text-gray-500' : 'text-gray-200 md:text-gray-300'\s+}`}/g,
        'className={`font-sans text-[14px] font-medium flex-1 pr-4 ${isDisabled ? \'text-text-muted\' : \'text-text-primary\'}`}'
    );

    // 5. Input Fields
    // Number input
    content = content.replace(
        /className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white\/10 rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500\/50 disabled:opacity-50"/g,
        'className="w-24 px-3 py-2 bg-[#0B0B18] border border-border rounded-lg font-mono text-[13px] text-text-primary text-center focus:outline-none focus:border-accent-1/50 transition-colors disabled:opacity-50"'
    );
    // String input
    content = content.replace(
        /className="w-24 md:w-40 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white\/10 rounded md:rounded-lg text-xs md:text-sm text-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500\/50 disabled:opacity-50"/g,
        'className="w-40 px-3 py-2 bg-[#0B0B18] border border-border rounded-lg font-mono text-[13px] text-text-primary focus:outline-none focus:border-accent-1/50 transition-colors disabled:opacity-50"'
    );
    // Time input
    content = content.replace(
        /className="w-24 md:w-40 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white\/10 rounded md:rounded-lg text-xs md:text-sm text-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500\/50 disabled:opacity-50"/g,
        'className="w-40 px-3 py-2 bg-[#0B0B18] border border-border rounded-lg font-mono text-[13px] text-text-primary text-center focus:outline-none focus:border-accent-1/50 transition-colors disabled:opacity-50"'
    );

    // Mobile Toggle switch
    content = content.replace(
        /className={`w-9 h-5 rounded-full peer transition-colors \${isDisabled \? 'bg-gray-700' : 'bg-gray-600 peer-checked:bg-primary-500'\s+} peer-focus:ring-2 peer-focus:ring-primary-500\/50 after:content-\[''\] after:absolute after:top-0\.5 after:left-0\.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4`}<\/div>/g,
        'className={`w-10 h-6 rounded-full peer transition-colors ${isDisabled ? \'bg-bg-elevated\' : \'bg-[#0B0B18] peer-checked:bg-accent-1\'} border border-border peer-focus:border-accent-1/50 after:content-[\'\'] after:absolute after:top-1 after:left-1 after:bg-text-primary after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 peer-checked:after:bg-[#07070E]`}></div>'
    );

    // Desktop Checkbox
    content = content.replace(
        /className="hidden md:block w-5 h-5 rounded bg-background-tertiary border-white\/10 text-primary-500 focus:ring-2 focus:ring-primary-500\/50 disabled:opacity-50"/g,
        'className="hidden md:block w-5 h-5 rounded bg-[#0B0B18] border-border text-accent-1 focus:ring-accent-1/50 focus:ring-offset-0 disabled:opacity-50"'
    );

    // 6. Footer
    content = content.replace(
        /className="flex items-center justify-between gap-2 px-2 md:px-6 py-2 md:py-4 border-t border-white\/10 bg-background-tertiary\/50"/g,
        'className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-bg-surface"'
    );
    
    // Gradient Save Button
    content = content.replace(
        /className="flex-1 md:flex-none md:px-6 py-2 md:py-2\.5 rounded-lg md:rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"/g,
        'className="px-8 py-3 rounded-xl bg-gradient-to-br from-accent-1 to-accent-2 text-[#07070E] font-sans text-[14px] font-bold flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-glow-mint transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed"'
    );

    // Close button in footer
    content = content.replace(
        /className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2\.5 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover text-gray-300 text-sm font-medium transition-colors"/g,
        'className="px-6 py-3 rounded-xl border border-border bg-transparent hover:bg-bg-elevated text-text-primary font-sans text-[14px] transition-colors"'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
}

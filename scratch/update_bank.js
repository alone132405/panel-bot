const fs = require('fs');
const path = require('path');

const bankFile = path.join(__dirname, '..', 'app', 'dashboard', 'bank', 'page.tsx');
let content = fs.readFileSync(bankFile, 'utf8');

// Header
content = content.replace(
    /<h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Bank Settings<\/h1>\s*<p className="text-gray-400 text-sm sm:text-base">Configure guild bank commands and authorized users<\/p>/,
    `<h1 className="font-orbitron text-xl sm:text-3xl font-bold text-text-primary mb-1 sm:mb-2 tracking-wide">Protocol Configuration</h1>
                    <p className="font-sans text-sm sm:text-base text-text-muted">Configure guild bank commands and authorized users</p>`
);

// Empty State Select IGG
content = content.replace(
    /className="glass-card p-12 text-center"/g,
    'className="bg-bg-surface border border-border rounded-[14px] p-12 text-center"'
);
content = content.replace(
    /<Database className="w-16 h-16 text-gray-500 mx-auto mb-4" \/>\s*<h3 className="text-xl font-bold text-white mb-2">Select an IGG ID<\/h3>\s*<p className="text-gray-400">Choose an IGG ID from the dropdown above to configure bank settings<\/p>/,
    `<div className="w-20 h-20 bg-bg-elevated rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-violet border border-border"><Database className="w-10 h-10 text-text-muted opacity-50" /></div>
                    <h3 className="font-sans text-[16px] font-bold text-text-primary mb-2">Select an IGG ID</h3>
                    <p className="font-sans text-[14px] text-text-muted">Choose an IGG ID from the dropdown above to configure bank settings</p>`
);

// Enable Bank Toggle
content = content.replace(
    /<motion\.div\s*initial=\{\{ opacity: 0, y: 20 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*className="glass-card p-6"\s*>/,
    `<motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-bg-surface border border-border rounded-[14px] p-6 mb-6 transition-all duration-300"
                    >`
);
content = content.replace(
    /<div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">/g,
    '<div className="w-12 h-12 bg-accent-2/10 border border-accent-2/20 rounded-xl flex items-center justify-center">'
);
content = content.replace(
    /<Database className="w-6 h-6 text-white" \/>/g,
    '<Database className="w-6 h-6 text-accent-2" />'
);
content = content.replace(
    /<h3 className="text-lg font-bold text-white">Enable Guild Bank \/ Commands<\/h3>/,
    '<h3 className="font-sans text-[16px] font-bold text-text-primary">Enable Guild Bank / Commands</h3>'
);
content = content.replace(
    /<p className="text-gray-400 text-sm">Allow bank commands and resource transfers<\/p>/,
    '<p className="font-sans text-text-muted text-[13px]">Allow bank commands and resource transfers</p>'
);
content = content.replace(
    /className=\{\`relative w-14 h-8 rounded-full transition-colors \$\{settings\.enableBank \? 'bg-accent-emerald' : 'bg-gray-600'\s*\}\`\}/,
    'className={`relative w-14 h-8 rounded-full transition-colors ${settings.enableBank ? \'bg-accent-1\' : \'bg-bg-elevated border border-border\'}`}'
);
content = content.replace(
    /className=\{\`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform \$\{settings\.enableBank \? 'left-7' : 'left-1'\s*\}\`\} \/>/,
    'className={`absolute top-1 w-6 h-6 rounded-full shadow transition-transform ${settings.enableBank ? \'bg-[#07070E] left-7 shadow-glow-mint\' : \'bg-text-muted left-1\'}`} />'
);

// Tabs
content = content.replace(
    /<div className="glass-card p-1\.5 sm:p-2 flex gap-1\.5 sm:gap-2">([\s\S]*?)<\/div>/,
    `<div className="bg-bg-elevated rounded-[10px] p-1 flex gap-1 mb-6 relative">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'users' | 'commands')}
                                    className={\`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-[8px] font-sans text-[14px] font-bold transition-all z-10 \${isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}\`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="bankTabIndicator"
                                            className="absolute inset-0 bg-bg-surface border border-border rounded-[8px] -z-10 shadow-glow-violet"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <Icon className={\`w-4 h-4 sm:w-5 sm:h-5 \${isActive ? 'text-accent-2' : ''}\`} />
                                    <span className="hidden xs:inline">{tab.label}</span>
                                    <span className="xs:hidden">{tab.id === 'users' ? 'Users' : 'Commands'}</span>
                                </button>
                            )
                        })}
                    </div>`
);

// Action Bar (Users)
content = content.replace(
    /<div className="glass-card p-3 sm:p-4">\s*<div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">\s*<div className="flex gap-2">\s*<button\s*onClick=\{\(\) => setShowAddUserModal\(true\)\}\s*className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2\.5 bg-primary-500\/10 text-primary-400 rounded-lg sm:rounded-xl hover:bg-primary-500\/20 transition-colors font-medium text-sm sm:text-base"\s*>\s*<UserPlus className="w-4 h-4" \/>\s*Add User\s*<\/button>\s*<button\s*onClick=\{clearAllUsers\}\s*className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2\.5 bg-accent-rose\/10 text-accent-rose rounded-lg sm:rounded-xl hover:bg-accent-rose\/20 transition-colors font-medium text-sm sm:text-base"\s*>\s*<Trash2 className="w-4 h-4" \/>\s*Clear\s*<\/button>\s*<\/div>\s*<div className="hidden sm:block flex-1" \/>\s*\{\/\* Checkboxes \*\/}\s*<div className="flex flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white\/5">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/,
    `<div className="bg-bg-surface border border-border rounded-[14px] p-4 mb-4">
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 sm:gap-6">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowAddUserModal(true)}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-br from-accent-2 to-[#5D42E6] text-white rounded-xl hover:brightness-110 hover:shadow-glow-violet transition-all font-sans text-[14px] font-bold"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Add User
                                            </button>

                                            <button
                                                onClick={clearAllUsers}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-accent-3 text-accent-3 rounded-xl hover:bg-accent-3/10 transition-colors font-sans text-[14px] font-bold"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Clear
                                            </button>
                                        </div>
                                        <div className="hidden sm:block flex-1" />
                                        {/* Toggles */}
                                        <div className="flex flex-wrap gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className={\`relative w-10 h-6 rounded-full transition-colors \${settings.allowAdminBalance ? 'bg-accent-1' : 'bg-bg-elevated border border-border'}\`}>
                                                    <div className={\`absolute top-1 w-4 h-4 rounded-full transition-transform \${settings.allowAdminBalance ? 'bg-[#07070E] left-5' : 'bg-text-muted left-1'}\`} />
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.allowAdminBalance}
                                                    onChange={() => setSettings({ ...settings, allowAdminBalance: !settings.allowAdminBalance })}
                                                    className="hidden"
                                                />
                                                <span className="font-sans text-[13px] text-text-primary font-medium">Use Balance</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className={\`relative w-10 h-6 rounded-full transition-colors \${settings.allowAdminSkipLimit ? 'bg-accent-1' : 'bg-bg-elevated border border-border'}\`}>
                                                    <div className={\`absolute top-1 w-4 h-4 rounded-full transition-transform \${settings.allowAdminSkipLimit ? 'bg-[#07070E] left-5' : 'bg-text-muted left-1'}\`} />
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.allowAdminSkipLimit}
                                                    onChange={() => setSettings({ ...settings, allowAdminSkipLimit: !settings.allowAdminSkipLimit })}
                                                    className="hidden"
                                                />
                                                <span className="font-sans text-[13px] text-text-primary font-medium">Bypass Rss Limit</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>`
);

// Empty State Users
content = content.replace(
    /\{pendingRequests\.length > 0 && \(/,
    `{pendingRequests.length > 0 ? (`
);
content = content.replace(
    /<\/div>\s*<\/>\s*\)}/,
    `</div>
                                    </>
                                ) : (
                                    <div className="bg-bg-surface border border-border rounded-[14px] p-12 flex flex-col items-center justify-center text-center mt-4">
                                        <div className="w-20 h-20 bg-bg-elevated rounded-full flex items-center justify-center mb-6 shadow-glow-violet border border-border">
                                            <Database className="w-10 h-10 text-text-muted opacity-50" />
                                        </div>
                                        <h3 className="font-sans text-[16px] font-bold text-text-primary mb-2">No users authorized yet</h3>
                                        <p className="font-sans text-[14px] text-text-muted mb-6">Add users to grant bank command access</p>
                                        <button
                                            onClick={() => setShowAddUserModal(true)}
                                            className="px-6 py-3 rounded-xl bg-gradient-to-br from-accent-2 to-[#5D42E6] text-white font-sans text-[14px] font-bold flex items-center gap-2 hover:brightness-110 hover:shadow-glow-violet transition-all"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Add First User
                                        </button>
                                    </div>
                                )}`
);

// Save Changes Button
content = content.replace(
    /<motion\.div\s*initial=\{\{ opacity: 0, y: 20 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*transition=\{\{ delay: 0\.3 \}\}\s*className="flex justify-center"\s*>\s*<button\s*onClick=\{saveSettings\}\s*className="btn-primary w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 shadow-glow hover:shadow-glow-lg transition-all"\s*>\s*<Save className="w-5 h-5 sm:w-6 sm:h-6" \/>\s*Save Changes\s*<\/button>\s*<\/motion\.div>/,
    `<motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex justify-center mt-8"
                        >
                            <button
                                onClick={saveSettings}
                                className="group px-8 py-4 rounded-[10px] bg-gradient-to-br from-accent-1 to-accent-2 text-[#07070E] font-sans text-[15px] font-bold flex items-center gap-3 hover:shadow-glow-mint hover:brightness-110 transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                Save Changes
                            </button>
                        </motion.div>`
);

// Apply Changes to Bot Button
content = content.replace(
    /className="btn-primary px-12 py-4 text-lg flex items-center gap-3 shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"/g,
    'className="group px-8 py-4 rounded-[10px] bg-gradient-to-br from-accent-1 to-accent-2 text-[#07070E] font-sans text-[15px] font-bold flex items-center gap-3 hover:shadow-glow-mint hover:brightness-110 transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"'
);

// All "glass-card" replacements
content = content.replace(/className="hidden md:block glass-card overflow-hidden"/g, 'className="hidden md:block bg-bg-surface border border-border rounded-[14px] overflow-hidden"');
content = content.replace(/className="glass-card p-3 sm:p-4"/g, 'className="bg-bg-surface border border-border rounded-[14px] p-4"');
content = content.replace(/className="glass-card p-3"/g, 'className="bg-bg-surface border border-border rounded-[14px] p-4"');
content = content.replace(/className="glass-card overflow-hidden hidden sm:block"/g, 'className="bg-bg-surface border border-border rounded-[14px] overflow-hidden hidden sm:block"');
content = content.replace(/className="glass-card p-4 space-y-3"/g, 'className="bg-bg-surface border border-border rounded-[14px] p-4 space-y-3 mb-3"');
content = content.replace(/className="glass-card p-8 text-center text-gray-500"/g, 'className="bg-bg-surface border border-border rounded-[14px] p-8 text-center text-text-muted"');

// Tables
content = content.replace(/bg-background-tertiary\/50/g, 'bg-bg-elevated');
content = content.replace(/divide-white\/5/g, 'divide-border');
content = content.replace(/border-white\/5/g, 'border-border');
content = content.replace(/border-white\/10/g, 'border-border');
content = content.replace(/hover:bg-white\/5/g, 'hover:bg-bg-elevated/50');

// Mobile add user modal
content = content.replace(/className="bg-background-secondary rounded-2xl border border-white\/10 p-6 max-w-md w-full shadow-xl"/g, 'className="bg-bg-base rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl"');
content = content.replace(/className="flex-1 px-4 py-3 bg-gradient-primary hover:opacity-90 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2"/g, 'className="flex-1 px-4 py-3 bg-gradient-to-br from-accent-2 to-[#5D42E6] hover:brightness-110 rounded-xl text-white font-sans text-[14px] font-bold transition-all flex items-center justify-center gap-2 shadow-glow-violet"');
content = content.replace(/className="flex-1 px-4 py-3 bg-surface hover:bg-surface-hover rounded-xl text-gray-300 font-medium transition-colors"/g, 'className="flex-1 px-4 py-3 bg-bg-elevated hover:bg-accent-3/10 hover:text-accent-3 rounded-xl text-text-primary font-sans text-[14px] font-bold transition-colors"');

fs.writeFileSync(bankFile, content, 'utf8');
console.log('Bank page updated');

const fs = require('fs');
const path = require('path');

const adminFile = path.join(__dirname, '..', 'app', 'dashboard', 'admin', 'page.tsx');
let content = fs.readFileSync(adminFile, 'utf8');

// Tabs redesign
content = content.replace(
    /<div className="flex gap-2 flex-wrap">([\s\S]*?)<\/div>\s*\{\/\* Search \*\/\}/,
    `<div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={\`px-5 py-2.5 rounded-full font-sans text-[14px] transition-all flex items-center gap-2 \${activeTab === 'pending'
                        ? 'bg-gradient-to-r from-accent-1 to-accent-2 text-[#07070E] font-bold shadow-glow-mint'
                        : 'bg-bg-elevated text-text-muted hover:text-text-primary hover:bg-bg-elevated/80'
                        }\`}
                >
                    <Clock className="w-4 h-4" />
                    Pending
                    <span className={\`ml-1 px-2 py-0.5 rounded-full text-[11px] \${activeTab === 'pending' ? 'bg-[#07070E]/20' : 'bg-bg-surface'}\`}>{pendingCount}</span>
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={\`px-5 py-2.5 rounded-full font-sans text-[14px] transition-all flex items-center gap-2 \${activeTab === 'approved'
                        ? 'bg-gradient-to-r from-accent-1 to-accent-2 text-[#07070E] font-bold shadow-glow-mint'
                        : 'bg-bg-elevated text-text-muted hover:text-text-primary hover:bg-bg-elevated/80'
                        }\`}
                >
                    <Check className="w-4 h-4" />
                    Approved
                    <span className={\`ml-1 px-2 py-0.5 rounded-full text-[11px] \${activeTab === 'approved' ? 'bg-[#07070E]/20' : 'bg-bg-surface'}\`}>{approvedCount}</span>
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={\`px-5 py-2.5 rounded-full font-sans text-[14px] transition-all flex items-center gap-2 \${activeTab === 'all'
                        ? 'bg-gradient-to-r from-accent-1 to-accent-2 text-[#07070E] font-bold shadow-glow-mint'
                        : 'bg-bg-elevated text-text-muted hover:text-text-primary hover:bg-bg-elevated/80'
                        }\`}
                >
                    <Users className="w-4 h-4" />
                    All Users
                    <span className={\`ml-1 px-2 py-0.5 rounded-full text-[11px] \${activeTab === 'all' ? 'bg-[#07070E]/20' : 'bg-bg-surface'}\`}>{users.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('adminRequests')}
                    className={\`px-5 py-2.5 rounded-full font-sans text-[14px] transition-all flex items-center gap-2 \${activeTab === 'adminRequests'
                        ? 'bg-gradient-to-r from-accent-1 to-accent-2 text-[#07070E] font-bold shadow-glow-mint'
                        : 'bg-bg-elevated text-text-muted hover:text-text-primary hover:bg-bg-elevated/80'
                        }\`}
                >
                    <UserPlus className="w-4 h-4" />
                    Admin Requests
                    <span className={\`ml-1 px-2 py-0.5 rounded-full text-[11px] \${activeTab === 'adminRequests' ? 'bg-[#07070E]/20' : 'bg-bg-surface'}\`}>{adminRequests.length}</span>
                </button>
            </div>

            {/* Search */}`
);

// User column formatting
content = content.replace(
    /<p className="text-white font-medium">\{user\.name\}<\/p>\s*<p className="text-gray-400 text-sm">\{user\.email\}<\/p>\s*<p className="text-gray-500 text-xs">\s*\{new Date\(user\.createdAt\)\.toLocaleDateString\(\)\}\s*<\/p>/g,
    `<div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-2/20 to-accent-1/20 border border-border flex items-center justify-center font-orbitron text-accent-1">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-sans text-[14px] font-bold text-text-primary">{user.name}</p>
                                                        <p className="font-sans text-[12px] text-text-muted">{user.email}</p>
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-bg-elevated rounded-full font-sans text-[11px] text-text-muted">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>`
);

// Contact column formatting
content = content.replace(
    /<span className=\{\`px-2 py-1 rounded text-xs font-medium \$\{user\.contactType === 'WHATSAPP' \? 'bg-green-500\/10 text-green-400' :\s*user\.contactType === 'LINE' \? 'bg-emerald-500\/10 text-emerald-400' :\s*'bg-blue-500\/10 text-blue-400'\s*\}\`\}>\s*\{user\.contactType\}\s*<\/span>\s*<span className="text-gray-300 text-sm">\{user\.contactValue\}<\/span>/g,
    `<span className={\`px-2 py-1 rounded-full text-[11px] font-sans font-bold border \${user.contactType === 'WHATSAPP' ? 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/30' :
                                                        user.contactType === 'LINE' ? 'bg-[#00C300]/10 text-[#00C300] border-[#00C300]/30' :
                                                            'bg-[#0088CC]/10 text-[#0088CC] border-[#0088CC]/30'
                                                        }\`}>
                                                        {user.contactType}
                                                    </span>
                                                    <span className="font-mono text-[12px] text-text-muted">{user.contactValue}</span>`
);

// Action Buttons
content = content.replace(
    /className="flex items-center gap-1 px-3 py-2 bg-accent-emerald\/10 text-accent-emerald rounded-lg hover:bg-accent-emerald\/20 transition-colors text-sm"/g,
    'className="flex items-center gap-1 px-3 py-2 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-[8px] hover:bg-[#10B981]/20 hover:shadow-glow-mint transition-all duration-150 font-sans text-[13px] font-bold"'
);
content = content.replace(
    /className="flex items-center gap-1 px-3 py-2 bg-red-500\/10 text-red-400 rounded-lg hover:bg-red-500\/20 transition-colors text-sm"/g,
    'className="flex items-center gap-1 px-3 py-2 bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-[#FF4D6D] rounded-[8px] hover:bg-[#FF4D6D]/20 hover:shadow-glow-red transition-all duration-150 font-sans text-[13px] font-bold"'
);
content = content.replace(
    /className="flex items-center gap-2 px-4 py-2 bg-primary-500\/10 text-primary-400 rounded-lg hover:bg-primary-500\/20 transition-colors text-sm"/g,
    'className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-1/10 to-accent-2/10 border border-accent-1/30 text-accent-1 rounded-[8px] hover:brightness-125 transition-all duration-150 font-sans text-[13px] font-bold"'
);

fs.writeFileSync(adminFile, content, 'utf8');
console.log('Admin page user table updated');

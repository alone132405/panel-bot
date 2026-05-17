const fs = require('fs');
const path = require('path');

const adminFile = path.join(__dirname, '..', 'app', 'dashboard', 'admin', 'page.tsx');
let content = fs.readFileSync(adminFile, 'utf8');

// Header
content = content.replace(
    /<h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Admin Panel<\/h1>/,
    '<h1 className="font-orbitron tracking-wide text-xl sm:text-3xl font-bold text-text-primary mb-1 sm:mb-2">SYSTEM ADMINISTRATION</h1>'
);
content = content.replace(
    /<p className="text-sm sm:text-base text-gray-400">Manage users, approvals, and IGG ID assignments<\/p>/,
    '<p className="font-sans text-sm sm:text-base text-text-muted">Manage users, approvals, and global system operations</p>'
);

// Stats Cards
content = content.replace(
    /<div className="grid grid-cols-1 md:grid-cols-4 gap-4">([\s\S]*?)<\/div>\s*\{\/\* Tabs \*\/\}/,
    `<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-bg-surface border border-border rounded-[14px] p-6 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 bg-gradient-to-t from-yellow-400 to-transparent"></div>
                    <div className="relative z-10">
                        <p className="font-sans text-text-muted text-sm uppercase tracking-wider mb-2">Pending</p>
                        <p className="font-orbitron text-4xl text-yellow-400">{pendingCount}</p>
                    </div>
                </div>

                <div className="bg-bg-surface border border-border rounded-[14px] p-6 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 bg-gradient-to-t from-accent-1 to-transparent"></div>
                    <div className="relative z-10">
                        <p className="font-sans text-text-muted text-sm uppercase tracking-wider mb-2">Approved Users</p>
                        <p className="font-orbitron text-4xl text-accent-1">{approvedCount}</p>
                    </div>
                </div>

                <div className="bg-bg-surface border border-border rounded-[14px] p-6 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 bg-gradient-to-t from-accent-2 to-transparent"></div>
                    <div className="relative z-10">
                        <p className="font-sans text-text-muted text-sm uppercase tracking-wider mb-2">Total IGG IDs</p>
                        <p className="font-orbitron text-4xl text-accent-2">{availableIggIds.length}</p>
                    </div>
                </div>

                <div className="bg-bg-surface border border-border rounded-[14px] p-6 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 bg-gradient-to-t from-accent-3 to-transparent"></div>
                    <div className="relative z-10">
                        <p className="font-sans text-text-muted text-sm uppercase tracking-wider mb-2">Unassigned</p>
                        <p className="font-orbitron text-4xl text-accent-3">{unassignedIggIds.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}`
);

// Search Bar
content = content.replace(
    /className="glass-card p-4"/,
    'className="bg-bg-surface border border-border rounded-[14px] p-4"'
);
content = content.replace(
    /className="w-full pl-10 pr-4 py-3 bg-background-tertiary border border-white\/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500\/50"/,
    'className="w-full pl-10 pr-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-2 focus:shadow-glow-violet transition-all"'
);
content = content.replace(
    /<Search className="absolute left-3 top-1\/2 -translate-y-1\/2 w-5 h-5 text-gray-400" \/>/,
    '<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />'
);

// All "glass-card" replacements
content = content.replace(/className="glass-card overflow-hidden"/g, 'className="bg-bg-surface border border-border rounded-[14px] overflow-hidden"');

// Tables
content = content.replace(/bg-background-tertiary\/50/g, 'bg-bg-elevated');
content = content.replace(/divide-white\/5/g, 'divide-border');
content = content.replace(/border-white\/5/g, 'border-border');
content = content.replace(/border-white\/10/g, 'border-border');
content = content.replace(/hover:bg-white\/5/g, 'hover:bg-[#7B5EFF0D]');

// Table Headers
content = content.replace(
    /text-left text-sm font-medium text-gray-300/g,
    'text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase'
);
content = content.replace(
    /text-center text-sm font-medium text-gray-300/g,
    'text-center font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase'
);

// Add Global Automation and Logs at the bottom (before the modals)
const injectionTarget = '{/* Approval Modal */}';
const injectionCode = `
            {/* Global Operations Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* GLOBAL AUTOMATION CARD */}
                <div className="bg-bg-elevated border border-accent-3 rounded-[14px] p-6 relative overflow-hidden shadow-glow-red">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-4 h-4 bg-accent-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(255,77,109,0.8)]"></div>
                        <h3 className="font-orbitron text-xl text-accent-3">CRITICAL OPERATIONS</h3>
                    </div>
                    <p className="font-sans text-sm text-text-muted mb-6">
                        Warning: Terminating all automation will immediately halt all active proxy servers and bot instances.
                    </p>
                    <button className="w-full py-4 bg-accent-3 text-white font-orbitron text-lg font-bold rounded-[10px] hover:brightness-125 hover:shadow-[0_0_30px_rgba(255,77,109,0.6)] transition-all active:scale-95">
                        EMERGENCY STOP
                    </button>
                </div>

                {/* LOGS TERMINAL */}
                <div className="bg-[#000000] border border-border rounded-[14px] p-0 flex flex-col h-[220px]">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-bg-surface rounded-t-[14px]">
                        <h3 className="font-orbitron text-sm text-text-primary tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-accent-1 rounded-full animate-pulse"></span>
                            REAL-TIME TELEMETRY
                        </h3>
                    </div>
                    <div className="p-4 flex-1 overflow-auto font-mono text-[11px] text-text-muted space-y-1">
                        <p className="text-accent-1">[SYS] Telemetry stream initialized...</p>
                        <p>[NET] Proxy connection established on port 8080</p>
                        <p>[AUT] Instance #142 reported status OK</p>
                        <p className="text-accent-gold">[WARN] High latency detected on node Alpha</p>
                        <p>[SYS] Syncing user data... 100%</p>
                        <p className="animate-pulse">_</p>
                    </div>
                </div>
            </div>

            {/* Approval Modal */}`;

content = content.replace(injectionTarget, injectionCode);

fs.writeFileSync(adminFile, content, 'utf8');
console.log('Admin page updated');

const fs = require('fs');
const path = require('path');

const reportsFile = path.join(__dirname, '..', 'app', 'dashboard', 'reports', 'page.tsx');
let content = fs.readFileSync(reportsFile, 'utf8');

// Header
content = content.replace(
    /<h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Reports<\/h1>/,
    '<h1 className="font-orbitron text-xl sm:text-3xl font-bold text-text-primary tracking-wide mb-1 sm:mb-2">REPORTS</h1>'
);
content = content.replace(
    /<p className="text-gray-400 text-sm sm:text-base">View and download exported stat reports<\/p>/,
    '<p className="font-sans text-text-muted text-sm sm:text-base">View and download exported stat reports</p>'
);

// Empty State Select IGG
content = content.replace(
    /className="glass-card p-12 text-center"/g,
    'className="bg-bg-surface border border-border rounded-[14px] p-12 text-center"'
);

// Filter Bar Container
content = content.replace(
    /<div className="glass-card p-3 sm:p-4">/,
    '<div className="bg-bg-surface border border-border rounded-[14px] p-4 mb-4">'
);

// Search Input
content = content.replace(
    /className="w-full pl-9 sm:pl-10 pr-4 py-2\.5 sm:py-3 bg-background-tertiary border border-white\/10 rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500\/50"/,
    'className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-bg-elevated border border-border rounded-[10px] text-text-primary text-sm sm:text-base placeholder-text-muted focus:outline-none focus:border-accent-2 focus:shadow-glow-violet transition-all"'
);
content = content.replace(
    /<Search className="absolute left-3 top-1\/2 -translate-y-1\/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" \/>/,
    '<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-text-muted" />'
);

// Date Inputs
content = content.replace(
    /className="px-2 sm:px-4 py-2 sm:py-3 bg-background-tertiary border border-white\/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500\/50"/g,
    'className="px-2 sm:px-4 py-2 sm:py-3 bg-bg-elevated border border-border rounded-[10px] text-text-primary text-sm focus:outline-none focus:border-accent-2 focus:shadow-glow-violet transition-all"'
);
content = content.replace(
    /<Calendar className="w-4 h-4 text-gray-400 hidden sm:block" \/>/,
    '<Calendar className="w-4 h-4 text-accent-2 hidden sm:block" />'
);

// Refresh Button
content = content.replace(
    /<button\s*onClick=\{loadFiles\}\s*disabled=\{loading\}\s*className="px-3 sm:px-4 py-2 bg-primary-500\/10 text-primary-400 rounded-xl hover:bg-primary-500\/20 transition-colors flex items-center gap-1 sm:gap-2 text-sm"\s*>\s*<RefreshCw className=\{\`w-4 h-4 \$\{loading \? 'animate-spin' : ''\}\`\} \/>\s*<span className="hidden sm:inline">Refresh<\/span>\s*<\/button>/,
    `<button
                                    onClick={loadFiles}
                                    disabled={loading}
                                    className="w-10 h-10 rounded-full border border-border hover:border-accent-1 text-text-muted hover:text-accent-1 transition-all flex items-center justify-center group flex-shrink-0"
                                    title="Refresh"
                                >
                                    <RefreshCw className={\`w-4 h-4 \${loading ? 'animate-spin' : 'group-active:rotate-[360deg] transition-transform duration-500 ease-out'}\`} />
                                </button>`
);

// Results Count
content = content.replace(
    /<div className="text-gray-400 text-sm">\s*Showing \{filteredFiles\.length\} of \{files\.length\} files\s*<\/div>/,
    `<div className="flex mb-4">
                        <span className="px-3 py-1 rounded-full bg-accent-1/10 text-accent-1 border border-accent-1/20 font-sans text-[12px] font-bold">
                            Showing {filteredFiles.length} of {files.length} files
                        </span>
                    </div>`
);

// Files Table Container
content = content.replace(
    /<div className="glass-card overflow-hidden">/,
    '<div className="bg-bg-surface border border-border rounded-[14px] overflow-hidden">'
);
content = content.replace(
    /<thead className="bg-background-tertiary\/50 border-b border-white\/5">/,
    '<thead className="bg-bg-elevated border-b border-border">'
);
content = content.replace(
    /text-left text-xs sm:text-sm font-medium text-gray-300/g,
    'text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase'
);
content = content.replace(
    /text-center text-xs sm:text-sm font-medium text-gray-300/g,
    'text-center font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase'
);

content = content.replace(
    /<tbody className="divide-y divide-white\/5">/,
    '<tbody className="divide-y divide-border">'
);
content = content.replace(
    /className="hover:bg-white\/5 transition-colors"/g,
    'className="hover:bg-[#7B5EFF0D] transition-all duration-150"'
);

// File Row Text
content = content.replace(
    /<span className="text-white font-medium text-sm sm:text-base block truncate max-w-\[150px\] sm:max-w-none">\{file\.filename\}<\/span>/g,
    '<span className="font-mono text-[13px] text-text-primary font-medium block truncate max-w-[150px] sm:max-w-none">{file.filename}</span>'
);
content = content.replace(
    /<span className="text-gray-300 text-sm">/g,
    '<span className="font-sans text-[13px] text-text-muted">'
);
content = content.replace(
    /<span className="text-gray-400 text-sm">\{formatFileSize\(file\.size\)\}<\/span>/g,
    '<span className="font-sans text-[13px] text-text-muted">{formatFileSize(file.size)}</span>'
);

// Download Button
content = content.replace(
    /<button\s*onClick=\{\(\) => downloadFile\(file\.filename\)\}\s*className="flex items-center gap-1 px-2 sm:px-3 py-1\.5 sm:py-2 bg-accent-emerald\/10 text-accent-emerald rounded-lg hover:bg-accent-emerald\/20 transition-colors text-xs sm:text-sm"\s*>\s*<Download className="w-3\.5 h-3\.5 sm:w-4 sm:h-4" \/>\s*<span className="hidden sm:inline">Download<\/span>\s*<\/button>/g,
    `<button
                                                                onClick={() => downloadFile(file.filename)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent-1/10 text-text-muted hover:text-accent-1 transition-colors"
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>`
);

// File Icon color depending on extension
// We can use a small regex replacer or a simple function inside JSX
content = content.replace(
    /<FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 flex-shrink-0" \/>/g,
    `{file.filename.endsWith('.xlsx') ? (
                                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                                            ) : file.filename.endsWith('.pdf') ? (
                                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent-3 flex-shrink-0" />
                                                            ) : (
                                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent-2 flex-shrink-0" />
                                                            )}`
);

fs.writeFileSync(reportsFile, content, 'utf8');
console.log('Reports page updated');

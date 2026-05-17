'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Search, Calendar, Download, Eye, X, Filter, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import IggIdSelector from '@/components/settings/IggIdSelector'

interface ReportFile {
    filename: string
    size: number
    createdAt: string
    modifiedAt: string
    parsedDate: string | null
}

interface FileContent {
    filename: string
    fileType: 'excel' | 'text'
    // For text files
    content?: string
    parsedContent?: any
    // For Excel files
    sheets?: { [key: string]: any[][] }
    sheetNames?: string[]
    size: number
    modifiedAt: string
}

// ViewModal component for displaying file content
function ViewModal({
    file,
    onClose,
    onDownload,
    formatFileSize
}: {
    file: FileContent
    onClose: () => void
    onDownload: () => void
    formatFileSize: (bytes: number) => string
}) {
    const [activeSheet, setActiveSheet] = useState<string>(file.sheetNames?.[0] || '')

    return (
        <div className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background-secondary rounded-2xl border border-white/10 w-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary-400" />
                        <div>
                            <h3 className="text-lg font-bold text-white">{file.filename}</h3>
                            <p className="text-gray-400 text-sm">
                                {formatFileSize(file.size)} • Modified {new Date(file.modifiedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onDownload}
                            className="flex items-center gap-1 px-3 py-2 bg-accent-emerald/10 text-accent-emerald rounded-lg hover:bg-accent-emerald/20 transition-colors text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Sheet Tabs for Excel files */}
                {file.fileType === 'excel' && file.sheetNames && file.sheetNames.length > 1 && (
                    <div className="flex gap-1 p-2 border-b border-white/10 overflow-x-auto">
                        {file.sheetNames.map(sheetName => (
                            <button
                                key={sheetName}
                                onClick={() => setActiveSheet(sheetName)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeSheet === sheetName
                                    ? 'bg-primary-500/20 text-primary-400'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {sheetName}
                            </button>
                        ))}
                    </div>
                )}

                {/* Modal Content */}
                <div className="flex-1 overflow-auto p-4">
                    {file.fileType === 'excel' && file.sheets ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-max">
                                <thead className="bg-background-tertiary sticky top-0">
                                    {file.sheets[activeSheet]?.[0] && (
                                        <tr>
                                            {file.sheets[activeSheet][0].map((header: any, idx: number) => (
                                                <th
                                                    key={idx}
                                                    className="px-4 py-3 text-left text-sm font-semibold text-white border border-white/10 bg-background-tertiary whitespace-nowrap"
                                                >
                                                    {header?.toString() || ''}
                                                </th>
                                            ))}
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {file.sheets[activeSheet]?.slice(1).map((row: any[], rowIdx: number) => {
                                        const headerLength = file.sheets![activeSheet][0]?.length || 0
                                        return (
                                            <tr key={rowIdx} className="hover:bg-white/5">
                                                {Array.from({ length: headerLength }).map((_, cellIdx: number) => (
                                                    <td
                                                        key={cellIdx}
                                                        className="px-4 py-2 text-sm text-gray-300 border border-white/10 whitespace-nowrap"
                                                    >
                                                        {row[cellIdx]?.toString() || ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {(!file.sheets[activeSheet] || file.sheets[activeSheet].length === 0) && (
                                <div className="text-center text-gray-400 py-8">
                                    No data in this sheet
                                </div>
                            )}
                        </div>
                    ) : (
                        <pre className="bg-background-tertiary rounded-xl p-4 text-sm text-gray-300 overflow-auto whitespace-pre-wrap font-mono">
                            {file.parsedContent
                                ? JSON.stringify(file.parsedContent, null, 2)
                                : file.content
                            }
                        </pre>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

export default function ReportsPage() {
    const [selectedIggId, setSelectedIggId] = useState<string | null>(null)
    const [files, setFiles] = useState<ReportFile[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [showViewModal, setShowViewModal] = useState(false)
    const [viewingFile, setViewingFile] = useState<FileContent | null>(null)
    const [loadingFile, setLoadingFile] = useState(false)

    useEffect(() => {
        if (selectedIggId) {
            loadFiles()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIggId])

    const loadFiles = async () => {
        if (!selectedIggId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/reports/${selectedIggId}`)
            if (res.ok) {
                const data = await res.json()
                setFiles(data.files || [])
            } else {
                toast.error('Failed to load reports')
            }
        } catch (error) {
            toast.error('Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    const viewFile = async (filename: string) => {
        if (!selectedIggId) return
        setLoadingFile(true)
        try {
            const res = await fetch(`/api/reports/${selectedIggId}/${encodeURIComponent(filename)}`)
            if (res.ok) {
                const data = await res.json()
                setViewingFile(data)
                setShowViewModal(true)
            } else {
                toast.error('Failed to load file')
            }
        } catch (error) {
            toast.error('Failed to load file')
        } finally {
            setLoadingFile(false)
        }
    }

    const downloadFile = async (filename: string) => {
        if (!selectedIggId) return
        try {
            // Add download=true query param to skip JSON parsing on server
            const res = await fetch(`/api/reports/${selectedIggId}/${encodeURIComponent(filename)}?download=true`)
            if (res.ok) {
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            } else {
                const data = await res.json().catch(() => ({}))
                toast.error(data.error || 'Failed to download file')
            }
        } catch (error) {
            console.error('Download error:', error)
            toast.error('Failed to download file')
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            // Search filter
            if (searchTerm && !file.filename.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false
            }

            // Date range filter
            const fileDate = file.parsedDate ? new Date(file.parsedDate) : new Date(file.modifiedAt)

            if (dateFrom) {
                const fromDate = new Date(dateFrom)
                if (fileDate < fromDate) return false
            }

            if (dateTo) {
                const toDate = new Date(dateTo)
                toDate.setHours(23, 59, 59, 999)
                if (fileDate > toDate) return false
            }

            return true
        }).sort((a, b) => {
            // Sort by modifiedAt, newest first
            const dateA = new Date(a.modifiedAt).getTime()
            const dateB = new Date(b.modifiedAt).getTime()
            return dateB - dateA
        })
    }, [files, searchTerm, dateFrom, dateTo])

    const clearFilters = () => {
        setSearchTerm('')
        setDateFrom('')
        setDateTo('')
    }

    return (
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="font-orbitron text-xl sm:text-3xl font-bold text-text-primary tracking-wide mb-1 sm:mb-2">REPORTS</h1>
                    <p className="font-sans text-text-muted text-sm sm:text-base">View and download exported stat reports</p>
                </div>
                <div className="w-full md:w-80">
                    <IggIdSelector
                        selectedIggId={selectedIggId}
                        onSelect={setSelectedIggId}
                    />
                </div>
            </div>

            {!selectedIggId ? (
                <div className="bg-bg-surface border border-border rounded-[14px] p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Select an IGG ID</h3>
                    <p className="text-gray-400">Choose an IGG ID from the dropdown above to view reports</p>
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="bg-bg-surface border border-border rounded-[14px] p-4 mb-4">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search by filename..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-bg-elevated border border-border rounded-[10px] text-text-primary text-sm sm:text-base placeholder-text-muted focus:outline-none focus:border-accent-2 focus:shadow-glow-violet transition-all"
                                />
                            </div>

                            {/* Date Filters and Actions Row */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                {/* Date From */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-accent-2 hidden sm:block" />
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="px-2 sm:px-4 py-2 sm:py-3 bg-bg-elevated border border-border rounded-[10px] text-text-primary text-sm focus:outline-none focus:border-accent-2 focus:shadow-glow-violet transition-all"
                                    />
                                </div>

                                <span className="text-gray-400 text-sm">to</span>

                                {/* Date To */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="px-2 sm:px-4 py-2 sm:py-3 bg-bg-elevated border border-border rounded-[10px] text-text-primary text-sm focus:outline-none focus:border-accent-2 focus:shadow-glow-violet transition-all"
                                    />
                                </div>

                                <div className="flex-1" />

                                {/* Clear Filters */}
                                {(searchTerm || dateFrom || dateTo) && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-2 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-1 sm:gap-2 text-sm"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="hidden sm:inline">Clear</span>
                                    </button>
                                )}

                                {/* Refresh */}
                                <button
                                    onClick={loadFiles}
                                    disabled={loading}
                                    className="w-10 h-10 rounded-full border border-border hover:border-accent-1 text-text-muted hover:text-accent-1 transition-all flex items-center justify-center group flex-shrink-0"
                                    title="Refresh"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-active:rotate-[360deg] transition-transform duration-500 ease-out'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="flex mb-4">
                        <span className="px-3 py-1 rounded-full bg-accent-1/10 text-accent-1 border border-accent-1/20 font-sans text-[12px] font-bold">
                            Showing {filteredFiles.length} of {files.length} files
                        </span>
                    </div>

                    {/* Files Table */}
                    <div className="bg-bg-surface border border-border rounded-[14px] overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-bg-elevated border-b border-border">
                                        <tr>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">Filename</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase hidden sm:table-cell">Date</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase hidden sm:table-cell">Size</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredFiles.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                                    {files.length === 0 ? 'No reports found' : 'No matching reports'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFiles.map((file) => (
                                                <tr key={file.filename} className="hover:bg-[#7B5EFF0D] transition-all duration-150">
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            {file.filename.endsWith('.xlsx') ? (
                                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                                            ) : file.filename.endsWith('.pdf') ? (
                                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent-3 flex-shrink-0" />
                                                            ) : (
                                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent-2 flex-shrink-0" />
                                                            )}
                                                            <div>
                                                                <span className="font-mono text-[13px] text-text-primary font-medium block truncate max-w-[150px] sm:max-w-none">{file.filename}</span>
                                                                {/* Mobile: Show date and size below filename */}
                                                                <div className="sm:hidden text-xs text-gray-400 mt-1">
                                                                    {file.parsedDate
                                                                        ? new Date(file.parsedDate).toLocaleDateString()
                                                                        : new Date(file.modifiedAt).toLocaleDateString()
                                                                    } • {formatFileSize(file.size)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                        <span className="font-sans text-[13px] text-text-muted">
                                                            {file.parsedDate
                                                                ? new Date(file.parsedDate).toLocaleDateString()
                                                                : new Date(file.modifiedAt).toLocaleDateString()
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                        <span className="font-sans text-[13px] text-text-muted">{formatFileSize(file.size)}</span>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                onClick={() => downloadFile(file.filename)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent-1/10 text-text-muted hover:text-accent-1 transition-colors"
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* View Modal */}
            <AnimatePresence>
                {showViewModal && viewingFile && (
                    <ViewModal
                        file={viewingFile}
                        onClose={() => setShowViewModal(false)}
                        onDownload={() => downloadFile(viewingFile.filename)}
                        formatFileSize={formatFileSize}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}


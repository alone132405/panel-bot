'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Search, Calendar, Download, Eye, X, Filter, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import IggIdSelector from '@/components/settings/IggIdSelector'
import ReportSettingsPanel from '@/components/settings/ReportSettingsPanel'

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="panel-solid flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg"
            >
                <div className="flex items-center justify-between gap-3 border-b border-border bg-bg-elevated/60 px-4 py-4 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent-2/25 bg-accent-2/10 text-accent-2">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-[17px] font-bold text-text-primary">{file.filename}</h3>
                            <p className="mt-0.5 truncate text-[12px] text-text-muted">
                                {formatFileSize(file.size)} - Modified {new Date(file.modifiedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            onClick={onDownload}
                            className="flex h-9 items-center gap-2 rounded-md border border-accent-1/25 bg-accent-1/10 px-3 text-[12px] font-bold text-accent-1 transition-colors hover:bg-accent-1/20"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Download</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-accent-3/20 bg-accent-3/10 text-accent-3 transition-colors hover:bg-accent-3/20"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {file.fileType === 'excel' && file.sheetNames && file.sheetNames.length > 1 && (
                    <div className="flex gap-1 overflow-x-auto border-b border-border bg-bg-inset/40 p-2">
                        {file.sheetNames.map(sheetName => (
                            <button
                                key={sheetName}
                                onClick={() => setActiveSheet(sheetName)}
                                className={`whitespace-nowrap rounded-md px-4 py-2 text-[12px] font-bold transition-colors ${activeSheet === sheetName
                                    ? 'border border-primary-500/30 bg-primary-500/20 text-primary-300'
                                    : 'border border-transparent text-text-muted hover:bg-white/5 hover:text-text-primary'
                                    }`}
                            >
                                {sheetName}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex-1 overflow-auto p-4 scrollbar-thin">
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
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
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

    const totalReportSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files])
    const latestReportDate = filteredFiles[0]
        ? new Date(filteredFiles[0].parsedDate || filteredFiles[0].modifiedAt).toLocaleDateString()
        : 'None'
    const activeFilterCount = [searchTerm, dateFrom, dateTo].filter(Boolean).length

    const getReportDate = (file: ReportFile) => (
        file.parsedDate ? new Date(file.parsedDate) : new Date(file.modifiedAt)
    )

    const getReportType = (filename: string) => {
        const lower = filename.toLowerCase()
        if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'Spreadsheet'
        if (lower.endsWith('.pdf')) return 'PDF'
        if (lower.endsWith('.json')) return 'JSON'
        return 'Text'
    }

    const getReportTone = (filename: string) => {
        const lower = filename.toLowerCase()
        if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'border-accent-1/25 bg-accent-1/10 text-accent-1'
        if (lower.endsWith('.pdf')) return 'border-accent-3/25 bg-accent-3/10 text-accent-3'
        if (lower.endsWith('.json')) return 'border-accent-gold/25 bg-accent-gold/10 text-accent-gold'
        return 'border-accent-2/25 bg-accent-2/10 text-accent-2'
    }

    return (
        <div className="space-y-5 p-3 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="mb-1 font-orbitron text-xl font-bold tracking-wide text-text-primary sm:text-3xl">REPORTS</h1>
                    <p className="font-sans text-sm text-text-muted sm:text-base">View, preview, and download exported stat reports.</p>
                </div>
                <div className="w-full md:w-80">
                    <IggIdSelector
                        selectedIggId={selectedIggId}
                        onSelect={(id, plan) => {
                            setSelectedIggId(id)
                            setSelectedPlan(plan || null)
                        }}
                    />
                </div>
            </div>

            {!selectedIggId ? (
                <div className="rounded-lg border border-dashed border-border bg-bg-surface p-8 text-center shadow-panel sm:p-12">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-accent-2/20 bg-accent-2/10 text-accent-2">
                        <FileText className="h-7 w-7" />
                    </div>
                    <h3 className="mb-2 text-[18px] font-bold text-text-primary">Select an IGG ID</h3>
                    <p className="text-sm text-text-muted">Choose an IGG ID to load generated report files.</p>
                </div>
            ) : (
                <>
                    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                        {[
                            { label: 'Total Files', value: files.length, tone: 'text-accent-1' },
                            { label: 'Visible', value: filteredFiles.length, tone: 'text-accent-cyan' },
                            { label: 'Latest', value: latestReportDate, tone: 'text-accent-gold' },
                            { label: 'Storage', value: formatFileSize(totalReportSize), tone: 'text-primary-300' },
                        ].map((metric) => (
                            <div key={metric.label} className="min-w-0 rounded-lg border border-border bg-bg-surface p-4 shadow-panel">
                                <p className="mb-2 truncate text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted sm:text-[11px]">{metric.label}</p>
                                <p className={`truncate font-orbitron text-[20px] leading-tight sm:text-2xl ${metric.tone}`}>{metric.value}</p>
                            </div>
                        ))}
                    </section>

                    {selectedPlan !== 'FARM_BOT' && (
                        <ReportSettingsPanel iggId={selectedIggId} />
                    )}

                    <section className="rounded-lg border border-border bg-bg-surface shadow-panel">
                        <div className="flex flex-col gap-3 border-b border-border bg-bg-elevated/55 p-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent-2/25 bg-accent-2/10 text-accent-2">
                                    <Filter className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-[15px] font-bold text-text-primary">Report Filters</h2>
                                    <p className="text-[12px] text-text-muted">{activeFilterCount ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'Showing newest files first'}</p>
                                </div>
                            </div>
                            <button
                                onClick={loadFiles}
                                disabled={loading}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-bg-inset px-4 text-[13px] font-bold text-text-muted transition-colors hover:border-accent-1/35 hover:text-accent-1 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                        <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_170px_170px_auto] lg:items-end">
                            <label className="block min-w-0">
                                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">Filename</span>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search by filename..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-11 w-full rounded-md border border-border bg-bg-inset px-4 pl-10 text-sm text-text-primary placeholder-text-muted transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
                                    <Calendar className="h-3.5 w-3.5 text-accent-2" />
                                    From
                                </span>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-11 w-full rounded-md border border-border bg-bg-inset px-3 text-sm text-text-primary transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">To</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-11 w-full rounded-md border border-border bg-bg-inset px-3 text-sm text-text-primary transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                                />
                            </label>

                            {(searchTerm || dateFrom || dateTo) && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-bg-inset px-4 text-[13px] font-bold text-text-muted transition-colors hover:border-accent-3/35 hover:text-accent-3"
                                >
                                    <X className="h-4 w-4" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border border-border bg-bg-surface shadow-panel">
                        <div className="flex flex-col gap-2 border-b border-border bg-bg-elevated/55 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-[15px] font-bold text-text-primary">Report Files</h2>
                                <p className="text-[12px] text-text-muted">Showing {filteredFiles.length} of {files.length} files</p>
                            </div>
                            <span className="w-fit rounded-full border border-accent-1/20 bg-accent-1/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-1">
                                IGG {selectedIggId}
                            </span>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500" />
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="p-8 text-center sm:p-12">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-bg-inset text-text-muted">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <p className="font-bold text-text-primary">{files.length === 0 ? 'No reports found' : 'No matching reports'}</p>
                                <p className="mt-1 text-sm text-text-muted">{files.length === 0 ? 'Generated reports will appear here.' : 'Adjust the filters to widen the result set.'}</p>
                            </div>
                        ) : (
                            <div>
                                <div className="hidden grid-cols-[minmax(0,1.7fr)_140px_120px_120px_104px] gap-3 border-b border-border bg-bg-elevated/35 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted xl:grid">
                                    <span>Filename</span>
                                    <span>Type</span>
                                    <span>Date</span>
                                    <span>Size</span>
                                    <span className="text-right">Actions</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {filteredFiles.map((file) => {
                                        const reportDate = getReportDate(file)
                                        return (
                                            <div
                                                key={file.filename}
                                                className="grid gap-3 p-4 transition-colors hover:bg-white/[0.025] xl:grid-cols-[minmax(0,1.7fr)_140px_120px_120px_104px] xl:items-center"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${getReportTone(file.filename)}`}>
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-mono text-[13px] font-bold text-text-primary">{file.filename}</p>
                                                        <p className="mt-1 text-[12px] text-text-muted xl:hidden">
                                                            {getReportType(file.filename)} - {reportDate.toLocaleDateString()} - {formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="hidden xl:block">
                                                    <span className="rounded-full border border-border bg-bg-inset px-3 py-1 text-[12px] font-bold text-text-muted">{getReportType(file.filename)}</span>
                                                </div>
                                                <div className="hidden text-[13px] text-text-muted xl:block">{reportDate.toLocaleDateString()}</div>
                                                <div className="hidden text-[13px] text-text-muted xl:block">{formatFileSize(file.size)}</div>
                                                <div className="flex items-center gap-2 xl:justify-end">
                                                    <button
                                                        onClick={() => viewFile(file.filename)}
                                                        disabled={loadingFile}
                                                        className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-inset text-text-muted transition-colors hover:border-accent-2/35 hover:text-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        title="Preview"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => downloadFile(file.filename)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-inset text-text-muted transition-colors hover:border-accent-1/35 hover:text-accent-1"
                                                        title="Download"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
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


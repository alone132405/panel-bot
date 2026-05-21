'use client'

import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Loader2, Save, X } from 'lucide-react'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

interface KonohaModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    iggId: string | null
    icon: any
    iconColor?: string
    iconBg?: string
    iconBorder?: string
    saving?: boolean
    onSave?: () => void
    saveLabel?: string
    statusLabel?: string
    children: ReactNode
    maxWidth?: string
}

export default function KonohaModal({
    isOpen,
    onClose,
    title,
    iggId,
    icon: Icon,
    iconColor = '#21f3b1',
    iconBg = 'rgba(33,243,177,0.10)',
    iconBorder = 'rgba(33,243,177,0.24)',
    saving = false,
    onSave,
    saveLabel = 'Save',
    statusLabel = 'Manual save. Use Protocol Apply Changes to run the script.',
    children,
    maxWidth = '860px',
}: KonohaModalProps) {
    useBodyScrollLock(isOpen)

    const motionProps = {
        initial: { opacity: 0, scale: 0.96, y: 14 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 14 },
        transition: { duration: 0.2, ease: 'easeOut' as const },
    }
    const syncLabel = saving ? 'Saving' : 'Manual save'

    if (!iggId) {
        const noIggModal = (
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close modal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 z-50 cursor-default bg-black/75 backdrop-blur-sm"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                {...motionProps}
                                className="panel-solid pointer-events-auto flex w-full max-w-md flex-col items-center rounded-lg p-7 text-center"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-accent-gold/25 bg-accent-gold/10 text-accent-gold">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <p className="mb-2 text-[18px] font-bold text-text-primary">No IGG ID Selected</p>
                                <p className="mb-6 text-[13px] text-text-muted">Select an IGG ID before configuring this module.</p>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-md border border-border bg-bg-elevated px-5 py-2 text-[13px] font-bold text-text-primary transition-colors hover:border-accent-1/35 hover:text-accent-1"
                                >
                                    Close
                                </button>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        )

        return typeof document === 'undefined' ? null : createPortal(noIggModal, document.body)
    }

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.button
                        type="button"
                        aria-label="Close modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 cursor-default bg-black/75 backdrop-blur-sm"
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none md:p-6">
                        <motion.div
                            {...motionProps}
                            style={{ maxWidth }}
                            className="panel-solid pointer-events-auto flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg"
                        >
                            <div className="flex items-center justify-between gap-4 border-b border-border bg-bg-elevated/60 px-5 py-4 md:px-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                                        style={{ backgroundColor: iconBg, border: `1px solid ${iconBorder}` }}
                                    >
                                        <Icon style={{ color: iconColor }} className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="flex min-w-0 items-center gap-2 truncate text-[17px] font-bold text-text-primary">
                                            <span className="truncate">{title}</span>
                                            {saving && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-1" />}
                                        </h2>
                                        <p className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                                            IGG ID {iggId}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <span className="hidden rounded-full border border-accent-1/25 bg-accent-1/10 px-3 py-1.5 text-[11px] font-black text-accent-1 sm:inline-flex">
                                        {syncLabel}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-accent-3/20 bg-accent-3/10 text-accent-3 transition-colors hover:bg-accent-3/20"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative flex-1 overflow-y-auto overflow-x-hidden p-5 scrollbar-thin md:p-6">
                                {children}
                            </div>

                            <div className="flex flex-col gap-3 border-t border-border bg-bg-elevated/55 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                                <div className="text-center text-[12px] text-text-muted sm:text-left">
                                    {saving ? 'Saving settings to config...' : statusLabel}
                                </div>
                                {onSave && (
                                    <div className="flex w-full items-center gap-3 sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={onSave}
                                            disabled={saving}
                                            className="btn-primary flex-1 gap-2 px-5 text-[13px] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                                        >
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            {saving ? 'Saving...' : saveLabel}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )

    return typeof document === 'undefined' ? null : createPortal(modal, document.body)
}

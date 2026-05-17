'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2 } from 'lucide-react'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { ReactNode } from 'react'

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
    children: ReactNode
    maxWidth?: string
}

export default function KonohaModal({
    isOpen,
    onClose,
    title,
    iggId,
    icon: Icon,
    iconColor = '#7B5EFF',
    iconBg = 'rgba(123,94,255,0.12)',
    iconBorder = 'rgba(123,94,255,0.25)',
    saving = false,
    onSave,
    children,
    maxWidth = '860px'
}: KonohaModalProps) {
    useBodyScrollLock(isOpen)

    if (!iggId) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/75 z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0F0F1A] border border-[rgba(123,94,255,0.15)] rounded-[18px] p-8 z-50 shadow-2xl flex flex-col items-center text-center"
                        >
                            <p className="text-[18px] font-bold text-[#F0F4FF] mb-2 font-sans">No IGG ID Selected</p>
                            <p className="text-[13px] text-[#6B7A99] mb-6">Please select an IGG ID to configure settings</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-lg bg-[rgba(123,94,255,0.1)] border border-[rgba(123,94,255,0.2)] text-[#F0F4FF] hover:bg-[rgba(123,94,255,0.2)] transition-colors text-[13px]"
                            >
                                Close
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        )
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Full screen overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/75 z-50 backdrop-blur-sm"
                    />

                    {/* Modal Card Wrapper */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            style={{ maxWidth }}
                            className="w-full max-h-[90vh] bg-[#0F0F1A] border border-[rgba(123,94,255,0.15)] rounded-[18px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-7 py-5 border-b border-[rgba(123,94,255,0.15)]"
                                style={{ background: 'linear-gradient(135deg, rgba(0,255,178,0.06), rgba(123,94,255,0.04))' }}>
                                <div className="flex items-center gap-4 min-w-0">
                                    <div
                                        className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: iconBg, border: `1px solid ${iconBorder}` }}
                                    >
                                        <Icon style={{ color: iconColor }} className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="font-sans text-[18px] font-bold text-[#F0F4FF] tracking-wide flex items-center gap-3">
                                            {title}
                                            {saving && <Loader2 className="w-4 h-4 animate-spin text-[#00FFB2]" />}
                                        </h2>
                                        <p className="font-mono text-[11px] text-[#6B7A99] mt-0.5">IGG ID: {iggId}</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                                    style={{
                                        backgroundColor: 'rgba(255,77,109,0.08)',
                                        border: '1px solid rgba(255,77,109,0.2)',
                                        color: '#FF4D6D'
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </motion.button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin relative">
                                {children}
                            </div>

                            {/* Footer */}
                            <div className="px-7 py-4 border-t border-[rgba(123,94,255,0.15)] bg-[#161626] flex items-center justify-between gap-4">
                                <div className="hidden sm:block text-[11px] text-[#6B7A99] font-sans">
                                    Changes sync with your bot <span className="text-[#00FFB2]">in real-time</span>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 sm:flex-none px-5 py-[9px] rounded-[9px] border border-[rgba(123,94,255,0.15)] bg-transparent hover:bg-[rgba(255,77,109,0.06)] hover:border-[#FF4D6D] hover:text-[#FF4D6D] text-[#6B7A99] font-sans text-[13px] transition-colors"
                                    >
                                        Close
                                    </button>
                                    {onSave && (
                                        <motion.button
                                            whileHover={{ scale: 1.02, translateY: -1, opacity: 0.92 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={onSave}
                                            disabled={saving}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-[7px] px-[22px] py-[9px] rounded-[9px] font-sans text-[13px] font-bold text-[#07070E] disabled:opacity-50"
                                            style={{ background: 'linear-gradient(135deg, #00FFB2, #7B5EFF)' }}
                                        >
                                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                            Save Changes
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

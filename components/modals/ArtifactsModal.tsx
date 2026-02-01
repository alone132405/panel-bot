'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Gem, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface ArtifactsModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function ArtifactsModal({ isOpen, onClose, iggId }: ArtifactsModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Artifacts settings - maps to artifactSettings in settings.json
    const [appraiseArtifacts, setAppraiseArtifacts] = useState(false)
    const [collectFreeChest, setCollectFreeChest] = useState(false)
    const [collectChest, setCollectChest] = useState(false)
    const [collectWeeklyChallenge, setCollectWeeklyChallenge] = useState(false)

    useEffect(() => {
        if (isOpen && iggId) {
            loadSettings()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, iggId])

    const loadSettings = async () => {
        if (!iggId) {
            toast.error('Please select an IGG ID first')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`)
            if (res.ok) {
                const data = await res.json()
                setSettings(data)

                if (data.artifactSettings) {
                    setAppraiseArtifacts(data.artifactSettings.appraiseArtifacts ?? false)
                    setCollectFreeChest(data.artifactSettings.collectFreeChest ?? false)
                    setCollectChest(data.artifactSettings.collectChest ?? false)
                    setCollectWeeklyChallenge(data.artifactSettings.collectWeeklyChallenge ?? false)
                }
            } else {
                toast.error('Failed to load settings')
            }
        } catch (error) {
            toast.error('Error loading settings')
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        if (!iggId || !settings) return

        setSaving(true)
        try {
            const updatedSettings = {
                ...settings,
                artifactSettings: {
                    ...settings.artifactSettings,
                    appraiseArtifacts,
                    collectFreeChest,
                    collectChest,
                    collectWeeklyChallenge,
                }
            }

            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings),
            })

            if (res.ok) {
                toast.success('Settings saved successfully')
                onClose()
                setSettings(updatedSettings)
            } else {
                toast.error('Failed to save settings')
            }
        } catch (error) {
            toast.error('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

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
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-4 md:inset-20 bg-background-secondary rounded-2xl border border-white/10 shadow-2xl z-50 flex items-center justify-center"
                        >
                            <div className="text-center">
                                <p className="text-xl text-white mb-2">No IGG ID Selected</p>
                                <p className="text-gray-400">Please select an IGG ID to configure artifacts settings</p>
                            </div>
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-2 sm:inset-4 md:inset-10 lg:inset-20 bg-background-secondary rounded-xl md:rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-4 border-b border-white/10 bg-background-tertiary/50">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Gem className="w-5 h-5 md:w-6 md:h-6 text-purple-400 flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Artifacts</h2>
                                    {saving && (
                                        <Loader2 className="w-4 h-4 animate-spin text-primary-400 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-[10px] md:text-sm text-gray-400 truncate">IGG ID: {iggId}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 scrollbar-thin">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                                </div>
                            ) : (
                                <div className="w-full space-y-6">
                                    {/* Settings Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-base sm:text-lg font-bold text-white">Settings</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { label: 'Appraise Artifacts', value: appraiseArtifacts, setter: setAppraiseArtifacts },
                                                { label: 'Collect Free Artifact Chests', value: collectFreeChest, setter: setCollectFreeChest },
                                                { label: 'Collect Artifact Chests (using coins)', value: collectChest, setter: setCollectChest },
                                                { label: 'Collect Weekly Challenge Rewards', value: collectWeeklyChallenge, setter: setCollectWeeklyChallenge },
                                            ].map((option, index) => (
                                                <label key={index} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={option.value}
                                                        onChange={(e) => option.setter(e.target.checked)}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-2 px-3 md:px-6 py-2.5 md:py-4 border-t border-white/10 bg-background-tertiary/50">
                            <p className="hidden md:block text-sm text-gray-400">Click "Save Changes" to save your settings</p>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={onClose}
                                    className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover text-gray-300 text-sm font-medium transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={saveSettings}
                                    disabled={saving}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">Save Changes</span>
                                    <span className="sm:hidden">Save</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

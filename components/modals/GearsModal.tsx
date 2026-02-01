'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Save, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface GearsModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function GearsModal({ isOpen, onClose, iggId }: GearsModalProps) {
    const [fullSettings, setFullSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Gear settings
    const [autoSwitchGear, setAutoSwitchGear] = useState(false)
    const [idleGearTime, setIdleGearTime] = useState(300)
    const [idleGearSet, setIdleGearSet] = useState(0)

    // Idle Gear options
    const idleGearOptions = [
        { value: 0, label: 'None' },
        { value: 1, label: 'Familiars' },
        { value: 2, label: 'Gathering' },
        { value: 3, label: 'Research' },
        { value: 4, label: 'Building' },
        { value: 5, label: 'Training' },
        { value: 6, label: 'Hunting' },
        { value: 7, label: 'Lunar Gear' },
        { value: 8, label: 'Food Boost' },
        { value: 9, label: 'Stone Boost' },
        { value: 10, label: 'Wood Boost' },
        { value: 11, label: 'Ore Boost' },
        { value: 12, label: 'Gold Boost' },
        { value: 13, label: 'Travel Boost' },
    ]

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
                setFullSettings(data)

                if (data.gearSettings) {
                    setAutoSwitchGear(data.gearSettings.autoSwitchGear || false)
                    setIdleGearTime(data.gearSettings.idleGearTime || 300)
                    setIdleGearSet(data.gearSettings.idleGearSet || 0)
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
        if (!iggId || !fullSettings) return

        setSaving(true)
        try {
            const updatedSettings = {
                ...fullSettings,
                gearSettings: {
                    ...fullSettings.gearSettings,
                    autoSwitchGear,
                    idleGearTime,
                    idleGearSet,
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
                setFullSettings(updatedSettings)
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
                                <p className="text-gray-400">Please select an IGG ID to configure gear settings</p>
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
                                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-teal-400 flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Gear Settings</h2>
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
                                    {/* Gear Settings Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Auto Switch Gears */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={autoSwitchGear}
                                                    onChange={(e) => setAutoSwitchGear(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-gray-300">Auto Switch Gears</span>
                                            </label>
                                        </div>

                                        {/* Idle Gear Time */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors">
                                            <label className="text-sm text-gray-300">Idle Gear Time:</label>
                                            <input
                                                type="number"
                                                value={idleGearTime ?? ''}
                                                min={10}
                                                max={3600}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? 0 : Number(e.target.value)
                                                    setIdleGearTime(Math.min(3600, Math.max(10, val)))
                                                }}
                                                className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                            />
                                        </div>

                                        {/* Idle Gear Dropdown */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors">
                                            <label className="text-sm text-gray-300">Idle Gear:</label>
                                            <select
                                                value={idleGearSet}
                                                onChange={(e) => setIdleGearSet(Number(e.target.value))}
                                                className="w-40 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            >
                                                {idleGearOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-2 px-3 md:px-6 py-2.5 md:py-4 border-t border-white/10 bg-background-tertiary/50">
                            <p className="hidden md:block text-sm text-gray-400">Click Save to apply changes</p>
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
                                    className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="hidden sm:inline">Saving...</span>
                                            <span className="sm:hidden">...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span className="hidden sm:inline">Save Changes</span>
                                            <span className="sm:hidden">Save</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2, Settings, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { SETTINGS_FIELD_MAP, setNestedValue, getNestedValue } from '@/lib/settingsMapper'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    categoryName: string
    iggId: string | null
}

export default function SettingsModal({ isOpen, onClose, categoryName, iggId }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState('Basic')
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [applying, setApplying] = useState(false)
    const [useSpeedUps, setUseSpeedUps] = useState(false)
    const tabsContainerRef = useRef<HTMLDivElement>(null)

    useBodyScrollLock(isOpen)

    const tabs = ['Basic', 'Quests', 'Speed-ups', 'Labyrinth', 'Tycoon', 'Guild', 'Turf Boosts', 'Daily Missions']

    useEffect(() => {
        if (isOpen && iggId) {
            loadSettings()
        }
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
                setUseSpeedUps(data.speedUpSettings?.useSpeedUps || false)
            } else {
                toast.error('Failed to load settings')
            }
        } catch (error) {
            toast.error('Error loading settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSettingChange = (path: string, value: any) => {
        const updatedSettings = { ...settings }
        setNestedValue(updatedSettings, path, value)
        setSettings(updatedSettings)

        if (path === 'speedUpSettings.useSpeedUps') {
            setUseSpeedUps(value)
        }
    }

    const handleSave = async () => {
        if (!iggId || !settings) return

        setSaving(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })

            if (res.ok) {
                toast.success('Settings saved successfully!')
                onClose()
            } else {
                toast.error('Failed to save settings')
            }
        } catch (error) {
            toast.error('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const getCurrentTabSettings = () => {
        if (!settings) return []

        const tabMap: Record<string, string> = {
            'Basic': 'basic',
            'Quests': 'quests',
            'Speed-ups': 'speedups',
            'Labyrinth': 'labyrinth',
            'Tycoon': 'tycoon',
            'Guild': 'guild',
            'Turf Boosts': 'turf-boosts',
            'Daily Missions': 'daily-missions',
        }

        const subcategory = tabMap[activeTab]
        const mappings = SETTINGS_FIELD_MAP.filter(
            (m) => m.category === 'general' && m.subcategory === subcategory
        )

        return mappings.map((mapping) => ({
            label: mapping.uiField,
            type: mapping.type,
            value: getNestedValue(settings, mapping.jsonPath),
            path: mapping.jsonPath,
            dependent: mapping.jsonPath.startsWith('speedUpSettings.') && mapping.jsonPath !== 'speedUpSettings.useSpeedUps',
            min: mapping.min,
            max: mapping.max,
        }))
    }

    const currentSettings = getCurrentTabSettings()

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
                            <div className="text-center p-4">
                                <Settings className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                <p className="text-lg text-white mb-2">No IGG ID Selected</p>
                                <p className="text-gray-400 text-sm">Please select an IGG ID to configure settings</p>
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
                        className="fixed inset-1 sm:inset-2 md:inset-10 lg:inset-20 bg-background-secondary rounded-xl md:rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header - Compact on mobile, full on desktop */}
                        <div className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-4 border-b border-white/10 bg-background-tertiary/50">
                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                <div className="hidden md:flex w-10 h-10 rounded-xl bg-primary-500/20 items-center justify-center flex-shrink-0">
                                    <Settings className="w-5 h-5 text-primary-400" />
                                </div>
                                <div className="flex md:hidden w-8 h-8 rounded-lg bg-primary-500/20 items-center justify-center flex-shrink-0">
                                    <Settings className="w-4 h-4 text-primary-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <h2 className="text-sm md:text-2xl font-bold text-white truncate">{categoryName}</h2>
                                        {saving && <Loader2 className="w-4 h-4 animate-spin text-primary-400 flex-shrink-0" />}
                                    </div>
                                    <p className="text-[10px] md:text-sm text-gray-400 truncate">ID: {iggId}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>

                        {/* Tabs - Pill style on mobile, standard on desktop */}
                        <div
                            ref={tabsContainerRef}
                            className="flex gap-1.5 md:gap-2 px-2 md:px-6 py-2 md:py-3 border-b border-white/5 bg-background-tertiary/30 overflow-x-auto scrollbar-none md:scrollbar-thin"
                        >
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    data-tab={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full md:rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab
                                        ? 'bg-primary-500 md:bg-primary-500/20 text-white md:text-primary-400 shadow-lg shadow-primary-500/25 md:shadow-none md:border md:border-primary-500/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-6 scrollbar-thin">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                                </div>
                            ) : (
                                <div className="w-full">
                                    {currentSettings.length > 0 ? (
                                        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
                                            {currentSettings.map((setting: any, index) => {
                                                const isDisabled = activeTab === 'Speed-ups' && setting.dependent && !useSpeedUps

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center justify-between p-3 md:p-4 transition-all
                                                            glass-card md:bg-none md:rounded-xl md:border-none md:shadow-none md:backdrop-blur-none
                                                            ${isDisabled
                                                                ? 'opacity-60 md:bg-surface/20 md:opacity-50 cursor-not-allowed'
                                                                : 'md:bg-surface/50 md:hover:bg-surface'
                                                            }`}
                                                    >
                                                        {/* Label */}
                                                        <label className={`flex items-center gap-2 md:gap-3 flex-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                            {/* Desktop checkbox */}
                                                            {setting.type === 'boolean' && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={setting.value || false}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => handleSettingChange(setting.path, e.target.checked)}
                                                                    className="hidden md:block w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            )}
                                                            <span className={`text-xs md:text-sm flex-1 pr-2 ${isDisabled ? 'text-gray-500' : 'text-gray-200 md:text-gray-300'
                                                                }`}>
                                                                {setting.label}
                                                            </span>
                                                        </label>

                                                        {/* Control */}
                                                        <div className="flex-shrink-0">
                                                            {/* Mobile toggle switch */}
                                                            {setting.type === 'boolean' && (
                                                                <label className="relative inline-flex items-center cursor-pointer md:hidden">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={setting.value || false}
                                                                        disabled={isDisabled}
                                                                        onChange={(e) => handleSettingChange(setting.path, e.target.checked)}
                                                                        className="sr-only peer"
                                                                    />
                                                                    <div className={`w-9 h-5 rounded-full peer transition-colors ${isDisabled ? 'bg-gray-700' : 'bg-gray-600 peer-checked:bg-primary-500'
                                                                        } peer-focus:ring-2 peer-focus:ring-primary-500/50 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4`}></div>
                                                                </label>
                                                            )}

                                                            {setting.type === 'number' && (
                                                                <input
                                                                    type="number"
                                                                    value={setting.value || 0}
                                                                    min={setting.min}
                                                                    max={setting.max}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => {
                                                                        let val = Number(e.target.value)
                                                                        if (setting.min !== undefined) val = Math.max(setting.min, val)
                                                                        if (setting.max !== undefined) val = Math.min(setting.max, val)
                                                                        handleSettingChange(setting.path, val)
                                                                    }}
                                                                    className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            )}

                                                            {setting.type === 'string' && (
                                                                <input
                                                                    type="text"
                                                                    value={setting.value || ''}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => handleSettingChange(setting.path, e.target.value)}
                                                                    className="w-24 md:w-40 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            )}

                                                            {setting.type === 'time' && (
                                                                <input
                                                                    type="text"
                                                                    value={setting.value || ''}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => handleSettingChange(setting.path, e.target.value)}
                                                                    className="w-24 md:w-40 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Settings className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-400 text-sm">No settings available for this category</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-2 px-2 md:px-6 py-2 md:py-4 border-t border-white/10 bg-background-tertiary/50">
                            <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-none">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || applying}
                                    className="flex-1 md:flex-none md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Save
                                </button>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover text-gray-300 text-sm font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { useWebSocket } from '@/hooks/useWebSocket'
import { SETTINGS_FIELD_MAP, setNestedValue, getNestedValue } from '@/lib/settingsMapper'

interface ProtectionModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function ProtectionModal({ isOpen, onClose, iggId }: ProtectionModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Load settings when modal opens or IGG ID changes
    useEffect(() => {
        if (isOpen && iggId) {
            loadSettings()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, iggId])

    // WebSocket for real-time updates (disabled for now)
    // useWebSocket(iggId, (data) => {
    //     if (data.settings) {
    //         setSettings(data.settings)
    //         toast.info('Settings updated externally')
    //     }
    // })

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
            } else {
                toast.error('Failed to load settings')
            }
        } catch (error) {
            toast.error('Error loading settings')
        } finally {
            setLoading(false)
        }
    }

    const saveSetting = async (path: string, value: any) => {
        if (!iggId) return

        setSaving(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, value }),
            })

            if (res.ok) {
                const updatedSettings = { ...settings }
                setNestedValue(updatedSettings, path, value)
                setSettings(updatedSettings)
            } else {
                toast.error('Failed to save setting')
            }
        } catch (error) {
            toast.error('Error saving setting')
        } finally {
            setSaving(false)
        }
    }

    const debouncedSave = useDebounce(saveSetting, 500)

    const handleSettingChange = (path: string, value: any) => {
        const updatedSettings = { ...settings }
        setNestedValue(updatedSettings, path, value)
        setSettings(updatedSettings)
    }

    const getProtectionSettings = () => {
        if (!settings) return { shield: [], antiScout: [], gathering: [], shelter: [] }

        const protectionMappings = SETTINGS_FIELD_MAP.filter((m) => m.category === 'protection')

        return {
            shield: protectionMappings
                .filter((m) => m.subcategory === 'shield')
                .map((m) => ({
                    label: m.uiField,
                    type: m.type,
                    value: getNestedValue(settings, m.jsonPath),
                    path: m.jsonPath,
                })),
            antiScout: protectionMappings
                .filter((m) => m.subcategory === 'anti-scout')
                .map((m) => ({
                    label: m.uiField,
                    type: m.type,
                    value: getNestedValue(settings, m.jsonPath),
                    path: m.jsonPath,
                })),
            gathering: protectionMappings
                .filter((m) => m.subcategory === 'gathering')
                .map((m) => ({
                    label: m.uiField,
                    type: m.type,
                    value: getNestedValue(settings, m.jsonPath),
                    path: m.jsonPath,
                })),
            shelter: protectionMappings
                .filter((m) => m.subcategory === 'shelter')
                .map((m) => ({
                    label: m.uiField,
                    type: m.type,
                    value: getNestedValue(settings, m.jsonPath),
                    path: m.jsonPath,
                })),
        }
    }

    const protectionSettings = getProtectionSettings()

    const renderSetting = (setting: any) => (
        <div key={setting.path} className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors">
            <label className="flex items-center gap-3 flex-1 cursor-pointer">
                {setting.type === 'boolean' && (
                    <input
                        type="checkbox"
                        checked={setting.value || false}
                        onChange={(e) => handleSettingChange(setting.path, e.target.checked)}
                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                    />
                )}
                <span className="text-sm text-gray-300">{setting.label}</span>
            </label>

            {setting.type === 'number' && (
                <input
                    type="number"
                    value={setting.value || 0}
                    onChange={(e) => handleSettingChange(setting.path, Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
            )}
        </div>
    )

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
                                <p className="text-gray-400">Please select an IGG ID to configure protection settings</p>
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
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Protection Settings</h2>
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
                                    {/* Shield Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Shield</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {protectionSettings.shield.map(renderSetting)}

                                            {/* Preferred Shield Dropdown - in grid */}
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors">
                                                <label className="text-sm text-gray-300">Preferred Shield:</label>
                                                <select
                                                    value={settings?.protectionSettings?.preferredShield ?? -1}
                                                    onChange={(e) => handleSettingChange('protectionSettings.preferredShield', Number(e.target.value))}
                                                    className="w-40 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                >
                                                    <option value={-1}>None</option>
                                                    <option value={0}>4 Hour Shield</option>
                                                    <option value={1}>8 Hour Shield</option>
                                                    <option value={2}>1 Day Shield</option>
                                                    <option value={3}>3 Day Shield</option>
                                                    <option value={4}>7 Day Shield</option>
                                                    <option value={5}>14 Day Shield</option>
                                                    <option value={6}>12 Hour Shield</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Anti-Scout Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Anti-Scout</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {protectionSettings.antiScout.map(renderSetting)}
                                        </div>
                                    </div>

                                    {/* Gathering Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Gathering (Resource Tiles)</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {protectionSettings.gathering.map(renderSetting)}
                                        </div>
                                    </div>

                                    {/* Shelter Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Shelter</h3>

                                        {/* Shelter Mode Option */}
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-3">Shelter Mode</label>
                                            <div className="flex flex-wrap gap-4">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="shelterMode"
                                                        checked={settings?.protectionSettings?.ShelterType === 0}
                                                        onChange={() => handleSettingChange('protectionSettings.ShelterType', 0)}
                                                        className="w-4 h-4 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-gray-300">Don't Shelter</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="shelterMode"
                                                        checked={settings?.protectionSettings?.ShelterType === 1}
                                                        onChange={() => handleSettingChange('protectionSettings.ShelterType', 1)}
                                                        className="w-4 h-4 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-gray-300">Always Shelter</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="shelterMode"
                                                        checked={settings?.protectionSettings?.ShelterType === 2}
                                                        onChange={() => handleSettingChange('protectionSettings.ShelterType', 2)}
                                                        className="w-4 h-4 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-gray-300">Shelter When Under Attack</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {protectionSettings.shelter.map(renderSetting)}
                                        </div>

                                        {/* Shelter Type Option */}
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-3">Shelter Type</label>
                                            <div className="flex flex-col gap-2">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="shelterType"
                                                        checked={settings?.protectionSettings?.AttackShelterType === 0}
                                                        onChange={() => handleSettingChange('protectionSettings.AttackShelterType', 0)}
                                                        className="w-4 h-4 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-gray-300">Shelter Hero and 1 Troop</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="shelterType"
                                                        checked={settings?.protectionSettings?.AttackShelterType === 1}
                                                        onChange={() => handleSettingChange('protectionSettings.AttackShelterType', 1)}
                                                        className="w-4 h-4 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-gray-300">Shelter Hero and Best Troops (Depends on Shelter Capacity)</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="grid grid-cols-2 md:flex md:flex-row md:items-center md:justify-between gap-2 px-3 md:px-6 py-2.5 md:py-4 border-t border-white/10 bg-background-tertiary/50">
                            <button
                                onClick={onClose}
                                className="order-1 md:order-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover text-gray-300 text-sm font-medium transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={async () => {
                                    if (!iggId || !settings) return
                                    setSaving(true)
                                    try {
                                        const res = await fetch(`/api/settings/${iggId}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(settings),
                                        })
                                        if (res.ok) {
                                            toast.success('Protection settings saved successfully!')
                                            onClose()
                                        } else {
                                            toast.error('Failed to save settings')
                                        }
                                    } catch (error) {
                                        toast.error('Error saving settings')
                                    } finally {
                                        setSaving(false)
                                    }
                                }}
                                disabled={saving}
                                className="order-2 md:order-1 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

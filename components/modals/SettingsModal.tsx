'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2, Settings, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
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
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title=""
                iggId={iggId}
                icon={Settings}
                iconColor="#64748b"
                iconBg="rgba(100,116,139,0.15)"
                iconBorder="rgba(100,116,139,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            iggId={iggId}
            icon={Settings}
            iconColor="#64748b"
            iconBg="rgba(100,116,139,0.15)"
            iconBorder="rgba(100,116,139,0.3)"
            saving={saving}
            onSave={handleSave}
            maxWidth="860px"
        >
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
                                                                    step="1"
                                                                    value={setting.value ?? ''}
                                                                    min={setting.min}
                                                                    max={setting.max}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value === '' ? 0 : Math.floor(Number(e.target.value))
                                                                        handleSettingChange(setting.path, val)
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                                            e.preventDefault();
                                                                        }
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        let val = e.target.value === '' ? 0 : Math.floor(Number(e.target.value))
                                                                        if (setting.min !== undefined && val < Number(setting.min)) val = Number(setting.min)
                                                                        if (setting.max !== undefined && val > Number(setting.max)) val = Number(setting.max)
                                                                        if (val !== setting.value) handleSettingChange(setting.path, val)
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
                                                                    type="time"
                                                                    step="1"
                                                                    value={setting.value || ''}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => handleSettingChange(setting.path, e.target.value)}
                                                                    placeholder="HH:mm:ss"
                                                                    onBlur={(e) => {
                                                                        let val = e.target.value || ''
                                                                        if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(val)) {
                                                                            val = String(setting.min || '00:00:00')
                                                                        }
                                                                        if (setting.min !== undefined && val < String(setting.min)) val = String(setting.min)
                                                                        if (setting.max !== undefined && val > String(setting.max)) val = String(setting.max)
                                                                        if (val !== setting.value) handleSettingChange(setting.path, val)
                                                                    }}
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
        </KonohaModal>
    )
}
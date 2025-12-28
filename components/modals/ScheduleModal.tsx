'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Calendar, Clock, Shield, Eye, Home, Shuffle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface ScheduleModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function ScheduleModal({ isOpen, onClose, iggId }: ScheduleModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Schedule settings
    const [enableSchedule, setEnableSchedule] = useState(false)
    const [recallArmies, setRecallArmies] = useState(false)
    const [monitorShield, setMonitorShield] = useState(false)
    const [monitorAntiScout, setMonitorAntiScout] = useState(false)
    const [monitorShelter, setMonitorShelter] = useState(false)
    const [randomizeSchedule, setRandomizeSchedule] = useState(false)
    const [randomMaxMinutes, setRandomMaxMinutes] = useState(10)

    // Schedule 1
    const [schedule1Enabled, setSchedule1Enabled] = useState(true)
    const [schedule1StartTime, setSchedule1StartTime] = useState('02:00')
    const [schedule1EndTime, setSchedule1EndTime] = useState('04:30')

    // Schedule 2
    const [schedule2Enabled, setSchedule2Enabled] = useState(false)
    const [schedule2OfflineAfter, setSchedule2OfflineAfter] = useState('01:00')
    const [schedule2OnlineIn, setSchedule2OnlineIn] = useState('00:05')

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

                if (data.scheduleSettings) {
                    setEnableSchedule(data.scheduleSettings.enableSchedule ?? false)
                    setRecallArmies(data.scheduleSettings.recallTroops ?? false)
                    setMonitorShield(data.scheduleSettings.checkShield ?? false)
                    setMonitorAntiScout(data.scheduleSettings.checkAnti ?? false)
                    setMonitorShelter(data.scheduleSettings.checkShelter ?? false)
                    setRandomizeSchedule(data.scheduleSettings.randomizeSchedule ?? false)
                    setRandomMaxMinutes(data.scheduleSettings.randMax ?? 10)

                    const schedType = data.scheduleSettings.scheduleType ?? 0
                    setSchedule1Enabled(schedType === 0)
                    setSchedule2Enabled(schedType === 1)

                    setSchedule1StartTime(data.scheduleSettings.schedule1StartTime ?? data.scheduleSettings.offlineTime ?? '02:00')
                    setSchedule1EndTime(data.scheduleSettings.onlineTime ?? '04:30')
                    setSchedule2OfflineAfter(data.scheduleSettings.offlineTime1 ?? '01:00')
                    setSchedule2OnlineIn(data.scheduleSettings.onlineTime1 ?? '00:05')
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

    const updateSettingsObject = (path: string, value: any) => {
        const keys = path.split('.')
        // Deep clone to avoid mutation issues
        const newSettings = JSON.parse(JSON.stringify(settings || {}))

        // Ensure scheduleSettings exists if that's what we're updating
        if (keys[0] === 'scheduleSettings' && !newSettings.scheduleSettings) {
            newSettings.scheduleSettings = {}
        }

        let current: any = newSettings
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {}
            }
            current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = value
        setSettings(newSettings)
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

            const data = await res.json().catch(() => ({}))

            if (res.ok) {
                toast.success('Schedule settings saved!')
                onClose()
            } else {
                if (res.status === 403) {
                    toast.error(data.error || 'Subscription expired')
                } else {
                    toast.error(data.error || 'Failed to save settings')
                }
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
                                <p className="text-gray-400">Please select an IGG ID to configure schedule settings</p>
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
                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-slate-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <h2 className="text-sm md:text-2xl font-bold text-white truncate">Schedule Settings</h2>
                                        {saving && <Loader2 className="w-4 h-4 animate-spin text-primary-400 flex-shrink-0" />}
                                    </div>
                                    <p className="text-[10px] md:text-sm text-gray-400 truncate">IGG ID: {iggId}</p>
                                </div>
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
                                <div className="space-y-4 md:space-y-6 max-w-full">
                                    {/* Enable Schedule Toggle */}
                                    <div className="p-3 md:p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={enableSchedule}
                                                onChange={(e) => {
                                                    setEnableSchedule(e.target.checked)
                                                    updateSettingsObject('scheduleSettings.enableSchedule', e.target.checked)
                                                }}
                                                className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50 flex-shrink-0"
                                            />
                                            <span className="text-sm md:text-base font-medium text-primary-300">Enable Schedule</span>
                                        </label>
                                    </div>

                                    {/* Schedule Options */}
                                    <div className="space-y-3 md:space-y-4">
                                        <h3 className="text-sm md:text-lg font-bold text-white">Schedule Options</h3>

                                        {/* Mobile: 2x2 Grid, Desktop: Flex wrap */}
                                        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
                                            {[
                                                { label: 'Recall Armies', mobileLabel: 'Recall Armies', value: recallArmies, setter: setRecallArmies, key: 'recallTroops' },
                                                { label: 'Monitor Shield', mobileLabel: 'Monitor Shield', value: monitorShield, setter: setMonitorShield, key: 'checkShield' },
                                                { label: 'Monitor Anti-Scout', mobileLabel: 'Anti-Scout', value: monitorAntiScout, setter: setMonitorAntiScout, key: 'checkAnti' },
                                                { label: 'Monitor Shelter', mobileLabel: 'Shelter', value: monitorShelter, setter: setMonitorShelter, key: 'checkShelter' },
                                            ].map((opt) => (
                                                <label key={opt.key} className="flex items-center gap-2 p-2.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={opt.value}
                                                        onChange={(e) => {
                                                            opt.setter(e.target.checked)
                                                            updateSettingsObject(`scheduleSettings.${opt.key}`, e.target.checked)
                                                        }}
                                                        className="w-4 h-4 md:w-5 md:h-5 rounded bg-background-tertiary border-white/10 text-primary-500 flex-shrink-0"
                                                    />
                                                    <span className="text-xs md:text-sm text-white truncate">
                                                        <span className="md:hidden">{opt.mobileLabel}</span>
                                                        <span className="hidden md:inline">{opt.label}</span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>

                                        {/* Randomize - Compact on mobile, inline on desktop */}
                                        <div className="p-3 md:p-4 rounded-xl bg-surface/50 space-y-2 md:space-y-0 md:flex md:items-center md:gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={randomizeSchedule}
                                                    onChange={(e) => {
                                                        setRandomizeSchedule(e.target.checked)
                                                        updateSettingsObject('scheduleSettings.randomizeSchedule', e.target.checked)
                                                    }}
                                                    className="w-4 h-4 md:w-5 md:h-5 rounded bg-background-tertiary border-white/10 text-primary-500 flex-shrink-0"
                                                />
                                                <span className="text-xs md:text-sm text-white">Randomize Schedule</span>
                                            </label>
                                            <div className="flex items-center gap-2 pl-6 md:pl-0">
                                                <span className="text-xs md:text-sm text-gray-300">Random Max (Minutes):</span>
                                                <input
                                                    type="number"
                                                    value={randomMaxMinutes ?? ''}
                                                    min={0}
                                                    max={60}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? 0 : Number(e.target.value)
                                                        setRandomMaxMinutes(val)
                                                        updateSettingsObject('scheduleSettings.randMax', val)
                                                    }}
                                                    className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule 1 */}
                                    <div className={`p-3 md:p-4 rounded-xl border transition-colors space-y-3 ${schedule1Enabled ? 'bg-blue-500/10 border-blue-500/30' : 'bg-surface/30 border-white/5'}`}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={schedule1Enabled}
                                                onChange={() => {
                                                    setSchedule1Enabled(true)
                                                    setSchedule2Enabled(false)
                                                    updateSettingsObject('scheduleSettings.scheduleType', 0)
                                                }}
                                                className="w-4 h-4 md:w-5 md:h-5 text-primary-500 flex-shrink-0"
                                            />
                                            <span className="text-sm md:text-lg font-bold text-white">Schedule 1</span>
                                        </label>
                                        {/* Mobile: Stacked, Desktop: Inline */}
                                        <div className="pl-6 md:pl-7 space-y-2 md:space-y-0 md:flex md:items-center md:gap-3">
                                            <span className="text-xs md:text-sm text-gray-300">Go offline between</span>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <input
                                                    type="time"
                                                    value={schedule1StartTime}
                                                    onChange={(e) => {
                                                        setSchedule1StartTime(e.target.value)
                                                        updateSettingsObject('scheduleSettings.schedule1StartTime', e.target.value)
                                                        updateSettingsObject('scheduleSettings.offlineTime', e.target.value)
                                                    }}
                                                    className="w-24 md:w-28 px-2 md:px-3 py-1.5 md:py-2 bg-background-tertiary border border-white/10 rounded-lg text-white text-xs md:text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-xs md:text-sm text-gray-300">and</span>
                                                <input
                                                    type="time"
                                                    value={schedule1EndTime}
                                                    onChange={(e) => {
                                                        setSchedule1EndTime(e.target.value)
                                                        updateSettingsObject('scheduleSettings.onlineTime', e.target.value)
                                                    }}
                                                    className="w-24 md:w-28 px-2 md:px-3 py-1.5 md:py-2 bg-background-tertiary border border-white/10 rounded-lg text-white text-xs md:text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule 2 */}
                                    <div className={`p-3 md:p-4 rounded-xl border transition-colors space-y-3 ${schedule2Enabled ? 'bg-purple-500/10 border-purple-500/30' : 'bg-surface/30 border-white/5'}`}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={schedule2Enabled}
                                                onChange={() => {
                                                    setSchedule1Enabled(false)
                                                    setSchedule2Enabled(true)
                                                    updateSettingsObject('scheduleSettings.scheduleType', 1)
                                                }}
                                                className="w-4 h-4 md:w-5 md:h-5 text-primary-500 flex-shrink-0"
                                            />
                                            <span className="text-sm md:text-lg font-bold text-white">Schedule 2</span>
                                        </label>
                                        {/* Mobile: Stacked, Desktop: Inline */}
                                        <div className="pl-6 md:pl-7 space-y-2 md:space-y-0 md:flex md:items-center md:gap-3">
                                            <span className="text-xs md:text-sm text-gray-300">Go offline after</span>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <input
                                                    type="time"
                                                    value={schedule2OfflineAfter}
                                                    onChange={(e) => {
                                                        setSchedule2OfflineAfter(e.target.value)
                                                        updateSettingsObject('scheduleSettings.offlineTime1', e.target.value)
                                                    }}
                                                    className="w-24 md:w-28 px-2 md:px-3 py-1.5 md:py-2 bg-background-tertiary border border-white/10 rounded-lg text-white text-xs md:text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-xs md:text-sm text-gray-300">hours, come back online in</span>
                                                <input
                                                    type="time"
                                                    value={schedule2OnlineIn}
                                                    onChange={(e) => {
                                                        setSchedule2OnlineIn(e.target.value)
                                                        updateSettingsObject('scheduleSettings.onlineTime1', e.target.value)
                                                    }}
                                                    className="w-24 md:w-28 px-2 md:px-3 py-1.5 md:py-2 bg-background-tertiary border border-white/10 rounded-lg text-white text-xs md:text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-hidden md:inline text-xs md:text-sm text-gray-300">hours</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-2 px-3 md:px-6 py-2.5 md:py-4 border-t border-white/10 bg-background-tertiary/50">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 md:flex-none md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Save
                            </button>
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

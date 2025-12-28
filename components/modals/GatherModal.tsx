'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Wheat, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface GatherModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function GatherModal({ isOpen, onClose, iggId }: GatherModalProps) {
    const [fullSettings, setFullSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Main settings
    const [gatherResources, setGatherResources] = useState(false)
    const [maxArmies, setMaxArmies] = useState(0)
    const [leaveSpareArmy, setLeaveSpareArmy] = useState(true)
    const [spareArmyAmount, setSpareArmyAmount] = useState(2)

    // Gathering options
    const [useGatheringGear, setUseGatheringGear] = useState(false)
    const [autoRecallCamps, setAutoRecallCamps] = useState(true)
    const [targetHigherLevel, setTargetHigherLevel] = useState(true)
    const [onlyClearableTiles, setOnlyClearableTiles] = useState(false)
    const [ignoreLevelSettings, setIgnoreLevelSettings] = useState(false)
    const [gatherLowestAmount, setGatherLowestAmount] = useState(false)

    // Levels
    const [levels, setLevels] = useState({
        level1: true,
        level2: true,
        level3: true,
        level4: true,
        level5: true,
        level6: false,
    })

    // Resource types
    const [resourceTypes, setResourceTypes] = useState({
        food: false,
        stone: true,
        wood: false,
        ore: false,
        gold: false,
        gems: false,
    })

    // Misc settings
    const [searchMultiplier, setSearchMultiplier] = useState(2)
    const [maxTravelTime, setMaxTravelTime] = useState(20)
    const [sendingDelay, setSendingDelay] = useState(2)
    const [minTileResourceCount, setMinTileResourceCount] = useState(100000)

    // Schedule
    const [gatherSchedule, setGatherSchedule] = useState(false)
    const [scheduleStart, setScheduleStart] = useState('12:00:00')
    const [scheduleEnd, setScheduleEnd] = useState('20:00:00')

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
                setFullSettings(data)

                if (data.gatherSettings) {
                    setGatherResources(data.gatherSettings.gatherResources || false)
                    setMaxArmies(data.gatherSettings.maxArmysToSend || 0)
                    setLeaveSpareArmy(data.gatherSettings.leaveSpareArmy ?? true)
                    setSpareArmyAmount(data.gatherSettings.spareArmyAmount || 2)
                    setUseGatheringGear(data.gatherSettings.useGatherGear || false)
                    setAutoRecallCamps(data.gatherSettings.recallCamps ?? true)
                    setTargetHigherLevel(data.gatherSettings.targetHigherLevel ?? true)
                    setOnlyClearableTiles(data.gatherSettings.clearTiles || false)
                    setIgnoreLevelSettings(data.gatherSettings.ignoreLevelForGems || false)
                    setGatherLowestAmount(data.gatherSettings.gatherLowestResources || false)

                    if (data.gatherSettings.levelToGather && Array.isArray(data.gatherSettings.levelToGather)) {
                        setLevels({
                            level1: data.gatherSettings.levelToGather[0] ?? true,
                            level2: data.gatherSettings.levelToGather[1] ?? true,
                            level3: data.gatherSettings.levelToGather[2] ?? true,
                            level4: data.gatherSettings.levelToGather[3] ?? true,
                            level5: data.gatherSettings.levelToGather[4] ?? true,
                            level6: data.gatherSettings.levelToGather[5] ?? false,
                        })
                    }

                    if (data.gatherSettings.typesToGather && Array.isArray(data.gatherSettings.typesToGather)) {
                        setResourceTypes({
                            food: data.gatherSettings.typesToGather[0] ?? false,
                            stone: data.gatherSettings.typesToGather[1] ?? false,
                            wood: data.gatherSettings.typesToGather[2] ?? false,
                            ore: data.gatherSettings.typesToGather[3] ?? true,
                            gold: data.gatherSettings.typesToGather[4] ?? true,
                            gems: data.gatherSettings.typesToGather[5] ?? false,
                        })
                    }

                    setSearchMultiplier(data.gatherSettings.maxSearchArea || 2)
                    setMaxTravelTime(data.gatherSettings.maxWalkTime || 20)
                    setSendingDelay(data.gatherSettings.sendingDelay || 2)
                    setMinTileResourceCount(data.gatherSettings.tileMinimum || 100000)
                    setGatherSchedule(data.gatherSettings.useGatherSchedule || false)
                    setScheduleStart(data.gatherSettings.gatherStartTime || '12:00:00')
                    setScheduleEnd(data.gatherSettings.gatherEndTime || '20:00:00')
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
                gatherSettings: {
                    ...fullSettings.gatherSettings,
                    gatherResources,
                    maxArmysToSend: maxArmies,
                    leaveSpareArmy,
                    spareArmyAmount,
                    useGatherGear: useGatheringGear,
                    recallCamps: autoRecallCamps,
                    targetHigherLevel,
                    clearTiles: onlyClearableTiles,
                    ignoreLevelForGems: ignoreLevelSettings,
                    gatherLowestResources: gatherLowestAmount,
                    levelToGather: [levels.level1, levels.level2, levels.level3, levels.level4, levels.level5, levels.level6],
                    typesToGather: [resourceTypes.food, resourceTypes.stone, resourceTypes.wood, resourceTypes.ore, resourceTypes.gold, resourceTypes.gems],
                    maxSearchArea: searchMultiplier,
                    maxWalkTime: maxTravelTime,
                    sendingDelay,
                    tileMinimum: minTileResourceCount,
                    useGatherSchedule: gatherSchedule,
                    gatherStartTime: scheduleStart,
                    gatherEndTime: scheduleEnd,
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
                                <p className="text-gray-400">Please select an IGG ID to configure gather settings</p>
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
                                    <Wheat className="w-5 h-5 md:w-6 md:h-6 text-accent-emerald flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Gather Settings</h2>
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
                                    {/* Main Toggle */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={gatherResources}
                                                onChange={(e) => setGatherResources(e.target.checked)}
                                                className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                            />
                                            <span className="text-sm font-medium text-primary-300">Gather Resources</span>
                                        </label>
                                    </div>

                                    {/* Army Settings */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Max Amount of Armies to Gather: (0 For All Armies)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="8"
                                                value={maxArmies}
                                                onChange={(e) => setMaxArmies(Math.min(8, Math.max(0, Number(e.target.value))))}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm text-gray-300">Leave Spare Army(s)?</label>
                                                <input
                                                    type="checkbox"
                                                    checked={leaveSpareArmy}
                                                    onChange={(e) => setLeaveSpareArmy(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
                                            {leaveSpareArmy && (
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Amount:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="7"
                                                        value={spareArmyAmount}
                                                        onChange={(e) => setSpareArmyAmount(Math.min(7, Math.max(1, Number(e.target.value))))}
                                                        className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gathering Options */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Gathering Options</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { label: 'Use Gathering Gear?', value: useGatheringGear, setter: setUseGatheringGear },
                                                { label: 'Auto Recall Camps', value: autoRecallCamps, setter: setAutoRecallCamps },
                                                { label: 'Target Higher Level over Closest', value: targetHigherLevel, setter: setTargetHigherLevel },
                                                { label: 'Only Gather Clearable Tiles', value: onlyClearableTiles, setter: setOnlyClearableTiles },
                                                { label: 'Ignore Level Settings for Gems?', value: ignoreLevelSettings, setter: setIgnoreLevelSettings },
                                                { label: 'Gather Lowest Resource Amount', value: gatherLowestAmount, setter: setGatherLowestAmount },
                                            ].map((option, idx) => (
                                                <label key={idx} className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <span className="text-sm text-gray-300">{option.label}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={option.value}
                                                        onChange={(e) => option.setter(e.target.checked)}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Level Selection */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Level:</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[1, 2, 3, 4, 5, 6].map((level) => (
                                                <label key={level} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={levels[`level${level}` as keyof typeof levels]}
                                                        onChange={(e) => setLevels({ ...levels, [`level${level}`]: e.target.checked })}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">{level}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Resource Types */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Types:</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { key: 'food', label: 'Food' },
                                                { key: 'stone', label: 'Stone' },
                                                { key: 'wood', label: 'Wood' },
                                                { key: 'ore', label: 'Ore' },
                                                { key: 'gold', label: 'Gold' },
                                                { key: 'gems', label: 'Gems' },
                                            ].map((type) => (
                                                <label key={type.key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={resourceTypes[type.key as keyof typeof resourceTypes]}
                                                        onChange={(e) => setResourceTypes({ ...resourceTypes, [type.key]: e.target.checked })}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">{type.label}</span>
                                                </label>
                                            ))}
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
                                    Cancel
                                </button>
                                <button
                                    onClick={saveSettings}
                                    disabled={saving}
                                    className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

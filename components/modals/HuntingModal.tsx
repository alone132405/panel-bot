'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Target, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface HuntingModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function HuntingModal({ isOpen, onClose, iggId }: HuntingModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Hunting settings
    const [huntMonsters, setHuntMonsters] = useState(false)
    const [maxTravelTime, setMaxTravelTime] = useState(60)
    const [sendingDelay, setSendingDelay] = useState(1000)

    // Hunting Options
    const [useEnergyItems, setUseEnergyItems] = useState(false)
    const [useWingedBoots, setUseWingedBoots] = useState(false)
    const [sendUnfinishedToGuildChat, setSendUnfinishedToGuildChat] = useState(false)
    const [avoidConflict, setAvoidConflict] = useState(false)
    const [alsoAvoidGuild, setAlsoAvoidGuild] = useState(false)

    const [useSaberfangSkill, setUseSaberfangSkill] = useState(false)
    const [huntPriority, setHuntPriority] = useState('0')

    // Levels to Hunt
    const [huntLevel1, setHuntLevel1] = useState(true)
    const [huntLevel2, setHuntLevel2] = useState(true)
    const [huntLevel3, setHuntLevel3] = useState(false)
    const [huntLevel4, setHuntLevel4] = useState(false)
    const [huntLevel5, setHuntLevel5] = useState(false)

    // Types to Hunt
    const [huntMagicPhysical, setHuntMagicPhysical] = useState(true)
    const [huntHighMDEF, setHuntHighMDEF] = useState(false)
    const [huntHighPDEF, setHuntHighPDEF] = useState(false)

    const [startHuntWhenEnergy, setStartHuntWhenEnergy] = useState(90)
    const [useComboPrediction, setUseComboPrediction] = useState(false)
    const [stopAfterOneKill, setStopAfterOneKill] = useState(false)

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

                // Load from monsterSettings
                if (data.monsterSettings) {
                    setHuntMonsters(data.monsterSettings.autoHunting ?? false)
                    setMaxTravelTime(data.monsterSettings.maxWalkTime ?? 60)
                    setSendingDelay(data.monsterSettings.huntSendDelay ?? 1000)
                    setUseEnergyItems(data.monsterSettings.useEnergyItems ?? false)
                    setUseWingedBoots(data.monsterSettings.useBoots ?? false)
                    setSendUnfinishedToGuildChat(data.monsterSettings.sendMonstersToChat ?? false)
                    setAvoidConflict(data.monsterSettings.avoidConflict ?? false)
                    setAlsoAvoidGuild(data.monsterSettings.avoidGuildConflict ?? false)
                    setUseSaberfangSkill(data.monsterSettings.allowSaberfang ?? false)

                    // huntMode: 0=Any, 1=Full Health, 2=Lowest Health, 3=Steal
                    setHuntPriority(String(data.monsterSettings.huntMode ?? 0))

                    // huntLevels is an array of 5 booleans
                    const levels = data.monsterSettings.huntLevels || [true, true, false, false, false]
                    setHuntLevel1(levels[0] ?? true)
                    setHuntLevel2(levels[1] ?? true)
                    setHuntLevel3(levels[2] ?? false)
                    setHuntLevel4(levels[3] ?? false)
                    setHuntLevel5(levels[4] ?? false)

                    // monsterTypes is an array of 3 booleans
                    const types = data.monsterSettings.monsterTypes || [true, false, false]
                    setHuntMagicPhysical(types[0] ?? true)
                    setHuntHighMDEF(types[1] ?? false)
                    setHuntHighPDEF(types[2] ?? false)

                    setStartHuntWhenEnergy(data.monsterSettings.energyPercentage ?? 90)
                    setUseComboPrediction(data.monsterSettings.comboPrediction ?? false)
                    setStopAfterOneKill(data.monsterSettings.oneKillHunt ?? false)
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
                monsterSettings: {
                    ...settings.monsterSettings,
                    autoHunting: huntMonsters,
                    maxWalkTime: maxTravelTime,
                    huntSendDelay: sendingDelay,
                    useEnergyItems,
                    useBoots: useWingedBoots,
                    sendMonstersToChat: sendUnfinishedToGuildChat,
                    avoidConflict,
                    avoidGuildConflict: alsoAvoidGuild,
                    allowSaberfang: useSaberfangSkill,
                    huntMode: parseInt(huntPriority, 10),
                    huntLevels: [huntLevel1, huntLevel2, huntLevel3, huntLevel4, huntLevel5],
                    monsterTypes: [huntMagicPhysical, huntHighMDEF, huntHighPDEF],
                    energyPercentage: startHuntWhenEnergy,
                    comboPrediction: useComboPrediction,
                    oneKillHunt: stopAfterOneKill,
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
                                <p className="text-gray-400">Please select an IGG ID to configure hunting settings</p>
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
                                    <Target className="w-5 h-5 md:w-6 md:h-6 text-orange-400 flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Hunting</h2>
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
                                    {/* Hunt Monsters and Settings */}
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer w-fit">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={huntMonsters}
                                                onChange={(e) => setHuntMonsters(e.target.checked)}
                                                className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                            />
                                            <span className="text-sm text-white">Hunt Monsters</span>
                                        </label>
                                    </div>

                                    {/* Max Travel Time and Sending Delay */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Max Travel Time (Seconds):</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={3600}
                                                value={maxTravelTime}
                                                onChange={(e) => setMaxTravelTime(Math.min(3600, Math.max(0, Number(e.target.value))))}
                                                className="w-32 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Sending Delay (MS):</label>
                                            <input
                                                type="number"
                                                min={200}
                                                max={10000}
                                                value={sendingDelay}
                                                onChange={(e) => setSendingDelay(Math.min(10000, Math.max(200, Number(e.target.value))))}
                                                className="w-32 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Hunting Options */}
                                    <div className="space-y-3">
                                        <h3 className="text-base sm:text-lg font-bold text-white">Hunting Options</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { label: 'Use Energy Items', value: useEnergyItems, setter: setUseEnergyItems },
                                                { label: 'Use Winged Boots (On Steal)', value: useWingedBoots, setter: setUseWingedBoots },
                                                { label: 'Send Unfinished Monsters to Guild Chat', value: sendUnfinishedToGuildChat, setter: setSendUnfinishedToGuildChat },
                                                { label: 'Avoid Conflict', value: avoidConflict, setter: setAvoidConflict },
                                                { label: 'Also Avoid Guild?', value: alsoAvoidGuild, setter: setAlsoAvoidGuild },
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

                                    {/* Use Saberfang Skill and Hunt Priority */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={useSaberfangSkill}
                                                    onChange={(e) => setUseSaberfangSkill(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-white">Use Saberfang Skill (If Possible)</span>
                                            </label>
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Hunt Priority:</label>
                                            <select
                                                value={huntPriority}
                                                onChange={(e) => setHuntPriority(e.target.value)}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            >
                                                <option value="0">Any</option>
                                                <option value="1">Full Health</option>
                                                <option value="2">Lowest Health</option>
                                                <option value="3">Steal</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Levels to Hunt */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-medium text-gray-300">Levels to Hunt:</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { label: '1', value: huntLevel1, setter: setHuntLevel1 },
                                                { label: '2', value: huntLevel2, setter: setHuntLevel2 },
                                                { label: '3', value: huntLevel3, setter: setHuntLevel3 },
                                                { label: '4', value: huntLevel4, setter: setHuntLevel4 },
                                                { label: '5', value: huntLevel5, setter: setHuntLevel5 },
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

                                    {/* Types to Hunt */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-medium text-gray-300">Types to Hunt:</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { label: 'Magic and Physical', value: huntMagicPhysical, setter: setHuntMagicPhysical },
                                                { label: 'High MDEF', value: huntHighMDEF, setter: setHuntHighMDEF },
                                                { label: 'High PDEF', value: huntHighPDEF, setter: setHuntHighPDEF },
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

                                    {/* Start Hunt When Energy and Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Start Hunt When Energy Is More Than:</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={startHuntWhenEnergy}
                                                    onChange={(e) => setStartHuntWhenEnergy(Math.min(100, Math.max(0, Number(e.target.value))))}
                                                    className="w-24 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-gray-400">%</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={useComboPrediction}
                                                    onChange={(e) => setUseComboPrediction(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-white">Use Combo Prediction</span>
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={stopAfterOneKill}
                                                    onChange={(e) => setStopAfterOneKill(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-white">Stop After One Kill</span>
                                            </label>
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

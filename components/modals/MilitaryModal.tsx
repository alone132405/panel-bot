'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Sword, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface MilitaryModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

interface TroopData {
    name: string
    tier: number
    amount: number
}

export default function MilitaryModal({ isOpen, onClose, iggId }: MilitaryModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Military settings
    const [trainTroops, setTrainTroops] = useState(false)
    const [rotateTroopTraining, setRotateTroopTraining] = useState(false)
    const [healTroops, setHealTroops] = useState(false)
    const [healSanctuary, setHealSanctuary] = useState(false)
    const [selectedChapter, setSelectedChapter] = useState('Chapter 9')
    const [craftLuminousGear, setCraftLuminousGear] = useState(false)

    // Skirmish settings
    const [attackSkirmishLevels, setAttackSkirmishLevels] = useState(false)
    const [attackTrailByFire, setAttackTrailByFire] = useState(false)
    const [recallTroopsForSkirmish, setRecallTroopsForSkirmish] = useState(false)
    const [attackSkirmishWhenTroopsAt, setAttackSkirmishWhenTroopsAt] = useState(90)

    // Troop data
    const [troops, setTroops] = useState<TroopData[]>([
        { name: 'Grunt', tier: 1, amount: 0 },
        { name: 'Archer', tier: 1, amount: 0 },
        { name: 'Cataphract', tier: 1, amount: 0 },
        { name: 'Ballista', tier: 1, amount: 0 },
        { name: 'Gladiator', tier: 2, amount: 0 },
        { name: 'Sharpshooter', tier: 2, amount: 0 },
        { name: 'Reptilian Rider', tier: 2, amount: 0 },
        { name: 'Catapult', tier: 2, amount: 0 },
        { name: 'Royal Guard', tier: 3, amount: 0 },
        { name: 'Stealth Sniper', tier: 3, amount: 0 },
        { name: 'Royal Cavalry', tier: 3, amount: 0 },
        { name: 'Fire Trebuchet', tier: 3, amount: 0 },
        { name: 'Heroic Fighter', tier: 4, amount: 0 },
        { name: 'Heroic Cannoneer', tier: 4, amount: 0 },
        { name: 'Ancient Drake Rider', tier: 4, amount: 0 },
        { name: 'Destroyer', tier: 4, amount: 0 },
        { name: 'Luminary Guard', tier: 5, amount: 0 },
        { name: 'Luminary Marksman', tier: 5, amount: 0 },
        { name: 'Luminary Lion Force', tier: 5, amount: 0 },
        { name: 'Luminary Avenger', tier: 5, amount: 0 },
    ])

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

                // Load from troopSettings
                if (data.troopSettings) {
                    setTrainTroops(data.troopSettings.autoTrainTroops ?? false)
                    setRotateTroopTraining(data.troopSettings.rotateTraining ?? false)
                    setHealTroops(data.troopSettings.autoHealTroops ?? false)
                    setHealSanctuary(data.troopSettings.autoHealSanctuary ?? false)
                    setCraftLuminousGear(data.troopSettings.autoCraftLunar ?? false)
                }

                // Load from miscSettings for skirmish
                if (data.miscSettings) {
                    setAttackSkirmishLevels(data.miscSettings.autoAttackSkirmish ?? false)
                    setAttackTrailByFire(data.miscSettings.autoAttackFireTrial ?? false)
                    setRecallTroopsForSkirmish(data.miscSettings.recallTroopsForSkirmish ?? false)
                    setAttackSkirmishWhenTroopsAt(data.miscSettings.skirmishTroopPercent ?? 90)

                    // Convert skirmishChapter to chapter string
                    const chapterNum = data.miscSettings.skirmishChapter ?? 9
                    setSelectedChapter(`Chapter ${chapterNum}`)
                }

                // Load troop data from militarySettings
                if (data.militarySettings?.troops) {
                    setTroops(data.militarySettings.troops)
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
            // Get current chapter index (0-based)
            const chapterNum = parseInt(selectedChapter.replace('Chapter ', ''))
            const chapterIndex = chapterNum - 1

            // Separate T1-T4 troops (first 16) and T5 troops (last 4)
            const t14Troops = troops.slice(0, 16).map(t => t.amount)
            const t5Troops = troops.slice(16, 20).map(t => t.amount)

            // Update troopData array for the current chapter
            const troopData = [...(settings.troopSettings?.troopData || [])]
            while (troopData.length <= chapterIndex) {
                troopData.push(Array(16).fill(0))
            }
            troopData[chapterIndex] = t14Troops

            const updatedSettings = {
                ...settings,
                troopSettings: {
                    ...settings.troopSettings,
                    autoTrainTroops: trainTroops,
                    rotateTraining: rotateTroopTraining,
                    autoHealTroops: healTroops,
                    autoHealSanctuary: healSanctuary,
                    autoCraftLunar: craftLuminousGear,
                    troopData,
                    troopData_T5: t5Troops,
                },
                miscSettings: {
                    ...settings.miscSettings,
                    skirmishChapter: chapterNum,
                    autoAttackSkirmish: attackSkirmishLevels,
                    autoSkirmish: attackSkirmishLevels,
                    autoAttackFireTrial: attackTrailByFire,
                    recallTroopsForSkirmish,
                    skirmishTroopPercent: attackSkirmishWhenTroopsAt,
                },
                militarySettings: {
                    ...settings.militarySettings,
                    troops,
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

    const handleResetTroops = () => {
        const resetTroops = troops.map(t => ({ ...t, amount: 0 }))
        setTroops(resetTroops)
        toast.success('Troop data reset!')
    }

    const updateTroopAmount = (index: number, amount: number) => {
        const updatedTroops = [...troops]
        updatedTroops[index].amount = Math.min(999999999999999999, Math.max(0, amount))
        setTroops(updatedTroops)
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
                                <p className="text-gray-400">Please select an IGG ID to configure military settings</p>
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
                                    <Sword className="w-5 h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Military</h2>
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
                                    {/* Main Options */}
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { label: 'Train Troops', value: trainTroops, setter: setTrainTroops },
                                            { label: 'Rotate Troop Training', value: rotateTroopTraining, setter: setRotateTroopTraining },
                                            { label: 'Heal Troops', value: healTroops, setter: setHealTroops },
                                            { label: 'Heal Sanctuary', value: healSanctuary, setter: setHealSanctuary },
                                            { label: 'Craft Luminous Gear', value: craftLuminousGear, setter: setCraftLuminousGear },
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

                                    {/* Reset Troop Data Button */}
                                    <div className="flex justify-start">
                                        <button
                                            onClick={handleResetTroops}
                                            className="px-6 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-medium transition-colors"
                                        >
                                            Reset Troop Data
                                        </button>
                                    </div>

                                    {/* Skirmish / Chapter Section */}
                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                        <h3 className="text-base sm:text-lg font-bold text-white">Skirmish / Chapter</h3>

                                        {/* Selected Chapter */}
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Selected Chapter:</label>
                                            <select
                                                value={selectedChapter}
                                                onChange={(e) => setSelectedChapter(e.target.value)}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            >
                                                {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                                                    <option key={num} value={`Chapter ${num}`}>Chapter {num}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={attackSkirmishLevels}
                                                    onChange={(e) => setAttackSkirmishLevels(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-white">Attack Skirmish Levels</span>
                                            </label>

                                            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={attackTrailByFire}
                                                    onChange={(e) => setAttackTrailByFire(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-white">Attack Trail By Fire</span>
                                            </label>

                                            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={recallTroopsForSkirmish}
                                                    onChange={(e) => setRecallTroopsForSkirmish(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-white">Recall Troops for Skirmish</span>
                                            </label>
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Attack Skirmish When Troops At:</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={attackSkirmishWhenTroopsAt}
                                                    onChange={(e) => setAttackSkirmishWhenTroopsAt(Math.min(100, Math.max(0, Number(e.target.value))))}
                                                    className="w-24 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-gray-400">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Troop Table */}
                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                        <h3 className="text-base sm:text-lg font-bold text-white">Troop Training</h3>

                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-white/10">
                                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Troop Name</th>
                                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-300">Tier</th>
                                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-300">Amount to Train</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {troops.map((troop, index) => (
                                                        <tr key={index} className="border-b border-white/5 hover:bg-surface/30 transition-colors">
                                                            <td className="py-3 px-4 text-sm text-white">{troop.name}</td>
                                                            <td className="py-3 px-4 text-sm text-center text-gray-400">{troop.tier}</td>
                                                            <td className="py-3 px-4 text-center">
                                                                <input
                                                                    type="number"
                                                                    value={troop.amount ?? ''}
                                                                    min={0}
                                                                    max={999999999999999999}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value === '' ? 0 : Number(e.target.value)
                                                                        updateTroopAmount(index, val)
                                                                    }}
                                                                    className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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

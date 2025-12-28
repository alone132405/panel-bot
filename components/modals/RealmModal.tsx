'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Globe, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface RealmModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function RealmModal({ isOpen, onClose, iggId }: RealmModalProps) {
    const [fullSettings, setFullSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Gathering settings
    const [gatherResources, setGatherResources] = useState(false)
    const [maxArmies, setMaxArmies] = useState(0)
    const [leaveSpareArmy, setLeaveSpareArmy] = useState(false)
    const [spareArmyAmount, setSpareArmyAmount] = useState(1)
    const [useHighTierTroops, setUseHighTierTroops] = useState(false)

    // Resource types
    const [gatherFood, setGatherFood] = useState(false)
    const [gatherStone, setGatherStone] = useState(false)
    const [gatherWood, setGatherWood] = useState(false)
    const [gatherOre, setGatherOre] = useState(true)
    const [gatherGold, setGatherGold] = useState(true)
    const [gatherLunite, setGatherLunite] = useState(false)

    // Hunting settings
    const [huntMonsters, setHuntMonsters] = useState(false)
    const [useEnergyItems, setUseEnergyItems] = useState(false)
    const [killsPerDay, setKillsPerDay] = useState(1)
    const [monsterLevel, setMonsterLevel] = useState(1)

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

                // Load realm gathering settings from realmGatherSettings
                if (data.realmGatherSettings) {
                    setGatherResources(data.realmGatherSettings.autoGathering || false)
                    setMaxArmies(data.realmGatherSettings.maxArmysToSend || 0)
                    setLeaveSpareArmy(data.realmGatherSettings.leaveSpareArmy || false)
                    setSpareArmyAmount(data.realmGatherSettings.spareArmyAmount || 1)
                    setUseHighTierTroops(data.realmGatherSettings.highTier || false)

                    // Map typesToGather array: [Food, Stone, Wood, Ore, Gold, Lunite]
                    if (data.realmGatherSettings.typesToGather && Array.isArray(data.realmGatherSettings.typesToGather)) {
                        setGatherFood(data.realmGatherSettings.typesToGather[0] || false)
                        setGatherStone(data.realmGatherSettings.typesToGather[1] || false)
                        setGatherWood(data.realmGatherSettings.typesToGather[2] || false)
                        setGatherOre(data.realmGatherSettings.typesToGather[3] || true)
                        setGatherGold(data.realmGatherSettings.typesToGather[4] || true)
                        setGatherLunite(data.realmGatherSettings.typesToGather[5] || false)
                    }
                }

                // Load monster hunting settings from realmMonsterSettings
                if (data.realmMonsterSettings) {
                    setHuntMonsters(data.realmMonsterSettings.autoHunting || false)
                    setUseEnergyItems(data.realmMonsterSettings.useEnergyItems || false)
                    setKillsPerDay(data.realmMonsterSettings.autoHuntCount || 1)
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
                realmGatherSettings: {
                    ...fullSettings.realmGatherSettings,
                    autoGathering: gatherResources,
                    maxArmysToSend: maxArmies,
                    leaveSpareArmy,
                    spareArmyAmount,
                    highTier: useHighTierTroops,
                    typesToGather: [gatherFood, gatherStone, gatherWood, gatherOre, gatherGold, gatherLunite],
                },
                realmMonsterSettings: {
                    ...fullSettings.realmMonsterSettings,
                    autoHunting: huntMonsters,
                    useEnergyItems,
                    autoHuntCount: killsPerDay,
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
                                <p className="text-gray-400">Please select an IGG ID to configure realm settings</p>
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
                                    <Globe className="w-5 h-5 md:w-6 md:h-6 text-purple-400 flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Realm Settings</h2>
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
                                    {/* Gathering Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                            <div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={gatherResources}
                                                        onChange={(e) => {
                                                            setGatherResources(e.target.checked)

                                                        }}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm font-medium text-primary-300">Gather Resources</span>
                                                </label>
                                                <p className="text-xs text-gray-400 ml-8">(This will disable normal gathering mode)</p>
                                            </div>
                                        </div>

                                        {/* Gathering Options */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">
                                                    Max Amount of Armies to Gather: <span className="text-xs text-gray-400">(0 For All Armies)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={8}
                                                    value={maxArmies}
                                                    onChange={(e) => setMaxArmies(Math.max(0, Math.min(8, Number(e.target.value))))}
                                                    className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>

                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={leaveSpareArmy}
                                                            onChange={(e) => {
                                                                setLeaveSpareArmy(e.target.checked)

                                                            }}
                                                            className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                        <span className="text-sm text-gray-300">Leave Spare Army(s)?</span>
                                                    </label>
                                                </div>
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">Amount:</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={7}
                                                    value={spareArmyAmount}
                                                    onChange={(e) => setSpareArmyAmount(Math.max(0, Math.min(7, Number(e.target.value))))}
                                                    className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
                                        </div>

                                        {/* Use High Tier Troops */}
                                        <label className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                            <span className="text-sm text-gray-300">Use High Tier Troops</span>
                                            <input
                                                type="checkbox"
                                                checked={useHighTierTroops}
                                                onChange={(e) => {
                                                    setUseHighTierTroops(e.target.checked)

                                                }}
                                                className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </label>

                                        {/* Resource Types */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-3">Types:</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {[
                                                    { label: 'Food', value: gatherFood, setter: setGatherFood, index: 0 },
                                                    { label: 'Stone', value: gatherStone, setter: setGatherStone, index: 1 },
                                                    { label: 'Wood', value: gatherWood, setter: setGatherWood, index: 2 },
                                                    { label: 'Ore', value: gatherOre, setter: setGatherOre, index: 3 },
                                                    { label: 'Gold', value: gatherGold, setter: setGatherGold, index: 4 },
                                                    { label: 'Lunite', value: gatherLunite, setter: setGatherLunite, index: 5 },
                                                ].map((resource) => (
                                                    <label key={resource.index} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={resource.value}
                                                            onChange={(e) => {
                                                                resource.setter(e.target.checked)

                                                            }}
                                                            className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                        <span className="text-sm text-white">{resource.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hunting Section */}
                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                            <div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={huntMonsters}
                                                        onChange={(e) => {
                                                            setHuntMonsters(e.target.checked)

                                                        }}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-green-500 focus:ring-2 focus:ring-green-500/50"
                                                    />
                                                    <span className="text-sm font-medium text-green-300">Hunt Monsters</span>
                                                </label>
                                                <p className="text-xs text-gray-400 ml-8">(This will disable normal hunting mode)</p>
                                            </div>
                                        </div>

                                        {/* Hunting Options */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <label className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <span className="text-sm text-gray-300">Use Energy Items</span>
                                                <input
                                                    type="checkbox"
                                                    checked={useEnergyItems}
                                                    onChange={(e) => {
                                                        setUseEnergyItems(e.target.checked)

                                                    }}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </label>

                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">Kills Per Day:</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={killsPerDay}
                                                    onChange={(e) => setKillsPerDay(Math.max(0, Math.min(100, Number(e.target.value))))}
                                                    className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>

                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">Level:</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={5}
                                                    value={monsterLevel}
                                                    onChange={(e) => setMonsterLevel(Math.max(1, Math.min(5, Number(e.target.value))))}
                                                    className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
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

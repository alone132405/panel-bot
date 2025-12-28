'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Trophy, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface GuildFestModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

interface Mission {
    id: number
    name: string
    minPoints: number
    maxPoints: number
    enabled: boolean
}

// Mission ID to name mapping
const MISSION_MAP: { [key: number]: string } = {
    1: 'Complete Admin Quests',
    2: 'Complete Guild Quests',
    4: 'Send help to your guildmates',
    5: 'Hit monsters',
    6: 'Complete Phase 3 (Solo Events)',
    7: 'Complete Phase 3 (Hell Events)',
    9: 'Complete Hero Stages',
    10: 'Cargo Ship Trades',
    11: 'Open Mystery Boxes',
    19: 'Increase total Might',
    12: 'Increase Might (Troops)',
    13: 'Increase Might (Buildings)',
    15: 'Increase Might (Quests)',
    14: 'Increase Might (Research)',
    18: 'Increase Might (Hero Armies)',
    21: 'Research Tech',
    22: 'Train Soldiers',
    29: 'Gather Resources',
    30: 'Supply Resources',
    37: 'Hero Colosseum Battles',
    41: 'Time reduced using Speed Ups',
    98: 'Spend Gems',
    99: 'Spend Guild Coins',
    100: 'Purchase Special Bundles',
    60: 'Get Dark Essences',
    61: 'Win Darknest Coalition battles (Rally Captain only)',
    62: 'Use Holy Stars',
    68: 'Encounter Labyrinth Guardians',
    64: 'Get Lv 19+ Dark Essences',
    0: 'Get a random quest!',
    71: 'Time reduced using Speed Up Merging',
    69: 'Merge Pacts',
    70: 'Use Fragments',
    72: 'Use Familiar Attack skills',
    74: 'Obtain [Legendary] Loot',
    78: 'Unlock Castle Stars',
    79: 'Encounter Elite/10x-Labyrinth Guardians',
    80: 'Gain Familiar EXP with EXP items (Not inclusive of Fragments)',
    81: 'Spend Luck Tokens',
    82: 'Meet a Gemming Gremlin in Kingdom Tycoon',
    83: 'Craft Gear',
    84: 'Upgrade Artifacts',
    85: 'Enhance Artifacts (includes Blessings)',
    86: 'Spend Artifact Coins',
}

// Default missions with their IDs
const DEFAULT_MISSIONS: Mission[] = Object.entries(MISSION_MAP).map(([id, name]) => ({
    id: parseInt(id),
    name,
    minPoints: 175,
    maxPoints: 355,
    enabled: false,
}))

export default function GuildFestModal({ isOpen, onClose, iggId }: GuildFestModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Guild Fest settings
    const [collectRewards, setCollectRewards] = useState(false)
    const [completeMissions, setCompleteMissions] = useState(false)
    const [sendMailToPlayer, setSendMailToPlayer] = useState('')
    const [buyExtraMission, setBuyExtraMission] = useState(false)
    const [itemToBuy, setItemToBuy] = useState('[1051] Shield (8 h) - 150K')

    // Missions list with IDs
    const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS)

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

                if (data.eventSettings?.guildFest) {
                    const gf = data.eventSettings.guildFest
                    setCollectRewards(gf.collectRewards ?? false)

                    // Load gfMissionComplete settings
                    if (gf.gfMissionComplete) {
                        const gfmc = gf.gfMissionComplete
                        setCompleteMissions(gfmc.completeMissions ?? false)
                        setBuyExtraMission(gfmc.buyExtraMission ?? false)
                        setSendMailToPlayer(gfmc.mMailPlayerName ?? '')

                        // Map itemToBuy number to display string
                        if (gfmc.itemToBuy) {
                            setItemToBuy(`[${gfmc.itemToBuy}]`)
                        }

                        // Map missions from missionsToComplete_
                        if (gfmc.missionsToComplete_) {
                            const missionData = gfmc.missionsToComplete_
                            const updatedMissions = DEFAULT_MISSIONS.map((mission) => {
                                const missionKey = mission.id.toString()
                                if (missionData[missionKey]) {
                                    return {
                                        ...mission,
                                        enabled: missionData[missionKey].ToComplete ?? false,
                                        minPoints: missionData[missionKey].TakeIfHigherThanPoints ?? 175,
                                        maxPoints: missionData[missionKey].MaxPoints ?? 355,
                                    }
                                }
                                return mission
                            })
                            setMissions(updatedMissions)
                        }
                    }
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
            // Build missionsToComplete_ object from missions array using mission IDs
            const missionsToComplete_: { [key: string]: any } = {}
            missions.forEach((mission) => {
                missionsToComplete_[mission.id.toString()] = {
                    ToComplete: mission.enabled,
                    TakeIfHigherThanPoints: mission.minPoints,
                    MaxPoints: mission.maxPoints,
                }
            })

            // Extract item number from display string (e.g., "[1051] Shield" -> 1051)
            const itemMatch = itemToBuy.match(/\[(\d+)\]/)
            const itemNumber = itemMatch ? parseInt(itemMatch[1]) : 1051

            const updatedSettings = {
                ...settings,
                eventSettings: {
                    ...settings.eventSettings,
                    guildFest: {
                        ...settings.eventSettings?.guildFest,
                        collectRewards,
                        gfMissionComplete: {
                            ...settings.eventSettings?.guildFest?.gfMissionComplete,
                            missionsToComplete_,
                            completeMissions,
                            buyExtraMission,
                            itemToBuy: itemNumber,
                            mMailPlayerName: sendMailToPlayer,
                            mToMailPlayer: sendMailToPlayer.length > 0,
                        },
                    },
                },
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

    const updateMission = (index: number, field: 'enabled' | 'minPoints' | 'maxPoints', value: any) => {
        const updatedMissions = [...missions]
        if (field === 'minPoints' || field === 'maxPoints') {
            value = Math.min(355, Math.max(0, value))
        }
        updatedMissions[index] = { ...updatedMissions[index], [field]: value }
        setMissions(updatedMissions)
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
                                <p className="text-gray-400">Please select an IGG ID to configure guild fest settings</p>
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
                                    <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Guild Fest</h2>
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
                                <div className="max-w-7xl space-y-6">
                                    {/* Settings Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white">Settings</h3>

                                        <div className="space-y-3">
                                            {/* Row 1: Collect Rewards */}
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer w-fit">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={collectRewards}
                                                        onChange={(e) => setCollectRewards(e.target.checked)}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">Collect Rewards (Randomly Selected)</span>
                                                </label>
                                            </div>

                                            {/* Row 2: Complete Missions and Send Mail */}
                                            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-3 md:gap-4">
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={completeMissions}
                                                            onChange={(e) => setCompleteMissions(e.target.checked)}
                                                            className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                        <span className="text-sm text-white">Complete Missions?</span>
                                                    </label>
                                                </div>

                                                <div className="flex flex-col md:flex-row md:items-center gap-2">
                                                    <label className="text-sm text-gray-300 whitespace-nowrap">Send Mail to Player:</label>
                                                    <input
                                                        type="text"
                                                        value={sendMailToPlayer}
                                                        onChange={(e) => setSendMailToPlayer(e.target.value)}
                                                        className="w-full md:flex-1 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                        placeholder="Player name"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 3: Buy Extra Mission */}
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer w-fit">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={buyExtraMission}
                                                        onChange={(e) => setBuyExtraMission(e.target.checked)}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">Buy Extra Mission?</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Missions Table */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white">Missions</h3>
                                        <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
                                            <table className="w-full">
                                                <thead className="bg-surface/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-300 w-12"></th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Mission Name</th>
                                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Min Points</th>
                                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Max Points</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/10">
                                                    {missions.map((mission, index) => (
                                                        <tr key={index} className="hover:bg-surface/30 transition-colors">
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={mission.enabled}
                                                                    onChange={(e) => updateMission(index, 'enabled', e.target.checked)}
                                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-white">{mission.name}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="number"
                                                                    value={mission.minPoints}
                                                                    min={0}
                                                                    max={355}
                                                                    onChange={(e) => updateMission(index, 'minPoints', parseInt(e.target.value) || 0)}
                                                                    className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={355}
                                                                    value={mission.maxPoints}
                                                                    onChange={(e) => updateMission(index, 'maxPoints', parseInt(e.target.value) || 0)}
                                                                    className="w-20 px-2 py-1 bg-background-tertiary border border-white/10 rounded text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden space-y-4">
                                            {missions.map((mission, index) => (
                                                <div key={index} className="glass-card p-4 space-y-4">
                                                    <div className="flex items-start gap-3">
                                                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={mission.enabled}
                                                                onChange={(e) => updateMission(index, 'enabled', e.target.checked)}
                                                                className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                            />
                                                        </label>
                                                        <span className="text-sm text-white font-medium flex-1">{mission.name}</span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400">Min Points</label>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={355}
                                                                value={mission.minPoints}
                                                                onChange={(e) => updateMission(index, 'minPoints', parseInt(e.target.value) || 0)}
                                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400">Max Points</label>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={355}
                                                                value={mission.maxPoints}
                                                                onChange={(e) => updateMission(index, 'maxPoints', parseInt(e.target.value) || 0)}
                                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
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

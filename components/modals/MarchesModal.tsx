'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Users, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface MarchesModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function MarchesModal({ isOpen, onClose, iggId }: MarchesModalProps) {
    const [fullSettings, setFullSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Main settings
    const [joinRallies, setJoinRallies] = useState(false)
    const [rallyLimit, setRallyLimit] = useState(5)
    const [maxTravelTime, setMaxTravelTime] = useState(30)

    // Darkest levels
    const [darkestLevels, setDarkestLevels] = useState({
        level1: true,
        level2: true,
        level3: true,
        level4: true,
        level5: true,
        level6: true,
        level7: true,
        level8: true,
        level9: true,
        level10: true,
    })

    // Rally options
    const [dontJoinIfLabFull, setDontJoinIfLabFull] = useState(false)
    const [dontFillRally, setDontFillRally] = useState(true)
    const [dontSendSiege, setDontSendSiege] = useState(false)
    const [dontSendT5, setDontSendT5] = useState(false)
    const [sendOneType, setSendOneType] = useState(true)
    const [addBuffers, setAddBuffers] = useState(false)

    // Additional settings
    const [maxRallyTime, setMaxRallyTime] = useState('1 Hour')
    const [leaveExtraSpace, setLeaveExtraSpace] = useState(5)
    const [timeToWait, setTimeToWait] = useState(10)

    // Troops to send - maps to rallyTroopType: 0=send one troop, 2=send max troop (with priority)
    const [rallyTroopType, setRallyTroopType] = useState<number>(0)

    // Rally priority
    const [rallyPriority, setRallyPriority] = useState<'highest' | 'recommended'>('highest')
    const [rallyPriorityOneTroop, setRallyPriorityOneTroop] = useState<'highest' | 'recommended'>('highest')

    // Essence options
    const [transmuteDarkEssences, setTransmuteDarkEssences] = useState(false)
    const [keepOneSlotFree, setKeepOneSlotFree] = useState(true)
    const [deleteEssencesLowerThan, setDeleteEssencesLowerThan] = useState(28)

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

                if (data.rallySettings) {
                    setJoinRallies(data.rallySettings.joinRallies || false)
                    setRallyLimit(data.rallySettings.rallyLimit || 1)
                    setMaxTravelTime(data.rallySettings.maxWalkTime || 5)

                    // Map levelToAttack array to darkestLevels object
                    if (data.rallySettings.levelToAttack && Array.isArray(data.rallySettings.levelToAttack)) {
                        const levelsObj: any = {}
                        data.rallySettings.levelToAttack.forEach((enabled: boolean, index: number) => {
                            levelsObj[`level${index + 1}`] = enabled
                        })
                        setDarkestLevels(levelsObj)
                    }

                    setDontJoinIfLabFull(data.rallySettings.checkLab || false)
                    setDontFillRally(data.rallySettings.dontFillRally || true)
                    setDontSendSiege(data.rallySettings.noSiege || false)
                    setDontSendT5(data.rallySettings.noT5 || false)
                    setSendOneType(data.rallySettings.oneType || false)
                    setAddBuffers(data.rallySettings.addBuffers || false)
                    setMaxRallyTime(data.rallySettings.maxRallyTime?.toString() || '2')
                    setLeaveExtraSpace(data.rallySettings.extraSpace || 50)
                    setTimeToWait(data.rallySettings.rejoinWaitTime || 10)

                    // Map rallyTroopType: 0=send one troop, 2=send max troop (with priority)
                    setRallyTroopType(data.rallySettings.rallyTroopType ?? 0)

                    setRallyPriority('highest') // Not in settings.json
                    setRallyPriorityOneTroop('highest') // Not in settings.json
                    setTransmuteDarkEssences(data.rallySettings.craftEssences || false)
                    setKeepOneSlotFree(data.rallySettings.keepEssSlotFree || false)
                    setDeleteEssencesLowerThan(data.rallySettings.minEssenceLevel || 0)
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
            const levelToAttackArray = Object.values(darkestLevels)
            const updatedSettings = {
                ...fullSettings,
                rallySettings: {
                    ...fullSettings.rallySettings,
                    joinRallies,
                    rallyLimit,
                    maxWalkTime: maxTravelTime,
                    levelToAttack: levelToAttackArray,
                    checkLab: dontJoinIfLabFull,
                    dontFillRally,
                    noSiege: dontSendSiege,
                    noT5: dontSendT5,
                    oneType: sendOneType,
                    addBuffers,
                    maxRallyTime: Number(maxRallyTime),
                    extraSpace: leaveExtraSpace,
                    rejoinWaitTime: timeToWait,
                    rallyTroopType,
                    craftEssences: transmuteDarkEssences,
                    keepEssSlotFree: keepOneSlotFree,
                    minEssenceLevel: deleteEssencesLowerThan,
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
                                <p className="text-gray-400">Please select an IGG ID to configure marches settings</p>
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
                                    <Users className="w-5 h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Marches Settings</h2>
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
                                                checked={joinRallies}
                                                onChange={(e) => setJoinRallies(e.target.checked)}
                                                className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                            />
                                            <span className="text-sm font-medium text-primary-300">Join Rallies (Darknest Only)</span>
                                        </label>
                                    </div>

                                    {/* Rally Settings */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Rally Limit:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="8"
                                                value={rallyLimit}
                                                onChange={(e) => setRallyLimit(Math.min(8, Math.max(1, Number(e.target.value))))}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Max Travel Time (Minutes):</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={120}
                                                value={maxTravelTime}
                                                onChange={(e) => setMaxTravelTime(Math.max(0, Math.min(120, Number(e.target.value))))}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Darkest Levels */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Darknest Levels to Join:</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                                                <label key={level} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={darkestLevels[`level${level}` as keyof typeof darkestLevels]}
                                                        onChange={(e) => {
                                                            const updated = { ...darkestLevels, [`level${level}`]: e.target.checked }
                                                            setDarkestLevels(updated)
                                                            // Convert object to array for levelToAttack
                                                            const levelsArray = Object.values(updated)

                                                        }}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">{level}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rally Options */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Rally Options</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { label: 'Dont Join if lab is full?', value: dontJoinIfLabFull, setter: setDontJoinIfLabFull, key: 'dontJoinIfLabFull' },
                                                { label: 'Dont Fill Rally', value: dontFillRally, setter: setDontFillRally, key: 'dontFillRally' },
                                                { label: 'Dont send siege', value: dontSendSiege, setter: setDontSendSiege, key: 'dontSendSiege' },
                                                { label: 'Dont send T5', value: dontSendT5, setter: setDontSendT5, key: 'dontSendT5' },
                                                { label: 'Send One Type', value: sendOneType, setter: setSendOneType, key: 'sendOneType' },
                                                { label: 'Add Buffers', value: addBuffers, setter: setAddBuffers, key: 'addBuffers' },
                                            ].map((option) => (
                                                <label key={option.key} className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
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

                                    {/* Additional Settings */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Maximum Rally Time:</label>
                                            <select
                                                value={maxRallyTime}
                                                onChange={(e) => setMaxRallyTime(e.target.value)}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            >
                                                <option value="0">5 Minutes</option>
                                                <option value="1">10 Minutes</option>
                                                <option value="2">1 Hour</option>
                                                <option value="3">8 Hours</option>
                                            </select>
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Leave Extra Space:</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={200000}
                                                value={leaveExtraSpace}
                                                onChange={(e) => setLeaveExtraSpace(Math.max(0, Math.min(200000, Number(e.target.value))))}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Time to wait before rejoining if kicked (In Minutes):</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={120}
                                                value={timeToWait}
                                                onChange={(e) => setTimeToWait(Math.max(0, Math.min(120, Number(e.target.value))))}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Troops to Send */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Troops to Send:</h3>
                                        <div className="flex flex-wrap gap-4">
                                            <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="troopsToSend"
                                                    checked={rallyTroopType === 0}
                                                    onChange={() => setRallyTroopType(0)}
                                                    className="w-5 h-5 bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-white">Send One Troop</span>
                                            </label>
                                            <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="troopsToSend"
                                                    checked={rallyTroopType === 2}
                                                    onChange={() => setRallyTroopType(2)}
                                                    className="w-5 h-5 bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-white">Send Max Troops (with priority)</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Essence Options */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Essence Options</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <span className="text-sm text-gray-300">Transmute Dark Essences</span>
                                                <input
                                                    type="checkbox"
                                                    checked={transmuteDarkEssences}
                                                    onChange={(e) => {
                                                        setTransmuteDarkEssences(e.target.checked)

                                                    }}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <span className="text-sm text-gray-300">Keep One Slot Free</span>
                                                <input
                                                    type="checkbox"
                                                    checked={keepOneSlotFree}
                                                    onChange={(e) => {
                                                        setKeepOneSlotFree(e.target.checked)

                                                    }}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </label>

                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">Delete essences that are lower level than:</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="28"
                                                    value={deleteEssencesLowerThan}
                                                    onChange={(e) => setDeleteEssencesLowerThan(Math.min(28, Number(e.target.value)))}
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

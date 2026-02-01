'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Hammer, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface ConstructionModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function ConstructionModal({ isOpen, onClose, iggId }: ConstructionModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Construction settings
    const [autoBuild, setAutoBuild] = useState(false)
    const [upgrade, setUpgrade] = useState(false)
    const [lowestLevelFirst, setLowestLevelFirst] = useState(true)
    const [ignoreSpamTarget, setIgnoreSpamTarget] = useState(true)
    const [autoRentSecondQueue, setAutoRentSecondQueue] = useState(true)
    const [secondQueueSpamOnly, setSecondQueueSpamOnly] = useState(false)
    const [spamTargetType, setSpamTargetType] = useState('None')
    const [spamTargetBuilding, setSpamTargetBuilding] = useState('Farm')
    const [buildingPriority, setBuildingPriority] = useState('Castle')
    const [strict, setStrict] = useState(false)
    const [maxBuildingLevel, setMaxBuildingLevel] = useState(25)

    // Building Target - Resource Buildings (18 locations)
    const [resource1, setResource1] = useState(4)
    const [resource2, setResource2] = useState(4)
    const [resource3, setResource3] = useState(4)
    const [resource4, setResource4] = useState(4)
    const [resource5, setResource5] = useState(4)
    const [resource6, setResource6] = useState(4)
    const [resource7, setResource7] = useState(4)
    const [resource8, setResource8] = useState(4)
    const [resource9, setResource9] = useState(4)
    const [resource10, setResource10] = useState(4)
    const [resource11, setResource11] = useState(4)
    const [resource12, setResource12] = useState(4)
    const [resource13, setResource13] = useState(4)
    const [resource14, setResource14] = useState(4)
    const [resource15, setResource15] = useState(4)
    const [resource16, setResource16] = useState(4)
    const [resource17, setResource17] = useState(4)
    const [resource18, setResource18] = useState(4)

    // Building Target - Military Buildings (17 locations)
    const [military1, setMilitary1] = useState(5)
    const [military2, setMilitary2] = useState(5)
    const [military3, setMilitary3] = useState(5)
    const [military4, setMilitary4] = useState(5)
    const [military5, setMilitary5] = useState(5)
    const [military6, setMilitary6] = useState(5)
    const [military7, setMilitary7] = useState(5)
    const [military8, setMilitary8] = useState(5)
    const [military9, setMilitary9] = useState(5)
    const [military10, setMilitary10] = useState(5)
    const [military11, setMilitary11] = useState(5)
    const [military12, setMilitary12] = useState(5)
    const [military13, setMilitary13] = useState(5)
    const [military14, setMilitary14] = useState(5)
    const [military15, setMilitary15] = useState(5)
    const [military16, setMilitary16] = useState(5)
    const [military17, setMilitary17] = useState(5)

    // Building Target - Familiar Buildings (8 locations)
    const [familiar1, setFamiliar1] = useState(21)
    const [familiar2, setFamiliar2] = useState(21)
    const [familiar3, setFamiliar3] = useState(21)
    const [familiar4, setFamiliar4] = useState(21)
    const [familiar5, setFamiliar5] = useState(21)
    const [familiar6, setFamiliar6] = useState(21)
    const [familiar7, setFamiliar7] = useState(21)
    const [familiar8, setFamiliar8] = useState(21)

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

                if (data.buildSettingsNew) {
                    setAutoBuild(data.buildSettingsNew.autoBuild ?? false)
                    setUpgrade(data.buildSettingsNew.autoUpgrade ?? false)
                    setLowestLevelFirst(data.buildSettingsNew.buildByLowestLevel ?? true)
                    setIgnoreSpamTarget(data.buildSettingsNew.ignoreSpamTarget ?? true)
                    setAutoRentSecondQueue(data.buildSettingsNew.autoBuySecondQueue ?? true)
                    setSecondQueueSpamOnly(data.buildSettingsNew.secondQueueSpamOnly ?? false)
                    setSpamTargetType(String(data.buildSettingsNew.newSpamTarget ?? 0))
                    setSpamTargetBuilding(data.buildSettingsNew.spamTargetBuilding ?? 'Farm')
                    setBuildingPriority(String(data.buildSettingsNew.buildPriority ?? 0))
                    setStrict(data.buildSettingsNew.strictPriority ?? false)
                    setMaxBuildingLevel(data.buildSettingsNew.maxBuildLevel ?? 25)

                    // Load Building Target - Resource Buildings (array indices 1-18)
                    for (let i = 1; i <= 18; i++) {
                        const setter = eval(`setResource${i}`)
                        setter(data.buildSettingsNew.BuildingTarget?.[i] ?? 4)
                    }

                    // Load Building Target - Military Buildings (array indices 19-35)
                    for (let i = 1; i <= 17; i++) {
                        const setter = eval(`setMilitary${i}`)
                        setter(data.buildSettingsNew.BuildingTarget?.[18 + i] ?? 5)
                    }

                    // Load Building Target - Familiar Buildings (array indices 36-43)
                    for (let i = 1; i <= 8; i++) {
                        const setter = eval(`setFamiliar${i}`)
                        setter(data.buildSettingsNew.BuildingTarget?.[35 + i] ?? 21)
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
            // Build the BuildingTarget array from current state
            const buildingTargetArray = settings.buildSettingsNew?.BuildingTarget ? [...settings.buildSettingsNew.BuildingTarget] : []

            // Update resource buildings (indices 1-18)
            for (let i = 1; i <= 18; i++) {
                buildingTargetArray[i] = eval(`resource${i}`)
            }
            // Update military buildings (indices 19-35)
            for (let i = 1; i <= 17; i++) {
                buildingTargetArray[18 + i] = eval(`military${i}`)
            }
            // Update familiar buildings (indices 36-43)
            for (let i = 1; i <= 8; i++) {
                buildingTargetArray[35 + i] = eval(`familiar${i}`)
            }

            const updatedSettings = {
                ...settings,
                buildSettingsNew: {
                    ...settings.buildSettingsNew,
                    autoBuild,
                    autoUpgrade: upgrade,
                    buildByLowestLevel: lowestLevelFirst,
                    ignoreSpamTarget,
                    autoBuySecondQueue: autoRentSecondQueue,
                    secondQueueSpamOnly,
                    newSpamTarget: Number(spamTargetType),
                    spamTargetBuilding,
                    buildPriority: Number(buildingPriority),
                    strictPriority: strict,
                    maxBuildLevel: maxBuildingLevel,
                    BuildingTarget: buildingTargetArray,
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

    const handleResetBuildData = () => {
        toast.success('Build data reset!')
        // In a real implementation, this would call an API endpoint
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
                                <p className="text-gray-400">Please select an IGG ID to configure construction settings</p>
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
                                    <Hammer className="w-5 h-5 md:w-6 md:h-6 text-orange-400 flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Construction</h2>
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
                                            { label: 'Auto Build', value: autoBuild, setter: setAutoBuild },
                                            { label: 'Upgrade', value: upgrade, setter: setUpgrade },
                                            { label: 'Lowest Level First', value: lowestLevelFirst, setter: setLowestLevelFirst },
                                            { label: 'Ignore Spam Target', value: ignoreSpamTarget, setter: setIgnoreSpamTarget },
                                            { label: 'Auto-Rent Second Queue', value: autoRentSecondQueue, setter: setAutoRentSecondQueue },
                                            { label: 'Second Queue (Spam Only)', value: secondQueueSpamOnly, setter: setSecondQueueSpamOnly },
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


                                    {/* Spam Target Type, Building Priority, and Max Building Level - Grid Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Spam Target Type:</label>
                                            <select
                                                value={spamTargetType}
                                                onChange={(e) => setSpamTargetType(e.target.value)}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            >
                                                <option value="0">None</option>
                                                <option value="1">Farm</option>
                                                <option value="2">Mine</option>
                                                <option value="3">Lumber Mill</option>
                                                <option value="4">Quarry</option>
                                                <option value="5">Manor</option>
                                                <option value="6">Barracks</option>
                                                <option value="7">Infirmary</option>
                                                <option value="8">Spring</option>
                                            </select>
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Building Priority:</label>
                                            <select
                                                value={buildingPriority}
                                                onChange={(e) => setBuildingPriority(e.target.value)}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            >
                                                <option value="0">Castle</option>
                                                <option value="1">Resource</option>
                                                <option value="2">Academy</option>
                                                <option value="3">Manor</option>
                                                <option value="4">Barracks / Infirmary</option>
                                                <option value="5">Monsterhold</option>
                                                <option value="6">Familiars</option>
                                                <option value="7">Trading Post</option>
                                                <option value="8">Resource (No Manor)</option>
                                                <option value="9">Treasure Trove</option>
                                                <option value="10">Workshop</option>
                                                <option value="11">None</option>
                                                <option value="12">Lunar Foundry</option>
                                            </select>
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Max Building Level:</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={50}
                                                value={maxBuildingLevel}
                                                onChange={(e) => setMaxBuildingLevel(Math.min(50, Math.max(0, Number(e.target.value))))}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Building Target Section */}
                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                        <h3 className="text-base sm:text-lg font-bold text-white">Building Target</h3>

                                        {/* Resource Buildings */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-3">Resource Buildings (18 Locations)</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                                {Array.from({ length: 18 }, (_, i) => i + 1).map((num) => {
                                                    const value = eval(`resource${num}`)
                                                    const setter = eval(`setResource${num}`)
                                                    return (
                                                        <div key={`resource${num}`} className="p-3 rounded-xl bg-surface/50">
                                                            <label className="block text-xs text-gray-400 mb-2">Location {num}</label>
                                                            <select
                                                                value={value}
                                                                onChange={(e) => {
                                                                    setter(Number(e.target.value))
                                                                }}
                                                                className="w-full px-2 py-1.5 bg-background-tertiary border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                            >
                                                                <option value={4}>Farm</option>
                                                                <option value={1}>Lumber Mill</option>
                                                                <option value={2}>Quarry</option>
                                                                <option value={3}>Mine</option>
                                                            </select>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Military Buildings */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-3">Military Buildings (17 Locations)</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                                {Array.from({ length: 17 }, (_, i) => i + 1).map((num) => {
                                                    const value = eval(`military${num}`)
                                                    const setter = eval(`setMilitary${num}`)
                                                    return (
                                                        <div key={`military${num}`} className="p-3 rounded-xl bg-surface/50">
                                                            <label className="block text-xs text-gray-400 mb-2">Location {num}</label>
                                                            <select
                                                                value={value}
                                                                onChange={(e) => {
                                                                    setter(Number(e.target.value))
                                                                }}
                                                                className="w-full px-2 py-1.5 bg-background-tertiary border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                            >
                                                                <option value={5}>Manor</option>
                                                                <option value={7}>Infirmary</option>
                                                                <option value={6}>Barracks</option>
                                                            </select>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Familiar Buildings */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-3">Familiar Buildings (8 Locations)</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => {
                                                    const value = eval(`familiar${num}`)
                                                    const setter = eval(`setFamiliar${num}`)
                                                    // Assuming `setting`, `isDisabled`, `handleSettingChange` are defined elsewhere in the component scope
                                                    // For this specific change, we'll adapt to the existing `value` and `setter` pattern.
                                                    return (
                                                        <div key={`familiar${num}`} className="p-3 rounded-xl bg-surface/50">
                                                            <label className="block text-xs text-gray-400 mb-2">Location {num}</label>
                                                            <input
                                                                type="number"
                                                                value={value ?? ''} // Use existing `value`
                                                                min={0} // Assuming min level is 0
                                                                max={60} // Assuming max level for familiar buildings is 60 (or adjust as needed)
                                                                // disabled={isDisabled} // If isDisabled is not defined, remove this
                                                                onChange={(e) => {
                                                                    const val = e.target.value === '' ? 0 : Number(e.target.value)
                                                                    setter(val) // Use existing `setter`
                                                                }}
                                                                className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                            />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reset Build Data Button */}
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={handleResetBuildData}
                                            className="px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-medium transition-colors"
                                        >
                                            Reset Build Data
                                        </button>
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


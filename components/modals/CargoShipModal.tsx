'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Ship, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface CargoShipModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function CargoShipModal({ isOpen, onClose, iggId }: CargoShipModalProps) {
    const [fullSettings, setFullSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Main toggle
    const [exchangeCargoShipItems, setExchangeCargoShipItems] = useState(true)

    // Exchange options
    const [onlyTradeForResourceItems, setOnlyTradeForResourceItems] = useState(false)
    const [useResourcesFromBag, setUseResourcesFromBag] = useState(true)
    const [minimumItemStars, setMinimumItemStars] = useState(1)

    // Resources to Trade
    const [tradeFood, setTradeFood] = useState(true)
    const [tradeStone, setTradeStone] = useState(true)
    const [tradeWood, setTradeWood] = useState(true)
    const [tradeOre, setTradeOre] = useState(true)
    const [tradeGold, setTradeGold] = useState(true)

    // Don't Trade For
    const [dontTradeFood, setDontTradeFood] = useState(false)
    const [dontTradeStone, setDontTradeStone] = useState(false)
    const [dontTradeWood, setDontTradeWood] = useState(false)
    const [dontTradeOre, setDontTradeOre] = useState(false)
    const [dontTradeGold, setDontTradeGold] = useState(false)
    const [dontTradeAnima, setDontTradeAnima] = useState(false)
    const [dontTradeLunite, setDontTradeLunite] = useState(false)
    const [dontTradeSpeedUps, setDontTradeSpeedUps] = useState(false)

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

                if (data.cargoShipSettings) {
                    setExchangeCargoShipItems(data.cargoShipSettings.allowTrading ?? true)
                    setOnlyTradeForResourceItems(data.cargoShipSettings.exchangeRssItemOnly ?? false)
                    setUseResourcesFromBag(data.cargoShipSettings.useRssFromBagIfNeeded ?? true)
                    setMinimumItemStars(data.cargoShipSettings.exchangeMinQuality ?? 1)

                    // Resources to Trade
                    setTradeFood(data.cargoShipSettings.tradeFood ?? true)
                    setTradeStone(data.cargoShipSettings.tradeStone ?? true)
                    setTradeWood(data.cargoShipSettings.tradeWood ?? true)
                    setTradeOre(data.cargoShipSettings.tradeOre ?? true)
                    setTradeGold(data.cargoShipSettings.tradeGold ?? true)

                    // Don't Trade For (ignore* fields)
                    setDontTradeFood(data.cargoShipSettings.ignoreFood ?? false)
                    setDontTradeStone(data.cargoShipSettings.ignoreStone ?? false)
                    setDontTradeWood(data.cargoShipSettings.ignoreWood ?? false)
                    setDontTradeOre(data.cargoShipSettings.ignoreOre ?? false)
                    setDontTradeGold(data.cargoShipSettings.ignoreGold ?? false)
                    setDontTradeAnima(data.cargoShipSettings.ignoreAnima ?? false)
                    setDontTradeLunite(data.cargoShipSettings.ignoreLunite ?? false)
                    setDontTradeSpeedUps(data.cargoShipSettings.ignoreSpeedUp ?? false)
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
                cargoShipSettings: {
                    ...fullSettings.cargoShipSettings,
                    allowTrading: exchangeCargoShipItems,
                    exchangeRssItemOnly: onlyTradeForResourceItems,
                    useRssFromBagIfNeeded: useResourcesFromBag,
                    exchangeMinQuality: minimumItemStars,
                    tradeFood,
                    tradeStone,
                    tradeWood,
                    tradeOre,
                    tradeGold,
                    ignoreFood: dontTradeFood,
                    ignoreStone: dontTradeStone,
                    ignoreWood: dontTradeWood,
                    ignoreOre: dontTradeOre,
                    ignoreGold: dontTradeGold,
                    ignoreAnima: dontTradeAnima,
                    ignoreLunite: dontTradeLunite,
                    ignoreSpeedUp: dontTradeSpeedUps,
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
                                <p className="text-gray-400">Please select an IGG ID to configure cargo ship settings</p>
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
                                    <Ship className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Cargo Ship</h2>
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
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={exchangeCargoShipItems}
                                                onChange={(e) => setExchangeCargoShipItems(e.target.checked)}
                                                className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                                            />
                                            <span className="text-sm font-medium text-cyan-300">Exchange Cargo Ship Items</span>
                                        </label>
                                    </div>

                                    {/* Exchange Options */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Exchange Options</h3>

                                        <div className="flex flex-wrap gap-3">
                                            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={onlyTradeForResourceItems}
                                                    onChange={(e) => setOnlyTradeForResourceItems(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-white">Only Trade for Resource Items</span>
                                            </label>

                                            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={useResourcesFromBag}
                                                    onChange={(e) => setUseResourcesFromBag(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm text-white">Use resources from bag if needed</span>
                                            </label>
                                        </div>

                                        {/* Minimum Item Stars */}
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Minimum Item Stars:</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={3}
                                                value={minimumItemStars}
                                                onChange={(e) => setMinimumItemStars(Math.min(3, Math.max(1, Number(e.target.value))))}
                                                className="w-32 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Resources to Trade */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Resources to Trade</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { label: 'Food', value: tradeFood, setter: setTradeFood, key: 'tradeFood' },
                                                { label: 'Stone', value: tradeStone, setter: setTradeStone, key: 'tradeStone' },
                                                { label: 'Wood', value: tradeWood, setter: setTradeWood, key: 'tradeWood' },
                                                { label: 'Ore', value: tradeOre, setter: setTradeOre, key: 'tradeOre' },
                                                { label: 'Gold', value: tradeGold, setter: setTradeGold, key: 'tradeGold' },
                                            ].map((resource) => (
                                                <label key={resource.key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={resource.value}
                                                        onChange={(e) => resource.setter(e.target.checked)}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">{resource.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Don't Trade For */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Don't Trade For</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { label: 'Food', value: dontTradeFood, setter: setDontTradeFood, key: 'ignoreFood' },
                                                { label: 'Stone', value: dontTradeStone, setter: setDontTradeStone, key: 'ignoreStone' },
                                                { label: 'Wood', value: dontTradeWood, setter: setDontTradeWood, key: 'ignoreWood' },
                                                { label: 'Ore', value: dontTradeOre, setter: setDontTradeOre, key: 'ignoreOre' },
                                                { label: 'Gold', value: dontTradeGold, setter: setDontTradeGold, key: 'ignoreGold' },
                                                { label: 'Anima', value: dontTradeAnima, setter: setDontTradeAnima, key: 'ignoreAnima' },
                                                { label: 'Lunite', value: dontTradeLunite, setter: setDontTradeLunite, key: 'ignoreLunite' },
                                                { label: 'Speed-Ups', value: dontTradeSpeedUps, setter: setDontTradeSpeedUps, key: 'ignoreSpeedUp' },
                                            ].map((resource) => (
                                                <label key={resource.key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={resource.value}
                                                        onChange={(e) => resource.setter(e.target.checked)}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">{resource.label}</span>
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

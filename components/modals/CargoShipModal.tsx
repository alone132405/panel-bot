'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Ship, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'

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
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Cargo Ship"
                iggId={iggId}
                icon={Ship}
                iconColor="#06B6D4"
                iconBg="rgba(6,182,212,0.15)"
                iconBorder="rgba(6,182,212,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Cargo Ship"
            iggId={iggId}
            icon={Ship}
            iconColor="#06B6D4"
            iconBg="rgba(6,182,212,0.15)"
            iconBorder="rgba(6,182,212,0.3)"
            saving={saving}
            onSave={saveSettings}
            maxWidth="860px"
        >
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
                                                value={minimumItemStars ?? ''}
                                                min={1}
                                                max={3}
                                                step="1"
                                                disabled={false}
                                                onKeyDown={(e) => {
                                                    if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? 0 : Math.floor(Number(e.target.value))
                                                    setMinimumItemStars(val)
                                                }}
                                                onBlur={(e) => {
                                                    const val = e.target.value === '' ? 1 : Math.floor(Number(e.target.value))
                                                    setMinimumItemStars(Math.max(1, Math.min(3, val)))
                                                }}
                                                className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
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
        </KonohaModal>
    )
}
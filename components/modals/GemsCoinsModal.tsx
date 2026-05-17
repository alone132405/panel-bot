'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Gem, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'

interface GemsCoinsModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function GemsCoinsModal({ isOpen, onClose, iggId }: GemsCoinsModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Gems settings
    const [useGems, setUseGems] = useState(true)
    const [buyShield, setBuyShield] = useState(true)
    const [buyWithdrawSquad, setBuyWithdrawSquad] = useState(false)
    const [withdrawSquadShield, setWithdrawSquadShield] = useState('24 Hours')
    const [goldHammer, setGoldHammer] = useState(false)
    const [steelCuffs, setSteelCuffs] = useState(false)
    const [soulCrystal, setSoulCrystal] = useState(false)
    const [crystalPickaxe, setCrystalPickaxe] = useState(false)
    const [warTome, setWarTome] = useState(false)
    const [archaicTome, setArchaicTome] = useState(false)
    const [reduceUpkeep, setReduceUpkeep] = useState(false)
    const [gemsBuyVIPLevel, setGemsBuyVIPLevel] = useState(0)

    // Guild Coins settings
    const [useGuildCoins, setUseGuildCoins] = useState(true)
    const [shield8h, setShield8h] = useState(false)
    const [withdrawSquad, setWithdrawSquad] = useState(false)
    const [gatheringBoost, setGatheringBoost] = useState(false)
    const [foodBoost, setFoodBoost] = useState(true)
    const [stoneBoost, setStoneBoost] = useState(false)
    const [woodBoost, setWoodBoost] = useState(false)
    const [oreBoost, setOreBoost] = useState(false)
    const [goldBoost, setGoldBoost] = useState(true)
    const [guildCoinsBuyVIPLevel, setGuildCoinsBuyVIPLevel] = useState(0)
    const [reserveGuildCoins, setReserveGuildCoins] = useState(0)

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

                if (data.spendingSettings) {
                    // Main toggles
                    setUseGems(data.spendingSettings.spendGems ?? true)
                    setUseGuildCoins(data.spendingSettings.spendGC ?? true)

                    // Gems settings
                    if (data.spendingSettings.gemSettings) {
                        setBuyShield(data.spendingSettings.gemSettings.buyShield ?? true)
                        setBuyWithdrawSquad(data.spendingSettings.gemSettings.buyWithdrawSquad ?? false)
                        const shieldMap: { [key: number]: string } = { 0: '8 Hours', 1: '24 Hours', 2: '3 Days', 3: '7 Days', 4: '14 Days', 5: '12 Hours' }
                        setWithdrawSquadShield(shieldMap[data.spendingSettings.gemSettings.shieldToBuy] || '24 Hours')
                        setGoldHammer(data.spendingSettings.gemSettings.buyGoldHammer ?? false)
                        setSteelCuffs(data.spendingSettings.gemSettings.buySteelCuffs ?? false)
                        setSoulCrystal(data.spendingSettings.gemSettings.buySoulCrystal ?? false)
                        setCrystalPickaxe(data.spendingSettings.gemSettings.buyCrystalPickAxe ?? false)
                        setWarTome(data.spendingSettings.gemSettings.buyWarTome ?? false)
                        setArchaicTome(data.spendingSettings.gemSettings.buyArchaicTome ?? false)
                        setReduceUpkeep(data.spendingSettings.gemSettings.buyReducedUpKeep ?? false)
                        setGemsBuyVIPLevel(data.spendingSettings.gemSettings.buyVIP_Points ?? 0)
                    }

                    // Guild Coins settings
                    if (data.spendingSettings.gcSettings) {
                        setShield8h(data.spendingSettings.gcSettings.buyShield ?? false)
                        setWithdrawSquad(data.spendingSettings.gcSettings.buyWithdrawSquad ?? false)
                        setGatheringBoost(data.spendingSettings.gcSettings.buyGatheringBoost ?? false)
                        setFoodBoost(data.spendingSettings.gcSettings.buyFoodBoost ?? false)
                        setStoneBoost(data.spendingSettings.gcSettings.buyStoneBoost ?? false)
                        setWoodBoost(data.spendingSettings.gcSettings.buyWoodBoost ?? false)
                        setOreBoost(data.spendingSettings.gcSettings.buyOreBoost ?? false)
                        setGoldBoost(data.spendingSettings.gcSettings.buyGoldBoost ?? false)
                        setGuildCoinsBuyVIPLevel(data.spendingSettings.gcSettings.buyVIP_Points ?? 0)
                        setReserveGuildCoins(data.spendingSettings.gcSettings.coinReserve ?? 0)
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
            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })

            if (res.ok) {
                toast.success('Settings saved successfully')
                onClose()
            } else {
                toast.error('Failed to save settings')
            }
        } catch (error) {
            toast.error('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    // Helper function to update settings object
    const updateSettingsObject = (path: string, value: any) => {
        const keys = path.split('.')
        const newSettings = { ...settings }
        let current: any = newSettings
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {}
            current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = value
        setSettings(newSettings)
    }

    if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Gems & Coins"
                iggId={iggId}
                icon={Gem}
                iconColor="#10B981"
                iconBg="rgba(16,185,129,0.15)"
                iconBorder="rgba(16,185,129,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Gems & Coins"
            iggId={iggId}
            icon={Gem}
            iconColor="#10B981"
            iconBg="rgba(16,185,129,0.15)"
            iconBorder="rgba(16,185,129,0.3)"
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
                                    {/* Gems Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={useGems}
                                                    onChange={(e) => {
                                                        setUseGems(e.target.checked)
                                                        updateSettingsObject('spendingSettings.spendGems', e.target.checked)
                                                    }}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
                                                />
                                                <span className="text-sm font-medium text-emerald-300">Use Gems</span>
                                            </label>
                                        </div>

                                        {/* Buy Shield with Duration Selection */}
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={buyShield}
                                                    onChange={(e) => {
                                                        setBuyShield(e.target.checked)
                                                        updateSettingsObject('spendingSettings.gemSettings.buyShield', e.target.checked)
                                                    }}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <label className="text-sm text-gray-300">Shield</label>
                                                {buyShield && (
                                                    <>
                                                        <span className="text-sm text-gray-400">&gt;</span>
                                                        <select
                                                            value={withdrawSquadShield}
                                                            onChange={(e) => {
                                                                setWithdrawSquadShield(e.target.value)
                                                                const shieldMap: { [key: string]: number } = { '8 Hours': 0, '24 Hours': 1, '3 Days': 2, '7 Days': 3, '14 Days': 4, '12 Hours': 5 }
                                                                updateSettingsObject('spendingSettings.gemSettings.shieldToBuy', shieldMap[e.target.value])
                                                            }}
                                                            className="flex-1 px-3 py-1.5 bg-background-tertiary border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                        >
                                                            <option>8 Hours</option>
                                                            <option>24 Hours</option>
                                                            <option>3 Days</option>
                                                            <option>7 Days</option>
                                                            <option>14 Days</option>
                                                            <option>12 Hours</option>
                                                        </select>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Gem Items */}
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { label: 'Withdraw Squad', value: buyWithdrawSquad, setter: setBuyWithdrawSquad, key: 'buyWithdrawSquad' },
                                                { label: 'Gold Hammer', value: goldHammer, setter: setGoldHammer, key: 'buyGoldHammer' },
                                                { label: 'Steel Cuffs', value: steelCuffs, setter: setSteelCuffs, key: 'buySteelCuffs' },
                                                { label: 'Soul Crystal', value: soulCrystal, setter: setSoulCrystal, key: 'buySoulCrystal' },
                                                { label: 'Crystal Pickaxe', value: crystalPickaxe, setter: setCrystalPickaxe, key: 'buyCrystalPickAxe' },
                                                { label: 'War Tome', value: warTome, setter: setWarTome, key: 'buyWarTome' },
                                                { label: 'Archaic Tome', value: archaicTome, setter: setArchaicTome, key: 'buyArchaicTome' },
                                                { label: 'Reduce Upkeep', value: reduceUpkeep, setter: setReduceUpkeep, key: 'buyReducedUpKeep' },
                                            ].map((item) => (
                                                <label key={item.key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.value}
                                                        onChange={(e) => {
                                                            item.setter(e.target.checked)
                                                            updateSettingsObject(`spendingSettings.gemSettings.${item.key}`, e.target.checked)
                                                        }}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>

                                        {/* Reduce Upkeep - Removed standalone version since it's now in the list above */}

                                        {/* Buy VIP Points */}
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Buy VIP Points Up to Level:</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={9999999}
                                                step="1"
                                                value={gemsBuyVIPLevel}
                                                onChange={(e) => {
                                                    setGemsBuyVIPLevel(Math.floor(Number(e.target.value)))
                                                }}
                                                onBlur={(e) => {
                                                    const val = Math.max(0, Math.min(9999999, Math.floor(Number(e.target.value))))
                                                    setGemsBuyVIPLevel(val)
                                                    updateSettingsObject('spendingSettings.gemSettings.buyVIP_Points', val)
                                                }}
                                                className="w-32 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Guild Coins Section */}
                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={useGuildCoins}
                                                        onChange={(e) => {
                                                            setUseGuildCoins(e.target.checked)
                                                            updateSettingsObject('spendingSettings.spendGC', e.target.checked)
                                                        }}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
                                                    />
                                                    <span className="text-sm font-medium text-amber-300">Use Guild Coins</span>
                                                </label>
                                                <p className="text-xs text-gray-400 ml-8">Guild Coins will be Prioritized over Gems</p>
                                            </div>
                                        </div>

                                        {/* Guild Coin Boosts */}
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { label: 'Shield (8h)', value: shield8h, setter: setShield8h, key: 'buyShield' },
                                                { label: 'Withdraw Squad', value: withdrawSquad, setter: setWithdrawSquad, key: 'buyWithdrawSquad' },
                                                { label: 'Gathering Boost', value: gatheringBoost, setter: setGatheringBoost, key: 'buyGatheringBoost' },
                                                { label: 'Food Boost', value: foodBoost, setter: setFoodBoost, key: 'buyFoodBoost' },
                                                { label: 'Stone Boost', value: stoneBoost, setter: setStoneBoost, key: 'buyStoneBoost' },
                                                { label: 'Wood Boost', value: woodBoost, setter: setWoodBoost, key: 'buyWoodBoost' },
                                                { label: 'Ore Boost', value: oreBoost, setter: setOreBoost, key: 'buyOreBoost' },
                                                { label: 'Gold Boost', value: goldBoost, setter: setGoldBoost, key: 'buyGoldBoost' },
                                            ].map((boost) => (
                                                <label key={boost.key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={boost.value}
                                                        onChange={(e) => {
                                                            boost.setter(e.target.checked)
                                                            updateSettingsObject(`spendingSettings.gcSettings.${boost.key}`, e.target.checked)
                                                        }}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">{boost.label}</span>
                                                </label>
                                            ))}
                                        </div>

                                        {/* Buy VIP Points and Reserve Guild Coins */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">Buy VIP Points Up to Level:</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={9999999}
                                                    step="1"
                                                    value={guildCoinsBuyVIPLevel}
                                                    onChange={(e) => {
                                                        setGuildCoinsBuyVIPLevel(Math.floor(Number(e.target.value)))
                                                    }}
                                                    onBlur={(e) => {
                                                        const val = Math.max(0, Math.min(9999999, Math.floor(Number(e.target.value))))
                                                        setGuildCoinsBuyVIPLevel(val)
                                                        updateSettingsObject('spendingSettings.gcSettings.buyVIP_Points', val)
                                                    }}
                                                    className="w-32 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>

                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">Reserve Guild Coins:</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={99999999}
                                                    step="1"
                                                    value={reserveGuildCoins}
                                                    onChange={(e) => {
                                                        setReserveGuildCoins(Math.floor(Number(e.target.value)))
                                                    }}
                                                    onBlur={(e) => {
                                                        const val = Math.max(0, Math.min(99999999, Math.floor(Number(e.target.value))))
                                                        setReserveGuildCoins(val)
                                                        updateSettingsObject('spendingSettings.gcSettings.coinReserve', val)
                                                    }}
                                                    className="w-32 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}
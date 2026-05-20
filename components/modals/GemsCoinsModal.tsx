'use client'

import { Coins, Gem, Loader2, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { Checkbox } from '@/components/ui/Checkbox'
import { TacticalSelect } from '@/components/ui/TacticalSelect'
import { SettingInfoLabel } from '@/components/ui/SettingInfoLabel'
import { useAutoSaveSettings } from '@/hooks/useAutoSaveSettings'

interface GemsCoinsModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

const SHIELD_VALUE_BY_LABEL: Record<string, number> = {
    '8 Hours': 0,
    '24 Hours': 1,
    '3 Days': 2,
    '7 Days': 3,
    '14 Days': 4,
    '12 Hours': 5,
}

function clampWholeNumber(value: number, min: number, max: number) {
    if (Number.isNaN(value)) return min
    return Math.max(min, Math.min(max, Math.floor(value)))
}

export default function GemsCoinsModal({ isOpen, onClose, iggId }: GemsCoinsModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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
            const updatedSettings = {
                ...settings,
                spendingSettings: {
                    ...(settings.spendingSettings || {}),
                    spendGems: useGems,
                    spendGC: useGuildCoins,
                    gemSettings: {
                        ...(settings.spendingSettings?.gemSettings || {}),
                        buyShield,
                        shieldToBuy: SHIELD_VALUE_BY_LABEL[withdrawSquadShield] ?? 1,
                        buyWithdrawSquad,
                        buyWarTome: warTome,
                        buyCrystalPickAxe: crystalPickaxe,
                        buyGoldHammer: goldHammer,
                        buyArchaicTome: archaicTome,
                        buySoulCrystal: soulCrystal,
                        buySteelCuffs: steelCuffs,
                        buyReducedUpKeep: reduceUpkeep,
                        buyVIP_Points: clampWholeNumber(gemsBuyVIPLevel, 0, 9999999),
                    },
                    gcSettings: {
                        ...(settings.spendingSettings?.gcSettings || {}),
                        buyShield: shield8h,
                        buyWithdrawSquad: withdrawSquad,
                        buyFoodBoost: foodBoost,
                        buyStoneBoost: stoneBoost,
                        buyWoodBoost: woodBoost,
                        buyOreBoost: oreBoost,
                        buyGoldBoost: goldBoost,
                        buyGatheringBoost: gatheringBoost,
                        coinReserve: clampWholeNumber(reserveGuildCoins, 0, 99999999),
                        buyVIP_Points: clampWholeNumber(guildCoinsBuyVIPLevel, 0, 9999999),
                    },
                },
            }

            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings),
            })

            if (res.ok) {
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

    useAutoSaveSettings(
        isOpen && !loading && Boolean(iggId && settings),
        saveSettings,
        [
            useGems,
            buyShield,
            buyWithdrawSquad,
            withdrawSquadShield,
            goldHammer,
            steelCuffs,
            soulCrystal,
            crystalPickaxe,
            warTome,
            archaicTome,
            reduceUpkeep,
            gemsBuyVIPLevel,
            useGuildCoins,
            shield8h,
            withdrawSquad,
            gatheringBoost,
            foodBoost,
            stoneBoost,
            woodBoost,
            oreBoost,
            goldBoost,
            guildCoinsBuyVIPLevel,
            reserveGuildCoins,
        ]
    )

    const enabledGemItems = [buyShield, buyWithdrawSquad, goldHammer, steelCuffs, soulCrystal, crystalPickaxe, warTome, archaicTome, reduceUpkeep].filter(Boolean).length
    const enabledCoinItems = [shield8h, withdrawSquad, gatheringBoost, foodBoost, stoneBoost, woodBoost, oreBoost, goldBoost].filter(Boolean).length

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
            statusLabel={saving ? 'Syncing...' : 'Auto-sync. Use Protocol Apply Changes to deploy.'}
            maxWidth="860px"
        >
            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#00FFB2]" />
                                </div>
                            ) : (
                                <div className="w-full space-y-6">
                                    <ModalSummaryGrid
                                        items={[
                                            { label: 'Gems', value: useGems ? 'On' : 'Off', icon: Gem, tone: 'mint' },
                                            { label: 'Gem Items', value: enabledGemItems, icon: ShieldCheck, tone: 'cyan' },
                                            { label: 'Coin Items', value: enabledCoinItems, icon: Coins, tone: 'gold' },
                                        ]}
                                    />

                                    {/* Gems Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <Checkbox checked={useGems} onChange={setUseGems} />
                                                <SettingInfoLabel label="Use Gems" className="text-sm font-medium text-emerald-300" />
                                            </label>
                                        </div>

                                        {/* Buy Shield with Duration Selection */}
                                        <div className="p-3 sm:p-4 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)]">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                <label className="flex items-center gap-3 cursor-pointer shrink-0">
                                                    <Checkbox checked={buyShield} onChange={setBuyShield} />
                                                    <SettingInfoLabel label="Shield" className="text-sm text-gray-300" />
                                                </label>
                                                {buyShield && (
                                                    <>
                                                        <span className="text-sm text-gray-400">&gt;</span>
                                                        <TacticalSelect
                                                            value={withdrawSquadShield}
                                                            onChange={(v) => {
                                                                setWithdrawSquadShield(v)
                                                                const shieldMap: { [key: string]: number } = { '8 Hours': 0, '24 Hours': 1, '3 Days': 2, '7 Days': 3, '14 Days': 4, '12 Hours': 5 }
                                                                updateSettingsObject('spendingSettings.gemSettings.shieldToBuy', shieldMap[v])
                                                            }}
                                                            options={[
                                                                { value: '8 Hours', label: '8 Hours' },
                                                                { value: '24 Hours', label: '24 Hours' },
                                                                { value: '3 Days', label: '3 Days' },
                                                                { value: '7 Days', label: '7 Days' },
                                                                { value: '14 Days', label: '14 Days' },
                                                                { value: '12 Hours', label: '12 Hours' },
                                                            ]}
                                                            className="w-full md:flex-1"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Gem Items */}
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-wrap md:gap-3">
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
                                                <label key={item.key} className="flex min-h-[48px] md:min-h-0 items-center justify-between md:justify-start gap-4 md:gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-bg-inset/70 md:bg-[#0F0F1A] border border-white/10 md:border-[rgba(123,94,255,0.08)] hover:bg-white/[0.035] md:hover:bg-[#161626] transition-colors cursor-pointer">
                                                    <SettingInfoLabel label={item.label} className="text-[13px] sm:text-[14px] md:text-sm text-white" />
                                                    <Checkbox checked={item.value} onChange={item.setter} />
                                                </label>
                                            ))}
                                        </div>

                                        {/* Reduce Upkeep - Removed standalone version since it's now in the list above */}

                                        {/* Buy VIP Points */}
                                        <div className="p-3 sm:p-4 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)]">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Buy VIP Points Up to Level" className="text-xs sm:text-sm text-gray-300" />
                                            </div>
                                            <input type="number"
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
                                                className="w-32 px-3 py-2 bg-[#07070E]/50 border border-[rgba(123,94,255,0.2)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7B5EFF]/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Guild Coins Section */}
                                    <div className="space-y-4 pt-6 border-t border-[rgba(123,94,255,0.2)]">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <Checkbox checked={useGuildCoins} onChange={setUseGuildCoins} />
                                                    <SettingInfoLabel label="Use Guild Coins" className="text-sm font-medium text-amber-300" />
                                                </label>
                                                <p className="text-xs text-gray-400 ml-8">Guild Coins will be Prioritized over Gems</p>
                                            </div>
                                        </div>

                                        {/* Guild Coin Boosts */}
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-wrap md:gap-3">
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
                                                <label key={boost.key} className="flex min-h-[48px] md:min-h-0 items-center justify-between md:justify-start gap-4 md:gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-bg-inset/70 md:bg-[#0F0F1A] border border-white/10 md:border-[rgba(123,94,255,0.08)] hover:bg-white/[0.035] md:hover:bg-[#161626] transition-colors cursor-pointer">
                                                    <SettingInfoLabel label={boost.label} className="text-[13px] sm:text-[14px] md:text-sm text-white" />
                                                    <Checkbox checked={boost.value} onChange={boost.setter} />
                                                </label>
                                            ))}
                                        </div>

                                        {/* Buy VIP Points and Reserve Guild Coins */}
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            <div className="p-3 sm:p-4 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)]">
                                                <div className="mb-2">
                                                    <SettingInfoLabel label="Buy VIP Points Up to Level" className="text-xs sm:text-sm text-gray-300" />
                                                </div>
                                                <input type="number"
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
                                                    className="w-32 px-3 py-2 bg-[#07070E]/50 border border-[rgba(123,94,255,0.2)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7B5EFF]/50"
                                                />
                                            </div>

                                            <div className="p-3 sm:p-4 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)]">
                                                <div className="mb-2">
                                                    <SettingInfoLabel label="Reserve Guild Coins" className="text-xs sm:text-sm text-gray-300" />
                                                </div>
                                                <input type="number"
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
                                                    className="w-32 px-3 py-2 bg-[#07070E]/50 border border-[rgba(123,94,255,0.2)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7B5EFF]/50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}

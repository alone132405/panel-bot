'use client'

import { ListChecks, Loader2, Target, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { Checkbox } from '@/components/ui/Checkbox'
import { TacticalSelect } from '@/components/ui/TacticalSelect'
import { SettingInfoLabel } from '@/components/ui/SettingInfoLabel'

interface HuntingModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function HuntingModal({ isOpen, onClose, iggId }: HuntingModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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
            const updatedMonstersToHunt = { ...(settings.monsterSettings?.monstersToHunt_ || {}) }
            if (huntMonsters) {
                // If the dictionary is completely empty, populate 0 to 72 just in case
                if (Object.keys(updatedMonstersToHunt).length === 0) {
                    for (let i = 0; i <= 72; i++) {
                        updatedMonstersToHunt[String(i)] = true
                    }
                } else {
                    Object.keys(updatedMonstersToHunt).forEach(key => {
                        updatedMonstersToHunt[key] = true
                    })
                }
            }

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
                    monstersToHunt_: updatedMonstersToHunt,
                }
            }

            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings),
            })

            if (res.ok) {
                setSettings(updatedSettings)
                toast.success('Settings saved to config')
            } else {
                toast.error('Failed to save settings')
            }
        } catch (error) {
            toast.error('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const enabledLevels = [huntLevel1, huntLevel2, huntLevel3, huntLevel4, huntLevel5].filter(Boolean).length

    if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Hunting"
                iggId={iggId}
                icon={Target}
                iconColor="#F97316"
                iconBg="rgba(249,115,22,0.15)"
                iconBorder="rgba(249,115,22,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Hunting"
            iggId={iggId}
            icon={Target}
            iconColor="#F97316"
            iconBg="rgba(249,115,22,0.15)"
            iconBorder="rgba(249,115,22,0.3)"
            saving={saving}
            onSave={saveSettings}
            saveLabel="Save Changes"
            statusLabel={saving ? 'Saving...' : 'Manual save. Use Apply Changes to run the script.'}
            maxWidth="860px"
        >
            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-accent-1" />
                                </div>
                            ) : (
                                <div className="w-full space-y-6">
                                    <ModalSummaryGrid
                                        items={[
                                            { label: 'Hunting', value: huntMonsters ? 'On' : 'Off', icon: Target, tone: 'gold' },
                                            { label: 'Levels', value: `${enabledLevels}/5`, icon: ListChecks, tone: 'mint' },
                                            { label: 'Energy', value: `${startHuntWhenEnergy}%`, icon: Zap, tone: 'cyan' },
                                        ]}
                                    />

                                    {/* Hunt Monsters and Settings */}
                                    <label className="flex min-h-[58px] cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-bg-inset/70 px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.035]">
                                        <SettingInfoLabel label="Hunt Monsters" />
                                        <Checkbox checked={huntMonsters} onChange={setHuntMonsters} />
                                    </label>

                                    {/* Max Travel Time and Sending Delay */}
                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                        <div className="p-3 sm:p-4 rounded-[24px] bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)]">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Max Travel Time (Seconds)" className="text-xs sm:text-sm text-gray-300" />
                                            </div>
                                            <input
                                                type="number"
                                                step="1"
                                                min={1}
                                                max={3600}
                                                value={maxTravelTime}
                                                onChange={(e) => setMaxTravelTime(Math.floor(Number(e.target.value)))}
                                                onKeyDown={(e) => {
                                                    if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onBlur={(e) => setMaxTravelTime(Math.min(3600, Math.max(1, Math.floor(Number(e.target.value)))))}
                                                className="w-32 px-3 py-2 bg-bg-inset/50 border border-border rounded-[24px] text-white focus:outline-none focus:ring-2 focus:ring-[#7B5EFF]/50"
                                            />
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-[24px] bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)]">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Sending Delay (MS)" className="text-xs sm:text-sm text-gray-300" />
                                            </div>
                                            <input
                                                type="number"
                                                step="1"
                                                min={200}
                                                max={10000}
                                                value={sendingDelay}
                                                onChange={(e) => setSendingDelay(Math.floor(Number(e.target.value)))}
                                                onKeyDown={(e) => {
                                                    if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onBlur={(e) => setSendingDelay(Math.min(10000, Math.max(200, Math.floor(Number(e.target.value)))))}
                                                className="w-32 px-3 py-2 bg-bg-inset/50 border border-border rounded-[24px] text-white focus:outline-none focus:ring-2 focus:ring-[#7B5EFF]/50"
                                            />
                                        </div>
                                    </div>


                                    {/* Hunting Options */}
                                    <div className="space-y-3">
                                        <h3>
                                            <SettingInfoLabel label="Hunting Options" className="text-base sm:text-lg font-bold text-white" />
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {[
                                                { label: 'Use Energy Items', value: useEnergyItems, setter: setUseEnergyItems },
                                                { label: 'Use Winged Boots (On Steal)', value: useWingedBoots, setter: setUseWingedBoots },
                                                { label: 'Send Unfinished Monsters to Guild Chat', value: sendUnfinishedToGuildChat, setter: setSendUnfinishedToGuildChat },
                                                { label: 'Avoid Conflict', value: avoidConflict, setter: setAvoidConflict },
                                                { label: 'Also Avoid Guild?', value: alsoAvoidGuild, setter: setAlsoAvoidGuild },
                                            ].map((option, index) => (
                                                <label key={index} className="flex min-h-[58px] cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-bg-inset/70 px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.035]">
                                                    <SettingInfoLabel label={option.label} />
                                                    <Checkbox checked={option.value} onChange={option.setter} />
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Use Saberfang Skill and Hunt Priority */}
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                                        <label className="flex min-h-[58px] cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-bg-inset/70 px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.035]">
                                            <SettingInfoLabel label="Use Saberfang Skill (If Possible)" />
                                            <Checkbox checked={useSaberfangSkill} onChange={setUseSaberfangSkill} />
                                        </label>

                                        <div className="p-3 sm:p-4 rounded-[24px] bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)]">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Hunt Priority" className="text-xs sm:text-sm text-gray-300" />
                                            </div>
                                            <TacticalSelect
                                                value={String(huntPriority)}
                                                onChange={setHuntPriority}
                                                options={[{ value: "0", label: "Any" }, { value: "1", label: "Full Health" }, { value: "2", label: "Lowest Health" }, { value: "3", label: "Steal" }]}
                                            />
                                        </div>
                                    </div>

                                    {/* Levels to Hunt */}
                                    <div className="space-y-3">
                                        <h3>
                                            <SettingInfoLabel label="Levels to Hunt" className="text-sm font-medium text-gray-300" />
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                            {[
                                                { label: '1', value: huntLevel1, setter: setHuntLevel1 },
                                                { label: '2', value: huntLevel2, setter: setHuntLevel2 },
                                                { label: '3', value: huntLevel3, setter: setHuntLevel3 },
                                                { label: '4', value: huntLevel4, setter: setHuntLevel4 },
                                                { label: '5', value: huntLevel5, setter: setHuntLevel5 },
                                            ].map((option, index) => (
                                                <label key={index} className="flex min-h-[58px] cursor-pointer items-center justify-between gap-2 rounded-[24px] border border-white/10 bg-bg-inset/70 px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.035]">
                                                    <SettingInfoLabel label={`Level ${option.label}`} helpText={`Allows hunting level ${option.label} monsters.`} />
                                                    <Checkbox checked={option.value} onChange={option.setter} />
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Types to Hunt */}
                                    <div className="space-y-3">
                                        <h3>
                                            <SettingInfoLabel label="Types to Hunt" className="text-sm font-medium text-gray-300" />
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            {[
                                                { label: 'Magic and Physical', value: huntMagicPhysical, setter: setHuntMagicPhysical },
                                                { label: 'High MDEF', value: huntHighMDEF, setter: setHuntHighMDEF },
                                                { label: 'High PDEF', value: huntHighPDEF, setter: setHuntHighPDEF },
                                            ].map((option, index) => (
                                                <label key={index} className="flex min-h-[58px] cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-bg-inset/70 px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.035]">
                                                    <SettingInfoLabel label={option.label} className="text-[13px] sm:text-[14px] md:text-sm text-white" />
                                                    <Checkbox checked={option.value} onChange={option.setter} />
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Start Hunt When Energy and Options */}
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                                        <div className="p-3 sm:p-4 rounded-[24px] bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)]">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Start Hunt When Energy Is More Than" className="text-xs sm:text-sm text-gray-300" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={startHuntWhenEnergy}
                                                    step="1"
                                                    onChange={(e) => setStartHuntWhenEnergy(Math.floor(Number(e.target.value)))}
                                                    onKeyDown={(e) => {
                                                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onBlur={(e) => setStartHuntWhenEnergy(Math.min(100, Math.max(0, Math.floor(Number(e.target.value)))))}
                                                    className="w-24 px-3 py-2 bg-bg-inset/50 border border-border rounded-[24px] text-white focus:outline-none focus:ring-2 focus:ring-[#7B5EFF]/50"
                                                />
                                                <span className="text-sm text-gray-400">%</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 pt-2">
                                            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-[24px] hover:bg-white/[0.035] transition-colors">
                                                <Checkbox checked={useComboPrediction} onChange={setUseComboPrediction} />
                                                <SettingInfoLabel label="Use Combo Prediction" className="text-sm text-gray-300" />
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-[24px] hover:bg-white/[0.035] transition-colors">
                                                <Checkbox checked={stopAfterOneKill} onChange={setStopAfterOneKill} />
                                                <SettingInfoLabel label="Stop hunting once a single monster is killed" className="text-sm text-gray-300" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}

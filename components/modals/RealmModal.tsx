'use client'

import { Globe, Loader2, Mountain, Target } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { Checkbox } from '@/components/ui/Checkbox'
import { SettingInfoLabel } from '@/components/ui/SettingInfoLabel'

interface RealmModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function RealmModal({ isOpen, onClose, iggId }: RealmModalProps) {
    const [fullSettings, setFullSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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
                    setMonsterLevel(data.realmMonsterSettings.monsterLevel || 1)
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
                    monsterLevel,
                }
            }

            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings),
            })

            if (res.ok) {
                setFullSettings(updatedSettings)
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

    const selectedResourceCount = [gatherFood, gatherStone, gatherWood, gatherOre, gatherGold, gatherLunite].filter(Boolean).length

    if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Realm Settings"
                iggId={iggId}
                icon={Globe}
                iconColor="#8B5CF6"
                iconBg="rgba(139,92,246,0.15)"
                iconBorder="rgba(139,92,246,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Realm Settings"
            iggId={iggId}
            icon={Globe}
            iconColor="#8B5CF6"
            iconBg="rgba(139,92,246,0.15)"
            iconBorder="rgba(139,92,246,0.3)"
            saving={saving}
            onSave={saveSettings}
            saveLabel="Save Changes"
            statusLabel={saving ? 'Saving...' : 'Manual save. Use Apply Changes to run the script.'}
            maxWidth="980px"
        >
            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-accent-1" />
                                </div>
                            ) : (
                                <div className="w-full space-y-6">
                                    <ModalSummaryGrid
                                        items={[
                                            { label: 'Gather', value: gatherResources ? 'On' : 'Off', icon: Globe, tone: 'mint' },
                                            { label: 'Resources', value: `${selectedResourceCount}/6`, icon: Mountain, tone: 'violet' },
                                            { label: 'Hunt', value: huntMonsters ? `${killsPerDay}/day` : 'Off', icon: Target, tone: 'gold' },
                                        ]}
                                    />

                                    {/* Gathering Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-md border border-accent-1/20 bg-accent-1/10 p-4">
                                            <div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <Checkbox checked={gatherResources} onChange={setGatherResources} />
                                                    <SettingInfoLabel label="Gather Resources" />
                                                </label>
                                                <p className="ml-8 text-xs text-text-muted">This will disable normal gathering mode.</p>
                                            </div>
                                        </div>

                                        {/* Gathering Options */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            <div className="rounded-md border border-border bg-bg-inset/70 p-3 sm:p-4">
                                                <div className="mb-2">
                                                    <SettingInfoLabel label="Max Armies to Gather (0 for all)" className="text-[12px] font-bold text-text-muted" />
                                                </div>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={8}
                                                    step="1"
                                                    value={maxArmies}
                                                    onChange={(e) => setMaxArmies(Math.floor(Number(e.target.value)))}
                                                    onKeyDown={(e) => {
                                                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onBlur={(e) => setMaxArmies(Math.max(0, Math.min(8, Math.floor(Number(e.target.value)))))}
                                                    className="input-field min-h-[42px] w-full text-[13px]"
                                                />
                                            </div>

                                            <div className="rounded-md border border-border bg-bg-inset/70 p-3 sm:p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <Checkbox checked={leaveSpareArmy} onChange={setLeaveSpareArmy} />
                                                        <SettingInfoLabel label="Leave Spare Army" />
                                                    </label>
                                                </div>
                                                <div className="mb-2">
                                                    <SettingInfoLabel label="Spare Army Amount" className="text-[12px] font-bold text-text-muted" />
                                                </div>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={7}
                                                    step="1"
                                                    value={spareArmyAmount}
                                                    onChange={(e) => setSpareArmyAmount(Math.floor(Number(e.target.value)))}
                                                    onKeyDown={(e) => {
                                                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onBlur={(e) => setSpareArmyAmount(Math.max(0, Math.min(7, Math.floor(Number(e.target.value)))))}
                                                    className="input-field min-h-[42px] w-full text-[13px]"
                                                />
                                            </div>
                                        </div>

                                        {/* Use High Tier Troops */}
                                        <label className="flex items-center justify-between rounded-md border border-border bg-bg-inset/70 p-4 transition-colors hover:border-accent-1/25 hover:bg-white/[0.035] cursor-pointer">
                                            <SettingInfoLabel label="Use High Tier Troops" />
                                            <Checkbox checked={useHighTierTroops} onChange={setUseHighTierTroops} />
                                        </label>

                                        {/* Resource Types */}
                                        <div>
                                            <h4 className="mb-3">
                                                <SettingInfoLabel label="Resource Types" className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted" />
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-wrap md:gap-3">
                                                {[
                                                    { label: 'Food', value: gatherFood, setter: setGatherFood, index: 0 },
                                                    { label: 'Stone', value: gatherStone, setter: setGatherStone, index: 1 },
                                                    { label: 'Wood', value: gatherWood, setter: setGatherWood, index: 2 },
                                                    { label: 'Ore', value: gatherOre, setter: setGatherOre, index: 3 },
                                                    { label: 'Gold', value: gatherGold, setter: setGatherGold, index: 4 },
                                                    { label: 'Lunite', value: gatherLunite, setter: setGatherLunite, index: 5 },
                                                ].map((resource) => (
                                                    <label key={resource.index} className="flex items-center justify-between gap-4 md:gap-2 rounded-md border border-border bg-bg-inset/70 px-4 py-3 md:py-2 transition-colors hover:border-accent-1/25 hover:bg-white/[0.035] cursor-pointer">
                                                        <SettingInfoLabel label={resource.label} />
                                                        <Checkbox checked={resource.value} onChange={resource.setter} />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hunting Section */}
                                    <div className="space-y-4 border-t border-border pt-6">
                                        <div className="flex items-center justify-between rounded-md border border-accent-1/20 bg-accent-1/10 p-4">
                                            <div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <Checkbox checked={huntMonsters} onChange={setHuntMonsters} />
                                                    <SettingInfoLabel label="Hunt Monsters" />
                                                </label>
                                                <p className="ml-8 text-xs text-text-muted">This will disable normal hunting mode.</p>
                                            </div>
                                        </div>

                                        {/* Hunting Options */}
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                                            <label className="flex items-center justify-between rounded-md border border-border bg-bg-inset/70 p-4 transition-colors hover:border-accent-1/25 hover:bg-white/[0.035] cursor-pointer">
                                                <SettingInfoLabel label="Use Energy Items" />
                                                <Checkbox checked={useEnergyItems} onChange={setUseEnergyItems} />
                                            </label>

                                            <div className="rounded-md border border-border bg-bg-inset/70 p-3 sm:p-4">
                                                <div className="mb-2">
                                                    <SettingInfoLabel label="Kills Per Day" className="text-[12px] font-bold text-text-muted" />
                                                </div>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    step="1"
                                                    value={killsPerDay}
                                                    onChange={(e) => setKillsPerDay(Math.floor(Number(e.target.value)))}
                                                    onKeyDown={(e) => {
                                                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onBlur={(e) => setKillsPerDay(Math.max(0, Math.min(100, Math.floor(Number(e.target.value)))))}
                                                    className="input-field min-h-[42px] w-full text-[13px]"
                                                />
                                            </div>

                                            <div className="rounded-md border border-border bg-bg-inset/70 p-3 sm:p-4">
                                                <div className="mb-2">
                                                    <SettingInfoLabel label="Level" helpText="Monster level to hunt in realm mode." className="text-[12px] font-bold text-text-muted" />
                                                </div>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={5}
                                                    step="1"
                                                    value={monsterLevel}
                                                    onChange={(e) => setMonsterLevel(Math.floor(Number(e.target.value)))}
                                                    onKeyDown={(e) => {
                                                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onBlur={(e) => setMonsterLevel(Math.max(1, Math.min(5, Math.floor(Number(e.target.value)))))}
                                                    className="input-field min-h-[42px] w-full text-[13px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}

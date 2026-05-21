'use client'

import { Flame, HeartPulse, Loader2, Sword } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { Checkbox } from '@/components/ui/Checkbox'
import { TacticalSelect } from '@/components/ui/TacticalSelect'
import { SettingInfoLabel } from '@/components/ui/SettingInfoLabel'

interface MilitaryModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

interface TroopData {
    name: string
    tier: number
    amount: number
}

export default function MilitaryModal({ isOpen, onClose, iggId }: MilitaryModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [saving, setSaving] = useState(false)

    // Military settings
    const [trainTroops, setTrainTroops] = useState(false)
    const [rotateTroopTraining, setRotateTroopTraining] = useState(false)
    const [healTroops, setHealTroops] = useState(false)
    const [healSanctuary, setHealSanctuary] = useState(false)
    const [selectedChapter, setSelectedChapter] = useState('Chapter 9')
    const [craftLuminousGear, setCraftLuminousGear] = useState(false)

    // Skirmish settings
    const [attackSkirmishLevels, setAttackSkirmishLevels] = useState(false)
    const [attackTrailByFire, setAttackTrailByFire] = useState(false)
    const [recallTroopsForSkirmish, setRecallTroopsForSkirmish] = useState(false)
    const [attackSkirmishWhenTroopsAt, setAttackSkirmishWhenTroopsAt] = useState(90)

    // Troop data
    const [troops, setTroops] = useState<TroopData[]>([
        { name: 'Grunt', tier: 1, amount: 0 },
        { name: 'Archer', tier: 1, amount: 0 },
        { name: 'Cataphract', tier: 1, amount: 0 },
        { name: 'Ballista', tier: 1, amount: 0 },
        { name: 'Gladiator', tier: 2, amount: 0 },
        { name: 'Sharpshooter', tier: 2, amount: 0 },
        { name: 'Reptilian Rider', tier: 2, amount: 0 },
        { name: 'Catapult', tier: 2, amount: 0 },
        { name: 'Royal Guard', tier: 3, amount: 0 },
        { name: 'Stealth Sniper', tier: 3, amount: 0 },
        { name: 'Royal Cavalry', tier: 3, amount: 0 },
        { name: 'Fire Trebuchet', tier: 3, amount: 0 },
        { name: 'Heroic Fighter', tier: 4, amount: 0 },
        { name: 'Heroic Cannoneer', tier: 4, amount: 0 },
        { name: 'Ancient Drake Rider', tier: 4, amount: 0 },
        { name: 'Destroyer', tier: 4, amount: 0 },
        { name: 'Luminary Guard', tier: 5, amount: 0 },
        { name: 'Luminary Marksman', tier: 5, amount: 0 },
        { name: 'Luminary Lion Force', tier: 5, amount: 0 },
        { name: 'Luminary Avenger', tier: 5, amount: 0 },
    ])

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

                // Load from troopSettings
                if (data.troopSettings) {
                    setTrainTroops(data.troopSettings.autoTrainTroops ?? false)
                    setRotateTroopTraining(data.troopSettings.rotateTraining ?? false)
                    setHealTroops(data.troopSettings.autoHealTroops ?? false)
                    setHealSanctuary(data.troopSettings.autoHealSanctuary ?? false)
                    setCraftLuminousGear(data.troopSettings.autoCraftLunar ?? false)
                }

                // Load from miscSettings for skirmish
                if (data.miscSettings) {
                    setAttackSkirmishLevels(data.miscSettings.autoAttackSkirmish ?? false)
                    setAttackTrailByFire(data.miscSettings.autoAttackFireTrial ?? false)
                    setRecallTroopsForSkirmish(data.miscSettings.recallTroopsForSkirmish ?? false)
                    setAttackSkirmishWhenTroopsAt(data.miscSettings.skirmishTroopPercent ?? 90)

                    // Convert skirmishChapter to chapter string
                    const chapterNum = data.miscSettings.skirmishChapter ?? 9
                    setSelectedChapter(`Chapter ${chapterNum}`)
                }

                // Load troop data from militarySettings
                if (data.militarySettings?.troops) {
                    setTroops(data.militarySettings.troops)
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
            // Get current chapter index (0-based)
            const chapterNum = parseInt(selectedChapter.replace('Chapter ', ''))
            const chapterIndex = chapterNum - 1

            // Separate T1-T4 troops (first 16) and T5 troops (last 4)
            const t14Troops = troops.slice(0, 16).map(t => t.amount)
            const t5Troops = troops.slice(16, 20).map(t => t.amount)

            // Update troopData array for the current chapter
            const troopData = [...(settings.troopSettings?.troopData || [])]
            while (troopData.length <= chapterIndex) {
                troopData.push(Array(16).fill(0))
            }
            troopData[chapterIndex] = t14Troops

            const updatedSettings = {
                ...settings,
                troopSettings: {
                    ...settings.troopSettings,
                    autoTrainTroops: trainTroops,
                    rotateTraining: rotateTroopTraining,
                    autoHealTroops: healTroops,
                    autoHealSanctuary: healSanctuary,
                    autoCraftLunar: craftLuminousGear,
                    troopData,
                    troopData_T5: t5Troops,
                },
                miscSettings: {
                    ...settings.miscSettings,
                    skirmishChapter: chapterNum,
                    autoAttackSkirmish: attackSkirmishLevels,
                    autoSkirmish: attackSkirmishLevels,
                    autoAttackFireTrial: attackTrailByFire,
                    recallTroopsForSkirmish,
                    skirmishTroopPercent: attackSkirmishWhenTroopsAt,
                },
                militarySettings: {
                    ...settings.militarySettings,
                    troops,
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

    const handleResetTroops = () => {
        const resetTroops = troops.map(t => ({ ...t, amount: 0 }))
        setTroops(resetTroops)
        toast.success('Troop data reset!')
    }

    const updateTroopAmount = (index: number, amount: number) => {
        const updatedTroops = [...troops]
        updatedTroops[index].amount = Math.min(999999999, Math.max(0, amount))
        setTroops(updatedTroops)
    }

    if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Military"
                iggId={iggId}
                icon={Sword}
                iconColor="#EF4444"
                iconBg="rgba(239,68,68,0.15)"
                iconBorder="rgba(239,68,68,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Military"
            iggId={iggId}
            icon={Sword}
            iconColor="#EF4444"
            iconBg="rgba(239,68,68,0.15)"
            iconBorder="rgba(239,68,68,0.3)"
            saving={saving}
            onSave={saveSettings}
            saveLabel="Save Changes"
            statusLabel={saving ? 'Saving...' : 'Manual save. Use Apply Changes to run the script.'}
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
                                            { label: 'Training', value: trainTroops ? 'On' : 'Off', icon: Sword, tone: 'rose' },
                                            { label: 'Healing', value: healTroops || healSanctuary ? 'On' : 'Off', icon: HeartPulse, tone: 'mint' },
                                            { label: 'Skirmish', value: attackSkirmishLevels ? selectedChapter : 'Off', icon: Flame, tone: 'gold' },
                                        ]}
                                    />

                                    {/* Main Options */}
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-wrap md:gap-3">
                                        {[
                                            { label: 'Train Troops', value: trainTroops, setter: setTrainTroops },
                                            { label: 'Rotate Troop Training', value: rotateTroopTraining, setter: setRotateTroopTraining },
                                            { label: 'Heal Troops', value: healTroops, setter: setHealTroops },
                                            { label: 'Heal Sanctuary', value: healSanctuary, setter: setHealSanctuary },
                                            { label: 'Craft Luminous Gear', value: craftLuminousGear, setter: setCraftLuminousGear },
                                        ].map((option, index) => (
                                            <label key={index} className="flex min-h-[48px] md:min-h-0 items-center justify-between md:justify-start gap-4 md:gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-bg-inset/70 md:bg-[#0F0F1A] border border-white/10 md:border-[rgba(123,94,255,0.08)] hover:bg-white/[0.035] md:hover:bg-[#161626] transition-colors cursor-pointer">
                                                <SettingInfoLabel label={option.label} className="text-[13px] sm:text-[14px] md:text-sm text-white" />
                                                <Checkbox checked={option.value} onChange={option.setter} />
                                            </label>
                                        ))}
                                        <button
                                            onClick={handleResetTroops}
                                            className="px-6 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-medium transition-colors"
                                        >
                                            Reset Troop Data
                                        </button>
                                    </div>

                                    {/* Skirmish / Chapter Section */}
                                    <div className="space-y-4 pt-6 border-t border-[rgba(123,94,255,0.2)]">
                                        <h3>
                                            <SettingInfoLabel label="Skirmish / Chapter" className="text-base sm:text-lg font-bold text-white" />
                                        </h3>

                                        {/* Selected Chapter */}
                                        <div className="p-3 sm:p-4 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)]">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Selected Chapter" className="text-xs sm:text-sm text-gray-300" />
                                            </div>
                                            <TacticalSelect
                                                value={selectedChapter}
                                                onChange={setSelectedChapter}
                                                options={Array.from({ length: 9 }, (_, i) => ({ value: `Chapter ${i + 1}`, label: `Chapter ${i + 1}` }))}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-wrap md:gap-3">
                                            <label className="flex min-h-[48px] md:min-h-0 items-center justify-between md:justify-start gap-4 md:gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-bg-inset/70 md:bg-[#0F0F1A] border border-white/10 md:border-[rgba(123,94,255,0.08)] hover:bg-white/[0.035] md:hover:bg-[#161626] transition-colors cursor-pointer">
                                                <SettingInfoLabel label="Attack Skirmish Levels" className="text-[13px] sm:text-[14px] md:text-sm text-white" />
                                                <Checkbox checked={attackSkirmishLevels} onChange={setAttackSkirmishLevels} />
                                            </label>

                                            <label className="flex min-h-[48px] md:min-h-0 items-center justify-between md:justify-start gap-4 md:gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-bg-inset/70 md:bg-[#0F0F1A] border border-white/10 md:border-[rgba(123,94,255,0.08)] hover:bg-white/[0.035] md:hover:bg-[#161626] transition-colors cursor-pointer">
                                                <SettingInfoLabel label="Attack Trail By Fire" className="text-[13px] sm:text-[14px] md:text-sm text-white" />
                                                <Checkbox checked={attackTrailByFire} onChange={setAttackTrailByFire} />
                                            </label>

                                            <label className="flex min-h-[48px] md:min-h-0 items-center justify-between md:justify-start gap-4 md:gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-bg-inset/70 md:bg-[#0F0F1A] border border-white/10 md:border-[rgba(123,94,255,0.08)] hover:bg-white/[0.035] md:hover:bg-[#161626] transition-colors cursor-pointer">
                                                <SettingInfoLabel label="Recall Troops for Skirmish" className="text-[13px] sm:text-[14px] md:text-sm text-white" />
                                                <Checkbox checked={recallTroopsForSkirmish} onChange={setRecallTroopsForSkirmish} />
                                            </label>
                                        </div>

                                        <div className="p-3 sm:p-4 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)]">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Attack Skirmish When Troops At" className="text-xs sm:text-sm text-gray-300" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={attackSkirmishWhenTroopsAt}
                                                    step="1"
                                                    onChange={(e) => setAttackSkirmishWhenTroopsAt(Math.floor(Number(e.target.value)))}
                                                    onBlur={(e) => setAttackSkirmishWhenTroopsAt(Math.min(100, Math.max(0, Math.floor(Number(e.target.value)))))}
                                                    className="w-24 px-3 py-2 bg-[#07070E]/50 border border-[rgba(123,94,255,0.2)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7B5EFF]/50"
                                                />
                                                <span className="text-sm text-gray-400">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Troop Table */}
                                    <div className="space-y-4 pt-6 border-t border-[rgba(123,94,255,0.2)]">
                                        <h3>
                                            <SettingInfoLabel label="Troop Training" className="text-base sm:text-lg font-bold text-white" />
                                        </h3>

                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-[rgba(123,94,255,0.2)]">
                                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                                                            <SettingInfoLabel label="Troop Name" className="text-sm font-medium text-gray-300" />
                                                        </th>
                                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-300">
                                                            <SettingInfoLabel label="Tier" className="text-sm font-medium text-gray-300" />
                                                        </th>
                                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-300">
                                                            <SettingInfoLabel label="Amount to Train" className="text-sm font-medium text-gray-300" />
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {troops.map((troop, index) => (
                                                        <tr key={index} className="border-b border-white/5 hover:bg-[#161626]/30 transition-colors">
                                                            <td className="py-3 px-4 text-sm text-white">{troop.name}</td>
                                                            <td className="py-3 px-4 text-sm text-center text-gray-400">{troop.tier}</td>
                                                            <td className="py-3 px-4 text-center">
                                                                <input
                                                                    type="number"
                                                                    value={troop.amount ?? ''}
                                                                    min={0}
                                                                    max={999999999}
                                                                    step="1"
                                                                    onChange={(e) => {
                                                                        const val = e.target.value === '' ? 0 : Math.floor(Number(e.target.value))
                                                                        updateTroopAmount(index, val)
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const val = e.target.value === '' ? 0 : Math.min(999999999, Math.floor(Number(e.target.value)))
                                                                        updateTroopAmount(index, val)
                                                                    }}
                                                                    className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-[#07070E]/50 border border-[rgba(123,94,255,0.2)] rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#7B5EFF]/50 disabled:opacity-50"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}

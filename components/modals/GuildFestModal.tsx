'use client'

import { useEffect, useState } from 'react'
import { Check, Gift, ListChecks, Loader2, Send, Trophy, X } from 'lucide-react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { Checkbox } from '@/components/ui/Checkbox'
import { TacticalSelect } from '@/components/ui/TacticalSelect'
import { SettingInfoLabel } from '@/components/ui/SettingInfoLabel'

interface GuildFestModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

type GuildFestMode = 'complete' | 'delete'
type GuildFestSubTab = 'default' | '120' | '200'

interface MissionData {
    id: number
    name: string
    c_enabled: boolean
    c_min: number
    c_max: number
    c_auto: number
    c_solo: any
    d_enabled: boolean
    d_min: number
    d_max: number
    d_solo: any
}

const MISSION_MAP: Record<number, string> = {
    0: 'Get a random quest!',
    1: 'Complete Admin Quests',
    2: 'Complete Guild Quests',
    4: 'Send help to your guildmates',
    5: 'Hit monsters',
    6: 'Complete Phase 3 (Solo Events)',
    7: 'Complete Phase 3 (Hell Events)',
    9: 'Complete Hero Stages',
    10: 'Cargo Ship Trades',
    11: 'Open Mystery Boxes',
    12: 'Increase Might (Troops)',
    13: 'Increase Might (Buildings)',
    14: 'Increase Might (Research)',
    15: 'Increase Might (Quests)',
    18: 'Increase Might (Hero Armies)',
    19: 'Increase total Might',
    21: 'Research Tech',
    22: 'Train Soldiers',
    29: 'Gather Resources',
    30: 'Supply Resources',
    37: 'Hero Colosseum Battles',
    41: 'Time reduced using Speed Ups',
    60: 'Get Dark Essences',
    61: 'Win Darknest Coalition battles (Rally Captain only)',
    62: 'Use Holy Stars',
    64: 'Get Lv 19+ Dark Essences',
    68: 'Encounter Labyrinth Guardians',
    69: 'Merge Pacts',
    70: 'Use Fragments',
    71: 'Time reduced using Speed Up Merging',
    72: 'Use Familiar Attack skills',
    74: 'Obtain [Legendary] Loot',
    78: 'Unlock Castle Stars',
    79: 'Encounter Elite/10x-Labyrinth Guardians',
    80: 'Gain Familiar EXP with EXP items',
    81: 'Spend Luck Tokens',
    82: 'Meet a Gemming Gremlin in Kingdom Tycoon',
    83: 'Craft Gear',
    84: 'Upgrade Artifacts',
    85: 'Enhance Artifacts (includes Blessings)',
    86: 'Spend Artifact Coins',
    98: 'Spend Gems',
    99: 'Spend Guild Coins',
    100: 'Purchase Special Bundles',
}

const DEFAULT_MISSIONS: MissionData[] = Object.entries(MISSION_MAP).map(([id, name]) => ({
    id: parseInt(id, 10),
    name,
    c_enabled: false,
    c_min: 175,
    c_max: 355,
    c_auto: 0,
    c_solo: {},
    d_enabled: false,
    d_min: 100,
    d_max: 355,
    d_solo: {},
}))

const SUB_TAB_OPTIONS = [
    { value: 'default', label: 'Guild Task' },
    { value: '120', label: '120% Missions' },
    { value: '200', label: '200% Missions' },
]

function clampWholeNumber(value: number, min: number, max: number) {
    if (Number.isNaN(value)) return min
    return Math.max(min, Math.min(max, Math.floor(value)))
}

export default function GuildFestModal({ isOpen, onClose, iggId }: GuildFestModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [mode, setMode] = useState<GuildFestMode>('complete')
    const [subTab, setSubTab] = useState<GuildFestSubTab>('default')

    const [collectRewards, setCollectRewards] = useState(false)
    const [completeMissions, setCompleteMissions] = useState(false)
    const [buyExtraMission, setBuyExtraMission] = useState(false)
    const [mailPlayer, setMailPlayer] = useState('')
    const [itemToBuyNum, setItemToBuyNum] = useState(1051)
    const [missions, setMissions] = useState<MissionData[]>(DEFAULT_MISSIONS)

    useEffect(() => {
        if (isOpen && iggId) {
            loadSettings()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, iggId])

    const loadSettings = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`)
            if (res.ok) {
                const data = await res.json()
                const guildFest = data.eventSettings?.guildFest
                const completeSettings = guildFest?.gfMissionComplete
                const removeSettings = guildFest?.gfMissionRemove

                setSettings(data)
                setCollectRewards(guildFest?.collectRewards ?? false)
                setCompleteMissions(completeSettings?.completeMissions ?? false)
                setBuyExtraMission(completeSettings?.buyExtraMission ?? false)
                setMailPlayer(completeSettings?.mMailPlayerName ?? '')
                setItemToBuyNum(completeSettings?.itemToBuy ?? 1051)

                setMissions(DEFAULT_MISSIONS.map((mission) => {
                    const completeMission = completeSettings?.missionsToComplete_?.[mission.id]
                    const removeMission = removeSettings?.missionsToRemove_?.[mission.id]

                    return {
                        ...mission,
                        c_enabled: completeMission?.ToComplete ?? false,
                        c_min: completeMission?.TakeIfHigherThanPoints ?? 175,
                        c_max: completeMission?.MaxPoints ?? 355,
                        c_auto: completeMission?.IsAutomated ?? 0,
                        c_solo: {
                            ToCompleteSolo120: completeMission?.ToCompleteSolo120,
                            TakeIfHigherThanPointsSolo120: completeMission?.TakeIfHigherThanPointsSolo120,
                            MaxPointsSolo120: completeMission?.MaxPointsSolo120,
                            ToCompleteSolo200: completeMission?.ToCompleteSolo200,
                            TakeIfHigherThanPointsSolo200: completeMission?.TakeIfHigherThanPointsSolo200,
                            MaxPointsSolo200: completeMission?.MaxPointsSolo200,
                        },
                        d_enabled: removeMission?.ToRemove ?? false,
                        d_min: removeMission?.RemoveIfLowerThanPoints ?? 100,
                        d_max: removeMission?.MaxPoints ?? 355,
                        d_solo: {
                            ToRemoveSolo120: removeMission?.ToRemoveSolo120,
                            ToRemoveSolo200: removeMission?.ToRemoveSolo200,
                            RemoveIfLowerThanPointsSolo120: removeMission?.RemoveIfLowerThanPointsSolo120,
                            RemoveIfLowerThanPointsSolo200: removeMission?.RemoveIfLowerThanPointsSolo200,
                            MaxPointsSolo120: removeMission?.MaxPointsSolo120,
                            MaxPointsSolo200: removeMission?.MaxPointsSolo200,
                        },
                    }
                }))
            } else {
                toast.error('Failed to load settings')
            }
        } catch {
            toast.error('Error loading settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!iggId || !settings) return

        setSaving(true)
        try {
            const missionsToComplete_: any = {}
            const missionsToRemove_: any = {}

            missions.forEach((mission) => {
                missionsToComplete_[mission.id] = {
                    ToComplete: mission.c_enabled,
                    TakeIfHigherThanPoints: mission.c_min,
                    MaxPoints: mission.c_max,
                    IsAutomated: mission.c_auto,
                    ...(mission.c_solo || {}),
                }

                missionsToRemove_[mission.id] = {
                    ToRemove: mission.d_enabled,
                    RemoveIfLowerThanPoints: mission.d_min,
                    MaxPoints: mission.d_max,
                    ...(mission.d_solo || {}),
                }
            })

            const updatedSettings = {
                ...settings,
                eventSettings: {
                    ...(settings.eventSettings || {}),
                    guildFest: {
                        ...(settings.eventSettings?.guildFest || {}),
                        collectRewards,
                        gfMissionComplete: {
                            ...(settings.eventSettings?.guildFest?.gfMissionComplete || {}),
                            completeMissions,
                            buyExtraMission,
                            itemToBuy: itemToBuyNum,
                            mMailPlayerName: mailPlayer,
                            mToMailPlayer: mailPlayer.length > 0,
                            missionsToComplete_,
                        },
                        gfMissionRemove: {
                            ...(settings.eventSettings?.guildFest?.gfMissionRemove || {}),
                            missionsToRemove_,
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
                setSettings(updatedSettings)
                toast.success('Settings saved to config')
            } else {
                toast.error('Failed to save settings')
            }
        } catch {
            toast.error('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const getMissionState = (mission: MissionData) => {
        if (mode === 'complete') {
            if (subTab === '120') {
                return {
                    checked: !!mission.c_solo?.ToCompleteSolo120,
                    min: mission.c_solo?.TakeIfHigherThanPointsSolo120 ?? 0,
                    max: mission.c_solo?.MaxPointsSolo120 ?? 0,
                }
            }
            if (subTab === '200') {
                return {
                    checked: !!mission.c_solo?.ToCompleteSolo200,
                    min: mission.c_solo?.TakeIfHigherThanPointsSolo200 ?? 0,
                    max: mission.c_solo?.MaxPointsSolo200 ?? 0,
                }
            }
            return { checked: mission.c_enabled, min: mission.c_min, max: mission.c_max }
        }

        if (subTab === '120') {
            return {
                checked: !!mission.d_solo?.ToRemoveSolo120,
                min: mission.d_solo?.RemoveIfLowerThanPointsSolo120 ?? 0,
                max: mission.d_solo?.MaxPointsSolo120 ?? 0,
            }
        }
        if (subTab === '200') {
            return {
                checked: !!mission.d_solo?.ToRemoveSolo200,
                min: mission.d_solo?.RemoveIfLowerThanPointsSolo200 ?? 0,
                max: mission.d_solo?.MaxPointsSolo200 ?? 0,
            }
        }
        return { checked: mission.d_enabled, min: mission.d_min, max: mission.d_max }
    }

    const toggleMission = (index: number) => {
        setMissions((previous) => previous.map((mission, missionIndex) => {
            if (missionIndex !== index) return mission

            if (mode === 'complete') {
                if (subTab === '120') {
                    return {
                        ...mission,
                        c_solo: {
                            ...(mission.c_solo || {}),
                            ToCompleteSolo120: !mission.c_solo?.ToCompleteSolo120,
                        },
                    }
                }
                if (subTab === '200') {
                    return {
                        ...mission,
                        c_solo: {
                            ...(mission.c_solo || {}),
                            ToCompleteSolo200: !mission.c_solo?.ToCompleteSolo200,
                        },
                    }
                }
                return { ...mission, c_enabled: !mission.c_enabled }
            }

            if (subTab === '120') {
                return {
                    ...mission,
                    d_solo: {
                        ...(mission.d_solo || {}),
                        ToRemoveSolo120: !mission.d_solo?.ToRemoveSolo120,
                    },
                }
            }
            if (subTab === '200') {
                return {
                    ...mission,
                    d_solo: {
                        ...(mission.d_solo || {}),
                        ToRemoveSolo200: !mission.d_solo?.ToRemoveSolo200,
                    },
                }
            }
            return { ...mission, d_enabled: !mission.d_enabled }
        }))
    }

    const updateMissionValue = (index: number, key: 'min' | 'max', value: string) => {
        const maxLimit = subTab === '120' ? 400 : subTab === '200' ? 650 : 355
        const parsed = clampWholeNumber(parseInt(value, 10), 0, maxLimit)

        setMissions((previous) => previous.map((mission, missionIndex) => {
            if (missionIndex !== index) return mission

            if (mode === 'complete') {
                if (subTab === '120') {
                    return {
                        ...mission,
                        c_solo: {
                            ...(mission.c_solo || {}),
                            [key === 'min' ? 'TakeIfHigherThanPointsSolo120' : 'MaxPointsSolo120']: parsed,
                        },
                    }
                }
                if (subTab === '200') {
                    return {
                        ...mission,
                        c_solo: {
                            ...(mission.c_solo || {}),
                            [key === 'min' ? 'TakeIfHigherThanPointsSolo200' : 'MaxPointsSolo200']: parsed,
                        },
                    }
                }
                return key === 'min' ? { ...mission, c_min: parsed } : { ...mission, c_max: parsed }
            }

            if (subTab === '120') {
                return {
                    ...mission,
                    d_solo: {
                        ...(mission.d_solo || {}),
                        [key === 'min' ? 'RemoveIfLowerThanPointsSolo120' : 'MaxPointsSolo120']: parsed,
                    },
                }
            }
            if (subTab === '200') {
                return {
                    ...mission,
                    d_solo: {
                        ...(mission.d_solo || {}),
                        [key === 'min' ? 'RemoveIfLowerThanPointsSolo200' : 'MaxPointsSolo200']: parsed,
                    },
                }
            }
            return key === 'min' ? { ...mission, d_min: parsed } : { ...mission, d_max: parsed }
        }))
    }

    const enabledCount = missions.filter((mission) => getMissionState(mission).checked).length

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Guild Fest"
            iggId={iggId}
            icon={Trophy}
            iconColor="#ffbd4a"
            iconBg="rgba(255,189,74,0.14)"
            iconBorder="rgba(255,189,74,0.30)"
            saving={saving}
            onSave={handleSave}
            saveLabel="Save Changes"
            statusLabel={saving ? 'Saving...' : 'Manual save. Use Apply Changes to run the script.'}
            maxWidth="980px"
        >
            {loading ? (
                <div className="flex min-h-[360px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent-1" />
                </div>
            ) : (
                <div className="space-y-6">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Rewards', value: collectRewards ? 'On' : 'Off', icon: Gift, tone: 'gold' },
                            { label: 'Selected', value: enabledCount, icon: ListChecks, tone: mode === 'complete' ? 'mint' : 'rose' },
                            { label: 'Mail', value: mailPlayer ? 'Set' : 'None', icon: Send, tone: 'cyan' },
                        ]}
                    />

                    <section className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-3">
                        <label className="flex min-h-[44px] sm:min-h-[58px] cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-bg-inset/70 px-3 py-2 sm:px-4 sm:py-3 transition-colors hover:border-white/20 hover:bg-white/[0.035]">
                            <SettingInfoLabel label="Collect Rewards" className="text-[12px] sm:text-[14px]" />
                            <Checkbox checked={collectRewards} onChange={setCollectRewards} />
                        </label>
                        <label className="flex min-h-[44px] sm:min-h-[58px] cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-bg-inset/70 px-3 py-2 sm:px-4 sm:py-3 transition-colors hover:border-white/20 hover:bg-white/[0.035]">
                            <SettingInfoLabel label="Complete Missions" className="text-[12px] sm:text-[14px]" />
                            <Checkbox checked={completeMissions} onChange={setCompleteMissions} />
                        </label>
                        <label className="flex min-h-[44px] sm:min-h-[58px] cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-bg-inset/70 px-3 py-2 sm:px-4 sm:py-3 transition-colors hover:border-white/20 hover:bg-white/[0.035]">
                            <SettingInfoLabel label="Buy Extra Mission" className="text-[12px] sm:text-[14px]" />
                            <Checkbox checked={buyExtraMission} onChange={setBuyExtraMission} />
                        </label>
                    </section>

                    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-[1fr_220px_220px]">
                        <div className="rounded-[24px] border border-white/10 bg-bg-inset/70 p-4">
                            <div className="mb-2">
                                <SettingInfoLabel label="Send Mail to Player" className="text-[12px] font-black uppercase tracking-[0.14em] text-text-muted" />
                            </div>
                            <input
                                type="text"
                                value={mailPlayer}
                                onChange={(event) => setMailPlayer(event.target.value)}
                                placeholder="Player name"
                                className="input-field w-full text-[14px]"
                            />
                        </div>
                        <div className="rounded-[24px] border border-accent-1/20 bg-accent-1/10 p-4">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-1">Selected</div>
                            <div className="mt-1 font-orbitron text-2xl font-black text-accent-1">{enabledCount}</div>
                        </div>
                        <div className="rounded-[24px] border border-accent-gold/20 bg-accent-gold/10 p-4">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-gold">Mode</div>
                            <div className="mt-2 text-[13px] font-black uppercase text-accent-gold">{mode === 'complete' ? 'Complete' : 'Delete'}</div>
                        </div>
                    </section>

                    <section className="space-y-4 border-t border-white/10 pt-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2>
                                    <SettingInfoLabel label="Guild Missions" className="text-[17px] font-black text-text-primary" />
                                </h2>
                                <p className="mt-1 text-[12px] text-text-muted">Choose missions and set their point thresholds for each mission pool.</p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="grid grid-cols-2 rounded-[24px] border border-white/10 bg-bg-inset p-1">
                                    <button
                                        type="button"
                                        onClick={() => setMode('complete')}
                                        className={`flex min-h-[38px] items-center justify-center gap-2 rounded-[24px] px-4 text-[12px] font-black transition-colors ${mode === 'complete'
                                            ? 'bg-accent-1/15 text-accent-1 shadow-[inset_0_0_0_1px_rgba(33,243,177,0.26)]'
                                            : 'text-text-muted hover:text-text-primary'
                                            }`}
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        Complete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('delete')}
                                        className={`flex min-h-[38px] items-center justify-center gap-2 rounded-[24px] px-4 text-[12px] font-black transition-colors ${mode === 'delete'
                                            ? 'bg-accent-3/15 text-accent-3 shadow-[inset_0_0_0_1px_rgba(255,77,109,0.26)]'
                                            : 'text-text-muted hover:text-text-primary'
                                            }`}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Delete
                                    </button>
                                </div>
                                <TacticalSelect
                                    value={subTab}
                                    onChange={(value) => setSubTab(value as GuildFestSubTab)}
                                    options={SUB_TAB_OPTIONS}
                                    className="w-full sm:w-[220px]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 lg:gap-3">
                            {missions.map((mission, index) => {
                                const state = getMissionState(mission)
                                const disabledPointInputs = mode === 'delete' && state.checked

                                return (
                                    <div
                                        key={mission.id}
                                        className={`rounded-[24px] border p-4 transition-colors ${state.checked
                                            ? mode === 'complete'
                                                ? 'border-accent-1/25 bg-accent-1/[0.045]'
                                                : 'border-accent-3/25 bg-accent-3/[0.05]'
                                            : 'border-white/10 bg-bg-inset/70 hover:border-white/15'
                                            }`}
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex min-w-0 items-center gap-3 text-left">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleMission(index)}
                                                    aria-label={`${state.checked ? 'Disable' : 'Enable'} ${mission.name}`}
                                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[24px] border transition-colors ${state.checked
                                                        ? mode === 'complete'
                                                            ? 'border-accent-1 bg-accent-1 text-bg-base'
                                                            : 'border-accent-3 bg-accent-3 text-bg-base'
                                                        : 'border-white/15 bg-bg-base text-transparent'
                                                        }`}
                                                >
                                                    {mode === 'complete' ? <Check className="h-4 w-4" strokeWidth={4} /> : <X className="h-4 w-4" strokeWidth={4} />}
                                                </button>
                                                <SettingInfoLabel
                                                    label={mission.name}
                                                    helpText={mode === 'complete'
                                                        ? 'Selects this Guild Fest mission for automatic completion using the configured point thresholds.'
                                                        : 'Selects this Guild Fest mission for automatic removal using the configured point thresholds.'
                                                    }
                                                    className={`min-w-0 text-[14px] font-black leading-snug ${state.checked
                                                        ? mode === 'complete' ? 'text-accent-1' : 'text-accent-3'
                                                        : 'text-text-primary'
                                                        }`}
                                                />
                                            </div>

                                            <div className="grid w-full grid-cols-2 gap-2 md:w-[360px] md:gap-3">
                                                <label className="space-y-1.5">
                                                    <SettingInfoLabel label="Min Points" className="block text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted" />
                                                    <input
                                                        type="number"
                                                        value={state.min}
                                                        onChange={(event) => updateMissionValue(index, 'min', event.target.value)}
                                                        disabled={disabledPointInputs}
                                                        className="input-field h-10 w-full font-sans text-[13px] font-black text-accent-cyan disabled:cursor-not-allowed disabled:opacity-45"
                                                    />
                                                </label>
                                                <label className="space-y-1.5">
                                                    <SettingInfoLabel label="Max Points" className="block text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted" />
                                                    <input
                                                        type="number"
                                                        value={state.max}
                                                        onChange={(event) => updateMissionValue(index, 'max', event.target.value)}
                                                        disabled={disabledPointInputs}
                                                        className="input-field h-10 w-full font-sans text-[13px] font-black text-accent-cyan disabled:cursor-not-allowed disabled:opacity-45"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </div>
            )}
        </KonohaModal>
    )
}

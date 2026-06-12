'use client'

import { FlaskConical, Loader2, Swords, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { Checkbox } from '@/components/ui/Checkbox'
import { TacticalRadioGroup } from '@/components/ui/TacticalRadioGroup'
import { TacticalSelect } from '@/components/ui/TacticalSelect'
import { SettingInfoLabel } from '@/components/ui/SettingInfoLabel'

interface MarchesModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function MarchesModal({ isOpen, onClose, iggId }: MarchesModalProps) {
    const [fullSettings, setFullSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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

    const enabledDarknestLevels = Object.values(darkestLevels).filter(Boolean).length

    if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Marches Settings"
                iggId={iggId}
                icon={Users}
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
            title="Marches Settings"
            iggId={iggId}
            icon={Users}
            iconColor="#EF4444"
            iconBg="rgba(239,68,68,0.15)"
            iconBorder="rgba(239,68,68,0.3)"
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
                                            { label: 'Rallies', value: joinRallies ? 'On' : 'Off', icon: Swords, tone: 'rose' },
                                            { label: 'Limit', value: rallyLimit, icon: Users, tone: 'cyan' },
                                            { label: 'Darknest', value: `${enabledDarknestLevels}/10`, icon: FlaskConical, tone: 'gold' },
                                        ]}
                                    />

                                    {/* Main Toggle */}
                                    <div className="flex items-center justify-between rounded-[24px] border border-accent-1/20 bg-accent-1/10 p-4">
                                        <label className="flex items-center justify-between w-full cursor-pointer">
                                            <SettingInfoLabel label="Join Rallies (Darknest Only)" />
                                            <Checkbox checked={joinRallies} onChange={setJoinRallies} />
                                        </label>
                                    </div>

                                    {/* Rally Settings */}
                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                        <div className="rounded-[24px] border border-border bg-bg-inset/70 p-3 sm:p-4">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Rally Limit" className="text-[12px] font-bold text-text-muted" />
                                            </div>
                                            <input
                                                type="number"
                                                min="1"
                                                max="8"
                                                step="1"
                                                value={rallyLimit}
                                                onChange={(e) => setRallyLimit(Math.floor(Math.min(8, Math.max(1, Number(e.target.value)))))}
                                                onKeyDown={(e) => {
                                                    if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className="input-field min-h-[42px] w-full text-[13px]"
                                            />
                                        </div>

                                        <div className="rounded-[24px] border border-border bg-bg-inset/70 p-3 sm:p-4">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Max Travel Time (Minutes)" className="text-[12px] font-bold text-text-muted" />
                                            </div>
                                            <input
                                                type="number"
                                                min={1}
                                                max={120}
                                                step="1"
                                                value={maxTravelTime}
                                                onChange={(e) => setMaxTravelTime(Math.floor(Number(e.target.value)))}
                                                onKeyDown={(e) => {
                                                    if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onBlur={(e) => setMaxTravelTime(Math.max(1, Math.min(120, Math.floor(Number(e.target.value)))))}
                                                className="input-field min-h-[42px] w-full text-[13px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Darkest Levels */}
                                    <div className="space-y-4">
                                        <h3 className="border-b border-border pb-2">
                                            <SettingInfoLabel label="Darknest Levels to Join" className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted" />
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-3">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                                                <label key={level} className="flex items-center justify-between w-full gap-2 rounded-[24px] border border-border bg-bg-inset/70 px-4 py-2 transition-colors hover:border-accent-1/25 hover:bg-white/[0.035] cursor-pointer">
                                                    <SettingInfoLabel label={`Level ${level}`} helpText={`Allows joining level ${level} Darknest rallies.`} />
                                                    <Checkbox
                                                        checked={darkestLevels[`level${level}` as keyof typeof darkestLevels]}
                                                        onChange={(v: boolean) => {
                                                            const updated = { ...darkestLevels, [`level${level}`]: v }
                                                            setDarkestLevels(updated)
                                                        }}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rally Options */}
                                    <div className="space-y-4">
                                        <h3 className="border-b border-border pb-2">
                                            <SettingInfoLabel label="Rally Options" className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted" />
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'Dont Join if lab is full?', value: dontJoinIfLabFull, setter: setDontJoinIfLabFull, key: 'dontJoinIfLabFull' },
                                                { label: 'Dont Fill Rally', value: dontFillRally, setter: setDontFillRally, key: 'dontFillRally' },
                                                { label: 'Dont send siege', value: dontSendSiege, setter: setDontSendSiege, key: 'dontSendSiege' },
                                                { label: 'Dont send T5', value: dontSendT5, setter: setDontSendT5, key: 'dontSendT5' },
                                                { label: 'Send One Type', value: sendOneType, setter: setSendOneType, key: 'sendOneType' },
                                                { label: 'Add Buffers', value: addBuffers, setter: setAddBuffers, key: 'addBuffers' },
                                            ].map((option) => (
                                                <label key={option.key} className="flex items-center justify-between rounded-[24px] border border-border bg-bg-inset/70 p-4 transition-colors hover:border-accent-1/25 hover:bg-white/[0.035] cursor-pointer">
                                                    <SettingInfoLabel label={option.label} />
                                                    <Checkbox checked={option.value} onChange={option.setter} />
                                                </label>
                                            ))}
                                        </div>
                                    </div>


                                    {/* Additional Settings */}
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                                        <div className="rounded-[24px] border border-border bg-bg-inset/70 p-3 sm:p-4">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Maximum Rally Time" className="text-[12px] font-bold text-text-muted" />
                                            </div>
                                            <TacticalSelect
                                                value={maxRallyTime}
                                                onChange={setMaxRallyTime}
                                                options={[
                                                    { value: '0', label: '5 Minutes' },
                                                    { value: '1', label: '10 Minutes' },
                                                    { value: '2', label: '1 Hour' },
                                                    { value: '3', label: '8 Hours' },
                                                ]}
                                            />
                                        </div>

                                        <div className="rounded-[24px] border border-border bg-bg-inset/70 p-3 sm:p-4">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Leave Extra Space" className="text-[12px] font-bold text-text-muted" />
                                            </div>
                                            <input
                                                type="number"
                                                min={0}
                                                max={200000}
                                                step="1"
                                                value={leaveExtraSpace}
                                                onChange={(e) => setLeaveExtraSpace(Math.floor(Number(e.target.value)))}
                                                onKeyDown={(e) => {
                                                    if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onBlur={(e) => setLeaveExtraSpace(Math.max(0, Math.min(200000, Math.floor(Number(e.target.value)))))}
                                                className="input-field min-h-[42px] w-full text-[13px]"
                                            />
                                        </div>

                                        <div className="rounded-[24px] border border-border bg-bg-inset/70 p-3 sm:p-4">
                                            <div className="mb-2">
                                                <SettingInfoLabel label="Wait Before Rejoining (Minutes)" className="text-[12px] font-bold text-text-muted" />
                                            </div>
                                            <input
                                                type="number"
                                                min={1}
                                                max={120}
                                                step="1"
                                                value={timeToWait}
                                                onChange={(e) => setTimeToWait(Math.floor(Number(e.target.value)))}
                                                onKeyDown={(e) => {
                                                    if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onBlur={(e) => setTimeToWait(Math.max(1, Math.min(120, Math.floor(Number(e.target.value)))))}
                                                className="input-field min-h-[42px] w-full text-[13px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Troops to Send */}
                                    <div className="space-y-4">
                                        <h3 className="border-b border-border pb-2">
                                            <SettingInfoLabel label="Troops to Send" className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted" />
                                        </h3>
                                        <TacticalRadioGroup
                                            name="troopsToSend"
                                            value={rallyTroopType}
                                            onChange={setRallyTroopType}
                                            options={[
                                                { value: 0, label: 'Send One Troop' },
                                                { value: 2, label: 'Send Max Troops (with priority)' },
                                            ]}
                                        />
                                    </div>

                                    {/* Essence Options */}
                                    <div className="space-y-4">
                                        <h3 className="border-b border-border pb-2">
                                            <SettingInfoLabel label="Essence Options" className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted" />
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="flex items-center justify-between rounded-[24px] border border-border bg-bg-inset/70 p-4 transition-colors hover:border-accent-1/25 hover:bg-white/[0.035] cursor-pointer">
                                                <SettingInfoLabel label="Transmute Dark Essences" />
                                                <Checkbox checked={transmuteDarkEssences} onChange={setTransmuteDarkEssences} />
                                            </label>

                                            <label className="flex items-center justify-between rounded-[24px] border border-border bg-bg-inset/70 p-4 transition-colors hover:border-accent-1/25 hover:bg-white/[0.035] cursor-pointer">
                                                <SettingInfoLabel label="Keep One Slot Free" />
                                                <Checkbox checked={keepOneSlotFree} onChange={setKeepOneSlotFree} />
                                            </label>

                                            <div className="rounded-[24px] border border-border bg-bg-inset/70 p-3 sm:p-4">
                                                <div className="mb-2">
                                                    <SettingInfoLabel label="Delete Essences Lower Than" className="text-[12px] font-bold text-text-muted" />
                                                </div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="28"
                                                    step="1"
                                                    value={deleteEssencesLowerThan}
                                                    onChange={(e) => setDeleteEssencesLowerThan(Math.floor(Math.min(28, Number(e.target.value))))}
                                                    onKeyDown={(e) => {
                                                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
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

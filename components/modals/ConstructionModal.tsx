'use client'

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { ArrowUp, Hammer, Layers, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { Checkbox } from '@/components/ui/Checkbox'
import { TacticalSelect } from '@/components/ui/TacticalSelect'
import { SettingInfoLabel } from '@/components/ui/SettingInfoLabel'
import { SettingHelpButton } from '@/components/ui/ResponsiveModalShell'
import { useAutoSaveSettings } from '@/hooks/useAutoSaveSettings'

interface ConstructionModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

const SPAM_TARGET_OPTIONS = [
    { value: '0', label: 'None' },
    { value: '1', label: 'Farm' },
    { value: '2', label: 'Mine' },
    { value: '3', label: 'Lumber Mill' },
    { value: '4', label: 'Quarry' },
    { value: '5', label: 'Manor' },
    { value: '6', label: 'Barracks' },
    { value: '7', label: 'Infirmary' },
    { value: '8', label: 'Spring' },
]

const SPAM_BUILDING_OPTIONS = [
    { value: 'Farm', label: 'Farm' },
    { value: 'Mine', label: 'Mine' },
    { value: 'Lumber Mill', label: 'Lumber Mill' },
    { value: 'Quarry', label: 'Quarry' },
    { value: 'Manor', label: 'Manor' },
    { value: 'Barracks', label: 'Barracks' },
    { value: 'Infirmary', label: 'Infirmary' },
    { value: 'Spring', label: 'Spring' },
]

const BUILDING_PRIORITY_OPTIONS = [
    { value: '0', label: 'Castle' },
    { value: '1', label: 'Resource' },
    { value: '2', label: 'Academy' },
    { value: '3', label: 'Manor' },
    { value: '4', label: 'Barracks / Infirmary' },
    { value: '5', label: 'Monsterhold' },
    { value: '6', label: 'Familiars' },
    { value: '7', label: 'Trading Post' },
    { value: '8', label: 'Resource (No Manor)' },
    { value: '9', label: 'Treasure Trove' },
    { value: '10', label: 'Workshop' },
    { value: '11', label: 'None' },
    { value: '12', label: 'Lunar Foundry' },
]

const RESOURCE_BUILDING_OPTIONS = [
    { value: '4', label: 'Farm' },
    { value: '1', label: 'Lumber Mill' },
    { value: '2', label: 'Quarry' },
    { value: '3', label: 'Mine' },
]

const MILITARY_BUILDING_OPTIONS = [
    { value: '5', label: 'Manor' },
    { value: '7', label: 'Infirmary' },
    { value: '6', label: 'Barracks' },
]

const FAMILIAR_BUILDING_OPTIONS = [
    { value: '21', label: 'Spring' },
    { value: '22', label: 'Mystic Spire' },
    { value: '23', label: 'Gym' },
]

function clampWholeNumber(value: number, min: number, max: number) {
    if (Number.isNaN(value)) return min
    return Math.max(min, Math.min(max, Math.floor(value)))
}

function updateTarget(
    setter: Dispatch<SetStateAction<number[]>>,
    index: number,
    value: string
) {
    setter((previous) => {
        const next = [...previous]
        next[index] = Number(value)
        return next
    })
}

function TargetGrid({
    title,
    countLabel,
    targets,
    options,
    onChange,
}: {
    title: string
    countLabel: string
    targets: number[]
    options: { value: string; label: string }[]
    onChange: (index: number, value: string) => void
}) {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                <h3>
                    <SettingInfoLabel label={title} className="text-[14px] font-black text-text-primary" />
                </h3>
                <span className="rounded-full border border-white/10 bg-bg-inset px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
                    {countLabel}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {targets.map((value, index) => (
                    <div key={`${title}-${index}`} className="rounded-lg border border-white/10 bg-bg-inset/70 p-3">
                        <div className="mb-2">
                            <SettingInfoLabel label={`Location ${index + 1}`} className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted" />
                        </div>
                        <TacticalSelect
                            value={String(value)}
                            onChange={(nextValue) => onChange(index, nextValue)}
                            options={options}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default function ConstructionModal({ isOpen, onClose, iggId }: ConstructionModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [autoBuild, setAutoBuild] = useState(false)
    const [upgrade, setUpgrade] = useState(false)
    const [lowestLevelFirst, setLowestLevelFirst] = useState(true)
    const [ignoreSpamTarget, setIgnoreSpamTarget] = useState(true)
    const [autoRentSecondQueue, setAutoRentSecondQueue] = useState(true)
    const [secondQueueSpamOnly, setSecondQueueSpamOnly] = useState(false)
    const [spamTargetType, setSpamTargetType] = useState('0')
    const [spamTargetBuilding, setSpamTargetBuilding] = useState('Farm')
    const [buildingPriority, setBuildingPriority] = useState('0')
    const [strict, setStrict] = useState(false)
    const [maxBuildingLevel, setMaxBuildingLevel] = useState(25)
    const [resourceTargets, setResourceTargets] = useState<number[]>(Array(18).fill(4))
    const [militaryTargets, setMilitaryTargets] = useState<number[]>(Array(17).fill(5))
    const [familiarTargets, setFamiliarTargets] = useState<number[]>(Array(8).fill(21))

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
                const buildSettings = data.buildSettingsNew || {}
                const targets = Array.isArray(buildSettings.BuildingTarget) ? buildSettings.BuildingTarget : []

                setSettings(data)
                setAutoBuild(buildSettings.autoBuild ?? false)
                setUpgrade(buildSettings.autoUpgrade ?? false)
                setLowestLevelFirst(buildSettings.buildByLowestLevel ?? true)
                setIgnoreSpamTarget(buildSettings.ignoreSpamTarget ?? true)
                setAutoRentSecondQueue(buildSettings.autoBuySecondQueue ?? true)
                setSecondQueueSpamOnly(buildSettings.secondQueueSpamOnly ?? false)
                setSpamTargetType(String(buildSettings.newSpamTarget ?? 0))
                setSpamTargetBuilding(buildSettings.spamTargetBuilding ?? 'Farm')
                setBuildingPriority(String(buildSettings.buildPriority ?? 0))
                setStrict(buildSettings.strictPriority ?? false)
                setMaxBuildingLevel(buildSettings.maxBuildLevel ?? 25)
                setResourceTargets(Array.from({ length: 18 }, (_, index) => targets[index + 1] ?? 4))
                setMilitaryTargets(Array.from({ length: 17 }, (_, index) => targets[index + 19] ?? 5))
                setFamiliarTargets(Array.from({ length: 8 }, (_, index) => targets[index + 36] ?? 21))
            } else {
                toast.error('Failed to load settings')
            }
        } catch {
            toast.error('Error loading settings')
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        if (!iggId || !settings) return

        setSaving(true)
        try {
            const existingTargets = Array.isArray(settings.buildSettingsNew?.BuildingTarget)
                ? settings.buildSettingsNew.BuildingTarget
                : []
            const buildingTargetArray = Array.from(
                { length: Math.max(existingTargets.length, 44) },
                (_, index) => existingTargets[index] ?? 0
            )

            resourceTargets.forEach((value, index) => {
                buildingTargetArray[index + 1] = value
            })
            militaryTargets.forEach((value, index) => {
                buildingTargetArray[index + 19] = value
            })
            familiarTargets.forEach((value, index) => {
                buildingTargetArray[index + 36] = value
            })

            const updatedSettings = {
                ...settings,
                buildSettingsNew: {
                    ...(settings.buildSettingsNew || {}),
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
                    maxBuildLevel: clampWholeNumber(maxBuildingLevel, 0, 50),
                    BuildingTarget: buildingTargetArray,
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
        } catch {
            toast.error('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    useAutoSaveSettings(
        isOpen && !loading && Boolean(iggId && settings),
        saveSettings,
        [
            autoBuild,
            upgrade,
            lowestLevelFirst,
            ignoreSpamTarget,
            autoRentSecondQueue,
            secondQueueSpamOnly,
            spamTargetType,
            spamTargetBuilding,
            buildingPriority,
            strict,
            maxBuildingLevel,
            resourceTargets,
            militaryTargets,
            familiarTargets,
        ]
    )

    const toggleOptions = [
        { label: 'Auto Build', value: autoBuild, setter: setAutoBuild },
        { label: 'Upgrade', value: upgrade, setter: setUpgrade },
        { label: 'Lowest Level First', value: lowestLevelFirst, setter: setLowestLevelFirst },
        { label: 'Ignore Spam Target', value: ignoreSpamTarget, setter: setIgnoreSpamTarget },
        { label: 'Auto-Rent Second Queue', value: autoRentSecondQueue, setter: setAutoRentSecondQueue },
        { label: 'Second Queue (Spam Only)', value: secondQueueSpamOnly, setter: setSecondQueueSpamOnly },
        { label: 'Strict Priority', value: strict, setter: setStrict },
    ]

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Construction"
            iggId={iggId}
            icon={Hammer}
            iconColor="#fb923c"
            iconBg="rgba(251,146,60,0.14)"
            iconBorder="rgba(251,146,60,0.30)"
            saving={saving}
            statusLabel={saving ? 'Syncing...' : 'Auto-sync. Use Protocol Apply Changes to deploy.'}
            maxWidth="1120px"
        >
            {loading ? (
                <div className="flex min-h-[360px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent-1" />
                </div>
            ) : (
                <div className="space-y-6">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Auto Build', value: autoBuild ? 'On' : 'Off', icon: Hammer, tone: 'gold' },
                            { label: 'Enabled', value: [autoBuild, upgrade, lowestLevelFirst, ignoreSpamTarget, autoRentSecondQueue, secondQueueSpamOnly, strict].filter(Boolean).length, icon: Layers, tone: 'mint' },
                            { label: 'Max Level', value: maxBuildingLevel, icon: ArrowUp, tone: 'cyan' },
                        ]}
                    />

                    <section className="space-y-4">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
                            {toggleOptions.map((option) => (
                                <label
                                    key={option.label}
                                    className="flex min-h-[48px] sm:min-h-[58px] cursor-pointer items-center justify-between gap-4 rounded-lg border border-white/10 bg-bg-inset/70 px-3 py-2 sm:px-4 sm:py-3 transition-colors hover:border-white/20 hover:bg-white/[0.035]"
                                >
                                    <SettingInfoLabel label={option.label} className="text-[13px] sm:text-[14px]" />
                                    <Checkbox checked={option.value} onChange={option.setter} />
                                </label>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                            <div className="rounded-lg border border-white/10 bg-bg-inset/70 p-4">
                                <div className="mb-2">
                                    <SettingInfoLabel label="Spam Target Type" className="text-[12px] font-black uppercase tracking-[0.14em] text-text-muted" />
                                </div>
                                <TacticalSelect value={spamTargetType} onChange={setSpamTargetType} options={SPAM_TARGET_OPTIONS} />
                            </div>
                            <div className="rounded-lg border border-white/10 bg-bg-inset/70 p-4">
                                <div className="mb-2">
                                    <SettingInfoLabel label="Spam Target Building" className="text-[12px] font-black uppercase tracking-[0.14em] text-text-muted" />
                                </div>
                                <TacticalSelect value={spamTargetBuilding} onChange={setSpamTargetBuilding} options={SPAM_BUILDING_OPTIONS} />
                            </div>
                            <div className="rounded-lg border border-white/10 bg-bg-inset/70 p-4">
                                <div className="mb-2">
                                    <SettingInfoLabel label="Building Priority" className="text-[12px] font-black uppercase tracking-[0.14em] text-text-muted" />
                                </div>
                                <TacticalSelect value={buildingPriority} onChange={setBuildingPriority} options={BUILDING_PRIORITY_OPTIONS} />
                            </div>
                            <div className="rounded-lg border border-white/10 bg-bg-inset/70 p-4">
                                <div className="mb-2">
                                    <SettingInfoLabel label="Max Building Level" className="text-[12px] font-black uppercase tracking-[0.14em] text-text-muted" />
                                </div>
                                <input
                                    type="number"
                                    min={0}
                                    max={50}
                                    value={maxBuildingLevel}
                                    onChange={(event) => setMaxBuildingLevel(clampWholeNumber(Number(event.target.value), 0, 50))}
                                    className="input-field w-full font-mono text-[14px] font-black text-accent-cyan"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-white/10 pt-5">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2>
                                    <SettingInfoLabel label="Building Target" className="text-[17px] font-black text-text-primary" />
                                </h2>
                                <p className="mt-1 text-[12px] text-text-muted">Assign each construction slot to the building type the bot should maintain.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => toast.success('Build data reset queued')}
                                    className="inline-flex items-center justify-center gap-2 rounded-md border border-accent-3/25 bg-accent-3/10 px-3 py-2 text-[12px] font-bold text-accent-3 transition-colors hover:bg-accent-3/15"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset Build Data
                                </button>
                                <SettingHelpButton label="Reset Build Data" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <TargetGrid
                                title="Resource Buildings"
                                countLabel="18 locations"
                                targets={resourceTargets}
                                options={RESOURCE_BUILDING_OPTIONS}
                                onChange={(index, value) => updateTarget(setResourceTargets, index, value)}
                            />
                            <TargetGrid
                                title="Military Buildings"
                                countLabel="17 locations"
                                targets={militaryTargets}
                                options={MILITARY_BUILDING_OPTIONS}
                                onChange={(index, value) => updateTarget(setMilitaryTargets, index, value)}
                            />
                            <TargetGrid
                                title="Familiar Buildings"
                                countLabel="8 locations"
                                targets={familiarTargets}
                                options={FAMILIAR_BUILDING_OPTIONS}
                                onChange={(index, value) => updateTarget(setFamiliarTargets, index, value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </KonohaModal>
    )
}

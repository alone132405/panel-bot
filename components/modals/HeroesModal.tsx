'use client'

import { useEffect, useState } from 'react'
import { Gem, HeartPulse, ShieldCheck, Sparkles, Swords, Trophy, Users2, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ChoiceControl, ResponsiveModalShell, StepperControl, TabDef, ToggleControl } from '@/components/ui/ResponsiveModalShell'

interface HeroesModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

type HeroSelection = 'selected' | 'highestEnhanced' | 'highestRank' | 'highestLevel'
type ChapterMode = 'sequential' | 'custom'
type ColosseumHeroSelection = 'selected' | 'autoSelected' | 'bestHeroes'
type DefenderSelection = 'dontChange' | 'autoSelected'

interface ToggleOption {
    key: string
    label: string
    checked: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
}

interface HeroStageSettings extends Record<string, unknown> {
    selectedChapter?: Record<string, unknown>
}

interface BotSettingsData extends Record<string, unknown> {
    heroSettings?: Record<string, unknown>
    heroStageSettings?: HeroStageSettings
    arenaSettings?: Record<string, unknown>
}

const TABS: TabDef[] = [
    { id: 'management', label: 'Management', icon: Users2 },
    { id: 'stages', label: 'Hero Stages', icon: Swords },
    { id: 'colosseum', label: 'Colosseum', icon: Trophy },
]

const NO_ID_TABS: TabDef[] = [
    { id: 'select', label: 'Select IGG ID', icon: Users2 },
]

const HERO_SELECTION_OPTIONS = [
    { value: 'selected' as const, label: 'Selected' },
    { value: 'highestEnhanced' as const, label: 'Enhanced' },
    { value: 'highestRank' as const, label: 'Rank' },
    { value: 'highestLevel' as const, label: 'Level' },
]

const CHAPTER_MODE_OPTIONS = [
    { value: 'sequential' as const, label: 'Sequential' },
    { value: 'custom' as const, label: 'Custom Chapter' },
]

const STAGE_TYPE_OPTIONS = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Elite', label: 'Elite' },
]

const CUSTOM_CHAPTER_TYPE_OPTIONS = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Hard', label: 'Hard' },
]

const CHAPTER_OPTIONS = [
    { value: "Chapter 1 (Heroes' Assault)", label: "Chapter 1" },
    { value: 'Chapter 2', label: 'Chapter 2' },
    { value: 'Chapter 3', label: 'Chapter 3' },
    { value: 'Chapter 4', label: 'Chapter 4' },
    { value: 'Chapter 5', label: 'Chapter 5' },
    { value: 'Chapter 6', label: 'Chapter 6' },
    { value: 'Chapter 7', label: 'Chapter 7' },
    { value: 'Chapter 8', label: 'Chapter 8' },
    { value: 'Chapter 9', label: 'Chapter 9' },
]

const COLOSSEUM_HERO_OPTIONS = [
    { value: 'selected' as const, label: 'Selected' },
    { value: 'autoSelected' as const, label: 'Auto Selected' },
    { value: 'bestHeroes' as const, label: 'Best Heroes' },
]

const DEFENDER_OPTIONS = [
    { value: 'dontChange' as const, label: "Don't Change" },
    { value: 'autoSelected' as const, label: 'Auto Selected' },
]

function getChapterNumber(value: string) {
    return parseInt(value.match(/\d+/)?.[0] || '1')
}

function getStageTargetOptions(chapterNumber: string) {
    const chapter = getChapterNumber(chapterNumber)
    return [
        { value: 'Attack All Stages in this Chapter', label: 'All Stages' },
        ...[3, 6, 9, 12, 15].map((stage) => ({ value: `${chapter}-${stage}`, label: `${chapter}-${stage}` })),
    ]
}

function clamp(value: number, min: number, max: number) {
    if (Number.isNaN(value)) return min
    return Math.max(min, Math.min(max, value))
}

function boolValue(value: unknown, fallback: boolean) {
    return typeof value === 'boolean' ? value : fallback
}

function numberValue(value: unknown, fallback: number) {
    return typeof value === 'number' && !Number.isNaN(value) ? value : fallback
}

export default function HeroesModal({ isOpen, onClose, iggId }: HeroesModalProps) {
    const [fullSettings, setFullSettings] = useState<BotSettingsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [hireNewHeroes, setHireNewHeroes] = useState(true)
    const [enhanceHeroes, setEnhanceHeroes] = useState(false)
    const [useHeroExpItems, setUseHeroExpItems] = useState(false)
    const [upgradeHeroes, setUpgradeHeroes] = useState(false)
    const [reviveDeadLeader, setReviveDeadLeader] = useState(true)

    const [autoAttackHeroStages, setAutoAttackHeroStages] = useState(true)
    const [useBraveheartItems, setUseBraveheartItems] = useState(false)
    const [heroesToUse, setHeroesToUse] = useState<HeroSelection>('selected')
    const [chapterMode, setChapterMode] = useState<ChapterMode>('sequential')
    const [stageType, setStageType] = useState('Elite')
    const [customChapter, setCustomChapter] = useState('Normal')
    const [chapterNumber, setChapterNumber] = useState("Chapter 1 (Heroes' Assault)")
    const [attackAllStages, setAttackAllStages] = useState('Attack All Stages in this Chapter')
    const [stagePoint, setStagePoint] = useState(0)
    const [sweepStage, setSweepStage] = useState(true)
    const [tenxSweep, setTenxSweep] = useState(true)
    const [usePriorityMode, setUsePriorityMode] = useState(true)

    const [autoAttackColosseum, setAutoAttackColosseum] = useState(false)
    const [attackGuildMembers, setAttackGuildMembers] = useState(true)
    const [collectArenaGems, setCollectArenaGems] = useState(true)
    const [buyExtraAttempts, setBuyExtraAttempts] = useState(false)
    const [attemptsToBuy, setAttemptsToBuy] = useState(1)
    const [winChanceMin, setWinChanceMin] = useState(60)
    const [winChanceMax, setWinChanceMax] = useState(100)
    const [colosseumHeroesToUse, setColosseumHeroesToUse] = useState<ColosseumHeroSelection>('autoSelected')
    const [defendersToUse, setDefendersToUse] = useState<DefenderSelection>('autoSelected')

    useEffect(() => {
        if (!isOpen) return

        if (!iggId) {
            setFullSettings(null)
            setLoading(false)
            return
        }

        loadSettings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, iggId])

    const loadSettings = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`)
            if (res.ok) {
                const data = await res.json() as BotSettingsData
                setFullSettings(data)

                const heroSettings = data.heroSettings
                if (heroSettings) {
                    setHireNewHeroes(boolValue(heroSettings.autoHireHeros, true))
                    setEnhanceHeroes(boolValue(heroSettings.autoEnhanceHeros, false))
                    setUseHeroExpItems(boolValue(heroSettings.useLevelUpItems, false))
                    setUpgradeHeroes(boolValue(heroSettings.autoUpgradeHeros, false))
                    setReviveDeadLeader(boolValue(heroSettings.reviveDeadLeader, true))
                    setUseBraveheartItems(boolValue(heroSettings.useBraveheartItems, false))
                }

                const heroStageSettings = data.heroStageSettings
                if (heroStageSettings) {
                    setAutoAttackHeroStages(boolValue(heroStageSettings.AutoAttackHeroStages, true))
                    setUsePriorityMode(boolValue(heroStageSettings.priorityMode, true))

                    const heroSelectionMap: Record<number, HeroSelection> = {
                        0: 'selected',
                        1: 'highestEnhanced',
                        2: 'highestRank',
                        3: 'highestLevel',
                    }
                    setHeroesToUse(heroSelectionMap[numberValue(heroStageSettings.heroSelection, 0)] || 'selected')
                    setChapterMode(numberValue(heroStageSettings.attackStageType, 0) === 0 ? 'sequential' : 'custom')
                    setStageType(numberValue(heroStageSettings.seqAttackStageType, 1) === 0 ? 'Normal' : 'Elite')

                    const selectedChapter = heroStageSettings.selectedChapter
                    if (selectedChapter) {
                        setCustomChapter(numberValue(selectedChapter.selectedChapterStageType, 0) === 0 ? 'Normal' : 'Hard')

                        const chapterMap: Record<number, string> = {
                            1: "Chapter 1 (Heroes' Assault)",
                            2: 'Chapter 2',
                            3: 'Chapter 3',
                            4: 'Chapter 4',
                            5: 'Chapter 5',
                            6: 'Chapter 6',
                            7: 'Chapter 7',
                            8: 'Chapter 8',
                            9: 'Chapter 9',
                        }
                        const nextChapterNumber = chapterMap[numberValue(selectedChapter.StageChapter, 1)] || "Chapter 1 (Heroes' Assault)"
                        setChapterNumber(nextChapterNumber)

                        const stagePointValue = numberValue(selectedChapter.StagePoint, 0)
                        setStagePoint(stagePointValue)
                        setAttackAllStages(stagePointValue === 0 ? 'Attack All Stages in this Chapter' : `${getChapterNumber(nextChapterNumber)}-${stagePointValue}`)
                        setSweepStage(boolValue(selectedChapter.QuickFightStage, true))
                        setTenxSweep(boolValue(selectedChapter.useVipSweep, true))
                    }
                }

                const arenaSettings = data.arenaSettings
                if (arenaSettings) {
                    setAutoAttackColosseum(boolValue(arenaSettings.attackArena, false))
                    setAttackGuildMembers(boolValue(arenaSettings.attackGuildmates, true))
                    setCollectArenaGems(boolValue(arenaSettings.collectGems, true))
                    setBuyExtraAttempts(boolValue(arenaSettings.buyExtraAttempts, false))
                    setAttemptsToBuy(numberValue(arenaSettings.attemptsToBuy, 1))
                    setWinChanceMin(numberValue(arenaSettings.minWinChance, 60))
                    setWinChanceMax(numberValue(arenaSettings.maxWinChance, 100))

                    const arenaHeroMap: Record<number, ColosseumHeroSelection> = {
                        0: 'selected',
                        1: 'autoSelected',
                        2: 'bestHeroes',
                    }
                    setColosseumHeroesToUse(arenaHeroMap[numberValue(arenaSettings.arenaHeroType, 1)] || 'autoSelected')
                    setDefendersToUse(numberValue(arenaSettings.arenaDefenderType, 1) === 0 ? 'dontChange' : 'autoSelected')
                }
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
        if (!iggId || !fullSettings) return

        setSaving(true)
        try {
            const heroSelectionMap: Record<HeroSelection, number> = {
                selected: 0,
                highestEnhanced: 1,
                highestRank: 2,
                highestLevel: 3,
            }
            const arenaHeroMap: Record<ColosseumHeroSelection, number> = {
                selected: 0,
                autoSelected: 1,
                bestHeroes: 2,
            }

            const updatedSettings = {
                ...fullSettings,
                heroSettings: {
                    ...(fullSettings.heroSettings || {}),
                    autoHireHeros: hireNewHeroes,
                    autoEnhanceHeros: enhanceHeroes,
                    useLevelUpItems: useHeroExpItems,
                    autoUpgradeHeros: upgradeHeroes,
                    reviveDeadLeader,
                    useBraveheartItems,
                },
                heroStageSettings: {
                    ...(fullSettings.heroStageSettings || {}),
                    AutoAttackHeroStages: autoAttackHeroStages,
                    priorityMode: usePriorityMode,
                    heroSelection: heroSelectionMap[heroesToUse],
                    attackStageType: chapterMode === 'sequential' ? 0 : 1,
                    seqAttackStageType: stageType === 'Normal' ? 0 : 1,
                    selectedChapter: {
                        ...(fullSettings.heroStageSettings?.selectedChapter || {}),
                        selectedChapterStageType: customChapter === 'Normal' ? 0 : 1,
                        StageChapter: getChapterNumber(chapterNumber),
                        StagePoint: stagePoint,
                        QuickFightStage: sweepStage,
                        useVipSweep: tenxSweep,
                    },
                },
                arenaSettings: {
                    ...(fullSettings.arenaSettings || {}),
                    attackArena: autoAttackColosseum,
                    attackGuildmates: attackGuildMembers,
                    collectGems: collectArenaGems,
                    buyExtraAttempts,
                    attemptsToBuy,
                    minWinChance: winChanceMin,
                    maxWinChance: winChanceMax,
                    arenaHeroType: arenaHeroMap[colosseumHeroesToUse],
                    arenaDefenderType: defendersToUse === 'dontChange' ? 0 : 1,
                },
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
        } catch {
            toast.error('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const handleChapterChange = (value: string) => {
        setChapterNumber(value)
        if (stagePoint > 0) {
            setAttackAllStages(`${getChapterNumber(value)}-${stagePoint}`)
        }
    }

    const handleStageTargetChange = (value: string) => {
        setAttackAllStages(value)
        if (value === 'Attack All Stages in this Chapter') {
            setStagePoint(0)
            return
        }

        setStagePoint(parseInt(value.split('-')[1] || '0'))
    }

    const renderToggleGrid = (options: ToggleOption[], isMobile: boolean, isTablet: boolean) => {
        const gridClass = isMobile
            ? 'grid grid-cols-1 gap-1.5'
            : isTablet
                ? 'grid grid-cols-2 gap-2'
                : 'grid grid-cols-2 gap-3'

        return (
            <div className={gridClass}>
                {options.map((option) => (
                    <ToggleControl
                        key={option.key}
                        label={option.label}
                        checked={option.checked}
                        onChange={option.onChange}
                        isMobile={isMobile}
                        disabled={option.disabled}
                    />
                ))}
            </div>
        )
    }

    const renderStats = (stats: Array<{ label: string; value: string | number; icon: LucideIcon; tone: 'mint' | 'cyan' | 'gold' }>) => {
        const isFourItems = stats.length === 4;
        const gridColsClass = isFourItems ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-3';

        return (
            <div className={`grid gap-3 ${gridColsClass}`}>
                {stats.map((stat) => {
                    const Icon = stat.icon
                const toneClass = stat.tone === 'mint'
                    ? 'border-accent-1/20 bg-accent-1/10 text-accent-1'
                    : stat.tone === 'cyan'
                        ? 'border-accent-cyan/20 bg-accent-cyan/10 text-accent-cyan'
                        : 'border-accent-gold/20 bg-accent-gold/10 text-accent-gold'

                return (
                    <div key={stat.label} className={`rounded-lg border p-3 ${toneClass}`}>
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                            <Icon className="h-3.5 w-3.5" />
                            {stat.label}
                        </div>
                        <div className="font-orbitron text-xl font-black">{stat.value}</div>
                    </div>
                )
            })}
        </div>
    )
    }

    const renderSectionContent = (tabId: string, isMobile: boolean, isTablet: boolean) => {
        if (!iggId) {
            return (
                <div className="rounded-lg border border-accent-gold/20 bg-accent-gold/10 p-6 text-center">
                    <Users2 className="mx-auto mb-3 h-10 w-10 text-accent-gold" />
                    <p className="text-[14px] font-bold text-text-primary">Select an IGG ID to edit hero settings.</p>
                </div>
            )
        }

        if (tabId === 'management') {
            const options: ToggleOption[] = [
                { key: 'hire', label: 'Hire New Heroes', checked: hireNewHeroes, onChange: setHireNewHeroes },
                { key: 'enhance', label: 'Enhance Heroes', checked: enhanceHeroes, onChange: setEnhanceHeroes },
                { key: 'exp', label: 'Use Hero Exp Items', checked: useHeroExpItems, onChange: setUseHeroExpItems },
                { key: 'upgrade', label: 'Upgrade Heroes', checked: upgradeHeroes, onChange: setUpgradeHeroes },
                { key: 'revive', label: 'Revive Dead Leader', checked: reviveDeadLeader, onChange: setReviveDeadLeader },
            ]

            return (
                <div className="space-y-4">
                    {renderStats([
                        { label: 'Enabled', value: options.filter((option) => option.checked).length, icon: Sparkles, tone: 'mint' },
                        { label: 'Upgrade', value: upgradeHeroes ? 'On' : 'Off', icon: Swords, tone: 'cyan' },
                        { label: 'Leader', value: reviveDeadLeader ? 'Ready' : 'Manual', icon: HeartPulse, tone: 'gold' },
                    ])}
                    {renderToggleGrid(options, isMobile, isTablet)}
                </div>
            )
        }

        if (tabId === 'stages') {
            const stageOptions: ToggleOption[] = [
                { key: 'autoAttack', label: 'Auto Attack Hero Stages', checked: autoAttackHeroStages, onChange: setAutoAttackHeroStages },
                { key: 'braveheart', label: 'Use Braveheart Items', checked: useBraveheartItems, onChange: setUseBraveheartItems },
                { key: 'sweep', label: 'Sweep Stage', checked: sweepStage, onChange: setSweepStage },
                { key: 'tenx', label: '10x Sweep', checked: tenxSweep, onChange: setTenxSweep },
                { key: 'priority', label: 'Use Priority Mode', checked: usePriorityMode, onChange: setUsePriorityMode },
            ]

            return (
                <div className="space-y-4">
                    {renderStats([
                        { label: 'Mode', value: chapterMode === 'sequential' ? 'Seq' : 'Custom', icon: Swords, tone: 'mint' },
                        { label: 'Selection', value: HERO_SELECTION_OPTIONS.find((option) => option.value === heroesToUse)?.label || 'Selected', icon: Users2, tone: 'cyan' },
                        { label: 'Sweeps', value: sweepStage ? (tenxSweep ? '10x' : '1x') : 'Off', icon: Sparkles, tone: 'gold' },
                    ])}

                    {renderToggleGrid(stageOptions, isMobile, isTablet)}

                    <ChoiceControl
                        label="Hero Selection"
                        value={heroesToUse}
                        options={HERO_SELECTION_OPTIONS}
                        onChange={setHeroesToUse}
                        isMobile={isMobile}
                    />

                    <ChoiceControl
                        label="Chapter Flow"
                        value={chapterMode}
                        options={CHAPTER_MODE_OPTIONS}
                        onChange={setChapterMode}
                        isMobile={isMobile}
                    />

                    {chapterMode === 'sequential' ? (
                        <ChoiceControl
                            label="Sequential Stage Type"
                            value={stageType}
                            options={STAGE_TYPE_OPTIONS}
                            onChange={setStageType}
                            isMobile={isMobile}
                        />
                    ) : (
                        <div className="space-y-4">
                            <ChoiceControl
                                label="Chapter Type"
                                value={customChapter}
                                options={CUSTOM_CHAPTER_TYPE_OPTIONS}
                                onChange={setCustomChapter}
                                isMobile={isMobile}
                            />
                            <ChoiceControl
                                label="Chapter"
                                value={chapterNumber}
                                options={CHAPTER_OPTIONS}
                                onChange={handleChapterChange}
                                isMobile={isMobile}
                            />
                            <ChoiceControl
                                label="Stage Target"
                                value={attackAllStages}
                                options={getStageTargetOptions(chapterNumber)}
                                onChange={handleStageTargetChange}
                                isMobile={isMobile}
                            />
                        </div>
                    )}
                </div>
            )
        }

        if (tabId === 'colosseum') {
            const colosseumOptions: ToggleOption[] = [
                { key: 'arena', label: 'Auto Attack Colosseum', checked: autoAttackColosseum, onChange: setAutoAttackColosseum },
                { key: 'guildmates', label: 'Attack Guild Members', checked: attackGuildMembers, onChange: setAttackGuildMembers },
                { key: 'gems', label: 'Collect Arena Gems', checked: collectArenaGems, onChange: setCollectArenaGems },
                { key: 'extra', label: 'Buy Extra Attempts', checked: buyExtraAttempts, onChange: setBuyExtraAttempts },
            ]

            return (
                <div className="space-y-4">
                    {renderStats([
                        { label: 'Arena', value: autoAttackColosseum ? 'On' : 'Off', icon: Trophy, tone: 'mint' },
                        { label: 'Win Min', value: `${winChanceMin}%`, icon: ShieldCheck, tone: 'cyan' },
                        { label: 'Gems', value: buyExtraAttempts ? attemptsToBuy : 'Off', icon: Gem, tone: 'gold' },
                    ])}

                    {renderToggleGrid(colosseumOptions, isMobile, isTablet)}

                    <div className={!isMobile && !isTablet ? 'grid grid-cols-3 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-2'}>
                        <StepperControl
                            label="Attempts to Buy"
                            val={attemptsToBuy}
                            min={0}
                            max={100}
                            onChange={(value) => setAttemptsToBuy(clamp(Math.floor(value), 0, 100))}
                            isMobile={isMobile}
                            disabled={!buyExtraAttempts}
                            stacked
                        />
                        <StepperControl
                            label="Min Win Chance"
                            val={winChanceMin}
                            min={0}
                            max={99}
                            onChange={(value) => setWinChanceMin(clamp(Math.floor(value), 0, Math.min(99, winChanceMax)))}
                            isMobile={isMobile}
                            stacked
                        />
                        <StepperControl
                            label="Max Win Chance"
                            val={winChanceMax}
                            min={0}
                            max={100}
                            onChange={(value) => setWinChanceMax(clamp(Math.floor(value), Math.max(0, winChanceMin), 100))}
                            isMobile={isMobile}
                            stacked
                        />
                    </div>

                    <ChoiceControl
                        label="Attack Heroes"
                        value={colosseumHeroesToUse}
                        options={COLOSSEUM_HERO_OPTIONS}
                        onChange={setColosseumHeroesToUse}
                        isMobile={isMobile}
                    />

                    <ChoiceControl
                        label="Defenders"
                        value={defendersToUse}
                        options={DEFENDER_OPTIONS}
                        onChange={setDefendersToUse}
                        isMobile={isMobile}
                    />
                </div>
            )
        }

        return null
    }

    return (
        <ResponsiveModalShell
            isOpen={isOpen}
            onClose={onClose}
            title="Heroes"
            iggId={iggId}
            headerIcon={Users2}
            tabs={iggId ? TABS : NO_ID_TABS}
            loading={loading}
            saving={saving}
            onSave={saveSettings}
            saveLabel="Save Changes"
            statusLabel={saving ? 'Saving...' : 'Manual save'}
            renderSectionContent={renderSectionContent}
            maxWidth="980px"
        />
    )
}

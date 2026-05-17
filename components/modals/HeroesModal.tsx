'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Users2, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'

interface HeroesModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function HeroesModal({ isOpen, onClose, iggId }: HeroesModalProps) {
    const [fullSettings, setFullSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Hero management
    const [hireNewHeroes, setHireNewHeroes] = useState(true)
    const [enhanceHeroes, setEnhanceHeroes] = useState(false)
    const [useHeroExpItems, setUseHeroExpItems] = useState(false)
    const [upgradeHeroes, setUpgradeHeroes] = useState(false)
    const [reviveDeadLeader, setReviveDeadLeader] = useState(true)

    // Stage settings
    const [autoAttackHeroStages, setAutoAttackHeroStages] = useState(true)
    const [attackLimitedChallenges, setAttackLimitedChallenges] = useState(true)
    const [useBraveheartItems, setUseBraveheartItems] = useState(false)
    const [heroesToUse, setHeroesToUse] = useState<'selected' | 'highestEnhanced' | 'highestRank' | 'highestLevel'>('selected')
    const [chapterMode, setChapterMode] = useState<'sequential' | 'custom'>('sequential')
    const [stageType, setStageType] = useState('Elite')
    const [customChapter, setCustomChapter] = useState('Normal')
    const [chapterNumber, setChapterNumber] = useState('Chapter 1 (Heroes\' Assault)')
    const [attackAllStages, setAttackAllStages] = useState('Attack All Stages in this Chapter')
    const [stagePoint, setStagePoint] = useState(0)
    const [sweepStage, setSweepStage] = useState(true)
    const [tenxSweep, setTenxSweep] = useState(true)
    const [usePriorityMode, setUsePriorityMode] = useState(true)

    // Colosseum settings
    const [autoAttackColosseum, setAutoAttackColosseum] = useState(false)
    const [attackGuildMembers, setAttackGuildMembers] = useState(true)
    const [collectArenaGems, setCollectArenaGems] = useState(true)
    const [attemptsLeft, setAttemptsLeft] = useState(0)
    const [currentRank, setCurrentRank] = useState(46)
    const [buyExtraAttempts, setBuyExtraAttempts] = useState(false)
    const [attemptsToBuy, setAttemptsToBuy] = useState(1)
    const [winChanceMin, setWinChanceMin] = useState(60)
    const [winChanceMax, setWinChanceMax] = useState(100)
    const [colosseumHeroesToUse, setColosseumHeroesToUse] = useState<'selected' | 'autoSelected' | 'bestHeroes'>('autoSelected')
    const [defendersToUse, setDefendersToUse] = useState<'dontChange' | 'autoSelected'>('autoSelected')

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

                // Load hero management settings from heroSettings
                if (data.heroSettings) {
                    setHireNewHeroes(data.heroSettings.autoHireHeros ?? true)
                    setEnhanceHeroes(data.heroSettings.autoEnhanceHeros ?? false)
                    setUseHeroExpItems(data.heroSettings.useLevelUpItems ?? false)
                    setUpgradeHeroes(data.heroSettings.autoUpgradeHeros ?? false)
                    setReviveDeadLeader(data.heroSettings.reviveDeadLeader ?? true)
                    setUseBraveheartItems(data.heroSettings.useBraveheartItems ?? false)
                }

                // Load stage settings from heroStageSettings
                if (data.heroStageSettings) {
                    setAutoAttackHeroStages(data.heroStageSettings.AutoAttackHeroStages ?? true)
                    setUsePriorityMode(data.heroStageSettings.priorityMode ?? true)
                    // Map heroSelection: 0=selected, 1=highestEnhanced, 2=highestRank, 3=highestLevel
                    const heroSelectionMap: { [key: number]: 'selected' | 'highestEnhanced' | 'highestRank' | 'highestLevel' } = {
                        0: 'selected',
                        1: 'highestEnhanced',
                        2: 'highestRank',
                        3: 'highestLevel'
                    }
                    setHeroesToUse(heroSelectionMap[data.heroStageSettings.heroSelection] || 'selected')

                    // Map attackStageType: 0=sequential, 1=custom
                    setChapterMode(data.heroStageSettings.attackStageType === 0 ? 'sequential' : 'custom')

                    // Map seqAttackStageType: 0=Normal, 1=Elite
                    setStageType(data.heroStageSettings.seqAttackStageType === 0 ? 'Normal' : 'Elite')

                    if (data.heroStageSettings.selectedChapter) {
                        // Map selectedChapterStageType: 0=Normal, 1=Hard
                        setCustomChapter(data.heroStageSettings.selectedChapter.selectedChapterStageType === 0 ? 'Normal' : 'Hard')

                        // Map StageChapter: 1-9 to Chapter 1-9
                        const chapterMap: { [key: number]: string } = {
                            1: 'Chapter 1 (Heroes\'Assault)',
                            2: 'Chapter 2',
                            3: 'Chapter 3',
                            4: 'Chapter 4',
                            5: 'Chapter 5',
                            6: 'Chapter 6',
                            7: 'Chapter 7',
                            8: 'Chapter 8',
                            9: 'Chapter 9'
                        }
                        setChapterNumber(chapterMap[data.heroStageSettings.selectedChapter.StageChapter] || 'Chapter 1 (Heroes\'Assault)')

                        // Map StagePoint: 0=Attack All, 3/6/9/12/15=specific stage
                        const stagePointValue = data.heroStageSettings.selectedChapter.StagePoint ?? 0
                        setStagePoint(stagePointValue)
                        if (stagePointValue === 0) {
                            setAttackAllStages('Attack All Stages in this Chapter')
                        } else {
                            const chapterNum = data.heroStageSettings.selectedChapter.StageChapter || 1
                            setAttackAllStages(`${chapterNum}-${stagePointValue}`)
                        }

                        setSweepStage(data.heroStageSettings.selectedChapter.QuickFightStage ?? true)
                        setTenxSweep(data.heroStageSettings.selectedChapter.useVipSweep ?? true)
                    }
                }

                // Load colosseum settings from arenaSettings
                if (data.arenaSettings) {
                    setAutoAttackColosseum(data.arenaSettings.attackArena ?? false)
                    setAttackGuildMembers(data.arenaSettings.attackGuildmates ?? true)
                    setCollectArenaGems(data.arenaSettings.collectGems ?? true)
                    setBuyExtraAttempts(data.arenaSettings.buyExtraAttempts ?? false)
                    setAttemptsToBuy(data.arenaSettings.attemptsToBuy ?? 1)
                    setWinChanceMin(data.arenaSettings.minWinChance ?? 60)
                    setWinChanceMax(data.arenaSettings.maxWinChance ?? 100)
                    // Map arenaHeroType: 0=selected, 1=autoSelected, 2=bestHeroes
                    const arenaHeroMap: { [key: number]: 'selected' | 'autoSelected' | 'bestHeroes' } = {
                        0: 'selected',
                        1: 'autoSelected',
                        2: 'bestHeroes'
                    }
                    setColosseumHeroesToUse(arenaHeroMap[data.arenaSettings.arenaHeroType] || 'autoSelected')
                    // Map arenaDefenderType: 0=dontChange, 1=autoSelected
                    setDefendersToUse(data.arenaSettings.arenaDefenderType === 0 ? 'dontChange' : 'autoSelected')
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
            const heroSelectionMap = { 'selected': 0, 'highestEnhanced': 1, 'highestRank': 2, 'highestLevel': 3 }
            const arenaHeroMap = { 'selected': 0, 'autoSelected': 1, 'bestHeroes': 2 }
            const chapterNum = parseInt(chapterNumber.match(/\d+/)?.[0] || '1')

            const updatedSettings = {
                ...fullSettings,
                heroSettings: {
                    ...fullSettings.heroSettings,
                    autoHireHeros: hireNewHeroes,
                    autoEnhanceHeros: enhanceHeroes,
                    useLevelUpItems: useHeroExpItems,
                    autoUpgradeHeros: upgradeHeroes,
                    reviveDeadLeader,
                    useBraveheartItems,
                },
                heroStageSettings: {
                    ...fullSettings.heroStageSettings,
                    AutoAttackHeroStages: autoAttackHeroStages,
                    priorityMode: usePriorityMode,
                    heroSelection: heroSelectionMap[heroesToUse],
                    attackStageType: chapterMode === 'sequential' ? 0 : 1,
                    seqAttackStageType: stageType === 'Normal' ? 0 : 1,
                    selectedChapter: {
                        ...fullSettings.heroStageSettings?.selectedChapter,
                        selectedChapterStageType: customChapter === 'Normal' ? 0 : 1,
                        StageChapter: chapterNum,
                        StagePoint: stagePoint,
                        QuickFightStage: sweepStage,
                        useVipSweep: tenxSweep,
                    },
                },
                arenaSettings: {
                    ...fullSettings.arenaSettings,
                    attackArena: autoAttackColosseum,
                    attackGuildmates: attackGuildMembers,
                    collectGems: collectArenaGems,
                    buyExtraAttempts,
                    attemptsToBuy,
                    minWinChance: winChanceMin,
                    maxWinChance: winChanceMax,
                    arenaHeroType: arenaHeroMap[colosseumHeroesToUse],
                    arenaDefenderType: defendersToUse === 'dontChange' ? 0 : 1,
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
                title="Heroes"
                iggId={iggId}
                icon={Users2}
                iconColor="#EAB308"
                iconBg="rgba(234,179,8,0.15)"
                iconBorder="rgba(234,179,8,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Heroes"
            iggId={iggId}
            icon={Users2}
            iconColor="#EAB308"
            iconBg="rgba(234,179,8,0.15)"
            iconBorder="rgba(234,179,8,0.3)"
            saving={saving}
            onSave={saveSettings}
            maxWidth="860px"
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00FFB2]" />
                </div>
            ) : (
                <div className="w-full space-y-6">
                    {/* Hero Management */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: 'Hire New Heroes', value: hireNewHeroes, setter: setHireNewHeroes, key: 'autoHireHeros', path: 'heroSettings' },
                                { label: 'Enhance Heroes', value: enhanceHeroes, setter: setEnhanceHeroes, key: 'autoEnhanceHeros', path: 'heroSettings' },
                                { label: 'Use Hero Exp Items', value: useHeroExpItems, setter: setUseHeroExpItems, key: 'useLevelUpItems', path: 'heroSettings' },
                                { label: 'Upgrade Heroes', value: upgradeHeroes, setter: setUpgradeHeroes, key: 'autoUpgradeHeros', path: 'heroSettings' },
                                { label: 'Revive Dead Leader', value: reviveDeadLeader, setter: setReviveDeadLeader, key: 'reviveDeadLeader', path: 'heroSettings' },
                            ].map((option) => (
                                <label key={option.key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={option.value}
                                        onChange={(e) => {
                                            option.setter(e.target.checked)

                                        }}
                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                    />
                                    <span className="text-sm text-white">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Stage Settings */}
                    <div className="space-y-4 pt-6 border-t border-white/10">
                        <h3 className="text-base sm:text-lg font-bold text-white">Stage Settings</h3>

                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: 'Auto Attack Hero Stages', value: autoAttackHeroStages, setter: setAutoAttackHeroStages, key: 'AutoAttackHeroStages', path: 'heroStageSettings' },
                                { label: 'Use Braveheart Items', value: useBraveheartItems, setter: setUseBraveheartItems, key: 'useBraveheartItems', path: 'heroSettings' },
                            ].map((option) => (
                                <label key={option.key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={option.value}
                                        onChange={(e) => {
                                            option.setter(e.target.checked)

                                        }}
                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                    />
                                    <span className="text-sm text-white">{option.label}</span>
                                </label>
                            ))}
                        </div>


                        {/* Chapters to Fight */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Chapters to Fight:</h4>

                            {/* Attack Stages Sequentially - Single Row */}
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={chapterMode === 'sequential'}
                                        onChange={() => {
                                            setChapterMode('sequential')

                                        }}
                                        className="w-4 h-4 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                    />
                                    <span className="text-sm text-white">Attack Stages Sequentially</span>
                                </label>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-400">Stage Type</label>
                                    <select
                                        value={stageType}
                                        onChange={(e) => {
                                            setStageType(e.target.value)
                                            // Map Normal=0, Elite=1

                                        }}
                                        className="px-3 py-1.5 bg-background-tertiary border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    >
                                        <option>Normal</option>
                                        <option>Elite</option>
                                    </select>
                                </div>
                            </div>

                            {/* Custom Chapter - Single Row */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={chapterMode === 'custom'}
                                        onChange={() => {
                                            setChapterMode('custom')

                                        }}
                                        className="w-4 h-4 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                    />
                                    <span className="text-sm text-white">Custom Chapter</span>
                                </label>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={customChapter}
                                        onChange={(e) => {
                                            setCustomChapter(e.target.value)
                                            // Map Normal=0, Hard=1

                                        }}
                                        className="px-3 py-1.5 bg-background-tertiary border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    >
                                        <option>Normal</option>
                                        <option>Hard</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={chapterNumber}
                                        onChange={(e) => {
                                            setChapterNumber(e.target.value)
                                            // Extract chapter number from string
                                            const chapterNum = parseInt(e.target.value.match(/\d+/)?.[0] || '1')

                                        }}
                                        className="px-3 py-1.5 bg-background-tertiary border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    >
                                        <option>Chapter 1 (Heroes' Assault)</option>
                                        <option>Chapter 2</option>
                                        <option>Chapter 3</option>
                                        <option>Chapter 4</option>
                                        <option>Chapter 5</option>
                                        <option>Chapter 6</option>
                                        <option>Chapter 7</option>
                                        <option>Chapter 8</option>
                                        <option>Chapter 9</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={attackAllStages}
                                        onChange={(e) => {
                                            setAttackAllStages(e.target.value)
                                            if (e.target.value === 'Attack All Stages in this Chapter') {
                                                setStagePoint(0)
                                            } else {
                                                const stageNum = parseInt(e.target.value.split('-')[1] || '0')
                                                setStagePoint(stageNum)
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-background-tertiary border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    >
                                        <option>Attack All Stages in this Chapter</option>
                                        {(() => {
                                            const chapterNum = parseInt(chapterNumber.match(/\d+/)?.[0] || '1')
                                            return [3, 6, 9, 12, 15].map(stage => (
                                                <option key={stage} value={`${chapterNum}-${stage}`}>
                                                    {chapterNum}-{stage}
                                                </option>
                                            ))
                                        })()}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stage Options */}
                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: 'Sweep Stage', value: sweepStage, setter: setSweepStage, key: 'QuickFightStage', path: 'heroStageSettings.selectedChapter' },
                            { label: '10x Sweep?', value: tenxSweep, setter: setTenxSweep, key: 'useVipSweep', path: 'heroStageSettings.selectedChapter' },
                            { label: 'Use Priority Mode', value: usePriorityMode, setter: setUsePriorityMode, key: 'priorityMode', path: 'heroStageSettings' },
                        ].map((option) => (
                            <label key={option.key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={option.value}
                                    onChange={(e) => {
                                        option.setter(e.target.checked)
                                    }}
                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                />
                                <span className="text-sm text-white">{option.label}</span>
                            </label>
                        ))}
                    </div>


                    {/* Colosseum Settings */}
                    <div className="space-y-4 pt-6 border-t border-white/10">
                        <h3 className="text-base sm:text-lg font-bold text-white">Colosseum Settings</h3>

                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: 'Auto Attack Colosseum', value: autoAttackColosseum, setter: setAutoAttackColosseum, key: 'attackArena', path: 'arenaSettings' },
                                { label: 'Attack Guild Members', value: attackGuildMembers, setter: setAttackGuildMembers, key: 'attackGuildmates', path: 'arenaSettings' },
                                { label: 'Collect Arena Gems', value: collectArenaGems, setter: setCollectArenaGems, key: 'collectGems', path: 'arenaSettings' },
                            ].map((option) => (
                                <label key={option.key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={option.value}
                                        onChange={(e) => {
                                            option.setter(e.target.checked)
                                        }}
                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                    />
                                    <span className="text-sm text-white">{option.label}</span>
                                </label>
                            ))}
                        </div>

                        {/* Buy Extra Attempts */}
                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                            <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={buyExtraAttempts}
                                        onChange={(e) => {
                                            setBuyExtraAttempts(e.target.checked)
                                        }}
                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                    />
                                    <span className="text-sm text-gray-300">Buy Extra Attempts (Uses Gems!)</span>
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-300">Attempts to Buy:</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="1"
                                    value={attemptsToBuy}
                                    onChange={(e) => setAttemptsToBuy(Math.floor(Number(e.target.value)))}
                                    onBlur={(e) => setAttemptsToBuy(Math.max(0, Math.min(100, Math.floor(Number(e.target.value)))))}
                                    className="w-24 px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                />
                            </div>
                        </div>

                        {/* Win Chance */}
                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                            <label className="block text-xs sm:text-sm text-gray-300 mb-3">Win Chance:</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Min:</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={99}
                                        step="1"
                                        value={winChanceMin}
                                        onChange={(e) => setWinChanceMin(Math.floor(Number(e.target.value)))}
                                        onBlur={(e) => setWinChanceMin(Math.max(0, Math.min(99, Math.floor(Number(e.target.value)))))}
                                        className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Max:</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step="1"
                                        value={winChanceMax}
                                        onChange={(e) => setWinChanceMax(Math.floor(Number(e.target.value)))}
                                        onBlur={(e) => setWinChanceMax(Math.max(0, Math.min(100, Math.floor(Number(e.target.value)))))}
                                        className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </KonohaModal>
    )
}

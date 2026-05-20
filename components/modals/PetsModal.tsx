'use client'

import { Loader2, PackageOpen, PawPrint, Search, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { SettingInfoLabel } from '@/components/ui/SettingInfoLabel'
import { useAutoSaveSettings } from '@/hooks/useAutoSaveSettings'

interface PetsModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

interface FamiliarData {
    petId: number
    petUnlocked: boolean
    Level: number
    Exp: number
    Rarity: number
    Enhanced: number
    allowTraining: boolean
    allowSkillTraining: boolean
    allowEnhance: boolean
    upgradeSkills: boolean
    useExpItems: boolean
    useSkills: boolean
    shatterRunes: boolean
}

interface PactSettings {
    spreadTrainingHeroes: boolean
    openPacts: boolean
    mergePacts: boolean
    mergeStatus: number
    dailyFragment: number
    dailyRunes: number
    currentPactIndex: number
    pactsToMerge: boolean[]
}

// Pet ID to Name mapping (exact game data)
const PET_NAMES: Record<number, string> = {
    8: 'Jaziek',
    10: 'Yeti',
    11: 'Magus',
    12: 'Sorcerer',
    13: 'Bonehead',
    17: 'Oakroot',
    18: 'Magmalord',
    19: 'Terraspike',
    24: 'Gnome',
    25: 'Mole Shaman',
    26: 'Engineer',
    27: 'Beastmaster',
    28: 'Tempestite',
    29: 'Aquiris',
    30: 'Territe',
    31: 'Pyris',
    32: 'Harpy',
    33: 'Strix',
    35: 'Frostwing',
    36: 'Gargantua',
    38: 'Snow Beast',
    39: 'Jade Wyrm',
    40: 'Gryphon',
    41: 'Mega Maggot',
    43: 'Hell Drider',
    44: 'Noceros',
    45: 'Grim Reaper',
    46: 'Saberfang',
    47: 'Tidal Titan',
    48: 'Bon Appeti',
    49: 'Queen Bee',
    50: 'Blackwing',
    51: 'Mecha Trojan',
    52: 'Goblin',
    53: 'Evil Weevil',
    54: 'Totempest',
    55: 'Bouldur',
    56: 'Krabby',
    57: 'Huey Hops',
    58: 'Hoarder',
    59: 'Gemming Gremlin',
    60: 'Trickstar',
}

// Display order for familiars (by pet ID sequence)
const PET_ORDER = [8, 10, 11, 12, 13, 17, 18, 19, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]

// Pact labels for the checkboxes
const PACT_LABELS = ['Pact 1A', 'Pact 1B', 'Pact 2A', 'Pact 2B', 'Pact 3', 'Pact 4']

export default function PetsModal({ isOpen, onClose, iggId }: PetsModalProps) {
    const [loading, setLoading] = useState(true)

    const [saving, setSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Pact settings from pactSettings
    const [pactSettings, setPactSettings] = useState<PactSettings>({
        spreadTrainingHeroes: true,
        openPacts: false,
        mergePacts: false,
        mergeStatus: 1,
        dailyFragment: 64,
        dailyRunes: 0,
        currentPactIndex: 0,
        pactsToMerge: [false, false, false, false, false, false]
    })

    // Familiar data from familiarData
    const [familiarData, setFamiliarData] = useState<FamiliarData[]>([])

    // Full settings object for saving
    const [fullSettings, setFullSettings] = useState<any>(null)

    useEffect(() => {
        if (isOpen && iggId) {
            loadSettings()
            setSearchQuery('')
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

                // Load pactSettings
                if (data.pactSettings) {
                    setPactSettings({
                        spreadTrainingHeroes: data.pactSettings.spreadTrainingHeroes ?? true,
                        openPacts: data.pactSettings.openPacts ?? false,
                        mergePacts: data.pactSettings.mergePacts ?? false,
                        mergeStatus: data.pactSettings.mergeStatus ?? 1,
                        dailyFragment: data.pactSettings.dailyFragment ?? 64,
                        dailyRunes: data.pactSettings.dailyRunes ?? 0,
                        currentPactIndex: data.pactSettings.currentPactIndex ?? 0,
                        pactsToMerge: data.pactSettings.pactsToMerge ?? [false, false, false, false, false, false]
                    })
                }

                // Load familiarData or set defaults
                if (data.familiarData && Array.isArray(data.familiarData) && data.familiarData.length > 0) {
                    setFamiliarData(data.familiarData)
                } else {
                    // Generate default data if missing
                    const defaultData: FamiliarData[] = PET_ORDER.map(id => ({
                        petId: id,
                        petUnlocked: false,
                        Level: 0,
                        Exp: 0,
                        Rarity: 1,
                        Enhanced: 0,
                        allowTraining: false,
                        allowSkillTraining: false,
                        allowEnhance: false,
                        upgradeSkills: false,
                        useExpItems: false,
                        useSkills: false,
                        shatterRunes: false
                    }))
                    setFamiliarData(defaultData)
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
            // Update full settings with current state
            const updatedSettings = {
                ...fullSettings,
                pactSettings: pactSettings,
                familiarData: familiarData
            }

            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings),
            })

            if (res.ok) {
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

    const updatePactSetting = (key: keyof PactSettings, value: any) => {
        setPactSettings(prev => ({ ...prev, [key]: value }))
    }

    const updatePactsToMerge = (index: number, value: boolean) => {
        setPactSettings(prev => {
            const newPacts = [...prev.pactsToMerge]
            newPacts[index] = value
            return { ...prev, pactsToMerge: newPacts }
        })
    }

    const updateFamiliar = (petId: number, field: keyof FamiliarData, value: boolean | number) => {
        setFamiliarData(prev =>
            prev.map(pet =>
                pet.petId === petId ? { ...pet, [field]: value } : pet
            )
        )
    }

    const filteredPetOrder = PET_ORDER.filter(petId => {
        const name = PET_NAMES[petId] || `Pet #${petId}`
        return name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    useAutoSaveSettings(
        isOpen && !loading && Boolean(iggId && fullSettings),
        saveSettings,
        [pactSettings, familiarData]
    )

    const unlockedFamiliars = familiarData.filter((pet) => pet.petUnlocked).length
    const trainingEnabled = familiarData.filter((pet) => pet.allowTraining || pet.allowSkillTraining || pet.allowEnhance || pet.upgradeSkills).length

    if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Pets & Familiars"
                iggId={iggId}
                icon={PawPrint}
                iconColor="#EC4899"
                iconBg="rgba(236,72,153,0.15)"
                iconBorder="rgba(236,72,153,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Pets & Familiars"
            iggId={iggId}
            icon={PawPrint}
            iconColor="#EC4899"
            iconBg="rgba(236,72,153,0.15)"
            iconBorder="rgba(236,72,153,0.3)"
            saving={saving}
            statusLabel={saving ? 'Syncing...' : 'Auto-sync. Use Protocol Apply Changes to deploy.'}
            maxWidth="860px"
        >
            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#00FFB2]" />
                                </div>
                            ) : (
                                <div className="max-w-7xl space-y-6">
                                    <ModalSummaryGrid
                                        items={[
                                            { label: 'Pacts', value: pactSettings.openPacts ? 'Open' : 'Manual', icon: PackageOpen, tone: 'violet' },
                                            { label: 'Familiars', value: `${unlockedFamiliars}/${familiarData.length}`, icon: PawPrint, tone: 'mint' },
                                            { label: 'Training', value: trainingEnabled, icon: Sparkles, tone: 'gold' },
                                        ]}
                                    />

                                    {/* Pact Settings - Always visible */}
                                    <div className="space-y-4">
                                        <h3>
                                            <SettingInfoLabel label="Pact Settings" className="text-base sm:text-lg font-bold text-white" />
                                        </h3>

                                        {/* Open Pacts and Merge Pacts in same row */}
                                        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-3">
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] hover:bg-[#161626] transition-colors cursor-pointer">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <ToggleSwitch checked={pactSettings.openPacts} onChange={(v) => updatePactSetting('openPacts', v)} />
                                                    <SettingInfoLabel label="Open Pacts" className="text-sm text-white" />
                                                </label>
                                            </div>

                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] hover:bg-[#161626] transition-colors cursor-pointer">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <ToggleSwitch checked={pactSettings.mergePacts} onChange={(v) => updatePactSetting('mergePacts', v)} />
                                                    <SettingInfoLabel label="Merge Pacts" className="text-sm text-white" />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Pact Checkboxes */}
                                        <div className="grid grid-cols-2 gap-2 md:ml-8 md:flex md:flex-wrap md:gap-3">
                                            {PACT_LABELS.map((label, index) => (
                                                <label key={index} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] hover:bg-[#161626] transition-colors cursor-pointer">
                                                    <ToggleSwitch checked={pactSettings.pactsToMerge[index] ?? false} onChange={(v) => updatePactsToMerge(index, v)} />
                                                    <SettingInfoLabel label={label} className="text-sm text-white" />
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Familiars Table */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <h3>
                                                <SettingInfoLabel
                                                    label="Familiar Data"
                                                    className="text-base sm:text-lg font-bold text-white"
                                                />
                                                {searchQuery && <span className="ml-1 text-base sm:text-lg font-bold text-white">({filteredPetOrder.length})</span>}
                                            </h3>

                                            {/* Search Input - Scoped to Familiar Data */}
                                            <div className="relative w-full sm:w-64">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="text"
                                                    placeholder="Search familiars..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-1.5 bg-background-primary/50 border border-[rgba(123,94,255,0.2)] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B5EFF]/50"
                                                />
                                            </div>
                                        </div>

                                        {/* Desktop Table View */}
                                        <div className="hidden md:block relative h-[60vh] rounded-xl border border-[rgba(123,94,255,0.2)] overflow-hidden bg-surface/20">
                                            {/* Scrollable Container */}
                                            <div className="absolute inset-0 overflow-y-auto scrollbar-thin">
                                                <table className="w-full border-collapse">
                                                    <thead className="sticky top-0 z-20 bg-background-secondary/95 backdrop-blur-md border-b border-[rgba(123,94,255,0.2)] shadow-lg">
                                                        <tr>
                                                            <th className="px-4 py-4 text-left text-xs font-bold text-[#00FFB2] uppercase tracking-wider sticky left-0 z-30 bg-background-secondary/95 backdrop-blur-md">
                                                                <SettingInfoLabel label="Name" helpText="Familiar name shown in the configured familiar order." className="text-xs font-bold text-[#00FFB2] uppercase tracking-wider" />
                                                            </th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-[#00FFB2] uppercase tracking-wider">
                                                                <SettingInfoLabel label="Level" helpText="Current familiar level shown for tracking." className="text-xs font-bold text-[#00FFB2] uppercase tracking-wider" />
                                                            </th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-[#00FFB2] uppercase tracking-wider border-r border-[rgba(123,94,255,0.2)]">
                                                                <SettingInfoLabel label="Rarity" className="text-xs font-bold text-[#00FFB2] uppercase tracking-wider" />
                                                            </th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">
                                                                <SettingInfoLabel label="Training" helpText="Sends the familiar to the gym for training." className="text-xs font-bold text-gray-300 uppercase tracking-wider" />
                                                            </th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">
                                                                <SettingInfoLabel label="Train Skill" className="text-xs font-bold text-gray-300 uppercase tracking-wider" />
                                                            </th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">
                                                                <SettingInfoLabel label="Enhance" className="text-xs font-bold text-gray-300 uppercase tracking-wider" />
                                                            </th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">
                                                                <SettingInfoLabel label="Upg Skills" className="text-xs font-bold text-gray-300 uppercase tracking-wider" />
                                                            </th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">
                                                                <SettingInfoLabel label="Use Exp" className="text-xs font-bold text-gray-300 uppercase tracking-wider" />
                                                            </th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">
                                                                <SettingInfoLabel label="Use Skill" className="text-xs font-bold text-gray-300 uppercase tracking-wider" />
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {filteredPetOrder.map((petId) => {
                                                            const pet = familiarData.find(p => p.petId === petId)
                                                            if (!pet) return null
                                                            return (
                                                                <tr key={pet.petId} className="group hover:bg-white/5 transition-colors">
                                                                    <td className="px-4 py-3 text-sm text-white font-medium sticky left-0 z-10 bg-background-secondary/50 group-hover:bg-background-secondary/80 backdrop-blur-sm border-r border-white/5">
                                                                        {PET_NAMES[pet.petId] || `Pet #${pet.petId}`}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center text-sm text-gray-300 bg-black/10">
                                                                        <span className="inline-block min-w-[2rem]">{pet.Level}</span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center text-sm text-gray-300 border-r border-[rgba(123,94,255,0.2)] bg-black/10">
                                                                        <div className="flex justify-center">
                                                                            <span className={`text-sm font-medium ${pet.Rarity >= 5 ? 'text-yellow-400' :
                                                                                pet.Rarity >= 4 ? 'text-purple-400' :
                                                                                    pet.Rarity >= 3 ? 'text-blue-400' :
                                                                                        'text-gray-400'
                                                                                }`}>
                                                                                {pet.Rarity}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <ToggleSwitch checked={pet.allowTraining} onChange={(v) => updateFamiliar(pet.petId, 'allowTraining', v)} />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <ToggleSwitch checked={pet.allowSkillTraining} onChange={(v) => updateFamiliar(pet.petId, 'allowSkillTraining', v)} />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <ToggleSwitch checked={pet.allowEnhance} onChange={(v) => updateFamiliar(pet.petId, 'allowEnhance', v)} />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <ToggleSwitch checked={pet.upgradeSkills} onChange={(v) => updateFamiliar(pet.petId, 'upgradeSkills', v)} />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <ToggleSwitch checked={pet.useExpItems} onChange={(v) => updateFamiliar(pet.petId, 'useExpItems', v)} />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <ToggleSwitch checked={pet.useSkills} onChange={(v) => updateFamiliar(pet.petId, 'useSkills', v)} />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden space-y-4">
                                            {filteredPetOrder.map((petId) => {
                                                const pet = familiarData.find(p => p.petId === petId)
                                                if (!pet) return null
                                                return (
                                                    <div key={pet.petId} className="glass-card p-4 space-y-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="text-white font-bold">{PET_NAMES[pet.petId] || `Pet #${pet.petId}`}</h4>
                                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                                    <span>Lv. {pet.Level}</span>
                                                                    <span>Rarity: {pet.Rarity}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] border border-white/5">
                                                                <ToggleSwitch checked={pet.allowTraining} onChange={(v) => updateFamiliar(pet.petId, 'allowTraining', v)} />
                                                                <SettingInfoLabel label="Training" helpText="Sends the familiar to the gym for training." className="text-xs text-gray-300" />
                                                            </label>

                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] border border-white/5">
                                                                <ToggleSwitch checked={pet.allowSkillTraining} onChange={(v) => updateFamiliar(pet.petId, 'allowSkillTraining', v)} />
                                                                <SettingInfoLabel label="Train Skill" className="text-xs text-gray-300" />
                                                            </label>

                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] border border-white/5">
                                                                <ToggleSwitch checked={pet.allowEnhance} onChange={(v) => updateFamiliar(pet.petId, 'allowEnhance', v)} />
                                                                <SettingInfoLabel label="Enhance" className="text-xs text-gray-300" />
                                                            </label>

                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] border border-white/5">
                                                                <ToggleSwitch checked={pet.upgradeSkills} onChange={(v) => updateFamiliar(pet.petId, 'upgradeSkills', v)} />
                                                                <SettingInfoLabel label="Upg Skills" className="text-xs text-gray-300" />
                                                            </label>

                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] border border-white/5">
                                                                <ToggleSwitch checked={pet.useExpItems} onChange={(v) => updateFamiliar(pet.petId, 'useExpItems', v)} />
                                                                <SettingInfoLabel label="Use Exp" className="text-xs text-gray-300" />
                                                            </label>

                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] border border-white/5">
                                                                <ToggleSwitch checked={pet.useSkills} onChange={(v) => updateFamiliar(pet.petId, 'useSkills', v)} />
                                                                <SettingInfoLabel label="Use Skill" className="text-xs text-gray-300" />
                                                            </label>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}

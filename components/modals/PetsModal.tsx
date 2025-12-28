'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, PawPrint, Save, ChevronRight, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

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

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
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
                toast.success('Settings saved successfully')
                setFullSettings(updatedSettings)
                onClose()
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

    const updateFamiliar = (petId: number, field: keyof FamiliarData, value: boolean) => {
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


    if (!iggId) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-4 md:inset-20 bg-background-secondary rounded-2xl border border-white/10 shadow-2xl z-50 flex items-center justify-center"
                        >
                            <div className="text-center">
                                <p className="text-xl text-white mb-2">No IGG ID Selected</p>
                                <p className="text-gray-400">Please select an IGG ID to configure pets settings</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        )
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-2 sm:inset-4 md:inset-10 lg:inset-20 bg-background-secondary rounded-xl md:rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex flex-col gap-3 px-3 md:px-6 py-2.5 md:py-4 border-b border-white/10 bg-background-tertiary/50">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <PawPrint className="w-5 h-5 md:w-6 md:h-6 text-pink-400 flex-shrink-0" />
                                        <h2 className="text-sm md:text-2xl font-bold text-white truncate">Pets & Familiars</h2>
                                        {saving && (
                                            <Loader2 className="w-4 h-4 animate-spin text-primary-400 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-[10px] md:text-sm text-gray-400 truncate">IGG ID: {iggId}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors flex-shrink-0"
                                >
                                    <X className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 scrollbar-thin">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                                </div>
                            ) : (
                                <div className="max-w-7xl space-y-6">
                                    {/* Pact Settings - Always visible */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white">Pact Settings</h3>

                                        {/* Open Pacts and Merge Pacts in same row */}
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={pactSettings.openPacts}
                                                        onChange={(e) => updatePactSetting('openPacts', e.target.checked)}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">Open Pacts</span>
                                                </label>
                                            </div>

                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={pactSettings.mergePacts}
                                                        onChange={(e) => updatePactSetting('mergePacts', e.target.checked)}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">Merge Pacts &gt;</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Pact Checkboxes */}
                                        <div className="flex flex-wrap gap-3 ml-8">
                                            {PACT_LABELS.map((label, index) => (
                                                <label key={index} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={pactSettings.pactsToMerge[index] ?? false}
                                                        onChange={(e) => updatePactsToMerge(index, e.target.checked)}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Familiars Table */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <h3 className="text-base sm:text-lg font-bold text-white">
                                                Familiar Data {searchQuery && `(${filteredPetOrder.length})`}
                                            </h3>

                                            {/* Search Input - Scoped to Familiar Data */}
                                            <div className="relative w-full sm:w-64">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search familiars..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-1.5 bg-background-primary/50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
                                        </div>

                                        {/* Desktop Table View */}
                                        <div className="hidden md:block relative h-[60vh] rounded-xl border border-white/10 overflow-hidden bg-surface/20">
                                            {/* Scrollable Container */}
                                            <div className="absolute inset-0 overflow-y-auto scrollbar-thin">
                                                <table className="w-full border-collapse">
                                                    <thead className="sticky top-0 z-20 bg-background-secondary/95 backdrop-blur-md border-b border-white/10 shadow-lg">
                                                        <tr>
                                                            <th className="px-4 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider sticky left-0 z-30 bg-background-secondary/95 backdrop-blur-md">Name</th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-primary-400 uppercase tracking-wider">Level</th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-white/10">Rarity</th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">Training</th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">Train Skill</th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">Enhance</th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">Upg Skills</th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">Use Exp</th>
                                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/5">Use Skill</th>
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
                                                                    <td className="px-4 py-3 text-center text-sm text-gray-300 border-r border-white/10 bg-black/10">
                                                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${pet.Rarity >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                                                                            pet.Rarity >= 4 ? 'bg-purple-500/20 text-purple-400' :
                                                                                pet.Rarity >= 3 ? 'bg-blue-500/20 text-blue-400' :
                                                                                    'bg-gray-500/20 text-gray-400'
                                                                            }`}>
                                                                            {pet.Rarity}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={pet.allowTraining}
                                                                                onChange={(e) => updateFamiliar(pet.petId, 'allowTraining', e.target.checked)}
                                                                                className="w-5 h-5 rounded bg-background-tertiary border-white/20 text-primary-500 focus:ring-2 focus:ring-primary-500/50 cursor-pointer hover:border-primary-500/50 transition-colors"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={pet.allowSkillTraining}
                                                                                onChange={(e) => updateFamiliar(pet.petId, 'allowSkillTraining', e.target.checked)}
                                                                                className="w-5 h-5 rounded bg-background-tertiary border-white/20 text-primary-500 focus:ring-2 focus:ring-primary-500/50 cursor-pointer hover:border-primary-500/50 transition-colors"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={pet.allowEnhance}
                                                                                onChange={(e) => updateFamiliar(pet.petId, 'allowEnhance', e.target.checked)}
                                                                                className="w-5 h-5 rounded bg-background-tertiary border-white/20 text-primary-500 focus:ring-2 focus:ring-primary-500/50 cursor-pointer hover:border-primary-500/50 transition-colors"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={pet.upgradeSkills}
                                                                                onChange={(e) => updateFamiliar(pet.petId, 'upgradeSkills', e.target.checked)}
                                                                                className="w-5 h-5 rounded bg-background-tertiary border-white/20 text-primary-500 focus:ring-2 focus:ring-primary-500/50 cursor-pointer hover:border-primary-500/50 transition-colors"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={pet.useExpItems}
                                                                                onChange={(e) => updateFamiliar(pet.petId, 'useExpItems', e.target.checked)}
                                                                                className="w-5 h-5 rounded bg-background-tertiary border-white/20 text-primary-500 focus:ring-2 focus:ring-primary-500/50 cursor-pointer hover:border-primary-500/50 transition-colors"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <div className="flex justify-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={pet.useSkills}
                                                                                onChange={(e) => updateFamiliar(pet.petId, 'useSkills', e.target.checked)}
                                                                                className="w-5 h-5 rounded bg-background-tertiary border-white/20 text-primary-500 focus:ring-2 focus:ring-primary-500/50 cursor-pointer hover:border-primary-500/50 transition-colors"
                                                                            />
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
                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pet.allowTraining}
                                                                    onChange={(e) => updateFamiliar(pet.petId, 'allowTraining', e.target.checked)}
                                                                    className="w-4 h-4 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                                />
                                                                <span className="text-xs text-gray-300">Training</span>
                                                            </label>

                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pet.allowSkillTraining}
                                                                    onChange={(e) => updateFamiliar(pet.petId, 'allowSkillTraining', e.target.checked)}
                                                                    className="w-4 h-4 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                                />
                                                                <span className="text-xs text-gray-300">Skill Train</span>
                                                            </label>

                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pet.allowEnhance}
                                                                    onChange={(e) => updateFamiliar(pet.petId, 'allowEnhance', e.target.checked)}
                                                                    className="w-4 h-4 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                                />
                                                                <span className="text-xs text-gray-300">Enhance</span>
                                                            </label>

                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pet.upgradeSkills}
                                                                    onChange={(e) => updateFamiliar(pet.petId, 'upgradeSkills', e.target.checked)}
                                                                    className="w-4 h-4 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                                />
                                                                <span className="text-xs text-gray-300">Upg Skills</span>
                                                            </label>

                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pet.useExpItems}
                                                                    onChange={(e) => updateFamiliar(pet.petId, 'useExpItems', e.target.checked)}
                                                                    className="w-4 h-4 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                                />
                                                                <span className="text-xs text-gray-300">Use Exp</span>
                                                            </label>

                                                            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pet.useSkills}
                                                                    onChange={(e) => updateFamiliar(pet.petId, 'useSkills', e.target.checked)}
                                                                    className="w-4 h-4 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                                />
                                                                <span className="text-xs text-gray-300">Use Skill</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-2 px-3 md:px-6 py-2.5 md:py-4 border-t border-white/10 bg-background-tertiary/50">
                            <p className="hidden md:block text-sm text-gray-400">Click Save to apply changes</p>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={onClose}
                                    className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover text-gray-300 text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveSettings}
                                    disabled={saving}
                                    className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">Save Changes</span>
                                    <span className="sm:hidden">Save</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

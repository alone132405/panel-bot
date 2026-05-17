'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, BookOpen, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'

interface ResearchModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

// Research tree key mapping
const RESEARCH_TREE_KEYS: Record<string, number> = {
    'economy': 1,
    'defense': 2,
    'military': 3,
    'monsterHunt': 5,
    'upgradeDefenses': 7,
    'upgradeMilitary': 8,
    'armyLeadership': 9,
    'militaryCommand': 10,
    'familiars': 11,
    'sigils': 12,
    'wonderBattles': 13,
    'familiarBattles': 14,
    'gear': 15,
    'advancedWonderBattles': 16,
    'manaAwakening': 17,
}

// Reverse mapping for display
const KEY_TO_TREE: Record<number, string> = Object.fromEntries(
    Object.entries(RESEARCH_TREE_KEYS).map(([k, v]) => [v, k])
)

export default function ResearchModal({ isOpen, onClose, iggId }: ResearchModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Research settings
    const [autoResearch, setAutoResearch] = useState(false)
    const [useTargetSystem, setUseTargetSystem] = useState(false)
    const [maxTree, setMaxTree] = useState('')
    const [researchPriority, setResearchPriority] = useState<{ Key: number, Enabled: boolean }[]>([])
    const [useTechnologies, setUseTechnologies] = useState(false)
    const [minimumResearchMight, setMinimumResearchMight] = useState(1000000)

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

                if (data.researchSettings) {
                    setAutoResearch(data.researchSettings.autoResearch ?? false)
                    setUseTargetSystem(data.researchSettings.useTargetTable ?? false)
                    setUseTechnologies(data.researchSettings.useTechnolabes ?? false)
                    setMinimumResearchMight(data.researchSettings.minTechnoMight ?? 1000000)

                    // Load research priority and determine current max tree (first key)
                    const priority = data.researchSettings.researchPriority_ ?? []
                    setResearchPriority(priority)
                    if (priority.length > 0) {
                        const firstKey = priority[0]?.Key
                        setMaxTree(KEY_TO_TREE[firstKey] ?? '')
                    }
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
            const updatedSettings = {
                ...settings,
                researchSettings: {
                    ...settings.researchSettings,
                    autoResearch,
                    useTargetTable: useTargetSystem,
                    useTechnolabes: useTechnologies,
                    minTechnoMight: minimumResearchMight,
                    researchPriority_: researchPriority,
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
                setSettings(updatedSettings)
            } else {
                toast.error('Failed to save settings')
            }
        } catch (error) {
            toast.error('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const handleResetTree = () => {
        setMaxTree('economy')
        if (researchPriority.length > 0) {
            const selectedKey = RESEARCH_TREE_KEYS['economy']
            const selectedIndex = researchPriority.findIndex(p => p.Key === selectedKey)

            if (selectedIndex > 0) {
                const newPriority = [...researchPriority]
                const temp = newPriority[0]
                newPriority[0] = newPriority[selectedIndex]
                newPriority[selectedIndex] = temp
                setResearchPriority(newPriority)
            }
        }
        toast.success('Research tree reset!')
    }

    if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Research"
                iggId={iggId}
                icon={BookOpen}
                iconColor="#3B82F6"
                iconBg="rgba(59,130,246,0.15)"
                iconBorder="rgba(59,130,246,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Research"
            iggId={iggId}
            icon={BookOpen}
            iconColor="#3B82F6"
            iconBg="rgba(59,130,246,0.15)"
            iconBorder="rgba(59,130,246,0.3)"
            saving={saving}
            onSave={saveSettings}
            maxWidth="860px"
        >
            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                                </div>
                            ) : (
                                <div className="w-full space-y-6">
                                    {/* Main Options */}
                                    <div className="flex flex-wrap gap-3">
                                        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={autoResearch}
                                                onChange={(e) => setAutoResearch(e.target.checked)}
                                                className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                            />
                                            <span className="text-sm text-white">Auto Research</span>
                                        </label>

                                        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={useTargetSystem}
                                                onChange={(e) => setUseTargetSystem(e.target.checked)}
                                                className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                            />
                                            <span className="text-sm text-white">Use Target System</span>
                                        </label>
                                    </div>

                                    {/* Max Tree and Reset Tree */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Max Tree:</label>
                                            <select
                                                value={maxTree}
                                                onChange={(e) => {
                                                    const selectedTree = e.target.value
                                                    setMaxTree(selectedTree)

                                                    if (selectedTree && researchPriority.length > 0) {
                                                        const selectedKey = RESEARCH_TREE_KEYS[selectedTree]
                                                        const selectedIndex = researchPriority.findIndex(p => p.Key === selectedKey)

                                                        if (selectedIndex > 0) {
                                                            // Swap the selected key with the first position
                                                            const newPriority = [...researchPriority]
                                                            const temp = newPriority[0]
                                                            newPriority[0] = newPriority[selectedIndex]
                                                            newPriority[selectedIndex] = temp
                                                            setResearchPriority(newPriority)
                                                        }
                                                    }
                                                }}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            >
                                                <option value="">None</option>
                                                <option value="economy">Economy</option>
                                                <option value="defense">Defense</option>
                                                <option value="military">Military</option>
                                                <option value="monsterHunt">Monster Hunt</option>
                                                <option value="upgradeDefenses">Upgrade Defenses</option>
                                                <option value="upgradeMilitary">Upgrade Military</option>
                                                <option value="armyLeadership">Army Leadership</option>
                                                <option value="militaryCommand">Military Command</option>
                                                <option value="familiars">Familiars</option>
                                                <option value="sigils">Sigils</option>
                                                <option value="wonderBattles">Wonder Battles</option>
                                                <option value="familiarBattles">Familiar Battles</option>
                                                <option value="gear">Gear</option>
                                                <option value="advancedWonderBattles">Advanced Wonder Battles</option>
                                                <option value="manaAwakening">Mana Awakening</option>
                                            </select>
                                        </div>

                                        <div className="flex items-end p-4 rounded-xl bg-surface/50">
                                            <button
                                                onClick={handleResetTree}
                                                className="w-full px-6 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-medium transition-colors"
                                            >
                                                Reset Tree
                                            </button>
                                        </div>
                                    </div>

                                    {/* Technologies Section */}
                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer w-fit">
                                            <input
                                                type="checkbox"
                                                checked={useTechnologies}
                                                onChange={(e) => setUseTechnologies(e.target.checked)}
                                                className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                            />
                                            <span className="text-sm text-white">Use Technolabes</span>
                                        </label>

                                        <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                            <label className="block text-xs sm:text-sm text-gray-300 mb-2">Minimum Research Might for Technolabes:</label>
                                            <input
                                                type="number"
                                                min={10000}
                                                max={49000000}
                                                step="1"
                                                value={minimumResearchMight}
                                                onChange={(e) => setMinimumResearchMight(Math.floor(Number(e.target.value)))}
                                                onKeyDown={(e) => {
                                                    if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onBlur={(e) => setMinimumResearchMight(Math.min(49000000, Math.max(10000, Math.floor(Number(e.target.value)))))}
                                                className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                placeholder="1,000,000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}
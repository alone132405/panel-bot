'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { BookOpen, FlaskConical, Target } from 'lucide-react'
import { setNestedValue } from '@/lib/settingsMapper'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { ResponsiveModalShell, ToggleControl, StepperControl, TabDef } from '@/components/ui/ResponsiveModalShell'
import { motion } from 'framer-motion'

interface ResearchModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

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

const KEY_TO_TREE: Record<number, string> = Object.fromEntries(
    Object.entries(RESEARCH_TREE_KEYS).map(([k, v]) => [v, k])
)

const MAX_TREE_OPTIONS = [
    { val: '', label: 'None' },
    { val: 'economy', label: 'Economy' },
    { val: 'defense', label: 'Defense' },
    { val: 'military', label: 'Military' },
    { val: 'monsterHunt', label: 'Monster Hunt' },
    { val: 'upgradeDefenses', label: 'Upgrade Defenses' },
    { val: 'upgradeMilitary', label: 'Upgrade Military' },
    { val: 'armyLeadership', label: 'Army Leadership' },
    { val: 'militaryCommand', label: 'Military Command' },
    { val: 'familiars', label: 'Familiars' },
    { val: 'sigils', label: 'Sigils' },
    { val: 'wonderBattles', label: 'Wonder Battles' },
    { val: 'familiarBattles', label: 'Familiar Battles' },
    { val: 'gear', label: 'Gear' },
    { val: 'advancedWonderBattles', label: 'Advanced Wonder Battles' },
    { val: 'manaAwakening', label: 'Mana Awakening' },
]

const TABS: TabDef[] = [
    { id: 'general', label: 'Research', icon: BookOpen },
]

export default function ResearchModal({ isOpen, onClose, iggId }: ResearchModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isOpen && iggId) loadSettings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, iggId])

    const loadSettings = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`)
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
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
            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })
            if (res.ok) {
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

    const handleSettingChange = (path: string, value: any) => {
        if (!settings) return

        const updatedSettings = { ...settings }
        setNestedValue(updatedSettings, path, value)
        setSettings(updatedSettings)
    }

    const currentPriority = settings?.researchSettings?.researchPriority_ || []
    const currentMaxTreeKey = currentPriority.length > 0 ? currentPriority[0]?.Key : undefined
    const currentMaxTree = currentMaxTreeKey !== undefined ? (KEY_TO_TREE[currentMaxTreeKey] || '') : ''

    const handleTreeSelect = (selectedTree: string) => {
        if (!selectedTree) {
            // Remove priority or handle none
            return
        }

        const selectedKey = RESEARCH_TREE_KEYS[selectedTree]
        const newPriority = [...currentPriority]
        const selectedIndex = newPriority.findIndex(p => p.Key === selectedKey)

        if (selectedIndex > 0) {
            const temp = newPriority[0]
            newPriority[0] = newPriority[selectedIndex]
            newPriority[selectedIndex] = temp
        } else if (selectedIndex === -1 && selectedKey !== undefined) {
            newPriority.unshift({ Key: selectedKey, Enabled: true })
        }

        handleSettingChange('researchSettings.researchPriority_', newPriority)
    }

    const handleResetTree = () => {
        handleTreeSelect('economy')
        toast.success('Research tree reset to Economy!')
    }

    const renderSectionContent = (tabId: string, isMobile: boolean, isTablet: boolean) => {
        if (!settings) return null
        
        const gridClass = isMobile
            ? 'grid grid-cols-1 gap-1.5'
            : isTablet
                ? 'grid grid-cols-2 gap-2'
                : 'grid grid-cols-2 gap-3'

        return (
            <div className="flex flex-col gap-8">
                <ModalSummaryGrid
                    items={[
                        { label: 'Research', value: settings.researchSettings?.autoResearch ? 'On' : 'Off', icon: BookOpen, tone: 'mint' },
                        { label: 'Target', value: settings.researchSettings?.useTargetTable ? 'On' : 'Off', icon: Target, tone: 'cyan' },
                        { label: 'Tree', value: MAX_TREE_OPTIONS.find((option) => option.val === currentMaxTree)?.label || 'None', icon: FlaskConical, tone: 'gold' },
                    ]}
                />

                <div className="space-y-4">
                    <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Main Settings</h3>
                    <div className={gridClass}>
                        <ToggleControl 
                            label="Auto Research" 
                            checked={!!settings.researchSettings?.autoResearch} 
                            onChange={(v) => handleSettingChange('researchSettings.autoResearch', v)} 
                            isMobile={isMobile} 
                        />
                        <ToggleControl 
                            label="Use Target System" 
                            checked={!!settings.researchSettings?.useTargetTable} 
                            onChange={(v) => handleSettingChange('researchSettings.useTargetTable', v)} 
                            isMobile={isMobile} 
                        />
                    </div>
                </div>

                <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                    <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Technolabes</h3>
                    <div className={gridClass}>
                        <ToggleControl 
                            label="Use Technolabes" 
                            checked={!!settings.researchSettings?.useTechnolabes} 
                            onChange={(v) => handleSettingChange('researchSettings.useTechnolabes', v)} 
                            isMobile={isMobile} 
                        />
                        <StepperControl 
                            label="Minimum Might" 
                            val={Number(settings.researchSettings?.minTechnoMight || 1000000)} 
                            min={10000} 
                            max={49000000} 
                            onChange={(v) => handleSettingChange('researchSettings.minTechnoMight', v)} 
                            isMobile={isMobile} 
                        />
                    </div>
                </div>

                <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase">Max Tree Priority</h3>
                        <button
                            onClick={handleResetTree}
                            className="text-[12px] text-[#FF4D6D] hover:text-[#FF4D6D]/80 font-medium transition-colors"
                        >
                            Reset Tree
                        </button>
                    </div>
                    
                    <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 md:grid-cols-4'}`}>
                        {MAX_TREE_OPTIONS.map(opt => (
                            <motion.button
                                key={opt.val}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleTreeSelect(opt.val)}
                                className={`px-2 py-2.5 rounded-lg text-[13px] font-medium transition-all border leading-tight ${currentMaxTree === opt.val
                                    ? 'bg-[#00C8FF]/10 border-[#00C8FF]/40 text-[#00C8FF] shadow-[0_0_15px_rgba(0,200,255,0.15)]'
                                    : 'bg-[#1A1E2A] border-[rgba(255,255,255,0.06)] text-[#6B7A99] hover:bg-[#1A1E2A]/80 hover:text-white'
                                }`}
                            >
                                {opt.label}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <ResponsiveModalShell
            isOpen={isOpen}
            onClose={onClose}
            title="Research Settings"
            iggId={iggId}
            headerIcon={BookOpen}
            tabs={TABS}
            loading={loading}
            saving={saving}
            onSave={saveSettings}
            saveLabel="Save Changes"
            statusLabel={saving ? 'Saving...' : 'Manual save'}
            renderSectionContent={renderSectionContent}
        />
    )
}

'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CheckSquare, Swords, Target } from 'lucide-react'
import { getNestedValue, setNestedValue } from '@/lib/settingsMapper'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { ResponsiveModalShell, ToggleControl, TabDef } from '@/components/ui/ResponsiveModalShell'

interface ChaosArenaModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

const TABS: TabDef[] = [
    { id: 'general', label: 'Chaos Arena', icon: Swords },
]

export default function ChaosArenaModal({ isOpen, onClose, iggId }: ChaosArenaModalProps) {
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

    const renderSectionContent = (tabId: string, isMobile: boolean, isTablet: boolean) => {
        if (!settings) return null
        
        const gridClass = isMobile
            ? 'grid grid-cols-1 gap-1.5'
            : isTablet
                ? 'grid grid-cols-2 gap-2'
                : 'grid grid-cols-2 gap-3'

        const generalSettings = [
            { label: 'Auto Enter Arena', path: 'eventSettings.Chaos.AutoJoinArena' },
            { label: 'Auto Complete Missions', path: 'eventSettings.Chaos.AutoCompleteMissions' },
        ]

        const missions = [
            { label: 'Clear remaining resources at Lv 1+ tiles', path: 'eventSettings.Chaos.AutoMission.GatherLV3Above' },
            { label: 'Clear remaining resources in Lv 4+ tiles', path: 'eventSettings.Chaos.AutoMission.GatherLv4Above' },
            { label: 'Clear remaining resources in Lv 5+ tiles', path: 'eventSettings.Chaos.AutoMission.GatherLV5Above' },
            { label: 'Kill Lv 3+ Monsters', path: 'eventSettings.Chaos.AutoMission.HuntLV3Above' },
            { label: 'Kill Lv 4+ Monsters', path: 'eventSettings.Chaos.AutoMission.HuntLV4Above' },
            { label: 'Kill Lv 5+ Monsters', path: 'eventSettings.Chaos.AutoMission.HuntLV5Above' },
        ]
        const missionCount = missions.filter((mission) => !!getNestedValue(settings, mission.path)).length

        return (
            <div className="flex flex-col gap-8">
                <ModalSummaryGrid
                    items={[
                        { label: 'Arena', value: getNestedValue(settings, 'eventSettings.Chaos.AutoJoinArena') ? 'On' : 'Off', icon: Swords, tone: 'mint' },
                        { label: 'Missions', value: getNestedValue(settings, 'eventSettings.Chaos.AutoCompleteMissions') ? 'Auto' : 'Manual', icon: CheckSquare, tone: 'cyan' },
                        { label: 'Enabled', value: `${missionCount}/6`, icon: Target, tone: 'gold' },
                    ]}
                />

                <div className="space-y-4">
                    <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Settings</h3>
                    <div className={gridClass}>
                        {generalSettings.map((s) => {
                            const val = getNestedValue(settings, s.path) ?? false
                            return (
                                <ToggleControl 
                                    key={s.path}
                                    label={s.label} 
                                    checked={!!val} 
                                    onChange={(v) => handleSettingChange(s.path, v)} 
                                    isMobile={isMobile} 
                                />
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                    <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Missions</h3>
                    <div className={gridClass}>
                        {missions.map((s) => {
                            const val = getNestedValue(settings, s.path) ?? false
                            return (
                                <ToggleControl 
                                    key={s.path}
                                    label={s.label} 
                                    checked={!!val} 
                                    onChange={(v) => handleSettingChange(s.path, v)} 
                                    isMobile={isMobile} 
                                />
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <ResponsiveModalShell
            isOpen={isOpen}
            onClose={onClose}
            title="Chaos Arena Settings"
            iggId={iggId}
            headerIcon={Swords}
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

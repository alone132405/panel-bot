'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Gem, Gift, Sparkles } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { getNestedValue, setNestedValue } from '@/lib/settingsMapper'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { ResponsiveModalShell, ToggleControl, TabDef } from '@/components/ui/ResponsiveModalShell'

interface ArtifactsModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

const TABS: TabDef[] = [
    { id: 'general', label: 'Artifacts', icon: Gem },
]

export default function ArtifactsModal({ isOpen, onClose, iggId }: ArtifactsModalProps) {
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

    const saveSetting = async (path: string, value: any) => {
        if (!iggId) return
        setSaving(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, value }),
            })
            if (res.ok) {
                const updatedSettings = { ...settings }
                setNestedValue(updatedSettings, path, value)
                setSettings(updatedSettings)
            } else {
                toast.error('Failed to save setting')
            }
        } catch (error) {
            toast.error('Error saving setting')
        } finally {
            setSaving(false)
        }
    }

    const debouncedSave = useDebounce(saveSetting, 500)

    const handleSettingChange = (path: string, value: any) => {
        const updatedSettings = { ...settings }
        setNestedValue(updatedSettings, path, value)
        setSettings(updatedSettings)
        debouncedSave(path, value)
    }

    const renderSectionContent = (tabId: string, isMobile: boolean, isTablet: boolean) => {
        if (!settings) return null
        
        const gridClass = isMobile
            ? 'grid grid-cols-1 gap-1.5'
            : isTablet
                ? 'grid grid-cols-2 gap-2'
                : 'grid grid-cols-2 gap-3'

        const artifactSettings = [
            { label: 'Appraise Artifacts', path: 'artifactSettings.appraiseArtifacts' },
            { label: 'Collect Free Artifact Chests', path: 'artifactSettings.collectFreeChest' },
            { label: 'Collect Artifact Chests (using coins)', path: 'artifactSettings.collectChest' },
            { label: 'Collect Weekly Challenge Rewards', path: 'artifactSettings.collectWeeklyChallenge' },
        ]
        const enabledCount = artifactSettings.filter((setting) => !!getNestedValue(settings, setting.path)).length

        return (
            <div className="flex flex-col gap-6">
                <ModalSummaryGrid
                    items={[
                        { label: 'Enabled', value: `${enabledCount}/4`, icon: Sparkles, tone: 'mint' },
                        { label: 'Appraise', value: getNestedValue(settings, 'artifactSettings.appraiseArtifacts') ? 'On' : 'Off', icon: Gem, tone: 'cyan' },
                        { label: 'Chests', value: getNestedValue(settings, 'artifactSettings.collectChest') ? 'Coins' : 'Free', icon: Gift, tone: 'gold' },
                    ]}
                />

                <div className={gridClass}>
                    {artifactSettings.map((s) => {
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
        )
    }

    return (
        <ResponsiveModalShell
            isOpen={isOpen}
            onClose={onClose}
            title="Artifact Settings"
            iggId={iggId}
            headerIcon={Gem}
            tabs={TABS}
            loading={loading}
            saving={saving}
            statusLabel={saving ? 'Syncing...' : 'Auto-sync'}
            renderSectionContent={renderSectionContent}
        />
    )
}

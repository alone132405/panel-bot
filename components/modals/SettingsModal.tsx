'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { Settings, Zap, Target, Scroll, Swords, Users, TrendingUp, CheckSquare } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { SETTINGS_FIELD_MAP, getNestedValue, setNestedValue } from '@/lib/settingsMapper'
import { ResponsiveModalShell, ToggleControl, StepperControl, InputControl, TabDef } from '@/components/ui/ResponsiveModalShell'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

const TABS: TabDef[] = [
    { id: 'basic', label: 'Basic', icon: Settings },
    { id: 'quests', label: 'Quests', icon: Scroll },
    { id: 'speedups', label: 'Speed-ups', icon: Zap },
    { id: 'labyrinth', label: 'Labyrinth', icon: Target },
    { id: 'tycoon', label: 'Tycoon', icon: TrendingUp },
    { id: 'guild', label: 'Guild', icon: Users },
    { id: 'turf-boosts', label: 'Turf Boosts', icon: Swords },
    { id: 'daily-missions', label: 'Daily Missions', icon: CheckSquare },
]

export default function SettingsModal({ isOpen, onClose, iggId }: SettingsModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const loadSettings = useCallback(async () => {
        if (!iggId) return

        setLoading(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`)
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            } else {
                toast.error('Failed to load settings')
            }
        } catch {
            toast.error('Error loading settings')
        } finally {
            setLoading(false)
        }
    }, [iggId])

    useEffect(() => {
        if (isOpen) loadSettings()
    }, [isOpen, loadSettings])

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
        } catch {
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

        const mappings = SETTINGS_FIELD_MAP.filter(
            (m) => m.category === 'general' && m.subcategory === tabId
        )

        const currentSettings = mappings.map((mapping) => ({
            label: mapping.uiField,
            type: mapping.type,
            value: getNestedValue(settings, mapping.jsonPath),
            path: mapping.jsonPath,
            dependent: mapping.jsonPath.startsWith('speedUpSettings.') && mapping.jsonPath !== 'speedUpSettings.useSpeedUps',
            min: mapping.min,
            max: mapping.max,
        }))

        const useSpeedUps = settings?.speedUpSettings?.useSpeedUps

        const gridClass = isMobile
            ? 'grid grid-cols-1 gap-1.5'
            : isTablet
                ? 'grid grid-cols-2 gap-2'
                : 'grid grid-cols-2 gap-3'
        const booleanCount = currentSettings.filter((setting) => setting.type === 'boolean').length
        const enabledCount = currentSettings.filter((setting) => setting.type === 'boolean' && !!setting.value).length
        const inputCount = currentSettings.length - booleanCount

        if (currentSettings.length === 0) {
            return (
                <div className="rounded-lg border border-white/10 bg-bg-inset/70 py-12 text-center">
                    <Settings className="mx-auto mb-3 h-10 w-10 text-text-muted" />
                    <p className="text-[13px] text-text-muted">No settings available for this category</p>
                </div>
            )
        }

        const controlsList = (
            <div className={gridClass}>
                {currentSettings.map((s, index) => {
                    const isDisabled = tabId === 'speedups' && s.dependent && !useSpeedUps

                    return (
                        <div key={s.path + index}>
                            {s.type === 'boolean' && (
                                <ToggleControl
                                    label={s.label}
                                    checked={!!s.value}
                                    onChange={(v) => handleSettingChange(s.path, v)}
                                    isMobile={isMobile}
                                    disabled={isDisabled}
                                />
                            )}
                            {s.type === 'number' && (
                                <StepperControl
                                    label={s.label}
                                    val={Number(s.value || 0)}
                                    min={Number(s.min || 0)}
                                    max={Number(s.max || 9999)}
                                    onChange={(v) => handleSettingChange(s.path, v)}
                                    isMobile={isMobile}
                                    disabled={isDisabled}
                                />
                            )}
                            {s.type === 'string' && (
                                <InputControl
                                    label={s.label}
                                    val={String(s.value || '')}
                                    onChange={(v) => handleSettingChange(s.path, v)}
                                    isMobile={isMobile}
                                    disabled={isDisabled}
                                />
                            )}
                            {s.type === 'time' && (
                                <InputControl
                                    label={s.label}
                                    val={String(s.value || '')}
                                    onChange={(v) => {
                                        const formattedTime = v.length === 5 ? `${v}:00` : v
                                        handleSettingChange(s.path, formattedTime)
                                    }}
                                    isMobile={isMobile}
                                    disabled={isDisabled}
                                    type="time"
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        )

        if (isMobile) {
            return controlsList
        }

        return (
            <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-bg-inset/70 p-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Controls</div>
                        <div className="mt-1 font-orbitron text-xl font-black text-text-primary">{currentSettings.length}</div>
                    </div>
                    <div className="rounded-lg border border-accent-1/20 bg-accent-1/10 p-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-1">Enabled</div>
                        <div className="mt-1 font-orbitron text-xl font-black text-accent-1">{enabledCount}</div>
                    </div>
                    <div className="rounded-lg border border-accent-cyan/20 bg-accent-cyan/10 p-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-cyan">Inputs</div>
                        <div className="mt-1 font-orbitron text-xl font-black text-accent-cyan">{inputCount}</div>
                    </div>
                </div>

                {controlsList}
            </div>
        )
    }

    return (
        <ResponsiveModalShell
            isOpen={isOpen}
            onClose={onClose}
            title="General Settings"
            iggId={iggId}
            headerIcon={Settings}
            tabs={TABS}
            loading={loading}
            saving={saving}
            onSave={onClose}
            saveLabel="Close"
            statusLabel={saving ? 'Syncing...' : 'Auto-sync'}
            renderSectionContent={renderSectionContent}
        />
    )
}

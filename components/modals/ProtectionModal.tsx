'use client'

import { useEffect, useState } from 'react'
import { Axe, EyeOff, Home, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { SETTINGS_FIELD_MAP, getNestedValue, setNestedValue } from '@/lib/settingsMapper'
import { ChoiceControl, ResponsiveModalShell, StepperControl, TabDef, ToggleControl } from '@/components/ui/ResponsiveModalShell'

interface ProtectionModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

const TABS: TabDef[] = [
    { id: 'shield', label: 'Shield', icon: Shield },
    { id: 'anti-scout', label: 'Anti-Scout', icon: EyeOff },
    { id: 'gathering', label: 'Gathering', icon: Axe },
    { id: 'shelter', label: 'Shelter', icon: Home },
]

const PREFERRED_SHIELD_OPTIONS = [
    { value: -1, label: 'None' },
    { value: 0, label: '4 Hr' },
    { value: 1, label: '8 Hr' },
    { value: 6, label: '12 Hr' },
    { value: 2, label: '24 Hr' },
    { value: 3, label: '3 Day' },
    { value: 4, label: '7 Day' },
    { value: 5, label: '14 Day' },
]

const SHELTER_MODE_OPTIONS = [
    { value: 0, label: "Don't Shelter" },
    { value: 1, label: 'Always Shelter' },
    { value: 2, label: 'Only Without Shield' },
]

export default function ProtectionModal({ isOpen, onClose, iggId }: ProtectionModalProps) {
    const [settings, setSettings] = useState<Record<string, unknown> | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isOpen) return

        if (!iggId) {
            setSettings(null)
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
                const data = await res.json() as Record<string, unknown>
                setSettings(data)
            } else {
                toast.error('Failed to load settings')
            }
        } catch {
            toast.error('Error loading settings')
        } finally {
            setLoading(false)
        }
    }

    const saveSetting = async (path: string, value: unknown) => {
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

    const handleSettingChange = (path: string, value: unknown) => {
        if (!settings) return

        const updatedSettings = { ...settings }
        setNestedValue(updatedSettings, path, value)
        setSettings(updatedSettings)
        debouncedSave(path, value)
    }

    const getProtectionSettings = (subcategory: string) => {
        if (!settings) return []

        return SETTINGS_FIELD_MAP
            .filter((mapping) => mapping.category === 'protection' && mapping.subcategory === subcategory)
            .map((mapping) => ({
                label: mapping.uiField,
                type: mapping.type,
                value: getNestedValue(settings, mapping.jsonPath),
                path: mapping.jsonPath,
                min: mapping.min,
                max: mapping.max,
            }))
    }

    const renderMappedSetting = (setting: ReturnType<typeof getProtectionSettings>[number], isMobile: boolean) => {
        if (setting.type === 'boolean') {
            return (
                <ToggleControl
                    key={setting.path}
                    label={setting.label}
                    checked={!!setting.value}
                    onChange={(value) => handleSettingChange(setting.path, value)}
                    isMobile={isMobile}
                />
            )
        }

        if (setting.type === 'number') {
            return (
                <StepperControl
                    key={setting.path}
                    label={setting.label}
                    val={Number(setting.value || 0)}
                    min={Number(setting.min || 0)}
                    max={Number(setting.max || 9999)}
                    onChange={(value) => handleSettingChange(setting.path, value)}
                    isMobile={isMobile}
                />
            )
        }

        return null
    }

    const renderSectionContent = (tabId: string, isMobile: boolean, isTablet: boolean) => {
        if (!iggId) {
            return (
                <div className="rounded-lg border border-accent-gold/20 bg-accent-gold/10 p-6 text-center">
                    <Shield className="mx-auto mb-3 h-10 w-10 text-accent-gold" />
                    <p className="text-[14px] font-bold text-text-primary">Select an IGG ID to edit protection settings.</p>
                </div>
            )
        }

        const sectionSettings = getProtectionSettings(tabId)
        const gridClass = isMobile
            ? 'grid grid-cols-1 gap-1.5'
            : isTablet
                ? 'grid grid-cols-2 gap-2'
                : 'grid grid-cols-2 gap-3'
        const enabledCount = sectionSettings.filter((setting) => setting.type === 'boolean' && !!setting.value).length
        const timerCount = sectionSettings.filter((setting) => setting.type === 'number').length

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-bg-inset/70 p-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Rules</div>
                        <div className="mt-1 font-orbitron text-xl font-black text-text-primary">{sectionSettings.length}</div>
                    </div>
                    <div className="rounded-lg border border-accent-1/20 bg-accent-1/10 p-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-1">Enabled</div>
                        <div className="mt-1 font-orbitron text-xl font-black text-accent-1">{enabledCount}</div>
                    </div>
                    <div className="rounded-lg border border-accent-cyan/20 bg-accent-cyan/10 p-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-cyan">Timers</div>
                        <div className="mt-1 font-orbitron text-xl font-black text-accent-cyan">{timerCount}</div>
                    </div>
                </div>

                <div className={gridClass}>
                    {sectionSettings.map((setting) => renderMappedSetting(setting, isMobile))}
                </div>

                {tabId === 'shield' && (
                    <ChoiceControl
                        label="Preferred Shield"
                        value={Number(getNestedValue(settings, 'protectionSettings.preferredShield') ?? -1)}
                        options={PREFERRED_SHIELD_OPTIONS}
                        onChange={(value) => handleSettingChange('protectionSettings.preferredShield', value)}
                        isMobile={isMobile}
                    />
                )}

                {tabId === 'shelter' && (
                    <ChoiceControl
                        label="Shelter Mode"
                        value={Number(getNestedValue(settings, 'protectionSettings.ShelterType') ?? 0)}
                        options={SHELTER_MODE_OPTIONS}
                        onChange={(value) => handleSettingChange('protectionSettings.ShelterType', value)}
                        isMobile={isMobile}
                    />
                )}
            </div>
        )
    }

    return (
        <ResponsiveModalShell
            isOpen={isOpen}
            onClose={onClose}
            title="Protection Settings"
            iggId={iggId}
            headerIcon={Shield}
            tabs={iggId ? TABS : [{ id: 'select', label: 'Select IGG ID', icon: Shield }]}
            loading={loading}
            saving={saving}
            onSave={onClose}
            saveLabel="Close"
            statusLabel={saving ? 'Syncing...' : 'Auto-sync'}
            renderSectionContent={renderSectionContent}
            maxWidth="940px"
        />
    )
}

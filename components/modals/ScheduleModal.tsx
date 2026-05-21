'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Calendar, Clock, ShieldCheck, Timer, Settings2 } from 'lucide-react'
import { setNestedValue } from '@/lib/settingsMapper'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { ResponsiveModalShell, ToggleControl, StepperControl, InputControl, TabDef } from '@/components/ui/ResponsiveModalShell'

interface ScheduleModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

const TABS: TabDef[] = [
    { id: 'general', label: 'General', icon: Settings2 },
    { id: 'time', label: 'Fixed Time', icon: Calendar },
    { id: 'interval', label: 'Interval', icon: Timer },
]

export default function ScheduleModal({ isOpen, onClose, iggId }: ScheduleModalProps) {
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
        const scheduleSettings = settings.scheduleSettings || {}

        if (tabId === 'general') {
            const checksEnabled = [scheduleSettings.checkShield, scheduleSettings.checkAnti, scheduleSettings.checkShelter].filter(Boolean).length

            return (
                <div className="flex flex-col gap-8">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Schedule', value: scheduleSettings.enableSchedule ? 'On' : 'Off', icon: Calendar, tone: 'mint' },
                            { label: 'Checks', value: `${checksEnabled}/3`, icon: ShieldCheck, tone: 'cyan' },
                            { label: 'Random', value: scheduleSettings.randomizeSchedule ? `${Number(scheduleSettings.randMax || 10)}m` : 'Off', icon: Timer, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Core Control</h3>
                        <div className={gridClass}>
                            <ToggleControl 
                                label="Enable Schedule System" 
                                checked={!!settings.scheduleSettings?.enableSchedule} 
                                onChange={(v) => handleSettingChange('scheduleSettings.enableSchedule', v)} 
                                isMobile={isMobile} 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Actions Before Offline</h3>
                        <div className={gridClass}>
                            <ToggleControl 
                                label="Recall Armies" 
                                checked={!!settings.scheduleSettings?.recallTroops} 
                                onChange={(v) => handleSettingChange('scheduleSettings.recallTroops', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Monitor Shield" 
                                checked={!!settings.scheduleSettings?.checkShield} 
                                onChange={(v) => handleSettingChange('scheduleSettings.checkShield', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Monitor Anti-Scout" 
                                checked={!!settings.scheduleSettings?.checkAnti} 
                                onChange={(v) => handleSettingChange('scheduleSettings.checkAnti', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Monitor Shelter" 
                                checked={!!settings.scheduleSettings?.checkShelter} 
                                onChange={(v) => handleSettingChange('scheduleSettings.checkShelter', v)} 
                                isMobile={isMobile} 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Randomization</h3>
                        <div className={gridClass}>
                            <ToggleControl 
                                label="Randomize Schedule" 
                                checked={!!settings.scheduleSettings?.randomizeSchedule} 
                                onChange={(v) => handleSettingChange('scheduleSettings.randomizeSchedule', v)} 
                                isMobile={isMobile} 
                            />
                            <StepperControl 
                                label="Random Max (Minutes)" 
                                val={Number(settings.scheduleSettings?.randMax || 10)} 
                                min={0} 
                                max={9999} 
                                onChange={(v) => handleSettingChange('scheduleSettings.randMax', v)} 
                                isMobile={isMobile} 
                                disabled={!settings.scheduleSettings?.randomizeSchedule}
                            />
                        </div>
                    </div>
                </div>
            )
        }

        const isTimeBased = settings.scheduleSettings?.scheduleType === 0
        const isIntervalBased = settings.scheduleSettings?.scheduleType === 1

        if (tabId === 'time') {
            return (
                <div className="flex flex-col gap-8">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Mode', value: isTimeBased ? 'Active' : 'Inactive', icon: Calendar, tone: isTimeBased ? 'mint' : 'rose' },
                            { label: 'Offline', value: scheduleSettings.offlineTime || '02:00', icon: Clock, tone: 'cyan' },
                            { label: 'Online', value: scheduleSettings.onlineTime || '04:30', icon: Timer, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase">Fixed Time Schedule</h3>
                            <button 
                                onClick={() => handleSettingChange('scheduleSettings.scheduleType', 0)}
                                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${isTimeBased ? 'bg-[#00C8FF]/10 text-[#00C8FF]' : 'bg-[#1A1E2A] text-[#6B7A99]'}`}
                            >
                                {isTimeBased ? 'Active Mode' : 'Set as Active'}
                            </button>
                        </div>
                        
                        <div className={gridClass}>
                            <InputControl 
                                label="Offline Time (Go Offline At)" 
                                type="time"
                                val={settings.scheduleSettings?.offlineTime || '02:00'} 
                                onChange={(v) => {
                                    const formattedTime = v.length === 5 ? `${v}:00` : v
                                    handleSettingChange('scheduleSettings.offlineTime', formattedTime)
                                }} 
                                isMobile={isMobile} 
                                disabled={!isTimeBased}
                            />
                            <InputControl 
                                label="Online Time (Come Back At)" 
                                type="time"
                                val={settings.scheduleSettings?.onlineTime || '04:30'} 
                                onChange={(v) => {
                                    const formattedTime = v.length === 5 ? `${v}:00` : v
                                    handleSettingChange('scheduleSettings.onlineTime', formattedTime)
                                }} 
                                isMobile={isMobile} 
                                disabled={!isTimeBased}
                            />
                        </div>
                    </div>
                </div>
            )
        }

        if (tabId === 'interval') {
            return (
                <div className="flex flex-col gap-8">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Mode', value: isIntervalBased ? 'Active' : 'Inactive', icon: Timer, tone: isIntervalBased ? 'mint' : 'rose' },
                            { label: 'Online', value: scheduleSettings.offlineTime1 || '01:00', icon: Clock, tone: 'cyan' },
                            { label: 'Offline', value: scheduleSettings.onlineTime1 || '00:05', icon: Calendar, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase">Interval Schedule</h3>
                            <button 
                                onClick={() => handleSettingChange('scheduleSettings.scheduleType', 1)}
                                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${isIntervalBased ? 'bg-[#00C8FF]/10 text-[#00C8FF]' : 'bg-[#1A1E2A] text-[#6B7A99]'}`}
                            >
                                {isIntervalBased ? 'Active Mode' : 'Set as Active'}
                            </button>
                        </div>
                        
                        <div className={gridClass}>
                            <InputControl 
                                label="Stay Online For (HH:mm)" 
                                type="time"
                                val={settings.scheduleSettings?.offlineTime1 || '01:00'} 
                                onChange={(v) => {
                                    const formattedTime = v.length === 5 ? `${v}:00` : v
                                    handleSettingChange('scheduleSettings.offlineTime1', formattedTime)
                                }} 
                                isMobile={isMobile} 
                                disabled={!isIntervalBased}
                            />
                            <InputControl 
                                label="Then Offline For (HH:mm)" 
                                type="time"
                                val={settings.scheduleSettings?.onlineTime1 || '00:05'} 
                                onChange={(v) => {
                                    const formattedTime = v.length === 5 ? `${v}:00` : v
                                    handleSettingChange('scheduleSettings.onlineTime1', formattedTime)
                                }} 
                                isMobile={isMobile} 
                                disabled={!isIntervalBased}
                            />
                        </div>
                    </div>
                </div>
            )
        }

        return null
    }

    return (
        <ResponsiveModalShell
            isOpen={isOpen}
            onClose={onClose}
            title="Schedule Settings"
            iggId={iggId}
            headerIcon={Calendar}
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

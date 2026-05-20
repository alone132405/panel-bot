'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Clock, Map, Mountain, Settings2, Users, Wheat } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { setNestedValue } from '@/lib/settingsMapper'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { ResponsiveModalShell, ToggleControl, StepperControl, InputControl, TabDef } from '@/components/ui/ResponsiveModalShell'

interface GatherModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

const TABS: TabDef[] = [
    { id: 'general', label: 'General', icon: Wheat },
    { id: 'targets', label: 'Targets', icon: Map },
    { id: 'advanced', label: 'Advanced', icon: Settings2 },
]

export default function GatherModal({ isOpen, onClose, iggId }: GatherModalProps) {
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
        const gatherSettings = settings.gatherSettings || {}

        if (tabId === 'general') {
            return (
                <div className="flex flex-col gap-8">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Gather', value: gatherSettings.gatherResources ? 'On' : 'Off', icon: Wheat, tone: 'mint' },
                            { label: 'Armies', value: Number(gatherSettings.maxArmysToSend || 0) || 'All', icon: Users, tone: 'cyan' },
                            { label: 'Gear', value: gatherSettings.useGatherGear ? 'On' : 'Off', icon: Settings2, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Core Settings</h3>
                        <div className={gridClass}>
                            <ToggleControl 
                                label="Gather Resources" 
                                checked={!!settings.gatherSettings?.gatherResources} 
                                onChange={(v) => handleSettingChange('gatherSettings.gatherResources', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Use Gathering Gear" 
                                checked={!!settings.gatherSettings?.useGatherGear} 
                                onChange={(v) => handleSettingChange('gatherSettings.useGatherGear', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Recall Camps Automatically" 
                                checked={settings.gatherSettings?.recallCamps ?? true} 
                                onChange={(v) => handleSettingChange('gatherSettings.recallCamps', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Target Higher Level Tiles First" 
                                checked={settings.gatherSettings?.targetHigherLevel ?? true} 
                                onChange={(v) => handleSettingChange('gatherSettings.targetHigherLevel', v)} 
                                isMobile={isMobile} 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Army Allocation</h3>
                        <div className={gridClass}>
                            <StepperControl 
                                label="Max Armies to Gather (0 for all)" 
                                val={Number(settings.gatherSettings?.maxArmysToSend || 0)} 
                                min={0} 
                                max={8} 
                                onChange={(v) => handleSettingChange('gatherSettings.maxArmysToSend', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Leave Spare Army" 
                                checked={settings.gatherSettings?.leaveSpareArmy ?? true} 
                                onChange={(v) => handleSettingChange('gatherSettings.leaveSpareArmy', v)} 
                                isMobile={isMobile} 
                            />
                            <StepperControl 
                                label="Spare Army Amount" 
                                val={Number(settings.gatherSettings?.spareArmyAmount || 2)} 
                                min={0} 
                                max={8} 
                                onChange={(v) => handleSettingChange('gatherSettings.spareArmyAmount', v)} 
                                isMobile={isMobile} 
                                disabled={!(settings.gatherSettings?.leaveSpareArmy ?? true)}
                            />
                        </div>
                    </div>
                </div>
            )
        }

        if (tabId === 'targets') {
            const types = [
                { label: 'Food', index: 0 },
                { label: 'Stone', index: 1 },
                { label: 'Wood', index: 2 },
                { label: 'Ore', index: 3 },
                { label: 'Gold', index: 4 },
                { label: 'Gems', index: 5 },
            ]
            const levels = [
                { label: 'Level 1', index: 0 },
                { label: 'Level 2', index: 1 },
                { label: 'Level 3', index: 2 },
                { label: 'Level 4', index: 3 },
                { label: 'Level 5', index: 4 },
                { label: 'Level 6', index: 5 },
            ]
            const selectedTypes = types.filter((type) => !!settings.gatherSettings?.typesToGather?.[type.index]).length
            const selectedLevels = levels.filter((level) => !!settings.gatherSettings?.levelToGather?.[level.index]).length

            return (
                <div className="flex flex-col gap-8">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Resources', value: `${selectedTypes}/6`, icon: Wheat, tone: 'mint' },
                            { label: 'Levels', value: `${selectedLevels}/6`, icon: Mountain, tone: 'cyan' },
                            { label: 'Gems Rule', value: gatherSettings.ignoreLevelForGems ? 'Ignore' : 'Normal', icon: Map, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Resource Types</h3>
                        <div className={gridClass}>
                            {types.map(t => {
                                const val = settings.gatherSettings?.typesToGather?.[t.index] ?? false
                                return (
                                    <ToggleControl 
                                        key={t.index}
                                        label={t.label} 
                                        checked={!!val} 
                                        onChange={(v) => handleSettingChange(`gatherSettings.typesToGather.${t.index}`, v)} 
                                        isMobile={isMobile} 
                                    />
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Tile Levels</h3>
                        <div className={gridClass}>
                            {levels.map(l => {
                                const val = settings.gatherSettings?.levelToGather?.[l.index] ?? false
                                return (
                                    <ToggleControl 
                                        key={l.index}
                                        label={l.label} 
                                        checked={!!val} 
                                        onChange={(v) => handleSettingChange(`gatherSettings.levelToGather.${l.index}`, v)} 
                                        isMobile={isMobile} 
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            )
        }

        if (tabId === 'advanced') {
            return (
                <div className="flex flex-col gap-8">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Clear Tiles', value: gatherSettings.clearTiles ? 'On' : 'Off', icon: Map, tone: 'mint' },
                            { label: 'Search', value: `${Number(gatherSettings.maxSearchArea || 2)}x`, icon: Mountain, tone: 'cyan' },
                            { label: 'Schedule', value: gatherSettings.useGatherSchedule ? 'On' : 'Off', icon: Clock, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Behavior Rules</h3>
                        <div className={gridClass}>
                            <ToggleControl 
                                label="Only Gather Clearable Tiles" 
                                checked={!!settings.gatherSettings?.clearTiles} 
                                onChange={(v) => handleSettingChange('gatherSettings.clearTiles', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Ignore Level Settings for Gems" 
                                checked={!!settings.gatherSettings?.ignoreLevelForGems} 
                                onChange={(v) => handleSettingChange('gatherSettings.ignoreLevelForGems', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Gather Lowest Amount First" 
                                checked={!!settings.gatherSettings?.gatherLowestResources} 
                                onChange={(v) => handleSettingChange('gatherSettings.gatherLowestResources', v)} 
                                isMobile={isMobile} 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Search Constraints</h3>
                        <div className={gridClass}>
                            <StepperControl 
                                label="Search Multiplier (Area)" 
                                val={Number(settings.gatherSettings?.maxSearchArea || 2)} 
                                min={1} max={20} 
                                onChange={(v) => handleSettingChange('gatherSettings.maxSearchArea', v)} 
                                isMobile={isMobile} 
                            />
                            <StepperControl 
                                label="Max Travel Time (Minutes)" 
                                val={Number(settings.gatherSettings?.maxWalkTime || 20)} 
                                min={1} max={180} 
                                onChange={(v) => handleSettingChange('gatherSettings.maxWalkTime', v)} 
                                isMobile={isMobile} 
                            />
                            <StepperControl 
                                label="Sending Delay (Seconds)" 
                                val={Number(settings.gatherSettings?.sendingDelay || 2)} 
                                min={1} max={60} 
                                onChange={(v) => handleSettingChange('gatherSettings.sendingDelay', v)} 
                                isMobile={isMobile} 
                            />
                            <StepperControl 
                                label="Minimum Tile Resources" 
                                val={Number(settings.gatherSettings?.tileMinimum || 100000)} 
                                min={0} max={99999999} 
                                onChange={(v) => handleSettingChange('gatherSettings.tileMinimum', v)} 
                                isMobile={isMobile} 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Scheduling</h3>
                        <div className={gridClass}>
                            <ToggleControl 
                                label="Enable Gather Schedule" 
                                checked={!!settings.gatherSettings?.useGatherSchedule} 
                                onChange={(v) => handleSettingChange('gatherSettings.useGatherSchedule', v)} 
                                isMobile={isMobile} 
                            />
                            <InputControl 
                                label="Start Time" 
                                type="time"
                                val={settings.gatherSettings?.gatherStartTime || '12:00:00'} 
                                onChange={(v) => {
                                    const formatted = v.length === 5 ? `${v}:00` : v
                                    handleSettingChange('gatherSettings.gatherStartTime', formatted)
                                }} 
                                disabled={!settings.gatherSettings?.useGatherSchedule}
                                isMobile={isMobile} 
                            />
                            <InputControl 
                                label="End Time" 
                                type="time"
                                val={settings.gatherSettings?.gatherEndTime || '20:00:00'} 
                                onChange={(v) => {
                                    const formatted = v.length === 5 ? `${v}:00` : v
                                    handleSettingChange('gatherSettings.gatherEndTime', formatted)
                                }} 
                                disabled={!settings.gatherSettings?.useGatherSchedule}
                                isMobile={isMobile} 
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
            title="Gather Settings"
            iggId={iggId}
            headerIcon={Wheat}
            tabs={TABS}
            loading={loading}
            saving={saving}
            statusLabel={saving ? 'Syncing...' : 'Auto-sync'}
            renderSectionContent={renderSectionContent}
        />
    )
}

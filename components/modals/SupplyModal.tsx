'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Backpack, Clock, Package, Truck, UserRound } from 'lucide-react'
import { getNestedValue, setNestedValue } from '@/lib/settingsMapper'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { ResponsiveModalShell, ToggleControl, StepperControl, InputControl, TabDef } from '@/components/ui/ResponsiveModalShell'

interface SupplyModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

const TABS: TabDef[] = [
    { id: 'general', label: 'Delivery', icon: Truck },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'bag', label: 'Bag Items', icon: Backpack },
]

const RESOURCE_NAMES = ['Food', 'Stone', 'Wood', 'Ore', 'Gold']

export default function SupplyModal({ isOpen, onClose, iggId }: SupplyModalProps) {
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

    const handleArrayChange = (arrayPath: string, index: number, value: any) => {
        const arr = [...(getNestedValue(settings, arrayPath) || [])]
        arr[index] = value
        handleSettingChange(arrayPath, arr)
    }

    const handleAmountChange = (arrayPath: string, index: number, v: string) => {
        const filtered = v.replace(/[^0-9]/g, '')
        if (filtered === '') {
            handleArrayChange(arrayPath, index, 0)
            return
        }
        let num = parseInt(filtered, 10)
        if (num > 4299999999) num = 4299999999
        handleArrayChange(arrayPath, index, num)
    }

    const renderSectionContent = (tabId: string, isMobile: boolean, isTablet: boolean) => {
        if (!settings) return null
        
        const gridClass = isMobile
            ? 'grid grid-cols-1 gap-1.5'
            : isTablet
                ? 'grid grid-cols-2 gap-2'
                : 'grid grid-cols-2 gap-3'
        const supplySettings = settings.supplySettings || {}

        if (tabId === 'general') {
            return (
                <div className="flex flex-col gap-8">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Target', value: supplySettings.playerToSend || 'Unset', icon: UserRound, tone: 'mint' },
                            { label: 'Travel', value: `${Number(supplySettings.maxTravelTime || 600)}s`, icon: Clock, tone: 'cyan' },
                            { label: 'Gear', value: supplySettings.speedGear ? 'On' : 'Off', icon: Truck, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Core Settings</h3>
                        <div className={gridClass}>
                            <InputControl 
                                label="Auto Send To (Name)" 
                                val={settings.supplySettings?.playerToSend === 'none' ? '' : (settings.supplySettings?.playerToSend ?? '')} 
                                onChange={(v) => {
                                    const filtered = v.replace(/[^a-zA-Z0-9 ]/g, '')
                                    handleSettingChange('supplySettings.playerToSend', filtered === '' ? 'none' : filtered)
                                }} 
                                isMobile={isMobile} 
                            />
                            <StepperControl 
                                label="Max Travel Time (Seconds)" 
                                val={Number(settings.supplySettings?.maxTravelTime || 600)} 
                                min={1} max={36000} 
                                onChange={(v) => handleSettingChange('supplySettings.maxTravelTime', v)} 
                                isMobile={isMobile} 
                            />
                            <InputControl 
                                label="Supply Speed (0.1 - 3)" 
                                type="number"
                                min={0.1}
                                max={3}
                                step={0.01}
                                val={String(settings.supplySettings?.supplySpeed ?? 0.1)} 
                                onChange={(v) => {
                                    let filtered = v.replace(/[^0-9.]/g, '')
                                    const parts = filtered.split('.')
                                    if (parts.length > 2) {
                                        filtered = parts[0] + '.' + parts.slice(1).join('').substring(0, 2)
                                    } else if (parts.length === 2 && parts[1].length > 2) {
                                        filtered = parts[0] + '.' + parts[1].substring(0, 2)
                                    }
                                    
                                    if (filtered === '' || filtered === '0' || filtered === '0.') {
                                        handleSettingChange('supplySettings.supplySpeed', filtered)
                                        return
                                    }
                                    
                                    const num = parseFloat(filtered)
                                    if (!isNaN(num) && num > 3) filtered = '3'
                                    
                                    handleSettingChange('supplySettings.supplySpeed', filtered)
                                }} 
                                onBlur={() => {
                                    const v = settings.supplySettings?.supplySpeed ?? 0.1
                                    const num = parseFloat(String(v))
                                    if (isNaN(num) || num < 0.1) {
                                        handleSettingChange('supplySettings.supplySpeed', 0.1)
                                    }
                                }}
                                isMobile={isMobile} 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Speed Gear</h3>
                        <div className={gridClass}>
                            <ToggleControl 
                                label="Use Speed Gear" 
                                checked={!!settings.supplySettings?.speedGear} 
                                onChange={(v) => handleSettingChange('supplySettings.speedGear', v)} 
                                isMobile={isMobile} 
                            />
                        </div>
                    </div>
                </div>
            )
        }

        if (tabId === 'inventory') {
            const selectedTypes = RESOURCE_NAMES.filter((_, index) => !!supplySettings.typesToSend?.[index]).length

            return (
                <div className="flex flex-col gap-6">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Inventory', value: supplySettings.sendResources ? 'On' : 'Off', icon: Package, tone: 'mint' },
                            { label: 'Resources', value: `${selectedTypes}/5`, icon: Truck, tone: 'cyan' },
                            { label: 'Speed', value: String(supplySettings.supplySpeed || 0.1), icon: Clock, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <ToggleControl 
                            label="Auto Send Resources" 
                            checked={!!settings.supplySettings?.sendResources} 
                            onChange={(v) => handleSettingChange('supplySettings.sendResources', v)} 
                            isMobile={isMobile} 
                        />
                    </div>
                    
                    <div className="space-y-4">
                        {RESOURCE_NAMES.map((name, i) => (
                            <div key={name} className="p-4 rounded-[24px] bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] flex flex-col gap-4">
                                <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.04)] pb-3">
                                    <ToggleControl 
                                        label={name} 
                                        checked={!!(settings.supplySettings?.typesToSend?.[i])} 
                                        onChange={(v) => handleArrayChange('supplySettings.typesToSend', i, v)} 
                                        isMobile={isMobile} 
                                    />
                                </div>
                                <div className={gridClass}>
                                    <InputControl 
                                        label="Reserved Amount" 
                                        type="number"
                                        min={0}
                                        max={4299999999}
                                        val={String(settings.supplySettings?.reservedRss?.[i] ?? 500000)} 
                                        onChange={(v) => handleAmountChange('supplySettings.reservedRss', i, v)} 
                                        isMobile={isMobile} 
                                    />
                                    <InputControl 
                                        label="Threshold" 
                                        type="number"
                                        min={0}
                                        max={4299999999}
                                        val={String(settings.supplySettings?.supplyMin?.[i] ?? 1000000)} 
                                        onChange={(v) => handleAmountChange('supplySettings.supplyMin', i, v)} 
                                        isMobile={isMobile} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        if (tabId === 'bag') {
            const selectedBagTypes = RESOURCE_NAMES.filter((_, index) => !!supplySettings.bagTypesToSend?.[index]).length

            return (
                <div className="flex flex-col gap-6">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Bag Send', value: supplySettings.useBagResource ? 'On' : 'Off', icon: Backpack, tone: 'mint' },
                            { label: 'Resources', value: `${selectedBagTypes}/5`, icon: Package, tone: 'cyan' },
                            { label: 'Target', value: supplySettings.playerToSend || 'Unset', icon: UserRound, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <ToggleControl 
                            label="Send Bag Resources" 
                            checked={!!settings.supplySettings?.useBagResource} 
                            onChange={(v) => handleSettingChange('supplySettings.useBagResource', v)} 
                            isMobile={isMobile} 
                        />
                    </div>
                    
                    <div className="space-y-4">
                        {RESOURCE_NAMES.map((name, i) => (
                            <div key={name} className="p-4 rounded-[24px] bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] flex flex-col gap-4">
                                <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.04)] pb-3">
                                    <ToggleControl 
                                        label={name} 
                                        checked={!!(settings.supplySettings?.bagTypesToSend?.[i])} 
                                        onChange={(v) => handleArrayChange('supplySettings.bagTypesToSend', i, v)} 
                                        isMobile={isMobile} 
                                    />
                                </div>
                                <div>
                                    <InputControl 
                                        label="Reserved Amount" 
                                        type="number"
                                        min={0}
                                        max={4299999999}
                                        val={String(settings.supplySettings?.reservedBagRss?.[i] ?? 100)} 
                                        onChange={(v) => handleAmountChange('supplySettings.reservedBagRss', i, v)} 
                                        isMobile={isMobile} 
                                    />
                                </div>
                            </div>
                        ))}
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
            title="Supply Settings"
            iggId={iggId}
            headerIcon={Package}
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

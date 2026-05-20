'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Ban, Coins, Gem, Ship, Star } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { setNestedValue } from '@/lib/settingsMapper'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { ResponsiveModalShell, ToggleControl, StepperControl, TabDef } from '@/components/ui/ResponsiveModalShell'

interface CargoShipModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

const TABS: TabDef[] = [
    { id: 'general', label: 'General', icon: Ship },
    { id: 'pay', label: 'Pay Resources', icon: Coins },
    { id: 'ignore', label: 'Ignore Rewards', icon: Ban },
]

export default function CargoShipModal({ isOpen, onClose, iggId }: CargoShipModalProps) {
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
        const cargoSettings = settings.cargoShipSettings || {}

        if (tabId === 'general') {
            return (
                <div className="flex flex-col gap-8">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Trading', value: cargoSettings.allowTrading ? 'On' : 'Off', icon: Ship, tone: 'mint' },
                            { label: 'Min Stars', value: Number(cargoSettings.exchangeMinQuality || 1), icon: Star, tone: 'gold' },
                            { label: 'Bag Pay', value: cargoSettings.useRssFromBagIfNeeded ? 'On' : 'Off', icon: Coins, tone: 'cyan' },
                        ]}
                    />

                    <div className="space-y-4">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Core Settings</h3>
                        <div className={gridClass}>
                            <ToggleControl 
                                label="Exchange Cargo Ship Items" 
                                checked={!!settings.cargoShipSettings?.allowTrading} 
                                onChange={(v) => handleSettingChange('cargoShipSettings.allowTrading', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Only Trade for Resource Items" 
                                checked={!!settings.cargoShipSettings?.exchangeRssItemOnly} 
                                onChange={(v) => handleSettingChange('cargoShipSettings.exchangeRssItemOnly', v)} 
                                isMobile={isMobile} 
                            />
                            <ToggleControl 
                                label="Use resources from bag if needed" 
                                checked={!!settings.cargoShipSettings?.useRssFromBagIfNeeded} 
                                onChange={(v) => handleSettingChange('cargoShipSettings.useRssFromBagIfNeeded', v)} 
                                isMobile={isMobile} 
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-6">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Quality Control</h3>
                        <div className={gridClass}>
                            <StepperControl 
                                label="Minimum Item Stars" 
                                val={Number(settings.cargoShipSettings?.exchangeMinQuality || 1)} 
                                min={1} max={3} 
                                onChange={(v) => handleSettingChange('cargoShipSettings.exchangeMinQuality', v)} 
                                isMobile={isMobile} 
                            />
                        </div>
                    </div>
                </div>
            )
        }

        if (tabId === 'pay') {
            const payTypes = [
                { label: 'Food', path: 'cargoShipSettings.tradeFood' },
                { label: 'Stone', path: 'cargoShipSettings.tradeStone' },
                { label: 'Wood', path: 'cargoShipSettings.tradeWood' },
                { label: 'Ore', path: 'cargoShipSettings.tradeOre' },
                { label: 'Gold', path: 'cargoShipSettings.tradeGold' },
            ]
            const selectedPayTypes = payTypes.filter((type) => cargoSettings[type.path.split('.')[1]] ?? true).length

            return (
                <div className="flex flex-col gap-8">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Pay Types', value: `${selectedPayTypes}/5`, icon: Coins, tone: 'mint' },
                            { label: 'Rss Only', value: cargoSettings.exchangeRssItemOnly ? 'On' : 'Off', icon: Gem, tone: 'cyan' },
                            { label: 'Trading', value: cargoSettings.allowTrading ? 'On' : 'Off', icon: Ship, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Allowed to Pay</h3>
                        <div className={gridClass}>
                            {payTypes.map(p => (
                                <ToggleControl 
                                    key={p.path}
                                    label={p.label} 
                                    checked={settings.cargoShipSettings?.[p.path.split('.')[1]] ?? true} 
                                    onChange={(v) => handleSettingChange(p.path, v)} 
                                    isMobile={isMobile} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )
        }

        if (tabId === 'ignore') {
            const ignoreTypes = [
                { label: 'Food', path: 'cargoShipSettings.ignoreFood' },
                { label: 'Stone', path: 'cargoShipSettings.ignoreStone' },
                { label: 'Wood', path: 'cargoShipSettings.ignoreWood' },
                { label: 'Ore', path: 'cargoShipSettings.ignoreOre' },
                { label: 'Gold', path: 'cargoShipSettings.ignoreGold' },
                { label: 'Anima', path: 'cargoShipSettings.ignoreAnima' },
                { label: 'Lunite', path: 'cargoShipSettings.ignoreLunite' },
                { label: 'Speed-Ups', path: 'cargoShipSettings.ignoreSpeedUp' },
            ]
            const ignoredTypes = ignoreTypes.filter((type) => !!cargoSettings[type.path.split('.')[1]]).length

            return (
                <div className="flex flex-col gap-8">
                    <ModalSummaryGrid
                        items={[
                            { label: 'Ignored', value: `${ignoredTypes}/8`, icon: Ban, tone: 'rose' },
                            { label: 'Rewards', value: ignoredTypes ? 'Filtered' : 'All', icon: Gem, tone: 'cyan' },
                            { label: 'Trading', value: cargoSettings.allowTrading ? 'On' : 'Off', icon: Ship, tone: 'gold' },
                        ]}
                    />

                    <div className="space-y-4">
                        <h3 className="text-[13px] font-semibold text-[#6B7A99] tracking-widest uppercase mb-4">Do Not Accept Rewards</h3>
                        <div className={gridClass}>
                            {ignoreTypes.map(p => (
                                <ToggleControl 
                                    key={p.path}
                                    label={p.label} 
                                    checked={!!settings.cargoShipSettings?.[p.path.split('.')[1]]} 
                                    onChange={(v) => handleSettingChange(p.path, v)} 
                                    isMobile={isMobile} 
                                />
                            ))}
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
            title="Cargo Ship Settings"
            iggId={iggId}
            headerIcon={Ship}
            tabs={TABS}
            loading={loading}
            saving={saving}
            statusLabel={saving ? 'Syncing...' : 'Auto-sync'}
            renderSectionContent={renderSectionContent}
        />
    )
}

'use client'

import { Clock, Loader2, RefreshCw, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
import { ModalSummaryGrid } from '@/components/ui/ModalSummaryGrid'
import { Checkbox } from '@/components/ui/Checkbox'
import { TacticalSelect } from '@/components/ui/TacticalSelect'
import { SettingInfoLabel } from '@/components/ui/SettingInfoLabel'

interface GearsModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function GearsModal({ isOpen, onClose, iggId }: GearsModalProps) {
    const [fullSettings, setFullSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [saving, setSaving] = useState(false)

    // Gear settings
    const [autoSwitchGear, setAutoSwitchGear] = useState(false)
    const [idleGearTime, setIdleGearTime] = useState(300)
    const [idleGearSet, setIdleGearSet] = useState(0)

    // Idle Gear options
    const idleGearOptions = [
        { value: 0, label: 'None' },
        { value: 1, label: 'Familiars' },
        { value: 2, label: 'Gathering' },
        { value: 3, label: 'Research' },
        { value: 4, label: 'Building' },
        { value: 5, label: 'Training' },
        { value: 6, label: 'Hunting' },
        { value: 7, label: 'Lunar Gear' },
        { value: 8, label: 'Food Boost' },
        { value: 9, label: 'Stone Boost' },
        { value: 10, label: 'Wood Boost' },
        { value: 11, label: 'Ore Boost' },
        { value: 12, label: 'Gold Boost' },
        { value: 13, label: 'Travel Boost' },
    ]

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
                setFullSettings(data)

                if (data.gearSettings) {
                    setAutoSwitchGear(data.gearSettings.autoSwitchGear || false)
                    setIdleGearTime(data.gearSettings.idleGearTime || 300)
                    setIdleGearSet(data.gearSettings.idleGearSet || 0)
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
        if (!iggId || !fullSettings) return

        setSaving(true)
        try {
            const updatedSettings = {
                ...fullSettings,
                gearSettings: {
                    ...fullSettings.gearSettings,
                    autoSwitchGear,
                    idleGearTime,
                    idleGearSet,
                }
            }

            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings),
            })

            if (res.ok) {
                setFullSettings(updatedSettings)
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

    const idleGearLabel = idleGearOptions.find((option) => option.value === idleGearSet)?.label || 'None'

    if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Gear Settings"
                iggId={iggId}
                icon={ShieldCheck}
                iconColor="#64748b"
                iconBg="rgba(100,116,139,0.15)"
                iconBorder="rgba(100,116,139,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Gear Settings"
            iggId={iggId}
            icon={ShieldCheck}
            iconColor="#64748b"
            iconBg="rgba(100,116,139,0.15)"
            iconBorder="rgba(100,116,139,0.3)"
            saving={saving}
            onSave={saveSettings}
            saveLabel="Save Changes"
            statusLabel={saving ? 'Saving...' : 'Manual save. Use Apply Changes to run the script.'}
            maxWidth="860px"
        >
            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#00FFB2]" />
                                </div>
                            ) : (
                                <div className="w-full space-y-6">
                                    <ModalSummaryGrid
                                        items={[
                                            { label: 'Switch', value: autoSwitchGear ? 'On' : 'Off', icon: RefreshCw, tone: 'cyan' },
                                            { label: 'Idle Gear', value: idleGearLabel, icon: ShieldCheck, tone: 'mint' },
                                            { label: 'Idle Time', value: `${idleGearTime}s`, icon: Clock, tone: 'gold' },
                                        ]}
                                    />

                                    {/* Gear Settings Grid */}
                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                        {/* Auto Switch Gears */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] hover:bg-[#161626] transition-colors">
                                            <label className="flex items-center justify-between w-full cursor-pointer">
                                                <SettingInfoLabel label="Auto Switch Gears" className="text-sm text-gray-300" />
                                                <Checkbox checked={autoSwitchGear} onChange={setAutoSwitchGear} />
                                            </label>
                                        </div>

                                        {/* Idle Gear Time */}
                                        <div className="flex min-w-0 flex-col items-start justify-between gap-3 p-4 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] hover:bg-[#161626] transition-colors md:flex-row md:items-center">
                                            <SettingInfoLabel label="Idle Gear Time" className="text-sm text-gray-300" />
                                            <input
                                                type="number"
                                                value={idleGearTime ?? ''}
                                                min={10}
                                                max={3600}
                                                step="1"
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? 0 : Math.floor(Number(e.target.value))
                                                    setIdleGearTime(Math.min(3600, Math.max(10, val)))
                                                }}
                                                onBlur={(e) => {
                                                    const val = e.target.value === '' ? 0 : Math.floor(Number(e.target.value))
                                                    setIdleGearTime(Math.min(3600, Math.max(10, val)))
                                                }}
                                                className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-[#07070E]/50 border border-[rgba(123,94,255,0.2)] rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#7B5EFF]/50 disabled:opacity-50"
                                            />
                                        </div>

                                        {/* Idle Gear Dropdown */}
                                        <div className="flex min-w-0 flex-col items-start justify-between gap-3 p-4 rounded-xl bg-[#0F0F1A] border border-[rgba(123,94,255,0.08)] hover:bg-[#161626] transition-colors md:flex-row md:items-center">
                                            <SettingInfoLabel label="Idle Gear" className="text-sm text-gray-300" />
                                            <TacticalSelect
                                                value={String(idleGearSet)}
                                                onChange={(v) => setIdleGearSet(Number(v))}
                                                options={idleGearOptions.map(o => ({ value: String(o.value), label: o.label }))}
                                                className="w-full md:w-44"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}

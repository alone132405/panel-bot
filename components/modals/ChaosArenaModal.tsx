'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Swords } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'
import { useDebounce } from '@/hooks/useDebounce'

interface ChaosArenaModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

interface Mission {
    name: string
    enabled: boolean
}

export default function ChaosArenaModal({ isOpen, onClose, iggId }: ChaosArenaModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Chaos Arena settings
    const [autoEnterArena, setAutoEnterArena] = useState(false)
    const [completeMissions, setCompleteMissions] = useState(false)

    // Missions list - mapped to AutoMission keys in JSON
    const missionKeys = ['GatherLV3Above', 'GatherLv4Above', 'GatherLV5Above', 'HuntLV3Above', 'HuntLV4Above', 'HuntLV5Above']
    const [missions, setMissions] = useState<Mission[]>([
        { name: 'Clear all remaining resources at Lv 1 and above Resource Tiles in the Chaos Arena', enabled: false },
        { name: 'Clear all remaining resources in Lv 4 and above Resource Tiles in the Chaos Arena', enabled: false },
        { name: 'Clear all remaining resources in Lv 5 and above Resource Tiles in the Chaos Arena', enabled: false },
        { name: 'Kill Lv 3 and above Monsters in the Chaos Arena', enabled: false },
        { name: 'Kill Lv 4 and above Monsters in the Chaos Arena', enabled: false },
        { name: 'Kill Lv 5 and above Monsters in the Chaos Arena', enabled: false },
    ])

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
                setSettings(data)

                if (data.eventSettings?.Chaos) {
                    const chaos = data.eventSettings.Chaos
                    setAutoEnterArena(chaos.AutoJoinArena ?? false)
                    setCompleteMissions(chaos.AutoCompleteMissions ?? false)

                    // Map missions from AutoMission object
                    if (chaos.AutoMission) {
                        const updatedMissions = missions.map((mission, index) => ({
                            ...mission,
                            enabled: chaos.AutoMission[missionKeys[index]] ?? false
                        }))
                        setMissions(updatedMissions)
                    }
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

    const saveSetting = async (path: string, value: any) => {
        if (!iggId) return

        setSaving(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, value }),
            })

            if (!res.ok) {
                toast.error('Failed to save setting')
            }
        } catch (error) {
            toast.error('Error saving setting')
        } finally {
            setSaving(false)
        }
    }

    const debouncedSave = useDebounce(saveSetting, 500)

    // Helper function to update settings object
    const updateSettingsObject = (path: string, value: any) => {
        const keys = path.split('.')
        const newSettings = { ...settings }
        let current: any = newSettings
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {}
            current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = value
        setSettings(newSettings)
    }

    const updateMission = (index: number, enabled: boolean) => {
        const updatedMissions = [...missions]
        updatedMissions[index] = { ...updatedMissions[index], enabled }
        setMissions(updatedMissions)

        // Update settings object
        const missionKey = missionKeys[index]
        updateSettingsObject(`eventSettings.Chaos.AutoMission.${missionKey}`, enabled)
    }

    if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Chaos Arena"
                iggId={iggId}
                icon={Swords}
                iconColor="#EF4444"
                iconBg="rgba(239,68,68,0.15)"
                iconBorder="rgba(239,68,68,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Chaos Arena"
            iggId={iggId}
            icon={Swords}
            iconColor="#EF4444"
            iconBg="rgba(239,68,68,0.15)"
            iconBorder="rgba(239,68,68,0.3)"
            maxWidth="860px"
        >
            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                                </div>
                            ) : (
                                <div className="w-full space-y-6">
                                    {/* Settings Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Settings</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={autoEnterArena}
                                                        onChange={(e) => {
                                                            setAutoEnterArena(e.target.checked)
                                                            updateSettingsObject('eventSettings.Chaos.AutoJoinArena', e.target.checked)
                                                        }}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-gray-300">Auto Enter Arena</span>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={completeMissions}
                                                        onChange={(e) => {
                                                            setCompleteMissions(e.target.checked)
                                                            updateSettingsObject('eventSettings.Chaos.AutoCompleteMissions', e.target.checked)
                                                        }}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-gray-300">Complete Missions</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Missions Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Missions</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {missions.map((mission, index) => (
                                                <label
                                                    key={index}
                                                    className="flex items-start gap-3 p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={mission.enabled}
                                                        onChange={(e) => updateMission(index, e.target.checked)}
                                                        className="w-5 h-5 mt-0.5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-gray-300 flex-1">{mission.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}
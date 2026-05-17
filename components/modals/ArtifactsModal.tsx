'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Gem, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'

interface ArtifactsModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

export default function ArtifactsModal({ isOpen, onClose, iggId }: ArtifactsModalProps) {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Artifacts settings - maps to artifactSettings in settings.json
    const [appraiseArtifacts, setAppraiseArtifacts] = useState(false)
    const [collectFreeChest, setCollectFreeChest] = useState(false)
    const [collectChest, setCollectChest] = useState(false)
    const [collectWeeklyChallenge, setCollectWeeklyChallenge] = useState(false)

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

                if (data.artifactSettings) {
                    setAppraiseArtifacts(data.artifactSettings.appraiseArtifacts ?? false)
                    setCollectFreeChest(data.artifactSettings.collectFreeChest ?? false)
                    setCollectChest(data.artifactSettings.collectChest ?? false)
                    setCollectWeeklyChallenge(data.artifactSettings.collectWeeklyChallenge ?? false)
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
        if (!iggId || !settings) return

        setSaving(true)
        try {
            const updatedSettings = {
                ...settings,
                artifactSettings: {
                    ...settings.artifactSettings,
                    appraiseArtifacts,
                    collectFreeChest,
                    collectChest,
                    collectWeeklyChallenge,
                }
            }

            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings),
            })

            if (res.ok) {
                toast.success('Settings saved successfully')
                onClose()
                setSettings(updatedSettings)
            } else {
                toast.error('Failed to save settings')
            }
        } catch (error) {
            toast.error('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    if (!iggId) {
        return (
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Artifacts"
                iggId={iggId}
                icon={Gem}
                iconColor="#8B5CF6"
                iconBg="rgba(139,92,246,0.15)"
                iconBorder="rgba(139,92,246,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Artifacts"
            iggId={iggId}
            icon={Gem}
            iconColor="#8B5CF6"
            iconBg="rgba(139,92,246,0.15)"
            iconBorder="rgba(139,92,246,0.3)"
            saving={saving}
            onSave={saveSettings}
            maxWidth="860px"
        >
            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                                </div>
                            ) : (
                                <div className="w-full space-y-6">
                                    {/* Settings Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-base sm:text-lg font-bold text-white">Settings</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { label: 'Appraise Artifacts', value: appraiseArtifacts, setter: setAppraiseArtifacts },
                                                { label: 'Collect Free Artifact Chests', value: collectFreeChest, setter: setCollectFreeChest },
                                                { label: 'Collect Artifact Chests (using coins)', value: collectChest, setter: setCollectChest },
                                                { label: 'Collect Weekly Challenge Rewards', value: collectWeeklyChallenge, setter: setCollectWeeklyChallenge },
                                            ].map((option, index) => (
                                                <label key={index} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={option.value}
                                                        onChange={(e) => option.setter(e.target.checked)}
                                                        className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                    />
                                                    <span className="text-sm text-white">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}
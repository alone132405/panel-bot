'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
    Settings,
    Shield,
    Package,
    Wheat,
    Users,
    Globe,
    Crown,
    Ship,
    Coins,
    Building,
    FlaskConical,
    Swords,
    Target,
    Sparkles,
    PawPrint,
    ShieldCheck,
    Calendar,
    Trophy,
    ChevronRight,
    Loader2,
    Clock
} from 'lucide-react'
import { useSocket } from '@/hooks/useSocket'
import SettingsModal from '@/components/modals/SettingsModal'
import ProtectionModal from '@/components/modals/ProtectionModal'
import SupplyModal from '@/components/modals/SupplyModal'
import GatherModal from '@/components/modals/GatherModal'
import MarchesModal from '@/components/modals/MarchesModal'
import RealmModal from '@/components/modals/RealmModal'
import HeroesModal from '@/components/modals/HeroesModal'
import CargoShipModal from '@/components/modals/CargoShipModal'
import GemsCoinsModal from '@/components/modals/GemsCoinsModal'
import ConstructionModal from '@/components/modals/ConstructionModal'
import ResearchModal from '@/components/modals/ResearchModal'
import MilitaryModal from '@/components/modals/MilitaryModal'
import HuntingModal from '@/components/modals/HuntingModal'
import ArtifactsModal from '@/components/modals/ArtifactsModal'
import PetsModal from '@/components/modals/PetsModal'
import GuildFestModal from '@/components/modals/GuildFestModal'
import ScheduleModal from '@/components/modals/ScheduleModal'
import ChaosArenaModal from '@/components/modals/ChaosArenaModal'
import GearsModal from '@/components/modals/GearsModal'
import IggIdSelector from '@/components/settings/IggIdSelector'

interface SettingCategory {
    id: string
    name: string
    description: string
    icon: any
    gradient: string
}

export default function SettingsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false)
    const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false)
    const [isGatherModalOpen, setIsGatherModalOpen] = useState(false)
    const [isMarchesModalOpen, setIsMarchesModalOpen] = useState(false)
    const [isRealmModalOpen, setIsRealmModalOpen] = useState(false)
    const [isHeroesModalOpen, setIsHeroesModalOpen] = useState(false)
    const [isCargoShipModalOpen, setIsCargoShipModalOpen] = useState(false)
    const [isGemsCoinsModalOpen, setIsGemsCoinsModalOpen] = useState(false)
    const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false)
    const [isResearchModalOpen, setIsResearchModalOpen] = useState(false)
    const [isMilitaryModalOpen, setIsMilitaryModalOpen] = useState(false)
    const [isHuntingModalOpen, setIsHuntingModalOpen] = useState(false)
    const [isArtifactsModalOpen, setIsArtifactsModalOpen] = useState(false)
    const [isPetsModalOpen, setIsPetsModalOpen] = useState(false)
    const [isGuildFestModalOpen, setIsGuildFestModalOpen] = useState(false)
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [isChaosArenaModalOpen, setIsChaosArenaModalOpen] = useState(false)
    const [isGearsModalOpen, setIsGearsModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<SettingCategory | null>(null)
    const [selectedIggId, setSelectedIggId] = useState<string | null>(null)
    const [applying, setApplying] = useState(false)
    const [queuePosition, setQueuePosition] = useState(0)
    const [cooldown, setCooldown] = useState(0)
    const { queueStatus, automationStatus, isConnected } = useSocket(selectedIggId || undefined)

    useEffect(() => {
        console.log('SettingsPage: mounted/updated. IGG ID:', selectedIggId, 'Socket Connected:', isConnected)
    }, [selectedIggId, isConnected])

    // Load cooldown from local storage
    useEffect(() => {
        if (!selectedIggId) return

        const checkCooldown = () => {
            const savedExpiry = localStorage.getItem(`automation_cooldown_settings_${selectedIggId}`)
            if (savedExpiry) {
                const expiryTime = parseInt(savedExpiry)
                const now = Date.now()
                const remaining = Math.ceil((expiryTime - now) / 1000)

                if (remaining > 0) {
                    setCooldown(remaining)
                } else {
                    localStorage.removeItem(`automation_cooldown_settings_${selectedIggId}`)
                    setCooldown(0)
                }
            } else {
                setCooldown(0)
            }
        }

        checkCooldown()
        const interval = setInterval(checkCooldown, 1000)
        return () => clearInterval(interval)
    }, [selectedIggId])

    // Update queue position and status from socket
    useEffect(() => {
        if (!selectedIggId || !queueStatus) {
            if (!applying) setQueuePosition(0) // Only reset if not locally "applying" (keep spinner if just clicked)
            return
        }

        const index = queueStatus.queuedIggIds.indexOf(selectedIggId)
        if (index !== -1) {
            // User is in queue
            // If index is 0 and isRunning is true, they are being processed
            // But we actually want to show "Applying..." in that case, handled by 'applying' state usually,
            // or we can derive it here.

            // To match User 2 requirement: "waiting in queue" vs "applying changes"
            if (index === 0 && queueStatus.isRunning) {
                // Currently processing this user
                setApplying(true) // Force applying state to show spinner
                setQueuePosition(0) // 0 means "current/processing" in our UI logic usually
            } else {
                // Waiting in queue
                setApplying(true) // Keep button disabled/showing status
                setQueuePosition(index + (queueStatus.isRunning ? 0 : 1)) // If running, 0 is active, so index 1 is pos 1? 
                // Actually: queueStatus.queuedIggIds includes the running one if running?
                // Let's check api logic: queue includes all.
                // If running, queue[0] is the running one.
                // So index 0 = running. Index 1 = waiting #1.
                // If NOT running, index 0 = waiting #1.

                // Let's simplify:
                // If index == 0 && queueStatus.isRunning -> Processing
                // Else -> Position = index (if running) or index + 1 (if not running)?
                // Actually queue array is just the list. 
                // broadcastQueueStatus sends entire queue.
                // processQueue: "item = queue[0]... broadcast... run... shift"
                // So queue[0] IS the one running if isRunning=true.

                if (queueStatus.isRunning) {
                    setQueuePosition(index) // 0 means running
                } else {
                    setQueuePosition(index + 1)
                }
            }
        } else {
            // Not in queue
            if (cooldown > 0) {
                setApplying(false)
            } else {
                // Only turn off applying if we think we are done (handled by automationStatus or local timeout? 
                // Actually fire-and-forget means we stop "applying" immediately after API return?
                // No, implementation plan said: "User 2 clicks apply... User 2 should automtically update to Applying..."
                // So we should let socket state drive "applying" variable essentially.
                if (queueStatus.queuedIggIds.length > 0) {
                    // We are not in queue, but queue exists? We are just idle.
                    setApplying(false)
                    setQueuePosition(0)
                }
            }
        }
    }, [queueStatus, selectedIggId])

    // Handle completion via socket event to clear state if needed
    useEffect(() => {
        console.log('SettingsPage: automationStatus updated:', automationStatus)
        if (automationStatus?.status === 'completed' || automationStatus?.status === 'error') {
            console.log('SettingsPage: Automation finished with status:', automationStatus.status)
            setApplying(false)
            setQueuePosition(0)
            if (automationStatus.status === 'completed') {
                console.log('SettingsPage: Triggering success toast')
                toast.success('Changes applied successfully!', { duration: 5000 })
            } else {
                console.log('SettingsPage: Triggering error toast')
                toast.error(automationStatus.message || 'Automation failed')
            }
        }
    }, [automationStatus])

    const handleApplyChanges = async () => {
        if (!selectedIggId) {
            toast.error('Please select an IGG ID first')
            return
        }

        if (cooldown > 0) {
            toast.warning(`Please wait ${Math.ceil(cooldown / 60)} minutes before applying changes again.`)
            return
        }

        setApplying(true)

        try {
            const res = await fetch('/api/automation/apply-changes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ iggId: selectedIggId }),
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Request sent to queue!')
                // Set cooldown
                const expiry = Date.now() + 5 * 60 * 1000 // 5 minutes
                localStorage.setItem(`automation_cooldown_settings_${selectedIggId}`, expiry.toString())
                setCooldown(300)
            } else {
                toast.error(data.error || 'Failed to apply changes')
                setApplying(false)
            }
        } catch (error: any) {
            toast.error(error.message || 'Error applying changes')
            setApplying(false)
        }
    }

    const formatCooldown = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const categories: SettingCategory[] = [
        {
            id: 'general',
            name: 'General',
            description: 'Basic bot configuration and automation settings',
            icon: Settings,
            gradient: 'from-primary-600 to-primary-700',
        },
        {
            id: 'protection',
            name: 'Protection',
            description: 'Shield management and defense automation',
            icon: Shield,
            gradient: 'from-blue-600 to-blue-700',
        },
        {
            id: 'supply',
            name: 'Supply',
            description: 'Resource supply and distribution settings',
            icon: Package,
            gradient: 'from-orange-600 to-orange-700',
        },
        {
            id: 'gather',
            name: 'Gather',
            description: 'Auto-gather resources and tile management',
            icon: Wheat,
            gradient: 'from-accent-emerald to-emerald-700',
        },
        {
            id: 'marches',
            name: 'Marches',
            description: 'March formation and troop deployment',
            icon: Users,
            gradient: 'from-red-600 to-red-700',
        },
        {
            id: 'realm',
            name: 'Realm',
            description: 'Kingdom events and realm activities',
            icon: Globe,
            gradient: 'from-accent-purple to-purple-700',
        },
        {
            id: 'heroes',
            name: 'Heroes',
            description: 'Hero management and skill upgrades',
            icon: Crown,
            gradient: 'from-yellow-600 to-yellow-700',
        },
        {
            id: 'cargo-ship',
            name: 'Cargo Ship',
            description: 'Trading ship and cargo management',
            icon: Ship,
            gradient: 'from-accent-cyan to-cyan-700',
        },
        {
            id: 'gems-coins',
            name: 'Gems/Coins',
            description: 'Currency management and spending limits',
            icon: Coins,
            gradient: 'from-amber-600 to-amber-700',
        },
        {
            id: 'construction',
            name: 'Construction',
            description: 'Building upgrades and construction queue',
            icon: Building,
            gradient: 'from-gray-600 to-gray-700',
        },
        {
            id: 'research',
            name: 'Research',
            description: 'Technology research and academy settings',
            icon: FlaskConical,
            gradient: 'from-indigo-600 to-indigo-700',
        },
        {
            id: 'military',
            name: 'Military',
            description: 'Troop training and military operations',
            icon: Swords,
            gradient: 'from-rose-600 to-rose-700',
        },
        {
            id: 'hunting',
            name: 'Hunting',
            description: 'Monster hunting and rewards collection',
            icon: Target,
            gradient: 'from-green-600 to-green-700',
        },
        {
            id: 'artifacts',
            name: 'Artifacts',
            description: 'Artifact enhancement and management',
            icon: Sparkles,
            gradient: 'from-pink-600 to-pink-700',
        },
        {
            id: 'pets',
            name: 'Pets',
            description: 'Pet care and familiar upgrades',
            icon: PawPrint,
            gradient: 'from-violet-600 to-violet-700',
        },
        {
            id: 'guild-fest',
            name: 'Guild Fest',
            description: 'Guild festival missions and rewards',
            icon: Trophy,
            gradient: 'from-yellow-600 to-yellow-700',
        },
        {
            id: 'chaos-arena',
            name: 'Chaos Arena',
            description: 'Arena battles and mission completion',
            icon: Swords,
            gradient: 'from-red-600 to-red-700',
        },
        {
            id: 'gears',
            name: 'Gears',
            description: 'Equipment crafting and gear upgrades',
            icon: ShieldCheck,
            gradient: 'from-teal-600 to-teal-700',
        },
        {
            id: 'schedule',
            name: 'Schedule',
            description: 'Task scheduling and automation timing',
            icon: Calendar,
            gradient: 'from-slate-600 to-slate-700',
        },
    ]

    const handleCategoryClick = (category: SettingCategory) => {
        setSelectedCategory(category)

        if (category.id === 'general') {
            setIsModalOpen(true)
        } else if (category.id === 'protection') {
            setIsProtectionModalOpen(true)
        } else if (category.id === 'supply') {
            setIsSupplyModalOpen(true)
        } else if (category.id === 'gather') {
            setIsGatherModalOpen(true)
        } else if (category.id === 'marches') {
            setIsMarchesModalOpen(true)
        } else if (category.id === 'realm') {
            setIsRealmModalOpen(true)
        } else if (category.id === 'heroes') {
            setIsHeroesModalOpen(true)
        } else if (category.id === 'cargo-ship') {
            setIsCargoShipModalOpen(true)
        } else if (category.id === 'gems-coins') {
            setIsGemsCoinsModalOpen(true)
        } else if (category.id === 'construction') {
            setIsConstructionModalOpen(true)
        } else if (category.id === 'research') {
            setIsResearchModalOpen(true)
        } else if (category.id === 'military') {
            setIsMilitaryModalOpen(true)
        } else if (category.id === 'hunting') {
            setIsHuntingModalOpen(true)
        } else if (category.id === 'artifacts') {
            setIsArtifactsModalOpen(true)
        } else if (category.id === 'pets') {
            setIsPetsModalOpen(true)
        } else if (category.id === 'guild-fest') {
            setIsGuildFestModalOpen(true)
        } else if (category.id === 'chaos-arena') {
            setIsChaosArenaModalOpen(true)
        } else if (category.id === 'schedule') {
            setIsScheduleModalOpen(true)
        } else if (category.id === 'gears') {
            setIsGearsModalOpen(true)
        } else {
            // Other categories can be implemented later
            console.log('Category clicked:', category.id)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    return (
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header with IGG ID Selector */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Bot Settings</h1>
                    <p className="text-sm sm:text-base text-gray-400">Configure your bot automation and preferences</p>
                </div>
                <div className="w-full md:w-80">
                    <IggIdSelector
                        selectedIggId={selectedIggId}
                        onSelect={setSelectedIggId}
                    />
                </div>
            </div>

            {/* Settings Categories Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
            >
                {categories.map((category) => {
                    const Icon = category.icon

                    return (
                        <motion.div
                            key={category.id}
                            variants={itemVariants}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCategoryClick(category)}
                            className="glass-card p-5 cursor-pointer group relative overflow-hidden"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                            <div className="relative">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gradient transition-all">
                                    {category.name}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                                    {category.description}
                                </p>

                                {/* Arrow */}
                                <div className="flex items-center gap-1 text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Configure</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Apply Changes Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
            >
                <button
                    onClick={handleApplyChanges}
                    disabled={applying || !selectedIggId || cooldown > 0}
                    className="btn-primary px-12 py-4 text-lg flex items-center gap-3 shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {applying ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            {automationStatus?.status === 'waiting'
                                ? 'Waiting for RDP disconnect...'
                                : queuePosition > 0
                                    ? `Queue #${queuePosition}`
                                    : 'Applying Changes...'}
                        </>
                    ) : cooldown > 0 ? (
                        <>
                            <Clock className="w-6 h-6" />
                            Wait {formatCooldown(cooldown)}
                        </>
                    ) : (
                        <>
                            <Settings className="w-6 h-6" />
                            Apply Changes
                        </>
                    )}
                </button>
            </motion.div>

            {/* Info Card */}
            <div className="glass-card p-6 bg-primary-500/5 border-primary-500/20">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Settings className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Quick Tip</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Click on any category card to configure specific settings. Changes are saved automatically and synced with your bot configuration files in real-time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {selectedCategory && (
                <SettingsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    categoryName={selectedCategory.name}
                    iggId={selectedIggId}
                />
            )}

            {/* Protection Modal */}
            <ProtectionModal
                isOpen={isProtectionModalOpen}
                onClose={() => setIsProtectionModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Supply Modal */}
            <SupplyModal
                isOpen={isSupplyModalOpen}
                onClose={() => setIsSupplyModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Gather Modal */}
            <GatherModal
                isOpen={isGatherModalOpen}
                onClose={() => setIsGatherModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Marches Modal */}
            <MarchesModal
                isOpen={isMarchesModalOpen}
                onClose={() => setIsMarchesModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Realm Modal */}
            <RealmModal
                isOpen={isRealmModalOpen}
                onClose={() => setIsRealmModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Heroes Modal */}
            <HeroesModal
                isOpen={isHeroesModalOpen}
                onClose={() => setIsHeroesModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Cargo Ship Modal */}
            <CargoShipModal
                isOpen={isCargoShipModalOpen}
                onClose={() => setIsCargoShipModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Gems/Coins Modal */}
            <GemsCoinsModal
                isOpen={isGemsCoinsModalOpen}
                onClose={() => setIsGemsCoinsModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Construction Modal */}
            <ConstructionModal
                isOpen={isConstructionModalOpen}
                onClose={() => setIsConstructionModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Research Modal */}
            <ResearchModal
                isOpen={isResearchModalOpen}
                onClose={() => setIsResearchModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Military Modal */}
            <MilitaryModal
                isOpen={isMilitaryModalOpen}
                onClose={() => setIsMilitaryModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Hunting Modal */}
            <HuntingModal
                isOpen={isHuntingModalOpen}
                onClose={() => setIsHuntingModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Artifacts Modal */}
            <ArtifactsModal
                isOpen={isArtifactsModalOpen}
                onClose={() => setIsArtifactsModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Pets Modal */}
            <PetsModal
                isOpen={isPetsModalOpen}
                onClose={() => setIsPetsModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Guild Fest Modal */}
            <GuildFestModal
                isOpen={isGuildFestModalOpen}
                onClose={() => setIsGuildFestModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Schedule Modal */}
            <ScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Chaos Arena Modal */}
            <ChaosArenaModal
                isOpen={isChaosArenaModalOpen}
                onClose={() => setIsChaosArenaModalOpen(false)}
                iggId={selectedIggId}
            />

            {/* Gears Modal */}
            <GearsModal
                isOpen={isGearsModalOpen}
                onClose={() => setIsGearsModalOpen(false)}
                iggId={selectedIggId}
            />
        </div>
    )
}

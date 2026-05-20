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
    Clock,
    type LucideIcon
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
    icon: LucideIcon
    color: string
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
        // console.log('SettingsPage: mounted/updated. IGG ID:', selectedIggId, 'Socket Connected:', isConnected)
    }, [selectedIggId, isConnected])

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

    useEffect(() => {
        if (!selectedIggId || !queueStatus) {
            if (!applying) setQueuePosition(0)
            return
        }

        const index = queueStatus.queuedIggIds.indexOf(selectedIggId)
        if (index !== -1) {
            if (index === 0 && queueStatus.isRunning) {
                setApplying(true)
                setQueuePosition(0)
            } else {
                setApplying(true)
                if (queueStatus.isRunning) {
                    setQueuePosition(index)
                } else {
                    setQueuePosition(index + 1)
                }
            }
        } else {
            if (cooldown > 0) {
                setApplying(false)
            } else {
                if (queueStatus.queuedIggIds.length > 0) {
                    setApplying(false)
                    setQueuePosition(0)
                }
            }
        }
    }, [queueStatus, selectedIggId, applying, cooldown])

    useEffect(() => {
        // console.log('SettingsPage: automationStatus updated:', automationStatus)
        if (automationStatus?.status === 'completed' || automationStatus?.status === 'error') {
            // console.log('SettingsPage: Automation finished with status:', automationStatus.status)
            setApplying(false)
            setQueuePosition(0)
            if (automationStatus.status === 'completed') {
                // console.log('SettingsPage: Triggering success toast')
                toast.success('Changes applied successfully!', { duration: 5000 })
            } else {
                // console.log('SettingsPage: Triggering error toast')
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
                const expiry = Date.now() + 5 * 60 * 1000
                localStorage.setItem(`automation_cooldown_settings_${selectedIggId}`, expiry.toString())
                setCooldown(300)
            } else {
                toast.error(data.error || 'Failed to apply changes')
                setApplying(false)
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Error applying changes')
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
            color: 'text-accent-1',
        },
        {
            id: 'protection',
            name: 'Protection',
            description: 'Shield management and defense automation',
            icon: Shield,
            color: 'text-accent-2',
        },
        {
            id: 'supply',
            name: 'Supply',
            description: 'Resource supply and distribution settings',
            icon: Package,
            color: 'text-[#FF8C00]',
        },
        {
            id: 'gather',
            name: 'Gather',
            description: 'Auto-gather resources and tile management',
            icon: Wheat,
            color: 'text-accent-1',
        },
        {
            id: 'marches',
            name: 'Marches',
            description: 'March formation and troop deployment',
            icon: Users,
            color: 'text-accent-3',
        },
        {
            id: 'realm',
            name: 'Realm',
            description: 'Kingdom events and realm activities',
            icon: Globe,
            color: 'text-accent-2',
        },
        {
            id: 'heroes',
            name: 'Heroes',
            description: 'Hero management and skill upgrades',
            icon: Crown,
            color: 'text-accent-gold',
        },
        {
            id: 'cargo-ship',
            name: 'Cargo Ship',
            description: 'Trading ship and cargo management',
            icon: Ship,
            color: 'text-[#00BFFF]',
        },
        {
            id: 'gems-coins',
            name: 'Gems/Coins',
            description: 'Currency management and spending limits',
            icon: Coins,
            color: 'text-accent-gold',
        },
        {
            id: 'construction',
            name: 'Construction',
            description: 'Building upgrades and construction queue',
            icon: Building,
            color: 'text-[#00BFFF]',
        },
        {
            id: 'research',
            name: 'Research',
            description: 'Technology research and academy settings',
            icon: FlaskConical,
            color: 'text-accent-2',
        },
        {
            id: 'military',
            name: 'Military',
            description: 'Troop training and military operations',
            icon: Swords,
            color: 'text-accent-3',
        },
        {
            id: 'hunting',
            name: 'Hunting',
            description: 'Monster hunting and rewards collection',
            icon: Target,
            color: 'text-accent-1',
        },
        {
            id: 'artifacts',
            name: 'Artifacts',
            description: 'Artifact enhancement and management',
            icon: Sparkles,
            color: 'text-accent-2',
        },
        {
            id: 'pets',
            name: 'Pets',
            description: 'Pet care and familiar upgrades',
            icon: PawPrint,
            color: 'text-[#FF8C00]',
        },
        {
            id: 'guild-fest',
            name: 'Guild Fest',
            description: 'Guild festival missions and rewards',
            icon: Trophy,
            color: 'text-accent-gold',
        },
        {
            id: 'chaos-arena',
            name: 'Chaos Arena',
            description: 'Arena battles and mission completion',
            icon: Swords,
            color: 'text-accent-3',
        },
        {
            id: 'gears',
            name: 'Gears',
            description: 'Equipment crafting and gear upgrades',
            icon: ShieldCheck,
            color: 'text-[#00BFFF]',
        },
        {
            id: 'schedule',
            name: 'Schedule',
            description: 'Task scheduling and automation timing',
            icon: Calendar,
            color: 'text-text-primary',
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
            // console.log('Category clicked:', category.id)
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
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
            {/* Header with IGG ID Selector */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-8">
                <div>
                    <h1 className="font-orbitron text-xl sm:text-3xl font-bold text-text-primary mb-1 sm:mb-2 tracking-wide">Protocol Configuration</h1>
                    <p className="font-sans text-sm sm:text-base text-text-muted">Configure automation parameters and behavioral overrides.</p>
                </div>
                <div className="w-full md:w-80">
                    <IggIdSelector
                        selectedIggId={selectedIggId}
                        onSelect={setSelectedIggId}
                    />
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-accent-1/5 border border-accent-1/20 rounded-[14px] p-6 mb-8">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-accent-1/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Settings className="w-5 h-5 text-accent-1" />
                    </div>
                    <div>
                        <h3 className="font-orbitron text-[14px] font-bold text-text-primary mb-2 tracking-wide">SYSTEM TIP</h3>
                        <p className="font-sans text-text-muted text-[13px] leading-relaxed">
                            Select a protocol module below to configure its parameters. Modifying these values updates the central automation core in real-time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Categories Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
            >
                {categories.map((category) => {
                    const Icon = category.icon

                    return (
                        <motion.div
                            key={category.id}
                            variants={itemVariants}
                            whileHover={{ y: -4 }}
                            onClick={() => handleCategoryClick(category)}
                            className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-bg-surface p-4 transition-all duration-200 hover:border-accent-1/40 hover:shadow-glow-mint sm:p-5"
                        >
                            <div className="relative">
                                {/* Icon */}
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] border border-border bg-bg-elevated transition-colors duration-300 group-hover:border-accent-1/20 group-hover:bg-accent-1/10 sm:mb-4 sm:h-[44px] sm:w-[44px]">
                                    <Icon className={`w-5 h-5 ${category.color} transition-transform group-hover:scale-110`} />
                                </div>

                                {/* Content */}
                                <h3 className="mb-2 truncate font-orbitron text-[13px] font-bold text-text-primary transition-all sm:text-[14px]">
                                    {category.name}
                                </h3>
                                <p className="mb-4 line-clamp-2 font-sans text-[12px] leading-relaxed text-text-muted sm:text-[13px]">
                                    {category.description}
                                </p>

                                {/* Arrow */}
                                <div className="flex -translate-x-2 items-center gap-1 font-sans text-[13px] font-bold text-accent-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                                    <span>Configure</span>
                                    <ChevronRight className="w-3 h-3" />
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
                className="flex justify-center mt-12"
            >
                <button
                    onClick={handleApplyChanges}
                    disabled={applying || !selectedIggId || cooldown > 0}
                    className="group flex items-center gap-3 rounded-lg bg-gradient-to-br from-accent-1 to-accent-cyan px-8 py-4 font-sans text-[15px] font-bold text-[#031017] transition-all duration-200 hover:brightness-110 hover:shadow-glow-mint disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                >
                    {(applying || queuePosition > 0) ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {automationStatus?.status === 'waiting'
                                ? 'Wait for RDP disconnection'
                                : queuePosition > 0
                                    ? `Queue Status #${queuePosition}`
                                    : 'Applying Changes...'}
                        </>
                    ) : cooldown > 0 ? (
                        <>
                            <Clock className="w-5 h-5" />
                            Wait {formatCooldown(cooldown)}
                        </>
                    ) : (
                        <>
                            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                            Apply Changes
                        </>
                    )}
                </button>
            </motion.div>

            {/* Modals */}
            {selectedCategory && (
                <SettingsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    iggId={selectedIggId}
                />
            )}
            <ProtectionModal isOpen={isProtectionModalOpen} onClose={() => setIsProtectionModalOpen(false)} iggId={selectedIggId} />
            <SupplyModal isOpen={isSupplyModalOpen} onClose={() => setIsSupplyModalOpen(false)} iggId={selectedIggId} />
            <GatherModal isOpen={isGatherModalOpen} onClose={() => setIsGatherModalOpen(false)} iggId={selectedIggId} />
            <MarchesModal isOpen={isMarchesModalOpen} onClose={() => setIsMarchesModalOpen(false)} iggId={selectedIggId} />
            <RealmModal isOpen={isRealmModalOpen} onClose={() => setIsRealmModalOpen(false)} iggId={selectedIggId} />
            <HeroesModal isOpen={isHeroesModalOpen} onClose={() => setIsHeroesModalOpen(false)} iggId={selectedIggId} />
            <CargoShipModal isOpen={isCargoShipModalOpen} onClose={() => setIsCargoShipModalOpen(false)} iggId={selectedIggId} />
            <GemsCoinsModal isOpen={isGemsCoinsModalOpen} onClose={() => setIsGemsCoinsModalOpen(false)} iggId={selectedIggId} />
            <ConstructionModal isOpen={isConstructionModalOpen} onClose={() => setIsConstructionModalOpen(false)} iggId={selectedIggId} />
            <ResearchModal isOpen={isResearchModalOpen} onClose={() => setIsResearchModalOpen(false)} iggId={selectedIggId} />
            <MilitaryModal isOpen={isMilitaryModalOpen} onClose={() => setIsMilitaryModalOpen(false)} iggId={selectedIggId} />
            <HuntingModal isOpen={isHuntingModalOpen} onClose={() => setIsHuntingModalOpen(false)} iggId={selectedIggId} />
            <ArtifactsModal isOpen={isArtifactsModalOpen} onClose={() => setIsArtifactsModalOpen(false)} iggId={selectedIggId} />
            <PetsModal isOpen={isPetsModalOpen} onClose={() => setIsPetsModalOpen(false)} iggId={selectedIggId} />
            <GuildFestModal isOpen={isGuildFestModalOpen} onClose={() => setIsGuildFestModalOpen(false)} iggId={selectedIggId} />
            <ScheduleModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} iggId={selectedIggId} />
            <ChaosArenaModal isOpen={isChaosArenaModalOpen} onClose={() => setIsChaosArenaModalOpen(false)} iggId={selectedIggId} />
            <GearsModal isOpen={isGearsModalOpen} onClose={() => setIsGearsModalOpen(false)} iggId={selectedIggId} />
        </div>
    )
}

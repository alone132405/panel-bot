'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Settings2,
    Database,
    Activity,
    ArrowRight
} from 'lucide-react'
import SubscriptionTimer from '@/components/ui/SubscriptionTimer'

interface ActionCard {
    title: string
    description: string
    icon: any
    href: string
    accentClass: string
    gradientStart: string
    gradientEnd: string
    delay: number
}

export default function DashboardPage() {
    const router = useRouter()
    const [subscriptions, setSubscriptions] = useState<any[]>([])
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        fetch('/api/subscription')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSubscriptions(data)
                } else {
                    console.error('Failed to fetch subscriptions:', data)
                    setSubscriptions([])
                }
            })
            .catch(err => console.error(err))
    }, [])

    const actionCards: ActionCard[] = [
        {
            title: 'Protocol Config',
            description: 'Advanced configuration matrix. Manage automation parameters, resources, and overrides.',
            icon: Settings2,
            href: '/dashboard/settings',
            accentClass: 'text-accent-1 bg-accent-1/10',
            gradientStart: 'from-accent-1',
            gradientEnd: 'to-accent-2',
            delay: 0.1
        },
        {
            title: 'Vault Systems',
            description: 'Centralized banking operations. Automate resource distribution securely.',
            icon: Database,
            href: '/dashboard/bank',
            accentClass: 'text-accent-2 bg-accent-2/10',
            gradientStart: 'from-accent-2',
            gradientEnd: 'to-accent-3',
            delay: 0.2
        },
        {
            title: 'Telemetry Analytics',
            description: 'Real-time analytics engine. Monitor efficiency, yield rates, and logs.',
            icon: Activity,
            href: '/dashboard/reports',
            accentClass: 'text-accent-3 bg-accent-3/10',
            gradientStart: 'from-accent-3',
            gradientEnd: 'to-accent-1',
            delay: 0.3
        },
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    }

    if (!isMounted) return null

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 sm:space-y-10 max-w-[1400px] mx-auto"
        >
            {/* HERO SECTION */}
            <motion.div 
                variants={itemVariants}
                className="relative w-full rounded-2xl overflow-hidden border border-accent-1/20 bg-bg-surface"
                style={{
                    backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(0,255,178,0.12) 0%, rgba(123,94,255,0.08) 40%, transparent 80%)'
                }}
            >
                <div className="scan-line"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 min-h-[280px]">
                    <div className="max-w-xl">
                        {/* Status Pill */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-accent-1/10 border border-accent-1/30 mb-6">
                            <div className="w-2 h-2 rounded-full bg-accent-1 animate-pulse-slow"></div>
                            <span className="font-orbitron text-[10px] tracking-[0.2em] text-accent-1 uppercase">
                                System Fully Operational
                            </span>
                        </div>
                        
                        <h1 className="font-orbitron text-4xl md:text-[52px] leading-[1.1] mb-4">
                            <span className="text-text-primary">Orchestrate</span><br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-1 to-accent-2">Your Network.</span>
                        </h1>
                        
                        <p className="font-sans text-[16px] text-text-muted mb-8 max-w-[480px]">
                            Manage bot configuration, bank controls, and exported reports from one dark operations workspace.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => router.push('/dashboard/settings')} className="group flex items-center gap-2 rounded-lg bg-gradient-to-br from-accent-1 to-accent-cyan px-7 py-3 font-sans text-[14px] font-bold text-[#031017] transition-all duration-200 hover:-translate-y-[2px] hover:brightness-110 hover:shadow-glow-mint">
                                <span>Initialize Setup</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => router.push('/dashboard/reports')} className="rounded-lg border border-border bg-transparent px-7 py-3 font-sans text-[14px] text-text-primary transition-all duration-200 hover:border-accent-2 hover:bg-accent-2/10">
                                View Logs
                            </button>
                        </div>
                    </div>

                    {/* Right side floating chips */}
                    <div className="hidden lg:flex flex-col gap-4 mt-8 md:mt-0 relative w-[240px] h-[200px]">
                        <div className="absolute top-0 right-0 rounded-lg border border-accent-1/20 bg-bg-surface px-4 py-3 animate-[float_3s_ease-in-out_infinite]">
                            <span className="flex items-center gap-2 font-sans text-sm font-medium text-text-primary">
                                <Activity className="h-4 w-4 text-accent-1" /> Bot Status: <span className="text-accent-1">RUNNING</span>
                            </span>
                        </div>
                        <div className="absolute right-[40px] top-[70px] rounded-lg border border-accent-2/20 bg-bg-surface px-4 py-3 animate-[float_3.5s_ease-in-out_infinite_0.5s]">
                            <span className="flex items-center gap-2 font-sans text-sm font-medium text-text-primary">
                                <Settings2 className="h-4 w-4 text-accent-2" /> Uptime: <span className="text-accent-2">99.8%</span>
                            </span>
                        </div>
                        <div className="absolute right-[20px] top-[140px] rounded-lg border border-accent-cyan/20 bg-bg-surface px-4 py-3 animate-[float_4s_ease-in-out_infinite_1s]">
                            <span className="flex items-center gap-2 font-sans text-sm font-medium text-text-primary">
                                <Database className="h-4 w-4 text-accent-cyan" /> Sync: <span className="text-accent-1">Manual</span>
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FEATURE CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {actionCards.map((card, i) => (
                    <motion.div 
                        variants={itemVariants}
                        key={i}
                        onClick={() => router.push(card.href)}
                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-bg-surface p-7 transition-all duration-200 hover:-translate-y-[6px] hover:border-accent-1/50 hover:shadow-glow-mint"
                    >
                        {/* Top Accent Bar */}
                        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.gradientStart} ${card.gradientEnd} opacity-50 group-hover:opacity-100 transition-opacity`} />
                        
                        <div className={`mb-5 flex h-[44px] w-[44px] items-center justify-center rounded-lg ${card.accentClass}`}>
                            <card.icon className="w-5 h-5" />
                        </div>

                        <h3 className="font-orbitron text-[14px] text-text-primary mb-2">
                            {card.title}
                        </h3>
                        
                        <p className="font-sans text-[13px] text-text-muted mb-6 line-clamp-2">
                            {card.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between">
                            <span className={`flex -translate-x-2 items-center gap-1 font-sans text-[13px] font-bold opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 ${card.accentClass.split(' ')[0]}`}>
                                Configure <ArrowRight className="w-3 h-3" />
                            </span>
                            
                            {/* Telemetry Sparkline (Only for the 3rd card) */}
                            {i === 2 && (
                                <div className="flex items-end gap-1 h-6">
                                    {[40, 70, 45, 90, 60].map((h, idx) => (
                                        <div key={idx} className="w-1.5 bg-accent-3/50 rounded-t-sm animate-pulse-slow" style={{ height: `${h}%`, animationDelay: `${idx * 0.1}s` }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ACTIVE LICENSES SECTION */}
            {subscriptions.length > 0 && (
                <motion.div variants={itemVariants} className="mt-4">
                    <div className="flex items-center gap-3 mb-4 pl-1">
                        <div className="w-[3px] h-[14px] bg-accent-1 rounded-full" />
                        <h2 className="font-orbitron text-[11px] tracking-[0.3em] text-text-muted uppercase">
                            Active Licenses
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {subscriptions.map((sub: any, index: number) => (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + (index * 0.1), duration: 0.4 }}
                            >
                                <SubscriptionTimer
                                    expiresAt={sub.expiresAt}
                                    plan={sub.plan}
                                    status={sub.status}
                                    iggId={sub.igg?.iggId}
                                    nickname={sub.igg?.displayName}
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

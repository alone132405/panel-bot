'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Settings2,
    Database,
    BarChart3,
    ArrowRight
} from 'lucide-react'
import SubscriptionTimer from '@/components/ui/SubscriptionTimer'

interface ActionCard {
    title: string
    description: string
    icon: any
    href: string
    gradient: string
}

export default function DashboardPage() {
    const router = useRouter()
    const [subscriptions, setSubscriptions] = useState<any[]>([])

    useEffect(() => {
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
            title: 'Bot Settings',
            description: 'Configure your bot preferences, auto-gather resources, and manage automation settings',
            icon: Settings2,
            href: '/dashboard/settings',
            gradient: 'from-primary-600 to-primary-700',
        },
        {
            title: 'Bank Settings',
            description: 'Manage bank operations, GP tasks, guild commands, and security configurations',
            icon: Database,
            href: '/dashboard/bank',
            gradient: 'from-accent-emerald to-emerald-600',
        },
        {
            title: 'Reports',
            description: 'View comprehensive analytics, statistics, and performance reports for your bots',
            icon: BarChart3,
            href: '/dashboard/reports',
            gradient: 'from-accent-purple to-purple-600',
        },
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    return (
        <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">Welcome back! 👋</h1>
                <p className="text-gray-400 text-sm sm:text-lg">Manage your bot operations from the dashboard</p>
            </div>

            {/* Main Action Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-7xl"
            >
                {/* Desktop Grid View */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {actionCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <motion.div
                                key={`desktop-${card.title}`}
                                variants={itemVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(card.href)}
                                className="glass-card p-8 cursor-pointer group relative overflow-hidden"
                            >
                                {/* Gradient Background on Hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                <div className="relative">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-gradient transition-all">
                                        {card.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                        {card.description}
                                    </p>

                                    {/* Action Button */}
                                    <div className="flex items-center gap-2 text-primary-400 font-semibold group-hover:gap-3 transition-all">
                                        <span>Open</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Mobile List View - Redesigned */}
                <div className="sm:hidden grid grid-cols-1 gap-4">
                    {actionCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <motion.div
                                key={`mobile-${card.title}`}
                                variants={itemVariants}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(card.href)}
                                className="glass-card p-5 cursor-pointer group relative overflow-hidden"
                            >
                                {/* Subtle Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-active:opacity-10 transition-opacity duration-300`} />

                                <div className="relative flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {/* Icon & Title Row */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">
                                                {card.title}
                                            </h3>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-400 text-xs leading-relaxed mb-4">
                                            {card.description}
                                        </p>

                                        {/* Action Button */}
                                        <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 group-active:bg-white/10 transition-colors ${card.gradient.includes('primary') ? 'text-primary-400' : card.gradient.includes('emerald') ? 'text-accent-emerald' : 'text-accent-purple'}`}>
                                            <span>Open Dashboard</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Subscription Status */}
            {subscriptions.length > 0 && (
                <div className="space-y-4">
                    {subscriptions.map((sub: any) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="max-w-7xl"
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
            )}
        </div>
    )
}

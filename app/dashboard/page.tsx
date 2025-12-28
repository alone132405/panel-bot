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
    const [subscription, setSubscription] = useState<any>(null)

    useEffect(() => {
        fetch('/api/subscription')
            .then(res => res.json())
            .then(data => setSubscription(data))
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

                {/* Mobile List View */}
                <div className="sm:hidden space-y-3">
                    {actionCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <motion.div
                                key={`mobile-${card.title}`}
                                variants={itemVariants}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(card.href)}
                                className="glass-card p-4 cursor-pointer group relative overflow-hidden flex items-center gap-4"
                            >
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-white mb-1 truncate">
                                        {card.title}
                                    </h3>
                                    <p className="text-gray-400 text-xs truncate">
                                        {card.description}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Subscription Status */}
            {subscription && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-7xl"
                >
                    <SubscriptionTimer
                        expiresAt={subscription.expiresAt}
                        plan={subscription.plan}
                        status={subscription.status}
                    />
                </motion.div>
            )}
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SubscriptionTimerProps {
    expiresAt: string | Date
    plan: string
    status: string
    iggId?: string
    nickname?: string | null
}

interface TimeRemaining {
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
}

export default function SubscriptionTimer({ expiresAt, plan, status, iggId, nickname }: SubscriptionTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
    })

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date().getTime()
            const expiry = new Date(expiresAt).getTime()
            const difference = expiry - now

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            return { days, hours, minutes, seconds, total: difference }
        }

        setTimeRemaining(calculateTimeRemaining())

        const interval = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining())
        }, 1000)

        return () => clearInterval(interval)
    }, [expiresAt])

    const isExpired = timeRemaining.total <= 0
    const formatNumber = (num: number) => num.toString().padStart(2, '0')

    return (
        <div className="relative bg-gradient-to-br from-accent-1/5 to-transparent border border-accent-1/20 rounded-[14px] p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                {/* Left side - Info */}
                <div className="flex items-start gap-4">
                    <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-accent-1 shadow-glow-mint animate-pulse-slow shrink-0" />
                    <div>
                        <h3 className="font-sans font-bold text-[16px] text-text-primary mb-1">
                            {nickname || plan}
                        </h3>
                        <div className="font-mono text-[12px] text-text-muted mb-2">
                            {iggId ? `ID: ${iggId}` : 'NO ID LINKED'}
                        </div>
                        <div className="text-[12px] text-text-muted">
                            Exp: {new Date(expiresAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>

                {/* Right side - Timer */}
                {!isExpired ? (
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center justify-center bg-accent-1/10 rounded-lg px-3.5 py-2 min-w-[64px]">
                            <span className="font-orbitron text-[24px] md:text-[28px] text-accent-1 leading-none">{formatNumber(timeRemaining.days)}</span>
                            <span className="font-sans text-[9px] tracking-[0.2em] text-text-muted uppercase mt-1">Days</span>
                        </div>
                        <span className="font-orbitron text-accent-1 text-xl opacity-50">:</span>
                        <div className="flex flex-col items-center justify-center bg-accent-1/10 rounded-lg px-3.5 py-2 min-w-[64px]">
                            <span className="font-orbitron text-[24px] md:text-[28px] text-accent-1 leading-none">{formatNumber(timeRemaining.hours)}</span>
                            <span className="font-sans text-[9px] tracking-[0.2em] text-text-muted uppercase mt-1">Hrs</span>
                        </div>
                        <span className="font-orbitron text-accent-1 text-xl opacity-50">:</span>
                        <div className="flex flex-col items-center justify-center bg-accent-1/10 rounded-lg px-3.5 py-2 min-w-[64px]">
                            <span className="font-orbitron text-[24px] md:text-[28px] text-accent-1 leading-none">{formatNumber(timeRemaining.minutes)}</span>
                            <span className="font-sans text-[9px] tracking-[0.2em] text-text-muted uppercase mt-1">Mins</span>
                        </div>
                        <span className="font-orbitron text-accent-1 text-xl opacity-50">:</span>
                        <AnimatePresence mode="popLayout">
                            <motion.div 
                                key={timeRemaining.seconds}
                                initial={{ scale: 1.1, opacity: 0.8 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center justify-center bg-accent-1/10 rounded-lg px-3.5 py-2 min-w-[64px]"
                            >
                                <span className="font-orbitron text-[24px] md:text-[28px] text-accent-1 leading-none">{formatNumber(timeRemaining.seconds)}</span>
                                <span className="font-sans text-[9px] tracking-[0.2em] text-text-muted uppercase mt-1">Secs</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="px-6 py-3 bg-accent-3/10 border border-accent-3/20 rounded-xl">
                        <span className="font-orbitron text-accent-3 tracking-widest text-sm">LICENSE EXPIRED</span>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {!isExpired && (
                <div className="mt-6 relative">
                    <div className="w-full h-1 bg-accent-1/10 rounded-full overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-1 to-accent-2"
                            style={{
                                width: `${Math.min(100, Math.max(0, (timeRemaining.days / 30) * 100))}%`
                            }}
                        >
                            {/* Shimmer Highlight */}
                            <motion.div 
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-[30%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    )
}

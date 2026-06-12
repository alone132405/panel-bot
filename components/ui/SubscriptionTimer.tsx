'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock3, KeyRound, ShieldCheck } from 'lucide-react'
import { CheckCircle2, Clock, CalendarDays, Loader2, Play, Square } from 'lucide-react'

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
        total: 0,
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
        const interval = setInterval(() => setTimeRemaining(calculateTimeRemaining()), 1000)

        return () => clearInterval(interval)
    }, [expiresAt])

    const isExpired = timeRemaining.total <= 0
    const formattedExpiry = useMemo(() => (
        new Date(expiresAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    ), [expiresAt])

    const formatNumber = (num: number) => num.toString().padStart(2, '0')
    const progress = Math.min(100, Math.max(0, (timeRemaining.days / 30) * 100))

    const timerBlocks = [
        { label: 'Days', value: timeRemaining.days },
        { label: 'Hrs', value: timeRemaining.hours },
        { label: 'Mins', value: timeRemaining.minutes },
        { label: 'Secs', value: timeRemaining.seconds },
    ]

    return (
        <div className="panel-solid relative overflow-hidden rounded-[24px] p-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-1/60 to-transparent" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[24px] border ${isExpired
                        ? 'border-accent-3/25 bg-accent-3/10 text-accent-3'
                        : 'border-accent-1/25 bg-accent-1/10 text-accent-1'
                        }`}
                    >
                        {isExpired ? <Clock3 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-[16px] font-bold text-text-primary">
                                {nickname || plan}
                            </h3>
                            <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${isExpired
                                ? 'border-accent-3/25 bg-accent-3/10 text-accent-3'
                                : 'border-accent-1/25 bg-accent-1/10 text-accent-1'
                                }`}
                            >
                                {isExpired ? 'Expired' : status}
                            </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-text-muted">
                            <span className="inline-flex items-center gap-1 font-sans">
                                <KeyRound className="h-3.5 w-3.5 text-accent-cyan" />
                                {iggId ? `ID ${iggId}` : 'No ID linked'}
                            </span>
                            <span>Expires {formattedExpiry}</span>
                            {iggId && !isExpired && (
                                <div className="ml-2 pl-2 border-l border-white/10">

                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {!isExpired ? (
                    <div className="grid grid-cols-4 gap-2">
                        {timerBlocks.map((block) => (
                            <div
                                key={block.label}
                                className="flex min-w-[58px] flex-col items-center justify-center rounded-[24px] border border-accent-1/15 bg-accent-1/10 px-2 py-2"
                            >
                                <AnimatePresence mode="popLayout">
                                    <motion.span
                                        key={`${block.label}-${block.value}`}
                                        initial={{ y: -6, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 6, opacity: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="font-orbitron text-[20px] leading-none text-accent-1 md:text-[24px]"
                                    >
                                        {formatNumber(block.value)}
                                    </motion.span>
                                </AnimatePresence>
                                <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-text-muted">
                                    {block.label}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[24px] border border-accent-3/25 bg-accent-3/10 px-4 py-3 text-center">
                        <span className="font-orbitron text-[12px] uppercase tracking-[0.22em] text-accent-3">
                            License expired
                        </span>
                    </div>
                )}
            </div>

            {!isExpired && (
                <div className="relative z-10 mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-accent-1 to-accent-cyan"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            )}
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'

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

        // Initial calculation
        setTimeRemaining(calculateTimeRemaining())

        // Update every second
        const interval = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining())
        }, 1000)

        return () => clearInterval(interval)
    }, [expiresAt])

    const isExpired = timeRemaining.total <= 0
    const isExpiringSoon = timeRemaining.days <= 3 && !isExpired

    const getStatusColor = () => {
        if (isExpired) return 'from-red-500/10 via-red-600/10 to-red-500/10 border-red-500/20'
        if (isExpiringSoon) return 'from-yellow-500/10 via-yellow-600/10 to-yellow-500/10 border-yellow-500/20'
        return 'from-accent-emerald/10 via-emerald-600/10 to-accent-emerald/10 border-accent-emerald/20'
    }

    const getTextColor = () => {
        if (isExpired) return 'text-red-400'
        if (isExpiringSoon) return 'text-yellow-400'
        return 'text-accent-emerald'
    }

    const formatNumber = (num: number) => num.toString().padStart(2, '0')

    return (
        <div className={`glass-card p-6 bg-gradient-to-r ${getStatusColor()}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left side - Plan info */}
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isExpired ? 'bg-red-500/20' : isExpiringSoon ? 'bg-yellow-500/20' : 'bg-accent-emerald/20'
                        }`}>
                        {isExpired ? (
                            <AlertTriangle className={`w-7 h-7 ${getTextColor()}`} />
                        ) : isExpiringSoon ? (
                            <Clock className={`w-7 h-7 ${getTextColor()}`} />
                        ) : (
                            <CheckCircle className={`w-7 h-7 ${getTextColor()}`} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            {nickname ? `${nickname} (${iggId})` : iggId ? `IGG: ${iggId}` : `${plan} Plan`}
                        </h3>

                        <p className={`text-sm ${getTextColor()}`}>
                            {isExpired
                                ? 'Your subscription has expired'
                                : isExpiringSoon
                                    ? 'Your subscription is expiring soon!'
                                    : `Status: ${status}`}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Expires: {new Date(expiresAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                {/* Right side - Timer */}
                {!isExpired && (
                    <div className="flex items-center gap-1 sm:gap-3">
                        <div className="text-center">
                            <div className={`text-xl sm:text-3xl font-bold ${getTextColor()}`}>
                                {formatNumber(timeRemaining.days)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Days</div>
                        </div>
                        <div className={`text-lg sm:text-2xl font-bold ${getTextColor()}`}>:</div>
                        <div className="text-center">
                            <div className={`text-xl sm:text-3xl font-bold ${getTextColor()}`}>
                                {formatNumber(timeRemaining.hours)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Hours</div>
                        </div>
                        <div className={`text-lg sm:text-2xl font-bold ${getTextColor()}`}>:</div>
                        <div className="text-center">
                            <div className={`text-xl sm:text-3xl font-bold ${getTextColor()}`}>
                                {formatNumber(timeRemaining.minutes)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Mins</div>
                        </div>
                        <div className={`text-lg sm:text-2xl font-bold ${getTextColor()}`}>:</div>
                        <div className="text-center">
                            <div className={`text-xl sm:text-3xl font-bold ${getTextColor()}`}>
                                {formatNumber(timeRemaining.seconds)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Secs</div>
                        </div>
                    </div>
                )}

                {/* Expired state */}
                {isExpired && (
                    <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold border border-red-500/30">
                        EXPIRED
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {!isExpired && (
                <div className="mt-4">
                    <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${isExpiringSoon ? 'bg-yellow-500' : 'bg-accent-emerald'
                                }`}
                            style={{
                                width: `${Math.min(100, Math.max(0, (timeRemaining.days / 30) * 100))}%`
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

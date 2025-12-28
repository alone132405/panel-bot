'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface IggIdSelectorProps {
    onSelect: (iggId: string) => void
    selectedIggId?: string | null
}

export default function IggIdSelector({ onSelect, selectedIggId }: IggIdSelectorProps) {
    const { data: session } = useSession()
    const [iggIds, setIggIds] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        fetchUserIggIds()
    }, [session])

    const fetchUserIggIds = async () => {
        if (!session?.user?.id) return

        try {
            const res = await fetch('/api/user/igg-ids')
            if (res.ok) {
                const data = await res.json()
                setIggIds(data.iggIds)

                // Auto-select if only one IGG ID and none is selected
                if (data.iggIds.length === 1 && !selectedIggId) {
                    onSelect(data.iggIds[0].iggId)
                }
            }
        } catch (error) {
            toast.error('Failed to load IGG IDs')
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (iggId: string) => {
        onSelect(iggId)
        setIsOpen(false)
    }

    const currentIggId = iggIds.find((igg) => igg.iggId === selectedIggId)

    if (loading) {
        return (
            <div className="w-full px-4 py-3 bg-surface rounded-xl animate-pulse">
                <div className="h-5 bg-gray-700 rounded w-32"></div>
            </div>
        )
    }

    if (iggIds.length === 0) {
        return (
            <div className="w-full px-4 py-3 bg-surface/50 rounded-xl border border-yellow-500/20">
                <p className="text-yellow-400 text-sm">No IGG IDs assigned. Contact admin.</p>
            </div>
        )
    }

    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-surface hover:bg-surface-hover rounded-xl flex items-center justify-between transition-colors border border-white/10"
            >
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                    <div>
                        <p className="text-xs text-gray-400">Selected IGG ID</p>
                        <p className="text-white font-medium">
                            {currentIggId ? currentIggId.iggId : 'Select IGG ID'}
                        </p>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background-secondary border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                        {iggIds.map((igg) => (
                            <button
                                key={igg.id}
                                onClick={() => handleSelect(igg.iggId)}
                                className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors ${igg.iggId === selectedIggId ? 'bg-primary-500/10' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">{igg.iggId}</p>
                                        {igg.displayName && (
                                            <p className="text-gray-400 text-sm">{igg.displayName}</p>
                                        )}
                                    </div>
                                    {igg.subscription?.expiresAt && new Date(igg.subscription.expiresAt) < new Date() && (
                                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">Expired</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {currentIggId?.subscription?.expiresAt && new Date(currentIggId.subscription.expiresAt) < new Date() && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <p className="text-sm text-red-200">
                        Subscription expired on {new Date(currentIggId.subscription.expiresAt).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
    )
}

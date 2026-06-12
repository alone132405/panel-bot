'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, Server, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

interface IggIdSelectorProps {
    onSelect: (iggId: string, plan?: string | null) => void
    selectedIggId?: string | null
}

interface IggRecord {
    id: string
    iggId: string
    displayName?: string | null
    subscription?: {
        expiresAt?: string | null
        plan?: string | null
    } | null
}

export default function IggIdSelector({ onSelect, selectedIggId }: IggIdSelectorProps) {
    const [iggIds, setIggIds] = useState<IggRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        const fetchUserIggIds = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch('/api/user/igg-ids', {
                    credentials: 'same-origin',
                    cache: 'no-store',
                })
                if (cancelled) return

                if (!res.ok) {
                    setIggIds([])
                    setIsOpen(false)
                    setError(res.status === 401 ? 'Session expired. Sign in again.' : 'Could not load IGG IDs.')
                    return
                }

                const data = await res.json()
                const ids = data.iggIds || []
                setIggIds(ids)

                if (!selectedIggId) {
                    const savedIggId = ids.find((igg: IggRecord) => igg.iggId === data.selectedIggId)
                    if (savedIggId) {
                        onSelect(savedIggId.iggId, savedIggId.subscription?.plan)
                    } else if (ids.length === 1) {
                        onSelect(ids[0].iggId, ids[0].subscription?.plan)
                    }
                }
            } catch {
                if (!cancelled) {
                    setIggIds([])
                    setIsOpen(false)
                    setError('Network error while loading IGG IDs.')
                    toast.error('Failed to load IGG IDs')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchUserIggIds()

        return () => {
            cancelled = true
        }
    }, [onSelect, selectedIggId])

    const currentIggId = useMemo(
        () => iggIds.find((igg) => igg.iggId === selectedIggId),
        [iggIds, selectedIggId]
    )

    const isExpired = (igg: IggRecord) => {
        const expiresAt = igg.subscription?.expiresAt
        return Boolean(expiresAt && new Date(expiresAt) < new Date())
    }

    const handleSelect = (igg: IggRecord) => {
        onSelect(igg.iggId, igg.subscription?.plan)
        setIsOpen(false)
    }

    if (loading) {
        return (
            <div className="panel-inset flex min-h-[64px] w-full items-center gap-3 rounded-lg px-4">
                <div className="h-9 w-9 animate-pulse rounded-md bg-white/[0.06]" />
                <div className="space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
                    <div className="h-4 w-32 animate-pulse rounded bg-white/[0.08]" />
                </div>
            </div>
        )
    }

    if (error || iggIds.length === 0) {
        return (
            <div className={`flex min-h-[64px] w-full items-center gap-3 rounded-lg border px-4 ${error ? 'border-accent-3/25 bg-accent-3/10' : 'border-accent-gold/25 bg-accent-gold/10'}`}>
                <ShieldAlert className={`h-5 w-5 shrink-0 ${error ? 'text-accent-3' : 'text-accent-gold'}`} />
                <div>
                    <p className={`text-[13px] font-bold ${error ? 'text-accent-3' : 'text-accent-gold'}`}>
                        {error ? 'IGG IDs unavailable' : 'No IGG IDs assigned'}
                    </p>
                    <p className="text-[12px] text-text-muted">{error || 'Contact an admin to unlock this workspace.'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="group flex min-h-[64px] w-full items-center justify-between gap-3 rounded-lg border border-border bg-bg-surface px-4 text-left shadow-panel transition-all hover:border-accent-1/35 hover:bg-bg-elevated"
            >
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent-1/20 bg-accent-1/10 text-accent-1">
                        <Server className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Active IGG ID</span>
                        <span className="block truncate font-mono text-[15px] font-bold text-text-primary">
                            {currentIggId ? currentIggId.iggId : 'Select account'}
                        </span>
                        {currentIggId?.displayName && (
                            <span className="block truncate text-[12px] text-text-muted">{currentIggId.displayName}</span>
                        )}
                    </span>
                </div>
                <ChevronDown className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Close account selector"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[320px] overflow-y-auto rounded-lg border border-border bg-bg-surface p-2 shadow-panel">
                        {iggIds.map((igg) => {
                            const expired = isExpired(igg)
                            const selected = igg.iggId === selectedIggId

                            return (
                                <button
                                    type="button"
                                    key={igg.id}
                                    onClick={() => handleSelect(igg)}
                                    className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left transition-all ${selected
                                        ? 'bg-accent-1/10 text-accent-1'
                                        : 'text-text-primary hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate font-mono text-[14px] font-bold">{igg.iggId}</span>
                                        <span className="block truncate text-[12px] text-text-muted">
                                            {igg.displayName || 'Unlabeled account'}
                                        </span>
                                    </span>
                                    <span className="flex shrink-0 items-center gap-2">
                                        {expired && (
                                            <span className="rounded border border-accent-3/25 bg-accent-3/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-3">
                                                Expired
                                            </span>
                                        )}
                                        {selected && <Check className="h-4 w-4" />}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </>
            )}

            {currentIggId && isExpired(currentIggId) && currentIggId.subscription?.expiresAt && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-accent-3/25 bg-accent-3/10 px-3 py-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-accent-3" />
                    <p className="text-[12px] text-accent-3">
                        Subscription expired on {new Date(currentIggId.subscription.expiresAt).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2, User, Key, Mail, Phone, Shield, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { TacticalSelect } from '@/components/ui/TacticalSelect'

interface User {
    id: string
    email: string
    name: string
    role: string
    accountStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
    contactType: 'WHATSAPP' | 'LINE' | 'TELEGRAM' | null
    contactValue: string | null
    selectedIggId: string | null
    createdAt: string
    iggIds: {
        id: string
        iggId: string
        displayName: string | null
        isActive: boolean
        status: string
        lastSync: string
        subscription: {
            expiresAt: string
            status: string
            plan?: string
        } | null
    }[]
}

interface UserManagementModalProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
    onUpdate: () => void
    onRevokeIgg: (userId: string, iggId: string) => Promise<void>
}

export default function UserManagementModal({ isOpen, onClose, user, onUpdate, onRevokeIgg }: UserManagementModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'igg'>('info')
    const [mounted, setMounted] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'USER',
        contactType: 'WHATSAPP' as 'WHATSAPP' | 'LINE' | 'TELEGRAM',
        contactValue: '',
    })
    const [saving, setSaving] = useState(false)
    const [expiryDates, setExpiryDates] = useState<Record<string, string>>({})
    const [plans, setPlans] = useState<Record<string, string>>({})

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!user) return

        setFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'USER',
            contactType: user.contactType || 'WHATSAPP',
            contactValue: user.contactValue || '',
        })

        const dates: Record<string, string> = {}
        const newPlans: Record<string, string> = {}
        user.iggIds.forEach((igg) => {
            if (igg.subscription?.expiresAt) {
                try {
                    dates[igg.iggId] = new Date(igg.subscription.expiresAt).toISOString().split('T')[0]
                } catch {
                    dates[igg.iggId] = ''
                }
            }
            if (igg.subscription?.plan) {
                newPlans[igg.iggId] = igg.subscription.plan
            } else {
                newPlans[igg.iggId] = 'BANK_BOT'
            }
        })
        setExpiryDates(dates)
        setPlans(newPlans)
    }, [user])

    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        try {
            const res = await fetch('/api/admin/update-user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    ...formData,
                }),
            })

            if (res.ok) {
                toast.success('User updated successfully')
                onUpdate()
            } else {
                const error = await res.json()
                toast.error(error.error || 'Failed to update user')
            }
        } catch {
            toast.error('Failed to update user')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateSubscription = async (iggId: string, date: string, plan: string) => {
        try {
            const res = await fetch('/api/admin/update-igg-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    iggId,
                    expiresAt: date,
                    plan,
                }),
            })

            if (res.ok) {
                toast.success('Subscription updated')
                onUpdate()
            } else {
                toast.error('Failed to update subscription')
            }
        } catch {
            toast.error('Error updating subscription')
        }
    }

    if (!user || !mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            className="pointer-events-auto relative flex w-full max-w-[600px] flex-col overflow-hidden rounded-[24px] border border-border bg-bg-surface shadow-panel max-h-[calc(100vh-24px)] md:max-h-[90vh] md:rounded-[24px]"
                        >
                        <div className="border-b border-border bg-bg-inset/60 px-4 py-4 sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-accent-1/20 bg-accent-1/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-accent-1">
                                            User Control
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-300">
                                            {user.accountStatus}
                                        </span>
                                    </div>
                                    <h2 className="truncate text-lg font-bold text-white sm:text-xl">Manage User</h2>
                                    <p className="mt-1 truncate text-[12px] text-gray-400 sm:text-sm">{user.name} | ID: {user.id}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[24px] border border-white/10 bg-surface transition-colors hover:bg-white/10"
                                >
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-b border-border bg-bg-inset/30 p-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('info')}
                                className={`flex min-h-[46px] items-center justify-center rounded-[24px] px-3 text-sm font-medium transition-colors ${activeTab === 'info'
                                    ? 'border border-primary-500/30 bg-primary-500/10 text-accent-1'
                                    : 'border border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <User className="h-4 w-4" />
                                    User Info
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('igg')}
                                className={`flex min-h-[46px] items-center justify-center rounded-[24px] px-3 text-sm font-medium transition-colors ${activeTab === 'igg'
                                    ? 'border border-primary-500/30 bg-primary-500/10 text-accent-1'
                                    : 'border border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Key className="h-4 w-4" />
                                    IGG IDs ({user.iggIds.length})
                                </div>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar sm:p-6">
                            {activeTab === 'info' ? (
                                <div className="space-y-4">
                                    <div className="rounded-[24px] border border-white/5 bg-background-primary/70 p-4">
                                        <div className="mb-3">
                                            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Profile</h3>
                                            <p className="mt-1 text-[12px] text-gray-400">Update identity, role, and contact details.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400">Name</label>
                                                <div className="flex h-11 w-full items-center rounded-[24px] border border-border bg-background-primary px-3 focus-within:ring-2 focus-within:ring-[#7B5EFF]/50">
                                                    <User className="h-4 w-4 shrink-0 text-gray-500" />
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="h-full w-full bg-transparent pl-3 text-white focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400">Role</label>
                                                <TacticalSelect
                                                    value={String(formData.role)}
                                                    onChange={(value) => setFormData({ ...formData, role: value })}
                                                    options={[
                                                        { value: 'USER', label: 'User' },
                                                        { value: 'ADMIN', label: 'Admin' },
                                                    ]}
                                                    icon={<Shield className="h-4 w-4 shrink-0 text-gray-500" />}
                                                    className="[&>button]:h-11 [&>button]:rounded-[24px] [&>button]:border-border [&>button]:bg-background-primary"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Email</label>
                                            <div className="flex h-11 w-full items-center rounded-[24px] border border-border bg-background-primary px-3 focus-within:ring-2 focus-within:ring-[#7B5EFF]/50">
                                                <Mail className="h-4 w-4 shrink-0 text-gray-500" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="h-full w-full bg-transparent pl-3 text-white focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400">Contact Type</label>
                                                <TacticalSelect
                                                    value={String(formData.contactType)}
                                                    onChange={(value) => setFormData({ ...formData, contactType: value as 'WHATSAPP' | 'LINE' | 'TELEGRAM' })}
                                                    options={[
                                                        { value: 'WHATSAPP', label: 'WhatsApp' },
                                                        { value: 'LINE', label: 'Line' },
                                                        { value: 'TELEGRAM', label: 'Telegram' },
                                                    ]}
                                                    className="[&>button]:h-11 [&>button]:rounded-[24px] [&>button]:border-border [&>button]:bg-background-primary"
                                                />
                                            </div>

                                            <div className="space-y-2 sm:col-span-2">
                                                <label className="text-sm font-medium text-gray-400">Contact Value</label>
                                                <div className="flex h-11 w-full items-center rounded-[24px] border border-border bg-background-primary px-3 focus-within:ring-2 focus-within:ring-[#7B5EFF]/50">
                                                    <Phone className="h-4 w-4 shrink-0 text-gray-500" />
                                                    <input
                                                        type="text"
                                                        value={formData.contactValue}
                                                        onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                                                        className="h-full w-full bg-transparent pl-3 text-white focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {user.iggIds.length === 0 ? (
                                        <div className="rounded-[24px] border border-dashed border-white/10 bg-background-primary/40 py-10 text-center text-gray-500">
                                            No IGG IDs assigned to this user.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {user.iggIds.map((igg) => (
                                                <div key={igg.id} className="rounded-[24px] border border-white/5 bg-background-primary p-4 transition-colors hover:border-border">
                                                    <div className="space-y-3">
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Key className="mt-0.5 h-4 w-4 shrink-0 text-accent-1" />
                                                                <span className="break-all text-lg font-semibold leading-tight text-white sm:text-base">{igg.iggId}</span>
                                                                <span className={`rounded-[24px] px-2 py-1 text-xs font-medium ${igg.isActive
                                                                    ? 'bg-green-500/10 text-green-400'
                                                                    : 'bg-red-500/10 text-red-400'
                                                                    }`}>
                                                                    {igg.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                            {igg.displayName && (
                                                                <p className="mt-2 pl-6 text-sm text-gray-400">{igg.displayName}</p>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:items-end">
                                                            <div className="grid gap-1">
                                                                <span className="text-xs text-gray-500">Expires</span>
                                                                <input
                                                                    type="date"
                                                                    value={expiryDates[igg.iggId] || ''}
                                                                    onChange={(e) => {
                                                                        const newDate = e.target.value
                                                                        setExpiryDates((prev) => ({ ...prev, [igg.iggId]: newDate }))
                                                                        handleUpdateSubscription(igg.iggId, newDate, plans[igg.iggId] || 'BANK_BOT')
                                                                    }}
                                                                    className="h-11 w-full rounded-[24px] border border-border bg-surface px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#7B5EFF]/50 [&::-webkit-calendar-picker-indicator]:invert"
                                                                />
                                                            </div>
                                                            
                                                            <div className="grid gap-1">
                                                                <span className="text-xs text-gray-500">Plan</span>
                                                                <select
                                                                    value={plans[igg.iggId] || 'BANK_BOT'}
                                                                    onChange={(e) => {
                                                                        const newPlan = e.target.value
                                                                        setPlans((prev) => ({ ...prev, [igg.iggId]: newPlan }))
                                                                        handleUpdateSubscription(igg.iggId, expiryDates[igg.iggId] || new Date().toISOString(), newPlan)
                                                                    }}
                                                                    className="h-11 w-full rounded-[24px] border border-border bg-surface px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#7B5EFF]/50 [&>option]:bg-background-primary"
                                                                >
                                                                    <option value="BANK_BOT">Bank Bot</option>
                                                                    <option value="BANK_BOT_WHATSAPP">Bank Bot + WA</option>
                                                                    <option value="FARM_BOT">Farm Bot</option>
                                                                </select>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => onRevokeIgg(user.id, igg.iggId)}
                                                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[24px] bg-red-500/10 px-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 sm:w-auto"
                                                                title="Revoke Assignment"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Revoke
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-border bg-bg-inset/45 p-4 sm:px-6">
                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex h-11 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 px-4 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
                                >
                                    Close
                                </button>
                                {activeTab === 'info' && (
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[24px] bg-gradient-primary px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
        ,
        document.body
    )
}

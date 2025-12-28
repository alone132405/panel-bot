'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2, User, Key, Mail, Phone, Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'USER',
        contactType: 'WHATSAPP',
        contactValue: '',
    })
    const [saving, setSaving] = useState(false)

    const [expiryDates, setExpiryDates] = useState<Record<string, string>>({})

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'USER',
                contactType: user.contactType || 'WHATSAPP',
                contactValue: user.contactValue || '',
            })

            // Initialize expiry dates
            const dates: Record<string, string> = {}
            user.iggIds.forEach(igg => {
                if (igg.subscription?.expiresAt) {
                    try {
                        dates[igg.iggId] = new Date(igg.subscription.expiresAt).toISOString().split('T')[0]
                    } catch (e) {
                        dates[igg.iggId] = ''
                    }
                }
            })
            setExpiryDates(dates)
        }
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
                    ...formData
                })
            })

            if (res.ok) {
                toast.success('User updated successfully')
                onUpdate()
            } else {
                const error = await res.json()
                toast.error(error.error || 'Failed to update user')
            }
        } catch (error) {
            toast.error('Failed to update user')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateSubscription = async (iggId: string, date: string) => {
        try {
            const res = await fetch('/api/admin/update-igg-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    iggId,
                    expiresAt: date
                })
            })

            if (res.ok) {
                toast.success('Subscription updated')
                onUpdate()
            } else {
                toast.error('Failed to update subscription')
            }
        } catch (error) {
            toast.error('Error updating subscription')
        }
    }

    if (!user) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                        className="fixed left-1/2 top-1/2 w-full max-w-[600px] max-h-[90vh] bg-background-secondary rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-background-tertiary/50 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-white">Manage User</h2>
                                <p className="text-sm text-gray-400">ID: {user.id}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'info'
                                    ? 'border-primary-500 text-primary-400 bg-primary-500/5'
                                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <User className="w-4 h-4" />
                                    User Info
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('igg')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'igg'
                                    ? 'border-primary-500 text-primary-400 bg-primary-500/5'
                                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Key className="w-4 h-4" />
                                    IGG IDs ({user.iggIds.length})
                                </div>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {activeTab === 'info' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 bg-background-primary border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Role</label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <select
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 bg-background-primary border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                                                >
                                                    <option value="USER">User</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-background-primary border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Contact Type</label>
                                            <select
                                                value={formData.contactType}
                                                onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
                                                className="w-full px-4 py-2 bg-background-primary border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                                            >
                                                <option value="WHATSAPP">WhatsApp</option>
                                                <option value="LINE">Line</option>
                                                <option value="TELEGRAM">Telegram</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Contact Value</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={formData.contactValue}
                                                    onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 bg-background-primary border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {user.iggIds.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No IGG IDs assigned to this user.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {user.iggIds.map((igg) => (
                                                <div key={igg.id} className="flex items-center justify-between p-4 bg-background-primary rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Key className="w-4 h-4 text-primary-400" />
                                                            <span className="font-medium text-white">{igg.iggId}</span>
                                                        </div>
                                                        {igg.displayName && (
                                                            <p className="text-sm text-gray-400 mt-1 ml-6">{igg.displayName}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-end mr-4">
                                                            <span className="text-xs text-gray-500 mb-1">Expires</span>
                                                            <input
                                                                type="date"
                                                                value={expiryDates[igg.iggId] || ''}
                                                                onChange={(e) => {
                                                                    const newDate = e.target.value
                                                                    setExpiryDates(prev => ({ ...prev, [igg.iggId]: newDate }))
                                                                    handleUpdateSubscription(igg.iggId, newDate)
                                                                }}
                                                                className="px-2 py-1 bg-surface border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 [&::-webkit-calendar-picker-indicator]:invert"
                                                            />
                                                        </div>
                                                        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${igg.isActive
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-red-500/10 text-red-400'
                                                            }`}>
                                                            {igg.isActive ? 'Active' : 'Inactive'}
                                                        </div>
                                                        <button
                                                            onClick={() => onRevokeIgg(user.id, igg.iggId)}
                                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                            title="Revoke Assignment"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

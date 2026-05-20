'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, Activity, Search, Plus, Trash2, Clock, Check, X, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { TacticalSelect } from '@/components/ui/TacticalSelect'
import UserManagementModal from '@/components/modals/UserManagementModal'

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
            createdAt: string
            status: string
        } | null
    }[]
    subscription: {
        plan: string
        status: string
        expiresAt: string
    } | null
}

interface IggIdInfo {
    iggId: string
    isAssigned: boolean
    assignedTo: {
        userId: string
        userName: string
        userEmail: string
    } | null
}

interface AdminRequest {
    id: string
    requesterId: string
    iggId: string
    adminUserId: string
    adminName: string
    requestType: 'ADD' | 'DELETE'
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: string
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([])
    const [availableIggIds, setAvailableIggIds] = useState<IggIdInfo[]>([])
    const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all' | 'adminRequests'>('pending')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null)
    const [isUserModalOpen, setIsUserModalOpen] = useState(false)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [showApprovalModal, setShowApprovalModal] = useState(false)
    const [assignFormData, setAssignFormData] = useState({ nickname: '', iggId: '' })
    const [approvalFormData, setApprovalFormData] = useState({
        iggId: '',
        nickname: '',
        months: 1,
        years: 0,
        plan: 'BANK_BOT' as 'BANK_BOT' | 'BANK_BOT_WHATSAPP'
    })
    const [isAssigning, setIsAssigning] = useState(false)
    const [isApproving, setIsApproving] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [usersRes, iggIdsRes, adminReqRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/igg-ids'),
                fetch('/api/admin-requests?status=PENDING'),
            ])

            if (usersRes.ok) {
                const data = await usersRes.json()
                setUsers(data.users)
            }

            if (iggIdsRes.ok) {
                const data = await iggIdsRes.json()
                setAvailableIggIds(data.iggIds)
            }

            if (adminReqRes.ok) {
                const data = await adminReqRes.json()
                setAdminRequests(data.requests || [])
            }
        } catch (error) {
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleApproveAdminRequest = async (requestId: string) => {
        try {
            const res = await fetch(`/api/admin-requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED' })
            })

            if (res.ok) {
                setAdminRequests(adminRequests.filter(r => r.id !== requestId))
                toast.success('Admin request approved')
            } else {
                toast.error('Failed to approve request')
            }
        } catch (error) {
            toast.error('Failed to approve request')
        }
    }

    const handleRejectAdminRequest = async (requestId: string) => {
        try {
            const res = await fetch(`/api/admin-requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED' })
            })

            if (res.ok) {
                setAdminRequests(adminRequests.filter(r => r.id !== requestId))
                toast.success('Admin request rejected')
            } else {
                toast.error('Failed to reject request')
            }
        } catch (error) {
            toast.error('Failed to reject request')
        }
    }

    const handleApproveUser = async () => {
        if (!selectedUser) return
        if (!approvalFormData.iggId.trim()) {
            toast.error('Please enter an IGG ID')
            return
        }
        if (approvalFormData.months === 0 && approvalFormData.years === 0) {
            toast.error('Please set a subscription duration')
            return
        }

        setIsApproving(true)
        try {
            const res = await fetch('/api/admin/approve-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    iggId: approvalFormData.iggId.trim(),
                    nickname: approvalFormData.nickname.trim() || null,
                    subscriptionDays: 0,
                    subscriptionMonths: approvalFormData.months,
                    subscriptionYears: approvalFormData.years,
                    plan: approvalFormData.plan,
                }),
            })

            if (res.ok) {
                toast.success('User approved successfully!')
                fetchData()
                setShowApprovalModal(false)
                setApprovalFormData({ iggId: '', nickname: '', months: 1, years: 0, plan: 'BANK_BOT' })
                setSelectedUser(null)
            } else {
                const error = await res.json()
                toast.error(error.error || 'Failed to approve user')
            }
        } catch (error) {
            toast.error('Failed to approve user')
        } finally {
            setIsApproving(false)
        }
    }

    const handleRejectUser = async (user: User) => {
        if (!confirm(`Are you sure you want to reject ${user.name}'s account?`)) return

        try {
            const res = await fetch('/api/admin/reject-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            })

            if (res.ok) {
                toast.success('User rejected')
                fetchData()
            } else {
                const error = await res.json()
                toast.error(error.error || 'Failed to reject user')
            }
        } catch (error) {
            toast.error('Failed to reject user')
        }
    }

    const handleAssignIggId = async (userId: string, iggId: string, displayName: string) => {
        if (!iggId.trim()) {
            toast.error('Please enter an IGG ID')
            return
        }

        setIsAssigning(true)
        try {
            const res = await fetch('/api/admin/assign-igg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, iggId, displayName: displayName.trim() || null }),
            })

            if (res.ok) {
                toast.success('IGG ID assigned successfully')
                fetchData()
                setShowAssignModal(false)
                setAssignFormData({ nickname: '', iggId: '' })
            } else {
                const error = await res.json()
                toast.error(error.error || 'Failed to assign IGG ID')
            }
        } catch (error) {
            toast.error('Failed to assign IGG ID')
        } finally {
            setIsAssigning(false)
        }
    }

    const handleRevokeIggId = async (userId: string, iggId: string) => {
        if (!confirm(`Are you sure you want to revoke IGG ID ${iggId}?`)) return

        try {
            const res = await fetch('/api/admin/assign-igg', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, iggId }),
            })

            if (res.ok) {
                toast.success('IGG ID revoked successfully')
                fetchData()
            } else {
                const error = await res.json()
                toast.error(error.error || 'Failed to revoke IGG ID')
            }
        } catch (error) {
            toast.error('Failed to revoke IGG ID')
        }
    }

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())

        if (activeTab === 'pending') return matchesSearch && user.accountStatus === 'PENDING'
        if (activeTab === 'approved') return matchesSearch && user.accountStatus === 'APPROVED'
        if (activeTab === 'adminRequests') return false
        return matchesSearch
    })

    const filteredAdminRequests = adminRequests.filter((request) => {
        const query = searchTerm.toLowerCase()
        if (!query) return true

        return request.iggId.toLowerCase().includes(query) ||
            request.adminName.toLowerCase().includes(query) ||
            request.adminUserId.toLowerCase().includes(query)
    })

    const pendingCount = users.filter(u => u.accountStatus === 'PENDING').length
    const approvedCount = users.filter(u => u.accountStatus === 'APPROVED').length
    const unassignedIggIds = availableIggIds.filter((igg) => !igg.isAssigned)
    const assignedCount = availableIggIds.length - unassignedIggIds.length

    const adminMetrics = [
        { label: 'Pending', value: pendingCount, icon: Clock, tone: 'text-accent-gold', iconClass: 'border-accent-gold/25 bg-accent-gold/10 text-accent-gold' },
        { label: 'Approved', value: approvedCount, icon: Check, tone: 'text-accent-1', iconClass: 'border-accent-1/25 bg-accent-1/10 text-accent-1' },
        { label: 'Assigned IGG', value: assignedCount, icon: Shield, tone: 'text-accent-cyan', iconClass: 'border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan' },
        { label: 'Unassigned', value: unassignedIggIds.length, icon: Activity, tone: 'text-primary-300', iconClass: 'border-primary-500/25 bg-primary-500/10 text-primary-300' },
    ]

    const adminTabs = [
        { id: 'pending' as const, label: 'Pending', count: pendingCount, icon: Clock },
        { id: 'approved' as const, label: 'Approved', count: approvedCount, icon: Check },
        { id: 'all' as const, label: 'All Users', count: users.length, icon: Users },
        { id: 'adminRequests' as const, label: 'Admin Requests', count: adminRequests.length, icon: UserPlus },
    ]

    const statusClass: Record<User['accountStatus'], string> = {
        PENDING: 'border-accent-gold/25 bg-accent-gold/10 text-accent-gold',
        APPROVED: 'border-accent-1/25 bg-accent-1/10 text-accent-1',
        REJECTED: 'border-accent-3/25 bg-accent-3/10 text-accent-3',
    }

    const contactClass = (contactType: User['contactType']) => {
        if (contactType === 'WHATSAPP') return 'border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366]'
        if (contactType === 'LINE') return 'border-[#00C300]/30 bg-[#00C300]/10 text-[#00C300]'
        return 'border-[#0088CC]/30 bg-[#0088CC]/10 text-[#0088CC]'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4 p-2.5 sm:space-y-5 sm:p-6">
            <div className="overflow-hidden rounded-xl border border-border bg-bg-surface shadow-panel">
                <div className="border-b border-border bg-[linear-gradient(135deg,rgba(33,243,177,0.08),rgba(88,101,242,0.04))] px-4 py-3 sm:px-6 sm:py-5">
                    <div className="w-fit rounded-full border border-accent-1/20 bg-accent-1/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-1 sm:text-[11px]">
                        Control Center
                    </div>
                    <h1 className="mt-3 font-orbitron text-lg font-bold tracking-[0.08em] text-text-primary sm:text-3xl sm:tracking-wide">SYSTEM ADMINISTRATION</h1>
                    <p className="mt-1 max-w-2xl font-sans text-[13px] leading-6 text-text-muted sm:text-base">
                        Manage users, approvals, IGG assignments, and global operations.
                    </p>
                </div>
            </div>

            <section className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
                {adminMetrics.map((metric) => {
                    const Icon = metric.icon
                    return (
                        <div key={metric.label} className="rounded-lg border border-border bg-bg-surface p-3 shadow-panel sm:p-4">
                            <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:items-center sm:gap-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted sm:text-[11px] sm:tracking-[0.16em]">{metric.label}</p>
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border sm:h-9 sm:w-9 ${metric.iconClass}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <p className={`font-orbitron text-[28px] leading-none sm:text-3xl ${metric.tone}`}>{metric.value}</p>
                        </div>
                    )
                })}
            </section>

            <section className="rounded-lg border border-border bg-bg-surface shadow-panel">
                <div className="grid grid-cols-2 gap-2 border-b border-border bg-bg-elevated/55 p-2.5 sm:p-3 xl:grid-cols-4">
                    {adminTabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex min-h-[54px] items-center justify-between gap-2 rounded-md border px-2.5 text-left transition-all sm:min-h-[48px] sm:gap-3 sm:px-3 ${isActive
                                    ? 'border-accent-1/35 bg-accent-1/10 text-accent-1 shadow-glow-mint'
                                    : 'border-border bg-bg-inset text-text-muted hover:border-accent-2/30 hover:text-text-primary'
                                    }`}
                            >
                                <span className="flex min-w-0 items-center gap-2">
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span className="truncate text-[12px] font-bold sm:text-[13px]">{tab.label}</span>
                                </span>
                                <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] sm:text-[11px] ${isActive ? 'border-accent-1/20 bg-accent-1/10' : 'border-border bg-bg-surface'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="grid gap-2.5 p-3 sm:gap-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder={activeTab === 'adminRequests' ? 'Search requests by IGG, admin name, or ID...' : 'Search users by name or email...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-11 w-full rounded-md border border-border bg-bg-inset px-4 pl-10 text-sm text-text-primary placeholder-text-muted transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                        />
                    </div>
                    <span className="w-fit rounded-full border border-border bg-bg-inset px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted sm:text-[11px]">
                        {activeTab === 'adminRequests' ? `${filteredAdminRequests.length} requests` : `${filteredUsers.length} users`}
                    </span>
                </div>
            </section>

            {activeTab === 'adminRequests' ? (
                <section className="overflow-hidden rounded-lg border border-border bg-bg-surface shadow-panel">
                    <div className="flex flex-col gap-2 border-b border-border bg-bg-elevated/55 p-3 sm:p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-text-primary">Admin Requests</h2>
                            <p className="text-[12px] text-text-muted">Review pending admin access changes.</p>
                        </div>
                        <span className="w-fit rounded-full border border-accent-gold/20 bg-accent-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-gold">
                            Pending Queue
                        </span>
                    </div>

                    {filteredAdminRequests.length === 0 ? (
                        <div className="p-8 text-center sm:p-12">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-bg-inset text-text-muted">
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <p className="font-bold text-text-primary">No pending admin requests</p>
                            <p className="mt-1 text-sm text-text-muted">Matching admin requests will appear here.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="hidden grid-cols-[minmax(110px,0.8fr)_minmax(180px,1fr)_110px_minmax(180px,1fr)_180px] gap-3 border-b border-border bg-bg-elevated/35 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted xl:grid">
                                <span>IGG ID</span>
                                <span>Requested Admin</span>
                                <span>Type</span>
                                <span>Requested At</span>
                                <span className="text-right">Actions</span>
                            </div>
                            <div className="space-y-3 p-3 sm:space-y-0 sm:p-0 sm:divide-y sm:divide-border">
                                {filteredAdminRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="grid gap-3 rounded-lg border border-border bg-bg-inset/50 p-3 transition-colors hover:bg-white/[0.025] sm:rounded-none sm:border-0 sm:bg-transparent sm:p-4 xl:grid-cols-[minmax(110px,0.8fr)_minmax(180px,1fr)_110px_minmax(180px,1fr)_180px] xl:items-center"
                                    >
                                        <div>
                                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted xl:hidden">IGG ID</span>
                                            <span className="font-mono text-[13px] font-bold text-text-primary">{request.iggId}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted xl:hidden">Requested Admin</span>
                                            <p className="truncate text-[14px] font-bold text-text-primary">{request.adminName}</p>
                                            <p className="truncate font-mono text-[12px] text-text-muted">{request.adminUserId}</p>
                                        </div>
                                        <div>
                                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${request.requestType === 'DELETE'
                                                ? 'border-accent-3/25 bg-accent-3/10 text-accent-3'
                                                : 'border-accent-2/25 bg-accent-2/10 text-accent-2'
                                                }`}>
                                                {request.requestType || 'ADD'}
                                            </span>
                                        </div>
                                        <div className="text-[13px] text-text-muted">
                                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted xl:hidden">Requested At</span>
                                            {new Date(request.createdAt).toLocaleString()}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleApproveAdminRequest(request.id)}
                                                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-accent-1/30 bg-accent-1/10 px-3 text-[12px] font-bold text-accent-1 transition-colors hover:bg-accent-1/20"
                                            >
                                                <Check className="h-4 w-4" />
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRejectAdminRequest(request.id)}
                                                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-accent-3/30 bg-accent-3/10 px-3 text-[12px] font-bold text-accent-3 transition-colors hover:bg-accent-3/20"
                                            >
                                                <X className="h-4 w-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            ) : (
                <section className="overflow-hidden rounded-lg border border-border bg-bg-surface shadow-panel">
                    <div className="flex flex-col gap-2 border-b border-border bg-bg-elevated/55 p-3 sm:p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-text-primary">User Accounts</h2>
                            <p className="text-[12px] text-text-muted">Open a row to review profile details and account controls.</p>
                        </div>
                        <span className="w-fit rounded-full border border-accent-1/20 bg-accent-1/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-1">
                            {activeTab === 'pending' ? 'Approval Queue' : activeTab === 'approved' ? 'Active Users' : 'All Accounts'}
                        </span>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <div className="p-8 text-center sm:p-12">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-bg-inset text-text-muted">
                                <Users className="h-6 w-6" />
                            </div>
                            <p className="font-bold text-text-primary">No users found</p>
                            <p className="mt-1 text-sm text-text-muted">Change the tab or search term to widen the result set.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="hidden grid-cols-[minmax(220px,1.25fr)_minmax(190px,1fr)_minmax(220px,1.15fr)_minmax(170px,0.95fr)_minmax(180px,0.95fr)] gap-3 border-b border-border bg-bg-elevated/35 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted 2xl:grid">
                                <span>User</span>
                                <span>Contact</span>
                                <span>IGG IDs</span>
                                <span>Subscription</span>
                                <span className="text-right">Actions</span>
                            </div>
                            <div className="space-y-3 p-3 sm:space-y-0 sm:p-0 sm:divide-y sm:divide-border">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            setSelectedUserForModal(user)
                                            setIsUserModalOpen(true)
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault()
                                                setSelectedUserForModal(user)
                                                setIsUserModalOpen(true)
                                            }
                                        }}
                                        className="grid cursor-pointer gap-3 rounded-lg border border-border bg-bg-inset/50 p-3 transition-colors hover:bg-white/[0.025] sm:gap-4 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-4 2xl:grid-cols-[minmax(220px,1.25fr)_minmax(190px,1fr)_minmax(220px,1.15fr)_minmax(170px,0.95fr)_minmax(180px,0.95fr)] 2xl:items-center"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-accent-1/20 bg-accent-1/10 font-orbitron text-[14px] text-accent-1">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-[14px] font-bold text-text-primary">{user.name}</p>
                                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${statusClass[user.accountStatus]}`}>
                                                        {user.accountStatus}
                                                    </span>
                                                </div>
                                                <p className="truncate text-[12px] text-text-muted">{user.email}</p>
                                                <p className="mt-1 text-[11px] text-text-muted">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="min-w-0">
                                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted 2xl:hidden">Contact</span>
                                            {user.contactType && user.contactValue ? (
                                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                    <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${contactClass(user.contactType)}`}>
                                                        {user.contactType}
                                                    </span>
                                                    <span className="min-w-0 truncate font-mono text-[12px] text-text-muted">{user.contactValue}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-text-muted">Not set</span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted 2xl:hidden">IGG IDs</span>
                                            <div className="flex flex-wrap gap-2">
                                                {user.iggIds.length > 0 ? (
                                                    user.iggIds.map((igg) => (
                                                        <div
                                                            key={igg.id}
                                                            className="flex max-w-full items-center gap-2 rounded-md border border-accent-1/20 bg-accent-1/10 px-2.5 py-1 text-[12px] font-bold text-accent-1"
                                                        >
                                                            <span className="truncate font-mono">{igg.iggId}</span>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation()
                                                                    handleRevokeIggId(user.id, igg.iggId)
                                                                }}
                                                                className="shrink-0 text-text-muted transition-colors hover:text-accent-3"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-text-muted">None</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="min-w-0">
                                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted 2xl:hidden">Subscription</span>
                                            {user.iggIds.some(igg => igg.subscription) ? (
                                                <div className="space-y-1">
                                                    {user.iggIds.filter(igg => igg.subscription).map((igg) => (
                                                        <div key={igg.id} className="flex min-w-0 items-center gap-2">
                                                            <span className="shrink-0 font-mono text-[11px] text-text-muted">{igg.iggId}:</span>
                                                            <span className="truncate text-[12px] text-text-primary">
                                                                {new Date(igg.subscription!.expiresAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-text-muted">None</span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 2xl:justify-end">
                                            {user.accountStatus === 'PENDING' ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation()
                                                            setSelectedUser(user)
                                                            setShowApprovalModal(true)
                                                        }}
                                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-accent-1/30 bg-accent-1/10 px-3 text-[12px] font-bold text-accent-1 transition-colors hover:bg-accent-1/20"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation()
                                                            handleRejectUser(user)
                                                        }}
                                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-accent-3/30 bg-accent-3/10 px-3 text-[12px] font-bold text-accent-3 transition-colors hover:bg-accent-3/20"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Reject
                                                    </button>
                                                </>
                                            ) : user.accountStatus === 'APPROVED' ? (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        setSelectedUser(user)
                                                        setShowAssignModal(true)
                                                    }}
                                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-accent-2/30 bg-accent-2/10 px-3 text-[12px] font-bold text-accent-2 transition-colors hover:bg-accent-2/20"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Assign IGG
                                                </button>
                                            ) : (
                                                <span className="text-sm text-text-muted">Rejected</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            <section className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="rounded-lg border border-accent-3/25 bg-bg-surface p-3 shadow-panel sm:p-4">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-accent-3/25 bg-accent-3/10 text-accent-3">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-text-primary">Critical Operations</h3>
                            <p className="text-[12px] text-text-muted">Stop all active proxy servers and bot instances.</p>
                        </div>
                    </div>
                    <button className="inline-flex min-h-[42px] w-full items-center justify-center rounded-md border border-accent-3/35 bg-accent-3/10 px-4 text-[13px] font-bold text-accent-3 transition-colors hover:bg-accent-3/20 active:scale-[0.99]">
                        Emergency Stop
                    </button>
                </div>

                <div className="flex h-[200px] flex-col overflow-hidden rounded-lg border border-border bg-bg-surface shadow-panel sm:h-[220px]">
                    <div className="flex items-center justify-between border-b border-border bg-bg-elevated/55 px-3 py-3 sm:px-4">
                        <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.16em] text-text-primary">
                            <span className="h-2 w-2 rounded-full bg-accent-1 shadow-glow-mint" />
                            Real-Time Telemetry
                        </h3>
                    </div>
                    <div className="flex-1 space-y-1 overflow-auto bg-[#030507] p-3 font-mono text-[11px] text-text-muted scrollbar-thin sm:p-4">
                        <p className="text-accent-1">[SYS] Telemetry stream initialized...</p>
                        <p>[NET] Proxy connection established on port 8080</p>
                        <p>[AUT] Instance #142 reported status OK</p>
                        <p className="text-accent-gold">[WARN] High latency detected on node Alpha</p>
                        <p>[SYS] Syncing user data... 100%</p>
                        <p className="animate-pulse">_</p>
                    </div>
                </div>
            </section>

            {/* Approval Modal */}
            {showApprovalModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background-secondary rounded-2xl border border-border p-6 max-w-lg w-full shadow-xl"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-accent-emerald to-emerald-600 rounded-xl flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Approve User</h3>
                                <p className="text-gray-400 text-sm">{selectedUser.name} ({selectedUser.email})</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* IGG ID */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    IGG ID <span className="text-accent-rose">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={approvalFormData.iggId}
                                    onChange={(e) => setApprovalFormData(prev => ({ ...prev, iggId: e.target.value }))}
                                    placeholder="Enter IGG ID (e.g., 1234567890)"
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                />
                            </div>

                            {/* Nickname */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    Nickname <span className="text-gray-500">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={approvalFormData.nickname}
                                    onChange={(e) => setApprovalFormData(prev => ({ ...prev, nickname: e.target.value }))}
                                    placeholder="Display name for this account"
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                />
                            </div>

                            {/* Subscription Plan */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Subscription Plan</label>
                                <TacticalSelect
        value={approvalFormData.plan}
        onChange={(v) => setApprovalFormData(prev => ({ ...prev, plan: v as any }))}
        options={[
            { value: 'BANK_BOT', label: 'Bank Bot' },
            { value: 'BANK_BOT_WHATSAPP', label: 'Bank Bot + WhatsApp Bot' }
        ]}
    />
                            </div>

                            {/* Subscription Duration */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    Subscription Duration <span className="text-accent-rose">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Months</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={approvalFormData.months}
                                            onChange={(e) => setApprovalFormData(prev => ({ ...prev, months: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Years</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={approvalFormData.years}
                                            onChange={(e) => setApprovalFormData(prev => ({ ...prev, years: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowApprovalModal(false)
                                        setApprovalFormData({ iggId: '', nickname: '', months: 1, years: 0, plan: 'BANK_BOT' })
                                        setSelectedUser(null)
                                    }}
                                    className="flex-1 px-4 py-3 bg-surface hover:bg-surface-hover rounded-xl text-gray-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApproveUser}
                                    disabled={isApproving || !approvalFormData.iggId.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-accent-emerald to-emerald-600 hover:opacity-90 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isApproving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Approving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Approve User
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Assign IGG ID Modal (for already approved users) */}
            {showAssignModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background-secondary rounded-2xl border border-border p-6 max-w-md w-full shadow-xl"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Assign IGG ID
                                </h3>
                                <p className="text-gray-400 text-sm">to {selectedUser.name}</p>
                            </div>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleAssignIggId(selectedUser.id, assignFormData.iggId, assignFormData.nickname)
                            }}
                            className="space-y-4"
                        >
                            {/* Nickname Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    Nickname <span className="text-gray-500">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={assignFormData.nickname}
                                    onChange={(e) => setAssignFormData(prev => ({ ...prev, nickname: e.target.value }))}
                                    placeholder="Enter a display name..."
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                                />
                            </div>

                            {/* IGG ID Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    IGG ID <span className="text-accent-rose">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={assignFormData.iggId}
                                    onChange={(e) => setAssignFormData(prev => ({ ...prev, iggId: e.target.value }))}
                                    placeholder="Enter IGG ID (e.g., 1234567890)"
                                    required
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAssignModal(false)
                                        setAssignFormData({ nickname: '', iggId: '' })
                                    }}
                                    className="flex-1 px-4 py-3 bg-surface hover:bg-surface-hover rounded-xl text-gray-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAssigning || !assignFormData.iggId.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-primary hover:opacity-90 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isAssigning ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Assigning...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Assign
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* User Management Modal */}
            <UserManagementModal
                isOpen={isUserModalOpen}
                onClose={() => {
                    setIsUserModalOpen(false)
                    setSelectedUserForModal(null)
                }}
                user={selectedUserForModal}
                onUpdate={fetchData}
                onRevokeIgg={handleRevokeIggId}
            />
        </div>
    )
}


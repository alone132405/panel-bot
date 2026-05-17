'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, Activity, Search, Plus, Trash2, Clock, Check, X, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
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

    // Filter users based on search and tab
    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())

        if (activeTab === 'pending') return matchesSearch && user.accountStatus === 'PENDING'
        if (activeTab === 'approved') return matchesSearch && user.accountStatus === 'APPROVED'
        return matchesSearch
    })

    const pendingCount = users.filter(u => u.accountStatus === 'PENDING').length
    const approvedCount = users.filter(u => u.accountStatus === 'APPROVED').length
    const unassignedIggIds = availableIggIds.filter((igg) => !igg.isAssigned)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-orbitron tracking-wide text-xl sm:text-3xl font-bold text-text-primary mb-1 sm:mb-2">SYSTEM ADMINISTRATION</h1>
                <p className="font-sans text-sm sm:text-base text-text-muted">Manage users, approvals, and global system operations</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-bg-surface border border-border rounded-[14px] p-6 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 bg-gradient-to-t from-yellow-400 to-transparent"></div>
                    <div className="relative z-10">
                        <p className="font-sans text-text-muted text-sm uppercase tracking-wider mb-2">Pending</p>
                        <p className="font-orbitron text-4xl text-yellow-400">{pendingCount}</p>
                    </div>
                </div>

                <div className="bg-bg-surface border border-border rounded-[14px] p-6 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 bg-gradient-to-t from-accent-1 to-transparent"></div>
                    <div className="relative z-10">
                        <p className="font-sans text-text-muted text-sm uppercase tracking-wider mb-2">Approved Users</p>
                        <p className="font-orbitron text-4xl text-accent-1">{approvedCount}</p>
                    </div>
                </div>

                <div className="bg-bg-surface border border-border rounded-[14px] p-6 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 bg-gradient-to-t from-accent-2 to-transparent"></div>
                    <div className="relative z-10">
                        <p className="font-sans text-text-muted text-sm uppercase tracking-wider mb-2">Total IGG IDs</p>
                        <p className="font-orbitron text-4xl text-accent-2">{availableIggIds.length}</p>
                    </div>
                </div>

                <div className="bg-bg-surface border border-border rounded-[14px] p-6 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 bg-gradient-to-t from-accent-3 to-transparent"></div>
                    <div className="relative z-10">
                        <p className="font-sans text-text-muted text-sm uppercase tracking-wider mb-2">Unassigned</p>
                        <p className="font-orbitron text-4xl text-accent-3">{unassignedIggIds.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-5 py-2.5 rounded-full font-sans text-[14px] transition-all flex items-center gap-2 ${activeTab === 'pending'
                        ? 'bg-gradient-to-r from-accent-1 to-accent-2 text-[#07070E] font-bold shadow-glow-mint'
                        : 'bg-bg-elevated text-text-muted hover:text-text-primary hover:bg-bg-elevated/80'
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    Pending
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] ${activeTab === 'pending' ? 'bg-[#07070E]/20' : 'bg-bg-surface'}`}>{pendingCount}</span>
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`px-5 py-2.5 rounded-full font-sans text-[14px] transition-all flex items-center gap-2 ${activeTab === 'approved'
                        ? 'bg-gradient-to-r from-accent-1 to-accent-2 text-[#07070E] font-bold shadow-glow-mint'
                        : 'bg-bg-elevated text-text-muted hover:text-text-primary hover:bg-bg-elevated/80'
                        }`}
                >
                    <Check className="w-4 h-4" />
                    Approved
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] ${activeTab === 'approved' ? 'bg-[#07070E]/20' : 'bg-bg-surface'}`}>{approvedCount}</span>
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-5 py-2.5 rounded-full font-sans text-[14px] transition-all flex items-center gap-2 ${activeTab === 'all'
                        ? 'bg-gradient-to-r from-accent-1 to-accent-2 text-[#07070E] font-bold shadow-glow-mint'
                        : 'bg-bg-elevated text-text-muted hover:text-text-primary hover:bg-bg-elevated/80'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    All Users
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] ${activeTab === 'all' ? 'bg-[#07070E]/20' : 'bg-bg-surface'}`}>{users.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('adminRequests')}
                    className={`px-5 py-2.5 rounded-full font-sans text-[14px] transition-all flex items-center gap-2 ${activeTab === 'adminRequests'
                        ? 'bg-gradient-to-r from-accent-1 to-accent-2 text-[#07070E] font-bold shadow-glow-mint'
                        : 'bg-bg-elevated text-text-muted hover:text-text-primary hover:bg-bg-elevated/80'
                        }`}
                >
                    <UserPlus className="w-4 h-4" />
                    Admin Requests
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] ${activeTab === 'adminRequests' ? 'bg-[#07070E]/20' : 'bg-bg-surface'}`}>{adminRequests.length}</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-bg-surface border border-border rounded-[14px] p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-2 focus:shadow-glow-violet transition-all"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-bg-surface border border-border rounded-[14px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-bg-elevated border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">User</th>
                                <th className="px-6 py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">Contact</th>
                                <th className="px-6 py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">IGG IDs</th>
                                <th className="px-6 py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">Subscription</th>
                                <th className="px-6 py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-[#7B5EFF0D] transition-colors cursor-pointer group"
                                        onClick={() => {
                                            setSelectedUserForModal(user)
                                            setIsUserModalOpen(true)
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-2/20 to-accent-1/20 border border-border flex items-center justify-center font-orbitron text-accent-1">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-sans text-[14px] font-bold text-text-primary">{user.name}</p>
                                                        <p className="font-sans text-[12px] text-text-muted">{user.email}</p>
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-bg-elevated rounded-full font-sans text-[11px] text-text-muted">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.contactType && user.contactValue ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-[11px] font-sans font-bold border ${user.contactType === 'WHATSAPP' ? 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/30' :
                                                        user.contactType === 'LINE' ? 'bg-[#00C300]/10 text-[#00C300] border-[#00C300]/30' :
                                                            'bg-[#0088CC]/10 text-[#0088CC] border-[#0088CC]/30'
                                                        }`}>
                                                        {user.contactType}
                                                    </span>
                                                    <span className="font-mono text-[12px] text-text-muted">{user.contactValue}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm">Not set</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {user.iggIds.length > 0 ? (
                                                    user.iggIds.map((igg) => (
                                                        <div
                                                            key={igg.id}
                                                            className="flex items-center gap-2 px-3 py-1 bg-accent-emerald/10 text-accent-emerald rounded-lg text-sm"
                                                        >
                                                            <span>{igg.iggId}</span>
                                                            <button
                                                                onClick={() => handleRevokeIggId(user.id, igg.iggId)}
                                                                className="hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500 text-sm">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.iggIds.some(igg => igg.subscription) ? (
                                                <div className="space-y-1">
                                                    {user.iggIds.filter(igg => igg.subscription).map((igg) => (
                                                        <div key={igg.id} className="flex items-center gap-2">
                                                            <span className="text-gray-400 text-xs font-mono">{igg.iggId}:</span>
                                                            <span className="text-white text-xs">
                                                                {new Date(igg.subscription!.expiresAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.accountStatus === 'PENDING' ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user)
                                                                setShowApprovalModal(true)
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-2 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-[8px] hover:bg-[#10B981]/20 hover:shadow-glow-mint transition-all duration-150 font-sans text-[13px] font-bold"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectUser(user)}
                                                            className="flex items-center gap-1 px-3 py-2 bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-[#FF4D6D] rounded-[8px] hover:bg-[#FF4D6D]/20 hover:shadow-glow-red transition-all duration-150 font-sans text-[13px] font-bold"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : user.accountStatus === 'APPROVED' ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user)
                                                            setShowAssignModal(true)
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-1/10 to-accent-2/10 border border-accent-1/30 text-accent-1 rounded-[8px] hover:brightness-125 transition-all duration-150 font-sans text-[13px] font-bold"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Assign IGG ID
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">Rejected</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Admin Requests Table - Only show when adminRequests tab is active */}
            {activeTab === 'adminRequests' && (
                <div className="bg-bg-surface border border-border rounded-[14px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-bg-elevated border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">For IGG ID</th>
                                    <th className="px-6 py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">Requested Admin</th>
                                    <th className="px-6 py-4 text-center font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">Type</th>
                                    <th className="px-6 py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">Requested At</th>
                                    <th className="px-6 py-4 text-left font-orbitron text-[10px] tracking-[0.15em] text-text-muted uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {adminRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            No pending admin requests
                                        </td>
                                    </tr>
                                ) : (
                                    adminRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-[#7B5EFF0D] transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-white font-mono">{request.iggId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-white font-medium">{request.adminName}</p>
                                                    <p className="text-gray-400 text-sm font-mono">{request.adminUserId}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.requestType === 'DELETE'
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {request.requestType || 'ADD'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-400 text-sm">
                                                    {new Date(request.createdAt).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleApproveAdminRequest(request.id)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-[8px] hover:bg-[#10B981]/20 hover:shadow-glow-mint transition-all duration-150 font-sans text-[13px] font-bold"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectAdminRequest(request.id)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-[#FF4D6D] rounded-[8px] hover:bg-[#FF4D6D]/20 hover:shadow-glow-red transition-all duration-150 font-sans text-[13px] font-bold"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            
            {/* Global Operations Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* GLOBAL AUTOMATION CARD */}
                <div className="bg-bg-elevated border border-accent-3 rounded-[14px] p-6 relative overflow-hidden shadow-glow-red">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-4 h-4 bg-accent-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(255,77,109,0.8)]"></div>
                        <h3 className="font-orbitron text-xl text-accent-3">CRITICAL OPERATIONS</h3>
                    </div>
                    <p className="font-sans text-sm text-text-muted mb-6">
                        Warning: Terminating all automation will immediately halt all active proxy servers and bot instances.
                    </p>
                    <button className="w-full py-4 bg-accent-3 text-white font-orbitron text-lg font-bold rounded-[10px] hover:brightness-125 hover:shadow-[0_0_30px_rgba(255,77,109,0.6)] transition-all active:scale-95">
                        EMERGENCY STOP
                    </button>
                </div>

                {/* LOGS TERMINAL */}
                <div className="bg-[#000000] border border-border rounded-[14px] p-0 flex flex-col h-[220px]">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-bg-surface rounded-t-[14px]">
                        <h3 className="font-orbitron text-sm text-text-primary tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-accent-1 rounded-full animate-pulse"></span>
                            REAL-TIME TELEMETRY
                        </h3>
                    </div>
                    <div className="p-4 flex-1 overflow-auto font-mono text-[11px] text-text-muted space-y-1">
                        <p className="text-accent-1">[SYS] Telemetry stream initialized...</p>
                        <p>[NET] Proxy connection established on port 8080</p>
                        <p>[AUT] Instance #142 reported status OK</p>
                        <p className="text-accent-gold">[WARN] High latency detected on node Alpha</p>
                        <p>[SYS] Syncing user data... 100%</p>
                        <p className="animate-pulse">_</p>
                    </div>
                </div>
            </div>

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
                                <select
                                    value={approvalFormData.plan}
                                    onChange={(e) => setApprovalFormData(prev => ({ ...prev, plan: e.target.value as any }))}
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                >
                                    <option value="BANK_BOT">Bank Bot</option>
                                    <option value="BANK_BOT_WHATSAPP">Bank Bot + WhatsApp Bot</option>
                                </select>
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


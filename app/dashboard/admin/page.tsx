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
                <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Admin Panel</h1>
                <p className="text-sm sm:text-base text-gray-400">Manage users, approvals, and IGG ID assignments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Pending Approval</p>
                            <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Approved Users</p>
                            <p className="text-2xl font-bold text-white">{approvedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-emerald/10 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-accent-emerald" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total IGG IDs</p>
                            <p className="text-2xl font-bold text-white">{availableIggIds.length}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-cyan/10 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-accent-cyan" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Unassigned</p>
                            <p className="text-2xl font-bold text-white">{unassignedIggIds.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    Pending ({pendingCount})
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'approved'
                        ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Check className="w-4 h-4" />
                    Approved ({approvedCount})
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'all'
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    All Users ({users.length})
                </button>
                <button
                    onClick={() => setActiveTab('adminRequests')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'adminRequests'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <UserPlus className="w-4 h-4" />
                    Admin Requests ({adminRequests.length})
                </button>
            </div>

            {/* Search */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background-tertiary border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-background-tertiary/50 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Contact</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">IGG IDs</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Subscription</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                                        onClick={() => {
                                            setSelectedUserForModal(user)
                                            setIsUserModalOpen(true)
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white font-medium">{user.name}</p>
                                                <p className="text-gray-400 text-sm">{user.email}</p>
                                                <p className="text-gray-500 text-xs">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${user.accountStatus === 'PENDING'
                                                    ? 'bg-yellow-500/10 text-yellow-400'
                                                    : user.accountStatus === 'APPROVED'
                                                        ? 'bg-accent-emerald/10 text-accent-emerald'
                                                        : 'bg-red-500/10 text-red-400'
                                                    }`}
                                            >
                                                {user.accountStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.contactType && user.contactValue ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.contactType === 'WHATSAPP' ? 'bg-green-500/10 text-green-400' :
                                                        user.contactType === 'LINE' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            'bg-blue-500/10 text-blue-400'
                                                        }`}>
                                                        {user.contactType}
                                                    </span>
                                                    <span className="text-gray-300 text-sm">{user.contactValue}</span>
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
                                                            <span>{igg.displayName || igg.iggId}</span>
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
                                            {user.subscription ? (
                                                <div>
                                                    <span className="text-white text-sm">{user.subscription.plan}</span>
                                                    <p className="text-gray-500 text-xs">
                                                        Expires: {new Date(user.subscription.expiresAt).toLocaleDateString()}
                                                    </p>
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
                                                            className="flex items-center gap-1 px-3 py-2 bg-accent-emerald/10 text-accent-emerald rounded-lg hover:bg-accent-emerald/20 transition-colors text-sm"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectUser(user)}
                                                            className="flex items-center gap-1 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
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
                                                        className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors text-sm"
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
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-background-tertiary/50 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">For IGG ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Requested Admin</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Requested At</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {adminRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            No pending admin requests
                                        </td>
                                    </tr>
                                ) : (
                                    adminRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-white/5 transition-colors">
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
                                                        className="flex items-center gap-1 px-3 py-2 bg-accent-emerald/10 text-accent-emerald rounded-lg hover:bg-accent-emerald/20 transition-colors text-sm"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectAdminRequest(request.id)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
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

            {/* Approval Modal */}
            {showApprovalModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background-secondary rounded-2xl border border-white/10 p-6 max-w-lg w-full shadow-xl"
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
                                    className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
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
                                    className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                />
                            </div>

                            {/* Subscription Plan */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Subscription Plan</label>
                                <select
                                    value={approvalFormData.plan}
                                    onChange={(e) => setApprovalFormData(prev => ({ ...prev, plan: e.target.value as any }))}
                                    className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
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
                                            className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Years</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={approvalFormData.years}
                                            onChange={(e) => setApprovalFormData(prev => ({ ...prev, years: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background-secondary rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-xl"
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
                                    className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
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
                                    className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
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

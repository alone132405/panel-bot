'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
    Database,
    Users,
    Plus,
    Trash2,
    Save,
    UserPlus,
    Terminal,
    Edit2,
    Check,
    X,
    Search,
    Settings,
    Loader2,
    Clock
} from 'lucide-react'
import { toast } from 'sonner'
import IggIdSelector from '@/components/settings/IggIdSelector'
import { useSocket } from '@/hooks/useSocket'

interface AuthorizedUser {
    UserID: number
    AccountName: string
    highAuth: boolean
    deferAccountName: string
    DeferID: number
    accountBalance: number[]
    socialID: number
}

interface GuildCommand {
    bCommand: number
    commadReference: string
    enableCommand: boolean
    minRank: number
}

interface BankSettings {
    enableBank: boolean
    allowChatCommands: boolean
    allowMailCommands: boolean
    autoDeleteCmdMail: boolean
    disableMailResponse: boolean
    disableErrorResponse: boolean
    cmdPrefix: string
    maxSendLimit: number
    maxSendDistance: number
    useBagRss: boolean
    ignoreBalance: boolean
    allowAdminBalance: boolean
    allowAdminSkipLimit: boolean
    allowExternalCommands: boolean
    BuildspamMinimum: number
    guildCommands: GuildCommand[]
    accountData: AuthorizedUser[]
}

const RANK_OPTIONS = [
    { value: 1, label: 'RANK1' },
    { value: 2, label: 'RANK2' },
    { value: 3, label: 'RANK3' },
    { value: 4, label: 'RANK4' },
    { value: 5, label: 'RANK5' },
    { value: 6, label: 'Authorized' },
]

// Command ID to display name mapping
const COMMAND_NAMES: Record<number, string> = {
    2: 'CheckBalance',
    5: 'SetAccount',
    6: 'SendFood',
    7: 'SendStone',
    8: 'SendWood',
    9: 'SendOre',
    10: 'SendGold',
    11: 'SendFoodAdmin',
    12: 'SendStoneAdmin',
    13: 'SendWoodAdmin',
    14: 'SendOreAdmin',
    15: 'SendGoldAdmin',
    16: 'donateFood',
    17: 'donateStone',
    18: 'donateWood',
    19: 'donateOre',
    20: 'donateGold',
    21: 'setRssLimit',
    22: 'adminBal',
    23: 'setBal',
    24: 'stop',
    25: 'shield',
    27: 'findTile',
    28: 'findMonster',
    29: 'pos',
    30: 'hunt',
    31: 'relocate',
    32: 'guild',
    33: 'abort',
    34: 'buildspam',
    35: 'addTitle',
    36: 'delTitle',
    37: 'transfer',
    38: 'stats',
    39: 'rss',
    40: 'adminRss',
    41: 'whitelist',
    42: 'blacklist',
    43: 'unlistWhite',
    44: 'unlistBlack',
    45: 'purge',
    46: 'quest',
    47: 'yell',
    48: 'camp',
    49: 'campLeader',
    50: 'recall',
    51: 'adminBag',
    52: 'snowbeast',
    53: 'setGather',
    54: 'relocateKvk',
    55: 'reloadAcc',
    56: 'members',
    57: 'findTileLocal',
    58: 'findMonsterLocal',
    59: 'migrate',
    60: 'pStats',
    61: 'findNest',
    62: 'findNestLocal',
    63: 'regUser',
    64: 'unregUser',
    65: 'gryphon',
    66: 'busRank',
    67: 'resetStats',
    68: 'payRansom',
    69: 'clearBoard',
    70: 'ess',
    71: 'joinGvG',
    72: 'leaveGvG',
    73: 'joinDa',
    74: 'joinCa',
    75: 'leaveCa',
    76: 'leaveDa',
}

// Interface for pending admin requests
interface PendingRequest {
    id: string
    adminUserId: string
    adminName: string
    requestType: 'ADD' | 'DELETE'
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: string
}

export default function BankSettingsPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'commands'>('users')
    const [selectedIggId, setSelectedIggId] = useState<string | null>(null)
    const [settings, setSettings] = useState<BankSettings | null>(null)
    const [loading, setLoading] = useState(false)
    const [showAddUserModal, setShowAddUserModal] = useState(false)
    const [newUser, setNewUser] = useState({ iggId: '', name: '' })
    const [editingCommand, setEditingCommand] = useState<number | null>(null)
    const [commandSearch, setCommandSearch] = useState('')
    const [showCommandSearch, setShowCommandSearch] = useState(false)
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
    const [applying, setApplying] = useState(false)
    const { queueStatus, automationStatus } = useSocket(selectedIggId || undefined)
    const [queuePosition, setQueuePosition] = useState(0)
    const [cooldown, setCooldown] = useState(0)
    const [showApplyButton, setShowApplyButton] = useState(false)

    // Load cooldown from local storage
    useEffect(() => {
        if (!selectedIggId) return

        const checkCooldown = () => {
            const savedExpiry = localStorage.getItem(`automation_cooldown_bank_${selectedIggId}`)
            if (savedExpiry) {
                const expiryTime = parseInt(savedExpiry)
                const now = Date.now()
                const remaining = Math.ceil((expiryTime - now) / 1000)

                if (remaining > 0) {
                    setCooldown(remaining)
                } else {
                    localStorage.removeItem(`automation_cooldown_bank_${selectedIggId}`)
                    setCooldown(0)
                }
            } else {
                setCooldown(0)
            }
        }

        checkCooldown()
        const interval = setInterval(checkCooldown, 1000)
        return () => clearInterval(interval)
    }, [selectedIggId])

    // Update queue status from socket
    // Update queue position and status from socket
    useEffect(() => {
        if (!selectedIggId || !queueStatus) {
            if (!applying) setQueuePosition(0)
            return
        }

        const index = queueStatus.queuedIggIds.indexOf(selectedIggId)
        if (index !== -1) {
            if (index === 0 && queueStatus.isRunning) {
                setApplying(true)
                setQueuePosition(0)
            } else {
                setApplying(true)
                if (queueStatus.isRunning) {
                    setQueuePosition(index)
                } else {
                    setQueuePosition(index + 1)
                }
            }
        } else {
            if (cooldown > 0) {
                setApplying(false)
            } else {
                if (queueStatus.queuedIggIds.length > 0) {
                    setApplying(false)
                    setQueuePosition(0)
                }
            }
        }
    }, [queueStatus, selectedIggId])

    // Listen for automation completion to hide button
    // Listen for automation completion to update UI
    // Listen for automation completion to update UI
    useEffect(() => {
        console.log('BankPage: automationStatus updated:', automationStatus)
        if (automationStatus?.status === 'completed' || automationStatus?.status === 'error') {
            console.log('BankPage: Automation finished with status:', automationStatus.status)
            setApplying(false)
            setQueuePosition(0)
            if (automationStatus.status === 'completed') {
                console.log('BankPage: Triggering success toast')
                toast.success('Changes applied successfully!', { duration: 5000 })
                setShowApplyButton(false)
            } else {
                console.log('BankPage: Triggering error toast')
                toast.error(automationStatus.message || 'Automation failed')
            }
        }
    }, [automationStatus])

    // Listen for file updates via socket
    const { socket } = useSocket(selectedIggId || undefined)
    useEffect(() => {
        if (!socket || !selectedIggId) return

        const onBankSettingsUpdated = (data: { iggId: string, settings: BankSettings }) => {
            if (data.iggId === selectedIggId) {
                console.log('BankPage: Received external settings update')
                setSettings(data.settings)
            }
        }

        socket.on('bank-settings-updated', onBankSettingsUpdated)

        return () => {
            socket.off('bank-settings-updated', onBankSettingsUpdated)
        }
    }, [socket, selectedIggId])

    const handleApplyChanges = async () => {
        if (!selectedIggId) return

        if (cooldown > 0) {
            toast.warning(`Please wait ${Math.ceil(cooldown / 60)} minutes before applying changes again.`)
            return
        }

        setApplying(true)

        try {
            const res = await fetch('/api/automation/apply-changes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ iggId: selectedIggId })
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.error || 'Failed to start automation')
                setApplying(false)
                return
            }

            toast.success('Request sent to queue!')
            // Set cooldown
            const expiry = Date.now() + 5 * 60 * 1000 // 5 minutes
            localStorage.setItem(`automation_cooldown_bank_${selectedIggId}`, expiry.toString())
            setCooldown(300)

        } catch (error) {
            toast.error('Failed to connect to automation server')
            setApplying(false)
        }
    }

    // Load settings and pending requests when IGG ID changes
    useEffect(() => {
        if (selectedIggId) {
            loadSettings()
            loadPendingRequests()
            setShowApplyButton(false)
        }
    }, [selectedIggId])

    const loadPendingRequests = async () => {
        if (!selectedIggId) return
        try {
            const res = await fetch(`/api/admin-requests?iggId=${selectedIggId}`)
            if (res.ok) {
                const data = await res.json()
                setPendingRequests(data.requests || [])
            }
        } catch (error) {
            console.error('Failed to load pending requests:', error)
        }
    }

    const loadSettings = async () => {
        if (!selectedIggId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/settings/${selectedIggId}/bank`)
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            } else {
                // Initialize with defaults if not found
                setSettings({
                    enableBank: false,
                    allowChatCommands: true,
                    allowMailCommands: true,
                    autoDeleteCmdMail: false,
                    disableMailResponse: false,
                    disableErrorResponse: false,
                    cmdPrefix: '!',
                    maxSendLimit: 40000000,
                    maxSendDistance: 50,
                    useBagRss: false,
                    ignoreBalance: false,
                    allowAdminBalance: false,
                    allowAdminSkipLimit: true,
                    allowExternalCommands: false,
                    BuildspamMinimum: 3,
                    guildCommands: [],
                    accountData: []
                })
            }
        } catch (error) {
            toast.error('Failed to load bank settings')
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        if (!selectedIggId || !settings) return
        try {
            const res = await fetch(`/api/settings/${selectedIggId}/bank`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            if (res.ok) {
                toast.success('Bank settings saved successfully')
                setShowApplyButton(true)
            } else {
                toast.error('Failed to save settings')
            }
        } catch (error) {
            toast.error('Failed to save settings')
        }
    }

    const toggleBankEnabled = () => {
        if (settings) {
            setSettings({ ...settings, enableBank: !settings.enableBank })
        }
    }

    const addUser = async () => {
        if (!selectedIggId || !newUser.iggId.trim()) {
            toast.error('Please enter an IGG ID')
            return
        }

        if (!newUser.name.trim()) {
            toast.error('Please enter a name')
            return
        }

        // Check if already in pending requests
        const existsPending = pendingRequests.find(r => r.adminUserId === newUser.iggId)
        if (existsPending) {
            toast.error('A request for this user is already pending')
            return
        }

        try {
            const res = await fetch('/api/admin-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    iggId: selectedIggId,
                    adminUserId: newUser.iggId,
                    adminName: newUser.name
                })
            })

            if (res.ok) {
                const data = await res.json()
                // Add to local pending requests
                setPendingRequests([...pendingRequests, data.request])
                setNewUser({ iggId: '', name: '' })
                setShowAddUserModal(false)
                toast.success('Admin request submitted - awaiting approval')
            } else {
                const error = await res.json()
                toast.error(error.error || 'Failed to submit request')
            }
        } catch (error) {
            toast.error('Failed to submit request')
        }
    }

    const submitDeleteRequest = async (user: { adminUserId: string, adminName: string }) => {
        if (!selectedIggId) return
        try {
            const res = await fetch('/api/admin-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    iggId: selectedIggId,
                    adminUserId: user.adminUserId,
                    adminName: user.adminName,
                    requestType: 'DELETE'
                })
            })

            if (res.ok) {
                const data = await res.json()
                // Add to local pending requests
                setPendingRequests([...pendingRequests, data.request])
                toast.success('Delete request submitted - awaiting admin approval')
            } else {
                const error = await res.json()
                toast.error(error.error || 'Failed to submit delete request')
            }
        } catch (error) {
            toast.error('Failed to submit delete request')
        }
    }

    const removeUser = (userId: number) => {
        if (!settings) return
        setSettings({
            ...settings,
            accountData: settings.accountData.filter(u => u.UserID !== userId)
        })
        toast.success('User removed')
    }

    const clearAllUsers = () => {
        if (!settings) return
        if (confirm('Are you sure you want to remove all users?')) {
            setSettings({ ...settings, accountData: [] })
            toast.success('All users cleared')
        }
    }

    const toggleUserHighAuth = (userId: number) => {
        if (!settings) return
        setSettings({
            ...settings,
            accountData: settings.accountData.map(u =>
                u.UserID === userId ? { ...u, highAuth: !u.highAuth } : u
            )
        })
    }

    const toggleCommandEnabled = (index: number) => {
        if (!settings) return
        const newCommands = [...settings.guildCommands]
        newCommands[index] = { ...newCommands[index], enableCommand: !newCommands[index].enableCommand }
        setSettings({ ...settings, guildCommands: newCommands })
    }

    const updateCommandRank = (index: number, rank: number) => {
        if (!settings) return
        const newCommands = [...settings.guildCommands]
        newCommands[index] = { ...newCommands[index], minRank: rank }
        setSettings({ ...settings, guildCommands: newCommands })
        setEditingCommand(null)
    }

    const usersList: AuthorizedUser[] = []

    const tabs = [
        { id: 'users', label: 'Authorized Users', icon: Users },
        { id: 'commands', label: 'Command Settings', icon: Terminal },
    ]

    return (
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Bank Settings</h1>
                    <p className="text-gray-400 text-sm sm:text-base">Configure guild bank commands and authorized users</p>
                </div>
                <div className="w-full md:w-80">
                    <IggIdSelector
                        selectedIggId={selectedIggId}
                        onSelect={setSelectedIggId}
                    />
                </div>
            </div>

            {!selectedIggId ? (
                <div className="glass-card p-12 text-center">
                    <Database className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Select an IGG ID</h3>
                    <p className="text-gray-400">Choose an IGG ID from the dropdown above to configure bank settings</p>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : settings && (
                <>
                    {/* Enable Bank Toggle Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                                    <Database className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Enable Guild Bank / Commands</h3>
                                    <p className="text-gray-400 text-sm">Allow bank commands and resource transfers</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleBankEnabled}
                                className={`relative w-14 h-8 rounded-full transition-colors ${settings.enableBank ? 'bg-accent-emerald' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.enableBank ? 'left-7' : 'left-1'
                                    }`} />
                            </button>
                        </div>
                    </motion.div>



                    {/* Tabs */}
                    <div className="glass-card p-1.5 sm:p-2 flex gap-1.5 sm:gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'users' | 'commands')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all text-sm sm:text-base ${activeTab === tab.id
                                        ? 'bg-gradient-primary text-white shadow-glow'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden xs:inline">{tab.label}</span>
                                    <span className="xs:hidden">{tab.id === 'users' ? 'Users' : 'Commands'}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                {/* User Controls */}
                                <div className="glass-card p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowAddUserModal(true)}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary-500/10 text-primary-400 rounded-lg sm:rounded-xl hover:bg-primary-500/20 transition-colors font-medium text-sm sm:text-base"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Add User
                                            </button>

                                            <button
                                                onClick={clearAllUsers}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-accent-rose/10 text-accent-rose rounded-lg sm:rounded-xl hover:bg-accent-rose/20 transition-colors font-medium text-sm sm:text-base"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Clear
                                            </button>
                                        </div>
                                        <div className="hidden sm:block flex-1" />
                                        {/* Checkboxes */}
                                        <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.allowAdminBalance}
                                                    onChange={() => setSettings({ ...settings, allowAdminBalance: !settings.allowAdminBalance })}
                                                    className="w-4 h-4 rounded border-gray-600 bg-surface text-primary-500 focus:ring-primary-500"
                                                />
                                                <span className="text-gray-300 text-xs sm:text-sm">Use Balance</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.allowAdminSkipLimit}
                                                    onChange={() => setSettings({ ...settings, allowAdminSkipLimit: !settings.allowAdminSkipLimit })}
                                                    className="w-4 h-4 rounded border-gray-600 bg-surface text-primary-500 focus:ring-primary-500"
                                                />
                                                <span className="text-gray-300 text-xs sm:text-sm">Bypass Rss Limit</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>


                                {/* Pending Requests Table - Only show when there are pending requests */}
                                {pendingRequests.length > 0 && (
                                    <>
                                        <div className="glass-card overflow-hidden hidden sm:block">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-background-tertiary/50 border-b border-white/5">
                                                        <tr>
                                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-300">IGG</th>
                                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-300">Name</th>
                                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-gray-300">Status</th>
                                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-gray-300">Action</th>
                                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-gray-300">Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {pendingRequests.map((request) => (
                                                            <tr key={request.id} className="hover:bg-white/5 transition-colors">
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                                    <span className="text-white font-mono text-xs sm:text-sm">{request.adminUserId}</span>
                                                                </td>
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                                    <span className="text-gray-300 text-xs sm:text-sm">{request.adminName}</span>
                                                                </td>
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                                                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${request.status === 'PENDING'
                                                                        ? 'bg-amber-500/20 text-amber-400'
                                                                        : request.status === 'APPROVED'
                                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                                            : 'bg-red-500/20 text-red-400'
                                                                        }`}>
                                                                        {request.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                                                                    {request.status === 'APPROVED' && request.requestType !== 'DELETE' && (
                                                                        <button
                                                                            onClick={() => submitDeleteRequest({
                                                                                adminUserId: request.adminUserId,
                                                                                adminName: request.adminName
                                                                            })}
                                                                            className="px-2 sm:px-3 py-1 bg-accent-rose/10 text-accent-rose rounded-lg hover:bg-accent-rose/20 transition-colors text-xs sm:text-sm font-medium"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    )}
                                                                    {request.status === 'PENDING' && (
                                                                        <span className="text-gray-500 text-xs">Pending</span>
                                                                    )}
                                                                    {request.status === 'REJECTED' && (
                                                                        <span className="text-gray-500 text-xs">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.requestType === 'ADD'
                                                                        ? 'bg-blue-500/20 text-blue-400'
                                                                        : 'bg-red-500/20 text-red-400'
                                                                        }`}>
                                                                        {request.requestType || 'ADD'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="space-y-3 sm:hidden">
                                            {pendingRequests.map((request) => (
                                                <div key={request.id} className="glass-card p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="text-xs text-gray-400">IGG ID</div>
                                                            <div className="font-mono text-white">{request.adminUserId}</div>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.requestType === 'ADD'
                                                            ? 'bg-blue-500/20 text-blue-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {request.requestType || 'ADD'}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="text-xs text-gray-400">Name</div>
                                                        <div className="text-gray-300">{request.adminName}</div>
                                                    </div>

                                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'PENDING'
                                                            ? 'bg-amber-500/20 text-amber-400'
                                                            : request.status === 'APPROVED'
                                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                                : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {request.status}
                                                        </span>

                                                        {request.status === 'APPROVED' && request.requestType !== 'DELETE' && (
                                                            <button
                                                                onClick={() => submitDeleteRequest({
                                                                    adminUserId: request.adminUserId,
                                                                    adminName: request.adminName
                                                                })}
                                                                className="px-3 py-1.5 bg-accent-rose/10 text-accent-rose rounded-lg hover:bg-accent-rose/20 transition-colors text-xs font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                        {request.status === 'PENDING' && (
                                                            <span className="text-gray-500 text-xs">Pending</span>
                                                        )}
                                                        {request.status === 'REJECTED' && (
                                                            <span className="text-gray-500 text-xs">-</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'commands' && (
                            <motion.div
                                key="commands"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                {/* Row 1: Main Checkboxes */}
                                <div className="glass-card p-3 sm:p-4">
                                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-3 sm:gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.allowChatCommands}
                                                onChange={() => setSettings({ ...settings, allowChatCommands: !settings.allowChatCommands })}
                                                className="w-4 h-4 rounded border-gray-600 bg-surface text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-gray-300 text-xs sm:text-sm">Chat Commands</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.allowMailCommands}
                                                onChange={() => setSettings({ ...settings, allowMailCommands: !settings.allowMailCommands })}
                                                className="w-4 h-4 rounded border-gray-600 bg-surface text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-gray-300 text-xs sm:text-sm">Mail Commands</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.disableMailResponse}
                                                onChange={() => setSettings({ ...settings, disableMailResponse: !settings.disableMailResponse })}
                                                className="w-4 h-4 rounded border-gray-600 bg-surface text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-gray-300 text-xs sm:text-sm">No Mail Response</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.disableErrorResponse}
                                                onChange={() => setSettings({ ...settings, disableErrorResponse: !settings.disableErrorResponse })}
                                                className="w-4 h-4 rounded border-gray-600 bg-surface text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-gray-300 text-xs sm:text-sm">No Error Mails</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Row 2: Additional Checkboxes */}
                                <div className="glass-card p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.allowExternalCommands}
                                                onChange={() => setSettings({ ...settings, allowExternalCommands: !settings.allowExternalCommands })}
                                                className="w-4 h-4 rounded border-gray-600 bg-surface text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-gray-300 text-xs sm:text-sm">External Guild Commands</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.ignoreBalance}
                                                onChange={() => setSettings({ ...settings, ignoreBalance: !settings.ignoreBalance })}
                                                className="w-4 h-4 rounded border-gray-600 bg-surface text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-gray-300 text-xs sm:text-sm">Ignore Balance</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Row 3: Inputs and Checkboxes */}
                                <div className="glass-card p-3 sm:p-4">
                                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-3 sm:gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.autoDeleteCmdMail}
                                                onChange={() => setSettings({ ...settings, autoDeleteCmdMail: !settings.autoDeleteCmdMail })}
                                                className="w-4 h-4 rounded border-gray-600 bg-surface text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-gray-300 text-xs sm:text-sm">Auto Delete Mails</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.useBagRss}
                                                onChange={() => setSettings({ ...settings, useBagRss: !settings.useBagRss })}
                                                className="w-4 h-4 rounded border-gray-600 bg-surface text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-gray-300 text-xs sm:text-sm">Use Bag Resources</span>
                                        </label>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <span className="text-gray-400 text-xs sm:text-sm">Buildspam Delay:</span>
                                            <input
                                                type="number"
                                                value={settings.BuildspamMinimum || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? 0 : Math.max(0, Math.min(3600, parseInt(e.target.value)))
                                                    setSettings({ ...settings, BuildspamMinimum: val })
                                                }}
                                                min={0}
                                                max={3600}
                                                className="w-14 sm:w-16 px-2 py-1.5 bg-surface border border-white/10 rounded-lg text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4: Limit Inputs */}
                                <div className="glass-card p-3 sm:p-4">
                                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-3 sm:gap-6">
                                        <div className="flex items-center justify-between sm:justify-start gap-2">
                                            <span className="text-gray-400 text-xs sm:text-sm">Max Send Limit:</span>
                                            <input
                                                type="number"
                                                value={settings.maxSendLimit || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? 0 : Math.max(0, Math.min(4290000000, parseInt(e.target.value)))
                                                    setSettings({ ...settings, maxSendLimit: val })
                                                }}
                                                min={0}
                                                max={4290000000}
                                                className="w-28 sm:w-32 px-2 sm:px-3 py-1.5 bg-surface border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-start gap-2">
                                            <span className="text-gray-400 text-xs sm:text-sm">Max Distance:</span>
                                            <input
                                                type="number"
                                                value={settings.maxSendDistance || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? 0 : Math.max(0, Math.min(1000, parseFloat(e.target.value)))
                                                    setSettings({ ...settings, maxSendDistance: val })
                                                }}
                                                min={0}
                                                max={1000}
                                                className="w-16 sm:w-20 px-2 sm:px-3 py-1.5 bg-surface border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-start gap-2">
                                            <span className="text-gray-400 text-xs sm:text-sm">Prefix:</span>
                                            <input
                                                type="text"
                                                value={settings.cmdPrefix}
                                                onChange={(e) => setSettings({ ...settings, cmdPrefix: e.target.value.slice(0, 1) })}
                                                maxLength={1}
                                                className="w-12 px-2 py-1.5 bg-surface border border-white/10 rounded-lg text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Commands List - Responsive */}
                                {(() => {
                                    const filteredCommands = settings.guildCommands
                                        .map((cmd, index) => ({ cmd, index }))
                                        .filter(({ cmd }) =>
                                            cmd.commadReference.toLowerCase().includes(commandSearch.toLowerCase())
                                        );

                                    return (
                                        <>
                                            {/* Desktop Table View */}
                                            <div className="hidden md:block glass-card overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead className="bg-background-tertiary/50 border-b border-white/5">
                                                            <tr>
                                                                {showCommandSearch ? (
                                                                    <th colSpan={3} className="px-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex-1 relative">
                                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Search commands..."
                                                                                    value={commandSearch}
                                                                                    onChange={(e) => setCommandSearch(e.target.value)}
                                                                                    autoFocus
                                                                                    className="w-full pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                                                />
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setShowCommandSearch(false)
                                                                                    setCommandSearch('')
                                                                                }}
                                                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </th>
                                                                ) : (
                                                                    <>
                                                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Command</th>
                                                                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Enabled</th>
                                                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                                                                            <div className="flex items-center justify-between">
                                                                                <span>Minimum Rank</span>
                                                                                <button
                                                                                    onClick={() => setShowCommandSearch(true)}
                                                                                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-primary-400 transition-colors"
                                                                                >
                                                                                    <Search className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        </th>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {filteredCommands.length > 0 ? (
                                                                filteredCommands.map(({ cmd, index }) => (
                                                                    <tr key={index} className="hover:bg-white/5 transition-colors">
                                                                        <td className="px-6 py-3">
                                                                            <span className="text-white font-mono text-sm">{cmd.commadReference}</span>
                                                                        </td>
                                                                        <td className="px-6 py-3 text-center">
                                                                            <button
                                                                                onClick={() => toggleCommandEnabled(index)}
                                                                                className={`p-1.5 rounded-lg transition-colors ${cmd.enableCommand
                                                                                    ? 'bg-accent-emerald/20 text-accent-emerald'
                                                                                    : 'bg-gray-600/20 text-gray-400'
                                                                                    }`}
                                                                            >
                                                                                {cmd.enableCommand ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                                            </button>
                                                                        </td>
                                                                        <td className="px-6 py-3">
                                                                            <select
                                                                                value={cmd.minRank}
                                                                                onChange={(e) => updateCommandRank(index, parseInt(e.target.value))}
                                                                                className="px-3 py-1.5 bg-surface border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                                            >
                                                                                {RANK_OPTIONS.map((opt) => (
                                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                                ))}
                                                                            </select>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                                                        No commands configured
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Mobile Card View */}
                                            <div className="md:hidden space-y-3">
                                                {/* Mobile Search */}
                                                <div className="glass-card p-3">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search commands..."
                                                            value={commandSearch}
                                                            onChange={(e) => {
                                                                setCommandSearch(e.target.value);
                                                                setShowCommandSearch(true);
                                                            }}
                                                            className="w-full pl-10 pr-4 py-2 bg-surface/50 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                    </div>
                                                </div>

                                                {filteredCommands.length > 0 ? (
                                                    filteredCommands.map(({ cmd, index }) => (
                                                        <div key={index} className="glass-card p-4 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-white font-mono text-sm font-medium">{cmd.commadReference}</span>
                                                                <button
                                                                    onClick={() => toggleCommandEnabled(index)}
                                                                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${cmd.enableCommand
                                                                        ? 'bg-accent-emerald/20 text-accent-emerald'
                                                                        : 'bg-surface border border-white/10 text-gray-400'
                                                                        }`}
                                                                >
                                                                    <span className="text-xs font-medium">{cmd.enableCommand ? 'Enabled' : 'Disabled'}</span>
                                                                    {cmd.enableCommand ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                                </button>
                                                            </div>

                                                            <div className="pt-3 border-t border-white/5 space-y-2">
                                                                <label className="text-xs text-gray-400 block uppercase tracking-wider">Minimum Rank</label>
                                                                <select
                                                                    value={cmd.minRank}
                                                                    onChange={(e) => updateCommandRank(index, parseInt(e.target.value))}
                                                                    className="w-full px-4 py-2.5 bg-surface border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                                                                >
                                                                    {RANK_OPTIONS.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="glass-card p-8 text-center text-gray-500">
                                                        No commands found
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Save Button - Only show when NOT applying/waiting */}
                    {!(showApplyButton || applying || cooldown > 0 || queuePosition > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex justify-center"
                        >
                            <button
                                onClick={saveSettings}
                                className="btn-primary w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 shadow-glow hover:shadow-glow-lg transition-all"
                            >
                                <Save className="w-5 h-5 sm:w-6 sm:h-6" />
                                Save Changes
                            </button>
                        </motion.div>
                    )}

                    {/* Apply Changes Button - Only shown after saving or if active */}
                    {(showApplyButton || applying || cooldown > 0 || queuePosition > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center pt-8"
                        >
                            <button
                                onClick={handleApplyChanges}
                                disabled={applying || !selectedIggId || cooldown > 0}
                                className="btn-primary px-12 py-4 text-lg flex items-center gap-3 shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {applying ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        {queuePosition > 0 ? `Waiting in Queue (#${queuePosition})...` : 'Applying...'}
                                    </>
                                ) : cooldown > 0 ? (
                                    <>
                                        <Clock className="w-6 h-6" />
                                        {(() => {
                                            const m = Math.floor(cooldown / 60)
                                            const s = cooldown % 60
                                            return `Wait ${m}:${s.toString().padStart(2, '0')}`
                                        })()}
                                    </>
                                ) : (
                                    <>
                                        <Settings className="w-6 h-6" />
                                        Apply Changes to Bot
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                </>
            )}

            {/* Add User Modal */}
            <AnimatePresence>
                {showAddUserModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-background-secondary rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                                    <UserPlus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Add User</h3>
                                    <p className="text-gray-400 text-sm">Enter user details</p>
                                </div>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    addUser()
                                }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        IGG ID <span className="text-accent-rose">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.iggId}
                                        onChange={(e) => setNewUser(prev => ({ ...prev, iggId: e.target.value }))}
                                        placeholder="Enter IGG ID"
                                        required
                                        className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        Name <span className="text-gray-500">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter display name"
                                        className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddUserModal(false)
                                            setNewUser({ iggId: '', name: '' })
                                        }}
                                        className="flex-1 px-4 py-3 bg-surface hover:bg-surface-hover rounded-xl text-gray-300 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-primary hover:opacity-90 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add User
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

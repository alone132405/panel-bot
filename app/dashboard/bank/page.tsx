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
    Search,
    Loader2,
    Clock,
    Settings
} from 'lucide-react'
import { toast } from 'sonner'
import IggIdSelector from '@/components/settings/IggIdSelector'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { TacticalSelect } from '@/components/ui/TacticalSelect'
import { useSocket } from '@/hooks/useSocket'
import { useDebounce } from '@/hooks/useDebounce'

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
    enableWhiteList?: boolean
    enableBlackList?: boolean
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

export default function BankSettingsPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'commands'>('users')
    const [selectedIggId, setSelectedIggId] = useState<string | null>(null)
    const [settings, setSettings] = useState<BankSettings | null>(null)
    const [loading, setLoading] = useState(false)
    const [showAddUserModal, setShowAddUserModal] = useState(false)
    const [newUser, setNewUser] = useState({ iggId: '', name: '', highAuth: true })
    const [commandSearch, setCommandSearch] = useState('')
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queueStatus, selectedIggId])

    // Listen for automation completion to hide button
    // Listen for automation completion to update UI
    // Listen for automation completion to update UI
    useEffect(() => {
        // console.log('BankPage: automationStatus updated:', automationStatus)
        if (automationStatus?.status === 'completed' || automationStatus?.status === 'error') {
            // console.log('BankPage: Automation finished with status:', automationStatus.status)
            setApplying(false)
            setQueuePosition(0)
            if (automationStatus.status === 'completed') {
                // console.log('BankPage: Triggering success toast')
                toast.success('Changes applied successfully!', { duration: 5000 })
                setShowApplyButton(false)
            } else {
                // console.log('BankPage: Triggering error toast')
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
                // console.log('BankPage: Received external settings update')
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
            setShowApplyButton(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIggId])

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
                    enableWhiteList: false,
                    enableBlackList: false,
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

    const saveSetting = async (newSettings: BankSettings) => {
        if (!selectedIggId) return
        try {
            const res = await fetch(`/api/settings/${selectedIggId}/bank`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            })
            if (res.ok) {
                setShowApplyButton(true)
            }
        } catch (error) {
            console.error('Failed to auto-save settings')
        }
    }

    const debouncedSave = useDebounce(saveSetting, 500)

    const updateSettings = (newSettings: BankSettings) => {
        setSettings(newSettings)
        debouncedSave(newSettings)
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
            updateSettings({ ...settings, enableBank: !settings.enableBank })
        }
    }

    const addUser = async () => {
        if (!settings || !selectedIggId || !newUser.iggId.trim()) {
            toast.error('Please enter an IGG ID')
            return
        }

        if (!newUser.name.trim()) {
            toast.error('Please enter a name for the user')
            return
        }

        const parsedUserId = parseInt(newUser.iggId.trim(), 10)
        if (!Number.isFinite(parsedUserId) || parsedUserId <= 0) {
            toast.error('Please enter a valid numeric IGG ID')
            return
        }

        const displayName = newUser.name.trim()
        const existingIndex = settings.accountData.findIndex((user) => user.UserID === parsedUserId)

        if (existingIndex >= 0) {
            const existingUser = settings.accountData[existingIndex]
            if (existingUser.highAuth && existingUser.AccountName === displayName) {
                toast.error('This user is already fully authorized in the roster')
                return
            }

            const updatedAccountData = [...settings.accountData]
            updatedAccountData[existingIndex] = {
                ...existingUser,
                AccountName: displayName,
                highAuth: newUser.highAuth,
            }

            updateSettings({
                ...settings,
                accountData: updatedAccountData,
            })
            setNewUser({ iggId: '', name: '', highAuth: true })
            setShowAddUserModal(false)
            toast.success('Existing user updated and authorized')
            return
        }

        updateSettings({
            ...settings,
            accountData: [
                ...settings.accountData,
                {
                    UserID: parsedUserId,
                    AccountName: displayName,
                    highAuth: newUser.highAuth,
                    deferAccountName: '',
                    DeferID: 0,
                    accountBalance: [0, 0, 0, 0, 0],
                    socialID: 0,
                },
            ],
        })
        setNewUser({ iggId: '', name: '', highAuth: true })
        setShowAddUserModal(false)
        toast.success('User added to the roster')
    }

    const removeUser = (userId: number) => {
        if (!settings) return
        updateSettings({
            ...settings,
            accountData: settings.accountData.filter(u => u.UserID !== userId)
        })
        toast.success('User removed')
    }

    const clearAllUsers = () => {
        if (!settings) return
        if (confirm('Are you sure you want to remove all users?')) {
            updateSettings({ ...settings, accountData: [] })
            toast.success('All users cleared')
        }
    }

    const toggleCommandEnabled = (index: number) => {
        if (!settings) return
        const newCommands = [...settings.guildCommands]
        newCommands[index] = { ...newCommands[index], enableCommand: !newCommands[index].enableCommand }
        updateSettings({ ...settings, guildCommands: newCommands })
    }

    const updateCommandRank = (index: number, rank: number) => {
        if (!settings) return
        const newCommands = [...settings.guildCommands]
        newCommands[index] = { ...newCommands[index], minRank: rank }
        updateSettings({ ...settings, guildCommands: newCommands })
    }

    const toggleHighAuth = (userId: number) => {
        if (!settings) return
        updateSettings({
            ...settings,
            accountData: settings.accountData.map((u) => u.UserID === userId ? { ...u, highAuth: !u.highAuth } : u)
        })
    }

    const tabs = [
        { id: 'users', label: 'Users', icon: Users },
        { id: 'commands', label: 'Commands', icon: Terminal },
    ]

    const authorizedUsers = (settings?.accountData ?? []).filter((user) => user.highAuth === true)
    const filteredCommands = settings?.guildCommands
        .map((cmd, index) => ({ cmd, index }))
        .filter(({ cmd }) => cmd.commadReference.toLowerCase().includes(commandSearch.toLowerCase())) ?? []

    const commandAccessCards = [
        {
            key: 'allowWhiteList',
            title: 'Whitelist',
            description: 'Auto-accept and rank approved list users.',
            enabled: Boolean(settings?.enableWhiteList),
            onToggle: () => settings && updateSettings({ ...settings, enableWhiteList: !settings.enableWhiteList }),
        },
        {
            key: 'allowBlackList',
            title: 'Blacklist',
            description: 'Block blacklisted users from guild access flow.',
            enabled: Boolean(settings?.enableBlackList),
            onToggle: () => settings && updateSettings({ ...settings, enableBlackList: !settings.enableBlackList }),
        },
    ]
    const commandChannelOptions = [
        {
            key: 'chat',
            title: 'Chat Commands',
            description: 'Accept command triggers from in-game chat.',
            checked: Boolean(settings?.allowChatCommands),
            onChange: () => settings && updateSettings({ ...settings, allowChatCommands: !settings.allowChatCommands }),
        },
        {
            key: 'mail',
            title: 'Mail Commands',
            description: 'Accept command mails from authorized players.',
            checked: Boolean(settings?.allowMailCommands),
            onChange: () => settings && updateSettings({ ...settings, allowMailCommands: !settings.allowMailCommands }),
        },
        {
            key: 'mail-response',
            title: 'No Mail Response',
            description: 'Do not send mail replies after processing.',
            checked: Boolean(settings?.disableMailResponse),
            onChange: () => settings && updateSettings({ ...settings, disableMailResponse: !settings.disableMailResponse }),
        },
        {
            key: 'error-mail',
            title: 'No Error Mails',
            description: 'Suppress mail delivery for error messages.',
            checked: Boolean(settings?.disableErrorResponse),
            onChange: () => settings && updateSettings({ ...settings, disableErrorResponse: !settings.disableErrorResponse }),
        },
    ]
    const commandRuntimeOptions = [
        {
            key: 'external',
            title: 'External Guild Commands',
            description: 'Accept commands from guild mail sources.',
            checked: Boolean(settings?.allowExternalCommands),
            onChange: () => settings && updateSettings({ ...settings, allowExternalCommands: !settings.allowExternalCommands }),
        },
        {
            key: 'ignore-balance',
            title: 'Ignore Balance',
            description: 'Skip live balance checks before dispatch.',
            checked: Boolean(settings?.ignoreBalance),
            onChange: () => settings && updateSettings({ ...settings, ignoreBalance: !settings.ignoreBalance }),
        },
        {
            key: 'auto-delete',
            title: 'Auto Delete Mails',
            description: 'Remove processed command mails automatically.',
            checked: Boolean(settings?.autoDeleteCmdMail),
            onChange: () => settings && updateSettings({ ...settings, autoDeleteCmdMail: !settings.autoDeleteCmdMail }),
        },
        {
            key: 'bag-rss',
            title: 'Use Bag Resources',
            description: 'Allow dispatches to use bag resources when available.',
            checked: Boolean(settings?.useBagRss),
            onChange: () => settings && updateSettings({ ...settings, useBagRss: !settings.useBagRss }),
        },
    ]

    return (
        <div className="space-y-5 p-3 sm:p-6">
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative z-30 rounded-lg border border-border bg-bg-surface shadow-panel"
            >
                <div className="flex flex-col gap-4 rounded-lg bg-[linear-gradient(135deg,rgba(33,243,177,0.08),rgba(88,101,242,0.04))] px-4 py-4 sm:px-6 sm:py-5 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <div className="mb-3 w-fit rounded-full border border-accent-1/20 bg-accent-1/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-1 sm:text-[11px]">
                            Bank Module
                        </div>
                        <h1 className="font-orbitron text-xl font-bold tracking-wide text-text-primary sm:text-3xl">BANK SETTINGS</h1>
                        <p className="mt-1 max-w-2xl font-sans text-sm text-text-muted sm:text-base">
                            Configure guild bank commands and authorized users
                        </p>
                    </div>
                    <div className="relative z-40 w-full xl:max-w-[320px]">
                        <IggIdSelector
                            selectedIggId={selectedIggId}
                            onSelect={setSelectedIggId}
                        />
                    </div>
                </div>
            </motion.section>

            {!selectedIggId ? (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-bg-surface p-8 text-center shadow-panel sm:p-12"
                >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-accent-2/20 bg-accent-2/10 text-accent-2">
                        <Database className="h-7 w-7" />
                    </div>
                    <h3 className="mb-2 text-[18px] font-bold text-text-primary">Select an IGG ID</h3>
                    <p className="text-sm text-text-muted">Choose an IGG ID to load bank settings.</p>
                </motion.div>
            ) : loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500"></div>
                </div>
            ) : settings && (
                <>
                    <section className="rounded-lg border border-border bg-bg-surface p-4 shadow-panel sm:p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent-2/25 bg-accent-2/10 text-accent-2 sm:h-11 sm:w-11">
                                    <Database className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-text-primary sm:text-[16px]">Enable Guild Bank / Commands</h2>
                                    <p className="text-[12px] text-text-muted">Allow bank commands and resource transfers</p>
                                </div>
                            </div>
                            <ToggleSwitch checked={settings.enableBank} onChange={toggleBankEnabled} />
                        </div>
                    </section>

                    <section className="rounded-lg border border-border bg-bg-surface shadow-panel">
                        <div className="grid grid-cols-2 gap-2 border-b border-border bg-bg-elevated/55 p-2.5 sm:p-3">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id as 'users' | 'commands')}
                                        className={`flex min-h-[48px] items-center justify-center gap-2 rounded-md border px-3 text-[13px] font-bold transition-all ${isActive
                                            ? 'border-accent-1/35 bg-accent-1/10 text-accent-1 shadow-glow-mint'
                                            : 'border-border bg-bg-inset text-text-muted hover:border-accent-2/30 hover:text-text-primary'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    <AnimatePresence mode="wait">
                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="space-y-4"
                            >
                                <section className="rounded-lg border border-border bg-bg-surface p-3 shadow-panel sm:p-4">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddUserModal(true)}
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-accent-2/25 bg-accent-2/10 px-4 text-[13px] font-bold text-accent-2 transition-colors hover:bg-accent-2/20"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                Add User
                                            </button>
                                            <button
                                                type="button"
                                                onClick={clearAllUsers}
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-accent-3/25 bg-accent-3/10 px-4 text-[13px] font-bold text-accent-3 transition-colors hover:bg-accent-3/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Clear
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-[13px] text-text-primary">
                                            <label className="inline-flex min-h-[40px] items-center gap-3 rounded-md border border-border bg-bg-inset px-3">
                                                <span className="font-bold">Use Balance</span>
                                                <ToggleSwitch checked={settings.allowAdminBalance} onChange={() => updateSettings({ ...settings, allowAdminBalance: !settings.allowAdminBalance })} compact />
                                            </label>
                                            <label className="inline-flex min-h-[40px] items-center gap-3 rounded-md border border-border bg-bg-inset px-3">
                                                <span className="font-bold">Bypass Rss Limit</span>
                                                <ToggleSwitch checked={settings.allowAdminSkipLimit} onChange={() => updateSettings({ ...settings, allowAdminSkipLimit: !settings.allowAdminSkipLimit })} compact />
                                            </label>
                                        </div>
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-lg border border-border bg-bg-surface shadow-panel">
                                    <div className="flex items-center justify-between border-b border-border bg-bg-elevated/55 px-4 py-4 sm:px-5">
                                        <div>
                                            <h3 className="text-[15px] font-bold text-text-primary">Authorized Users</h3>
                                            <p className="mt-1 text-[12px] text-text-muted">
                                                {authorizedUsers.length} admin users linked
                                            </p>
                                        </div>
                                    </div>

                                    <div className="hidden overflow-x-auto xl:block">
                                        <table className="w-full">
                                            <thead className="border-b border-border bg-bg-elevated/35">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">IGG</th>
                                                    <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Name</th>
                                                    <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Role</th>
                                                    <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">High Auth</th>
                                                    <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Source</th>
                                                    <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {authorizedUsers.length > 0 ? (
                                                    authorizedUsers.map((user) => (
                                                        <tr key={user.UserID} className="hover:bg-white/[0.02]">
                                                            <td className="px-6 py-5 font-mono text-sm font-bold text-white">{user.UserID}</td>
                                                            <td className="px-6 py-5 text-sm text-text-primary">{user.AccountName || `User ${user.UserID}`}</td>
                                                            <td className="px-6 py-5">
                                                                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[12px] font-bold text-emerald-400">
                                                                    ADMIN
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <ToggleSwitch
                                                                    checked={user.highAuth}
                                                                    onChange={() => toggleHighAuth(user.UserID)}
                                                                    compact
                                                                />
                                                            </td>
                                                            <td className="px-6 py-5 text-sm text-text-muted">
                                                                {user.socialID ? `Social ${user.socialID}` : 'Added'}
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeUser(user.UserID)}
                                                                    className="rounded-md border border-accent-3/25 bg-accent-3/10 px-3 py-2 text-[13px] font-bold text-accent-3 transition-colors hover:bg-accent-3/20"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-14 text-center text-text-muted">
                                                            No users added
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="space-y-3 p-4 xl:hidden">
                                        {authorizedUsers.length > 0 ? (
                                            authorizedUsers.map((user) => (
                                                <div key={user.UserID} className="rounded-lg border border-border bg-bg-inset/70 p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-mono text-[16px] font-bold text-white">{user.UserID}</p>
                                                            <p className="mt-1 text-[14px] text-text-primary">{user.AccountName || `User ${user.UserID}`}</p>
                                                            <span className="mt-3 inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-[12px] font-bold text-emerald-400">
                                                                ADMIN
                                                            </span>
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <span className="text-[12px] font-medium text-text-muted">High Auth:</span>
                                                                <ToggleSwitch
                                                                    checked={user.highAuth}
                                                                    onChange={() => toggleHighAuth(user.UserID)}
                                                                    compact
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeUser(user.UserID)}
                                                            className="rounded-md border border-accent-3/25 bg-accent-3/10 px-3 py-2 text-[12px] font-bold text-accent-3"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-lg border border-dashed border-border bg-bg-inset/30 px-6 py-12 text-center text-text-muted">
                                                No users added
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'commands' && (
                            <motion.div
                                key="commands"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="space-y-4"
                            >
                                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_380px]">
                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-border bg-bg-surface p-4 shadow-panel sm:p-5">
                                            <div className="mb-4">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Command Access</p>
                                                <h3 className="mt-1 text-[15px] font-bold text-text-primary">Channels</h3>
                                            </div>
                                            <div className="divide-y divide-border rounded-lg border border-border bg-bg-inset/70">
                                                {commandChannelOptions.map((item) => (
                                                    <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
                                                        <div className="min-w-0">
                                                            <p className="text-[14px] font-bold text-text-primary">{item.title}</p>
                                                            <p className="mt-1 text-[12px] text-text-muted">{item.description}</p>
                                                        </div>
                                                        <ToggleSwitch checked={item.checked} onChange={item.onChange} compact />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-border bg-bg-surface p-4 shadow-panel sm:p-5">
                                            <div className="mb-4">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Runtime Rules</p>
                                                <h3 className="mt-1 text-[15px] font-bold text-text-primary">Handling</h3>
                                            </div>
                                            <div className="divide-y divide-border rounded-lg border border-border bg-bg-inset/70">
                                                {commandRuntimeOptions.map((item) => (
                                                    <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
                                                        <div className="min-w-0">
                                                            <p className="text-[14px] font-bold text-text-primary">{item.title}</p>
                                                            <p className="mt-1 text-[12px] text-text-muted">{item.description}</p>
                                                        </div>
                                                        <ToggleSwitch checked={item.checked} onChange={item.onChange} compact />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-border bg-bg-surface p-4 shadow-panel sm:p-5">
                                            <div className="mb-4">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Limits</p>
                                                <h3 className="mt-1 text-[15px] font-bold text-text-primary">Dispatch</h3>
                                            </div>
                                            <div className="grid gap-3">
                                                <label className="grid gap-1.5">
                                                    <span className="text-[12px] font-medium text-text-muted">Buildspam Delay</span>
                                                    <input
                                                        type="number"
                                                        value={settings.BuildspamMinimum || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value === '' ? 0 : Math.max(0, Math.min(3600, parseInt(e.target.value)))
                                                            updateSettings({ ...settings, BuildspamMinimum: val })
                                                        }}
                                                        min={0}
                                                        max={3600}
                                                        className="h-11 rounded-md border border-border bg-bg-inset px-3 text-sm text-text-primary transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                                                    />
                                                </label>
                                                <label className="grid gap-1.5">
                                                    <span className="text-[12px] font-medium text-text-muted">Max Send Limit</span>
                                                    <input
                                                        type="number"
                                                        value={settings.maxSendLimit || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value === '' ? 0 : Math.max(0, Math.min(4290000000, parseInt(e.target.value)))
                                                            updateSettings({ ...settings, maxSendLimit: val })
                                                        }}
                                                        min={0}
                                                        max={4290000000}
                                                        className="h-11 rounded-md border border-border bg-bg-inset px-3 text-sm text-text-primary transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                                                    />
                                                </label>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <label className="grid gap-1.5">
                                                        <span className="text-[12px] font-medium text-text-muted">Max Distance</span>
                                                        <input
                                                            type="number"
                                                            value={settings.maxSendDistance || ''}
                                                            step="1"
                                                            onChange={(e) => {
                                                                const val = e.target.value === '' ? 0 : Math.max(0, Math.min(1000, parseFloat(e.target.value)))
                                                                updateSettings({ ...settings, maxSendDistance: val })
                                                            }}
                                                            onBlur={(e) => {
                                                                const val = e.target.value === '' ? 0 : Math.floor(parseFloat(e.target.value))
                                                                updateSettings({ ...settings, maxSendDistance: Math.max(0, Math.min(1000, val)) })
                                                            }}
                                                            min={0}
                                                            max={1000}
                                                            className="h-11 rounded-md border border-border bg-bg-inset px-3 text-sm text-text-primary transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                                                        />
                                                    </label>
                                                    <label className="grid gap-1.5">
                                                        <span className="text-[12px] font-medium text-text-muted">Prefix</span>
                                                        <input
                                                            type="text"
                                                            value={settings.cmdPrefix}
                                                            onChange={(e) => updateSettings({ ...settings, cmdPrefix: e.target.value.slice(0, 1) })}
                                                            maxLength={1}
                                                            className="h-11 rounded-md border border-border bg-bg-inset px-3 text-center text-sm text-text-primary transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-border bg-bg-surface p-4 shadow-panel sm:p-5">
                                            <div className="mb-4">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Access Filters</p>
                                                <h3 className="mt-1 text-[15px] font-bold text-text-primary">Lists</h3>
                                            </div>
                                            <div className="divide-y divide-border rounded-lg border border-border bg-bg-inset/70">
                                                {commandAccessCards.map((card) => (
                                                    <div key={card.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
                                                        <div className="min-w-0">
                                                            <p className="text-[14px] font-bold text-text-primary">{card.title}</p>
                                                            <p className="mt-1 text-[12px] text-text-muted">{card.description}</p>
                                                        </div>
                                                        <ToggleSwitch checked={card.enabled} onChange={card.onToggle} compact />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-lg border border-border bg-bg-surface shadow-panel">
                                    <div className="flex flex-col gap-3 border-b border-border bg-bg-elevated/55 p-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div>
                                            <h3 className="text-[15px] font-bold text-text-primary">Command Directory</h3>
                                            <p className="text-[12px] text-text-muted">Showing {filteredCommands.length} commands</p>
                                        </div>
                                        <div className="relative w-full max-w-md">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search commands..."
                                                value={commandSearch}
                                                onChange={(e) => setCommandSearch(e.target.value)}
                                                className="h-11 w-full rounded-md border border-border bg-bg-inset pl-10 pr-4 text-sm text-text-primary placeholder-text-muted transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                                            />
                                        </div>
                                    </div>

                                    <div className="hidden overflow-x-auto xl:block">
                                        <table className="w-full">
                                            <thead className="border-b border-border bg-bg-elevated/35">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Command</th>
                                                    <th className="px-6 py-4 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Enabled</th>
                                                    <th className="px-6 py-4 text-left text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Minimum Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {filteredCommands.length > 0 ? (
                                                    filteredCommands.map(({ cmd, index }) => (
                                                        <tr key={index} className="hover:bg-white/[0.02]">
                                                            <td className="px-6 py-5 font-mono text-sm font-bold text-white">{cmd.commadReference}</td>
                                                            <td className="px-6 py-5 text-center">
                                                                <div className="flex justify-center">
                                                                    <ToggleSwitch
                                                                        checked={cmd.enableCommand}
                                                                        onChange={() => toggleCommandEnabled(index)}
                                                                        compact
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <TacticalSelect
                                                                    value={String(cmd.minRank)}
                                                                    onChange={(v) => updateCommandRank(index, parseInt(v))}
                                                                    options={RANK_OPTIONS.map((opt) => ({ value: String(opt.value), label: opt.label }))}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-12 text-center text-text-muted">
                                                            No commands found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="space-y-3 p-4 xl:hidden">
                                        {filteredCommands.length > 0 ? (
                                            filteredCommands.map(({ cmd, index }) => (
                                                <div key={index} className="rounded-lg border border-border bg-bg-inset/70 p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="font-mono text-[14px] font-bold text-text-primary">{cmd.commadReference}</p>
                                                        <ToggleSwitch
                                                            checked={cmd.enableCommand}
                                                            onChange={() => toggleCommandEnabled(index)}
                                                            compact
                                                        />
                                                    </div>
                                                    <div className="mt-3">
                                                        <label className="mb-2 block text-[12px] text-text-muted">Minimum Rank</label>
                                                        <TacticalSelect
                                                            value={String(cmd.minRank)}
                                                            onChange={(v) => updateCommandRank(index, parseInt(v))}
                                                            options={RANK_OPTIONS.map((opt) => ({ value: String(opt.value), label: opt.label }))}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-lg border border-dashed border-border bg-bg-inset/30 p-8 text-center text-text-muted">
                                                No commands found
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="rounded-lg border border-border bg-bg-surface p-4 shadow-panel sm:p-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="text-[13px] text-text-muted">
                                Queue: <span className="font-mono text-text-primary">{queuePosition > 0 ? `#${queuePosition}` : applying ? 'Running' : 'Idle'}</span>
                                <span className="mx-2 text-border">|</span>
                                Cooldown: <span className="font-mono text-text-primary">{cooldown > 0 ? `${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')}` : 'Ready'}</span>
                            </div>
                            <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row">
                                <button
                                    onClick={saveSettings}
                                    className="inline-flex min-h-[44px] items-center justify-center gap-3 rounded-lg bg-gradient-to-br from-accent-1 to-accent-cyan px-6 text-[14px] font-bold text-[#031017] transition-all duration-200 hover:brightness-110 hover:shadow-glow-mint"
                                >
                                    <Save className="h-5 w-5" />
                                    Save Changes
                                </button>
                                {(showApplyButton || applying || cooldown > 0 || queuePosition > 0) && (
                                    <button
                                        onClick={handleApplyChanges}
                                        disabled={applying || !selectedIggId || cooldown > 0}
                                        className="inline-flex min-h-[44px] items-center justify-center gap-3 rounded-lg border border-border bg-bg-inset px-6 text-[14px] font-bold text-text-primary transition-colors hover:border-accent-2/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {(applying || queuePosition > 0) ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                {automationStatus?.status === 'waiting'
                                                    ? 'Wait for RDP disconnection'
                                                    : queuePosition > 0
                                                        ? `Queue Status #${queuePosition}`
                                                        : 'Applying Changes...'}
                                            </>
                                        ) : cooldown > 0 ? (
                                            <>
                                                <Clock className="h-5 w-5" />
                                                {`${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')}`}
                                            </>
                                        ) : (
                                            <>
                                                <Settings className="h-5 w-5" />
                                                Apply Changes to Bot
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Add User Modal */}
            <AnimatePresence>
                {showAddUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="panel-solid w-full max-w-md rounded-lg p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-accent-2/20 bg-accent-2/10 text-accent-2">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary">Add User</h3>
                                    <p className="text-sm text-text-muted">Enter user details</p>
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
                                        className="h-11 w-full rounded-md border border-border bg-bg-inset px-4 text-text-primary placeholder-text-muted transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        Name <span className="text-accent-rose">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter display name"
                                        required
                                        className="h-11 w-full rounded-md border border-border bg-bg-inset px-4 text-text-primary placeholder-text-muted transition-all focus:border-accent-2 focus:outline-none focus:shadow-glow-violet"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-300">High Auth</label>
                                    <ToggleSwitch
                                        checked={newUser.highAuth}
                                        onChange={(v) => setNewUser(prev => ({ ...prev, highAuth: v }))}
                                        compact
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddUserModal(false)
                                            setNewUser({ iggId: '', name: '', highAuth: true })
                                        }}
                                        className="flex-1 rounded-md border border-border bg-bg-elevated px-4 py-3 font-sans text-[14px] font-bold text-text-primary transition-colors hover:border-accent-3/30 hover:bg-accent-3/10 hover:text-accent-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-accent-1 to-accent-cyan px-4 py-3 font-sans text-[14px] font-bold text-[#031017] transition-all hover:brightness-110 hover:shadow-glow-mint"
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


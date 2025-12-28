'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Settings, Shield, Package, Globe, Sprout, Moon, Ship, Gem, Target, Users, Building, FlaskConical, Swords, ChevronRight, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface Category {
    id: string
    name: string
    icon: any
}

const categories: Category[] = [
    { id: 'basic', name: 'Basic Settings', icon: Settings },
    { id: 'protection', name: 'Protection', icon: Shield },
    { id: 'supply', name: 'Supply', icon: Package },
    { id: 'mirage', name: 'Mirage Realm', icon: Globe },
    { id: 'gathering', name: 'Gathering', icon: Sprout },
    { id: 'darkness', name: 'Darkness Rally', icon: Moon },
    { id: 'cargo', name: 'Cargo Ship', icon: Ship },
    { id: 'gems', name: 'Gems/Coins', icon: Gem },
    { id: 'talents', name: 'Talents', icon: Target },
    { id: 'heroes', name: 'Heroes', icon: Users },
    { id: 'buildings', name: 'Buildings', icon: Building },
    { id: 'research', name: 'Research', icon: FlaskConical },
    { id: 'army', name: 'Army', icon: Swords },
]

export default function SettingsDetailPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const params = useParams()
    const iggId = params && params.iggId ? (params.iggId as string) : ''

    const [activeCategory, setActiveCategory] = useState('basic')
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!session) {
            router.push('/login')
            return
        }

        // Fetch settings for this IGG ID
        fetch(`/api/settings/${iggId}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch settings')
                return res.json()
            })
            .then(data => {
                setSettings(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching settings:', err)
                toast.error('Failed to load settings')
                setLoading(false)
            })
    }, [session, router, iggId])

    const handleSettingChange = (path: string, value: any) => {
        // Update local state only - no auto-save
        const keys = path.split('.')
        const newSettings = { ...settings }
        let current = newSettings
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = value
        setSettings(newSettings)
    }

    const handleLogout = async () => {
        await signOut({ redirect: false })
        toast.success('Logged out successfully')
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        )
    }

    if (!settings) {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center">
                <div className="glass-card p-8 text-center">
                    <p className="text-red-400">Failed to load settings</p>
                    <button onClick={() => router.push('/dashboard')} className="btn-primary mt-4">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background-primary">
            {/* Header */}
            <header className="border-b border-white/10 bg-background-secondary/50 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Account Settings</h1>
                                <p className="text-xs text-gray-400">Configure your account preferences</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                                Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-6">
                    {/* Category Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-64 flex-shrink-0"
                    >
                        <div className="glass-card p-4">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3 px-2">Categories</h3>
                            <p className="text-xs text-gray-500 mb-4 px-2">Select a category</p>

                            <div className="space-y-1">
                                {categories.map((category) => {
                                    const Icon = category.icon
                                    const isActive = activeCategory === category.id

                                    return (
                                        <motion.button
                                            key={category.id}
                                            onClick={() => setActiveCategory(category.id)}
                                            whileHover={{ x: 4 }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive
                                                ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 pl-2'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{category.name}</span>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Settings Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1"
                    >
                        <div className="glass-card p-6">
                            {/* Account Selector */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Account: {iggId}</h2>
                                        <p className="text-sm text-blue-400">Category: {categories.find(c => c.id === activeCategory)?.name}</p>
                                    </div>
                                    <span className="status-active">Active</span>
                                </div>

                                <div className="mb-4">
                                    <label className="text-sm text-gray-300 mb-2 block">Choose Account</label>
                                    <select className="input-field w-full max-w-md">
                                        <option>{iggId} - Contact provider</option>
                                    </select>
                                </div>
                            </div>

                            {/* Configuration Settings */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Configuration Settings</h3>
                                <p className="text-sm text-gray-400 mb-6">Configure options for the selected category</p>

                                {/* Render settings based on active category */}
                                {activeCategory === 'gathering' && settings.gatherSettings && (
                                    <div className="space-y-4">
                                        <SettingToggle
                                            label="Gather Resources"
                                            description="Automatically gather resources from tiles"
                                            checked={settings.gatherSettings.gatherResources || false}
                                            onChange={(checked) => handleSettingChange('gatherSettings.gatherResources', checked)}
                                            disabled={saving}
                                        />

                                        <SettingToggle
                                            label="Gather Lowest Resources"
                                            description="Prioritize gathering the lowest resource type"
                                            checked={settings.gatherSettings.gatherLowestResources || false}
                                            onChange={(checked) => handleSettingChange('gatherSettings.gatherLowestResources', checked)}
                                            disabled={saving}
                                        />

                                        <SettingToggle
                                            label="Use Gather Gear"
                                            description="Automatically equip gathering gear when sending troops"
                                            checked={settings.gatherSettings.useGatherGear || false}
                                            onChange={(checked) => handleSettingChange('gatherSettings.useGatherGear', checked)}
                                            disabled={saving}
                                        />
                                    </div>
                                )}

                                {activeCategory === 'basic' && settings.miscSettings && (
                                    <div className="space-y-4">
                                        <SettingToggle
                                            label="Auto Treasure Trove"
                                            description="Automatically open treasure trove"
                                            checked={settings.miscSettings.autoTreasureTrove || false}
                                            onChange={(checked) => handleSettingChange('miscSettings.autoTreasureTrove', checked)}
                                            disabled={saving}
                                        />

                                        <SettingToggle
                                            label="Auto Open Chests"
                                            description="Automatically open chests when available"
                                            checked={settings.miscSettings.autoOpenChests || false}
                                            onChange={(checked) => handleSettingChange('miscSettings.autoOpenChests', checked)}
                                            disabled={saving}
                                        />
                                    </div>
                                )}

                                {/* Add more categories as needed */}
                                {activeCategory !== 'gathering' && activeCategory !== 'basic' && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-400">Settings for {categories.find(c => c.id === activeCategory)?.name} coming soon...</p>
                                    </div>
                                )}
                            </div>

                            {/* Apply Changes Button */}
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Apply Changes to Bot</h3>
                                        <p className="text-xs text-gray-400 mt-1">Click to apply all saved settings to the running bot</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Functionality to be implemented later
                                            toast.info('Apply Changes functionality will be implemented soon')
                                        }}
                                        className="px-8 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors shadow-lg hover:shadow-blue-500/50"
                                    >
                                        Apply Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

// Toggle Component
function SettingToggle({
    label,
    description,
    checked,
    onChange,
    disabled,
}: {
    label: string
    description?: string
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
}) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-lg bg-background-tertiary/50 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex-1">
                <label className="text-sm font-medium text-white cursor-pointer">
                    {label}
                </label>
                {description && (
                    <p className="text-xs text-gray-400 mt-1">{description}</p>
                )}
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
            </label>
        </div>
    )
}

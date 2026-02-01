'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Package, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface SupplyModalProps {
    isOpen: boolean
    onClose: () => void
    iggId: string | null
}

interface InventoryResource {
    name: string
    reserved: number
    threshold: number
}

interface BagResource {
    name: string
    reserved: number
}

export default function SupplyModal({ isOpen, onClose, iggId }: SupplyModalProps) {
    const [fullSettings, setFullSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Prevent background scroll when modal is open
    useBodyScrollLock(isOpen)
    const [saving, setSaving] = useState(false)

    // Resource settings
    const [sendTo, setSendTo] = useState('F C 1')
    const [maxTravelTime, setMaxTravelTime] = useState(600)
    const [supplySpeed, setSupplySpeed] = useState(0.1)
    const [useSpeedGear, setUseSpeedGear] = useState(false)
    const [sendResources, setSendResources] = useState(false)
    const [useBagResource, setUseBagResource] = useState(false)
    const [typesToSend, setTypesToSend] = useState<boolean[]>([true, true, true, true, true])
    const [bagTypesToSend, setBagTypesToSend] = useState<boolean[]>([false, false, false, false, false])

    // Inventory resources
    const [inventory, setInventory] = useState<InventoryResource[]>([
        { name: 'Food', reserved: 500000, threshold: 1000000 },
        { name: 'Stone', reserved: 500000, threshold: 1000000 },
        { name: 'Wood', reserved: 20000000, threshold: 40000000 },
        { name: 'Ore', reserved: 500000, threshold: 1000000 },
        { name: 'Gold', reserved: 500000, threshold: 1000000 },
    ])

    // Bag resources
    const [bag, setBag] = useState<BagResource[]>([
        { name: 'Food', reserved: 100 },
        { name: 'Stone', reserved: 100 },
        { name: 'Wood', reserved: 100 },
        { name: 'Ore', reserved: 100 },
        { name: 'Gold', reserved: 100 },
    ])

    useEffect(() => {
        if (isOpen && iggId) {
            loadSettings()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, iggId])

    const loadSettings = async () => {
        if (!iggId) {
            toast.error('Please select an IGG ID first')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`)
            if (res.ok) {
                const data = await res.json()
                setFullSettings(data)

                // Load supply settings if they exist
                if (data.supplySettings) {
                    setSendTo(data.supplySettings.playerToSend || 'F C 1')
                    setMaxTravelTime(data.supplySettings.maxTravelTime || 600)
                    setSupplySpeed(data.supplySettings.supplySpeed || 0.1)
                    setUseSpeedGear(data.supplySettings.speedGear || false)
                    setSendResources(data.supplySettings.sendResources || false)
                    setUseBagResource(data.supplySettings.useBagResource || false)

                    // Map reservedRss and supplyMin arrays to inventory state
                    if (data.supplySettings.reservedRss && data.supplySettings.supplyMin) {
                        const resourceNames = ['Food', 'Stone', 'Wood', 'Ore', 'Gold']
                        const mappedInventory = resourceNames.map((name, index) => ({
                            name,
                            reserved: data.supplySettings.reservedRss[index] ?? 500000,
                            threshold: data.supplySettings.supplyMin[index] ?? 1000000,
                        }))
                        setInventory(mappedInventory)
                    }

                    // Map reservedBagRss array to bag state
                    if (data.supplySettings.reservedBagRss) {
                        const resourceNames = ['Food', 'Stone', 'Wood', 'Ore', 'Gold']
                        const mappedBag = resourceNames.map((name, index) => ({
                            name,
                            reserved: data.supplySettings.reservedBagRss[index] ?? 100,
                        }))
                        setBag(mappedBag)
                    }

                    // Load typesToSend and bagTypesToSend
                    if (data.supplySettings.typesToSend) {
                        setTypesToSend(data.supplySettings.typesToSend)
                    }
                    if (data.supplySettings.bagTypesToSend) {
                        setBagTypesToSend(data.supplySettings.bagTypesToSend)
                    }
                }
            } else {
                toast.error('Failed to load settings')
            }
        } catch (error) {
            toast.error('Error loading settings')
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        if (!iggId || !fullSettings) return

        setSaving(true)
        try {
            // Build updated settings
            const updatedSettings = {
                ...fullSettings,
                supplySettings: {
                    ...fullSettings.supplySettings,
                    playerToSend: sendTo,
                    maxTravelTime: maxTravelTime,
                    supplySpeed: supplySpeed,
                    speedGear: useSpeedGear,
                    sendResources: sendResources,
                    useBagResource: useBagResource,
                    reservedRss: inventory.map(r => r.reserved),
                    supplyMin: inventory.map(r => r.threshold),
                    reservedBagRss: bag.map(r => r.reserved),
                    typesToSend: typesToSend,
                    bagTypesToSend: bagTypesToSend,
                }
            }

            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings),
            })

            if (res.ok) {
                toast.success('Settings saved successfully')
                onClose()
                setFullSettings(updatedSettings)
            } else {
                toast.error('Failed to save settings')
            }
        } catch (error) {
            toast.error('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const handleInventoryChange = (index: number, field: 'reserved' | 'threshold', value: number) => {
        const updated = [...inventory]
        updated[index][field] = value
        setInventory(updated)
    }

    const handleBagChange = (index: number, value: number) => {
        const updated = [...bag]
        updated[index].reserved = value
        setBag(updated)
    }

    if (!iggId) {
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-4 md:inset-20 bg-background-secondary rounded-2xl border border-white/10 shadow-2xl z-50 flex items-center justify-center"
                        >
                            <div className="text-center">
                                <p className="text-xl text-white mb-2">No IGG ID Selected</p>
                                <p className="text-gray-400">Please select an IGG ID to configure supply settings</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        )
    }

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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-2 sm:inset-4 md:inset-10 lg:inset-20 bg-background-secondary rounded-xl md:rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-4 border-b border-white/10 bg-background-tertiary/50">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Package className="w-5 h-5 md:w-6 md:h-6 text-accent-emerald flex-shrink-0" />
                                    <h2 className="text-sm md:text-2xl font-bold text-white truncate">Supply Settings</h2>
                                    {saving && (
                                        <Loader2 className="w-4 h-4 animate-spin text-primary-400 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-[10px] md:text-sm text-gray-400 truncate">IGG ID: {iggId}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 scrollbar-thin">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                                </div>
                            ) : (
                                <div className="w-full space-y-6">
                                    {/* General Settings */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">General Settings</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">Auto Send To:</label>
                                                <input
                                                    type="text"
                                                    value={sendTo}
                                                    onChange={(e) => setSendTo(e.target.value)}
                                                    className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>

                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">Max Travel Time (Seconds):</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={36000}
                                                    value={maxTravelTime}
                                                    onChange={(e) => setMaxTravelTime(Math.max(0, Math.min(36000, Number(e.target.value))))}
                                                    className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>

                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">Supply Speed (Seconds):</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min={0}
                                                    max={5}
                                                    value={supplySpeed}
                                                    onChange={(e) => setSupplySpeed(Math.max(0, Math.min(5, Number(e.target.value))))}
                                                    className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <label className="flex items-center justify-between p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer">
                                                <span className="text-sm text-gray-300">Use Speed Gear</span>
                                                <input
                                                    type="checkbox"
                                                    checked={useSpeedGear}
                                                    onChange={(e) => setUseSpeedGear(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Inventory Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Inventory</h3>

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 mb-3">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={sendResources}
                                                    onChange={(e) => setSendResources(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm font-medium text-primary-300">Auto Send Resources</span>
                                            </label>
                                        </div>

                                        <div className="space-y-3">
                                            {inventory.map((resource, index) => (
                                                <div key={resource.name} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={typesToSend[index] || false}
                                                            onChange={(e) => {
                                                                const updated = [...typesToSend]
                                                                updated[index] = e.target.checked
                                                                setTypesToSend(updated)
                                                            }}
                                                            className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                        <span className="text-white font-medium">{resource.name}</span>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Reserved Amount</label>
                                                        <input
                                                            type="number"
                                                            value={resource.reserved}
                                                            onChange={(e) => handleInventoryChange(index, 'reserved', Number(e.target.value))}
                                                            className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Amount needed before supply</label>
                                                        <input
                                                            type="number"
                                                            value={resource.threshold}
                                                            onChange={(e) => handleInventoryChange(index, 'threshold', Number(e.target.value))}
                                                            className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bag Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2">Send Resources (Bag)</h3>

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 mb-3">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={useBagResource}
                                                    onChange={(e) => setUseBagResource(e.target.checked)}
                                                    className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <span className="text-sm font-medium text-primary-300">Send Bag Resources</span>
                                            </label>
                                        </div>

                                        <div className="space-y-3">
                                            {bag.map((resource, index) => (
                                                <div key={resource.name} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={bagTypesToSend[index] || false}
                                                            onChange={(e) => {
                                                                const updated = [...bagTypesToSend]
                                                                updated[index] = e.target.checked
                                                                setBagTypesToSend(updated)
                                                            }}
                                                            className="w-5 h-5 rounded bg-background-tertiary border-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                        <span className="text-white font-medium">{resource.name}</span>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Reserved Amount</label>
                                                        <input
                                                            type="number"
                                                            value={resource.reserved}
                                                            onChange={(e) => handleBagChange(index, Number(e.target.value))}
                                                            className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-2 px-3 md:px-6 py-2.5 md:py-4 border-t border-white/10 bg-background-tertiary/50">
                            <p className="hidden md:block text-sm text-gray-400">Click Save to apply changes</p>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={onClose}
                                    className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-surface hover:bg-surface-hover text-gray-300 text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveSettings}
                                    disabled={saving}
                                    className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">Save Changes</span>
                                    <span className="sm:hidden">Save</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

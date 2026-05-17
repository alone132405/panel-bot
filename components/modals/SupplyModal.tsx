'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Package, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import KonohaModal from './KonohaModal'

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
            <KonohaModal
                isOpen={isOpen}
                onClose={onClose}
                title="Supply Settings"
                iggId={iggId}
                icon={Loader2}
                iconColor="#64748b"
                iconBg="rgba(100,116,139,0.15)"
                iconBorder="rgba(100,116,139,0.3)"
            >
                <div />
            </KonohaModal>
        )
    }

    return (
        <KonohaModal
            isOpen={isOpen}
            onClose={onClose}
            title="Supply Settings"
            iggId={iggId}
            icon={Loader2}
            iconColor="#64748b"
            iconBg="rgba(100,116,139,0.15)"
            iconBorder="rgba(100,116,139,0.3)"
            saving={saving}
            onSave={saveSettings}
            maxWidth="860px"
        >
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
                                                    min={1}
                                                    max={36000}
                                                    step="1"
                                                    value={maxTravelTime}
                                                    onChange={(e) => setMaxTravelTime(Math.floor(Number(e.target.value)))}
                                                    onKeyDown={(e) => {
                                                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onBlur={(e) => setMaxTravelTime(Math.max(1, Math.min(36000, Math.floor(Number(e.target.value)))))}
                                                    className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>

                                            <div className="p-3 sm:p-4 rounded-xl bg-surface/50">
                                                <label className="block text-xs sm:text-sm text-gray-300 mb-2">Supply Speed (Seconds):</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min={0.01}
                                                    max={0.99}
                                                    value={supplySpeed}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (val.includes('.') && val.split('.')[1].length > 2) {
                                                            val = val.substring(0, val.indexOf('.') + 3);
                                                        }
                                                        setSupplySpeed(Number(val));
                                                    }}
                                                    onBlur={(e) => {
                                                        const clamped = Math.max(0.01, Math.min(0.99, Number(e.target.value)));
                                                        setSupplySpeed(Number(clamped.toFixed(2)));
                                                    }}
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
                                                            step="1"
                                                            min={100000}
                                                            max={4290000000}
                                                            value={resource.reserved}
                                                            onChange={(e) => handleInventoryChange(index, 'reserved', Math.floor(Number(e.target.value)))}
                                                            onBlur={(e) => {
                                                                const val = Math.max(100000, Math.min(4290000000, Math.floor(Number(e.target.value))))
                                                                handleInventoryChange(index, 'reserved', val)
                                                            }}
                                                            className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Amount needed before supply</label>
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            min={100000}
                                                            max={4290000000}
                                                            value={resource.threshold}
                                                            onChange={(e) => handleInventoryChange(index, 'threshold', Math.floor(Number(e.target.value)))}
                                                            onBlur={(e) => {
                                                                const val = Math.max(100000, Math.min(4290000000, Math.floor(Number(e.target.value))))
                                                                handleInventoryChange(index, 'threshold', val)
                                                            }}
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
                                                            step="1"
                                                            min={100000}
                                                            max={4290000000}
                                                            value={resource.reserved}
                                                            onChange={(e) => handleBagChange(index, Math.floor(Number(e.target.value)))}
                                                            onBlur={(e) => {
                                                                const val = Math.max(100000, Math.min(4290000000, Math.floor(Number(e.target.value))))
                                                                handleBagChange(index, val)
                                                            }}
                                                            className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
        </KonohaModal>
    )
}
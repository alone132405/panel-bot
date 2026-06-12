'use client'

import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { BarChart3, ChevronRight, Clock3, Loader2, Save, SlidersHorizontal, TimerReset, X, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { getNestedValue, setNestedValue } from '@/lib/settingsMapper'
import { SettingHelpButton } from '@/components/ui/ResponsiveModalShell'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { TacticalRadioGroup } from '@/components/ui/TacticalRadioGroup'
import { TacticalSelect } from '@/components/ui/TacticalSelect'

type ResetType = 0 | 1

interface ReportSettingsPanelProps {
    iggId: string
}

interface ResetTimeDraft {
    resetType: ResetType
    hourReset: number
    giftResetTime: string
    giftResetDay: number
    dayGiftResetTime: string
}

interface StatisticSettingsDraft {
    pointGoalHunt: number[]
    pointGoalPurchase: number[]
    finalPointGoalHunt: number
    finalPointGoalPurchase: number
}

const HOUR_RESET_OPTIONS = [
    { value: '0', label: '24 Hours / 1 Days' },
    { value: '1', label: '48 Hours / 2 Days' },
    { value: '2', label: '72 Hours / 3 Days' },
    { value: '3', label: '96 Hours / 4 Days' },
    { value: '4', label: '120 Hours / 5 Days' },
    { value: '5', label: '144 Hours / 6 Days' },
    { value: '6', label: '168 Hours / 7 Days' },
]

const GIFT_RESET_DAY_OPTIONS = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
]

const RESET_TYPE_OPTIONS: Array<{ value: ResetType; label: string }> = [
    { value: 1, label: 'Day Based' },
    { value: 0, label: 'Hourly Based' },
]

const REPORT_TOGGLES = [
    { label: 'Save Stats', path: 'miscSettings.saveGuildStats' },
    { label: 'Save Guild Fest Stats', path: 'miscSettings.saveFestStats' },
    { label: 'Save Guild List', path: 'miscSettings.saveGuildList' },
]

const STAT_GOAL_COUNT = 5

export default function ReportSettingsPanel({ iggId }: ReportSettingsPanelProps) {
    const [settings, setSettings] = useState<Record<string, unknown> | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isResetTimeOpen, setIsResetTimeOpen] = useState(false)
    const [isStatisticSettingsOpen, setIsStatisticSettingsOpen] = useState(false)

    const loadSettings = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`)
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            } else {
                toast.error('Failed to load report settings')
            }
        } catch {
            toast.error('Error loading report settings')
        } finally {
            setLoading(false)
        }
    }, [iggId])

    useEffect(() => {
        loadSettings()
    }, [loadSettings])

    useEffect(() => {
        setIsResetTimeOpen(false)
        setIsStatisticSettingsOpen(false)
    }, [iggId])

    const saveSettingsObject = async (nextSettings: Record<string, unknown>) => {
        setSaving(true)
        try {
            const res = await fetch(`/api/settings/${iggId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nextSettings),
            })

            if (res.ok) {
                setSettings(nextSettings)
                toast.success('Report settings saved to config')
                return true
            }

            toast.error('Failed to save report settings')
            return false
        } catch {
            toast.error('Error saving report settings')
            return false
        } finally {
            setSaving(false)
        }
    }

    const saveCurrentSettings = async () => {
        if (!settings) return
        await saveSettingsObject(cloneSettings(settings))
    }

    const handleToggleChange = (path: string, value: boolean) => {
        const updatedSettings = cloneSettings(settings)
        setNestedValue(updatedSettings, path, value)
        setSettings(updatedSettings)
    }

    const handleResetTimeApply = async (draft: ResetTimeDraft) => {
        if (!settings) return

        const updatedSettings = cloneSettings(settings)
        setNestedValue(updatedSettings, 'miscSettings.giftResetType', draft.resetType)
        setNestedValue(updatedSettings, 'miscSettings.hourReset', draft.hourReset)
        setNestedValue(updatedSettings, 'miscSettings.giftResetTime', draft.giftResetTime)
        setNestedValue(updatedSettings, 'miscSettings.giftResetDay', draft.giftResetDay)
        setNestedValue(updatedSettings, 'miscSettings.dayGiftResetTime', draft.dayGiftResetTime)

        const saved = await saveSettingsObject(updatedSettings)
        if (saved) setIsResetTimeOpen(false)
    }

    const handleStatisticSettingsApply = async (draft: StatisticSettingsDraft) => {
        if (!settings) return

        const updatedSettings = cloneSettings(settings)
        setNestedValue(updatedSettings, 'statSettings.pointGoalHunt', draft.pointGoalHunt)
        setNestedValue(updatedSettings, 'statSettings.pointGoalPurchase', draft.pointGoalPurchase)
        setNestedValue(updatedSettings, 'statSettings.finalPointGoalHunt', draft.finalPointGoalHunt)
        setNestedValue(updatedSettings, 'statSettings.finalPointGoalPurchase', draft.finalPointGoalPurchase)

        const saved = await saveSettingsObject(updatedSettings)
        if (saved) setIsStatisticSettingsOpen(false)
    }

    const enabledCount = REPORT_TOGGLES.filter((setting) => !!getNestedValue(settings, setting.path)).length

    return (
        <>
            <section className="rounded-[24px] border border-border bg-bg-surface shadow-panel">
                <div className="flex flex-col gap-3 border-b border-border bg-bg-elevated/55 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[24px] border border-accent-1/25 bg-accent-1/10 text-accent-1">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-[15px] font-bold text-text-primary">Report Settings</h2>
                            <p className="text-[12px] text-text-muted">{saving ? 'Saving settings to config' : 'Controls exported stats and reset timing'}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="w-fit rounded-full border border-accent-1/20 bg-accent-1/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-1 sm:text-[11px]">
                            {enabledCount} Enabled
                        </span>
                        <button
                            type="button"
                            onClick={() => void saveCurrentSettings()}
                            disabled={loading || saving || !settings}
                            className="btn-primary min-h-[34px] gap-2 px-3 text-[12px] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-[190px] items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-7 w-7 animate-spin text-accent-1" />
                            <div className="text-[12px] font-bold uppercase tracking-[0.18em] text-text-muted">Loading report settings</div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
                            {REPORT_TOGGLES.map((setting) => (
                                <ReportToggleRow
                                    key={setting.path}
                                    label={setting.label}
                                    checked={!!getNestedValue(settings, setting.path)}
                                    onChange={(value) => handleToggleChange(setting.path, value)}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:gap-3">
                            <SettingActionButton
                                icon={SlidersHorizontal}
                                title="Statistic Settings"
                                subtitle="Point goals and final stat targets"
                                onClick={() => setIsStatisticSettingsOpen(true)}
                            />
                            <SettingActionButton
                                icon={TimerReset}
                                title="Set Reset Time"
                                subtitle={getResetSummary(settings)}
                                onClick={() => setIsResetTimeOpen(true)}
                            />
                        </div>
                    </div>
                )}
            </section>

            <ResetTimeDialog
                isOpen={isResetTimeOpen}
                settings={settings}
                saving={saving}
                onClose={() => setIsResetTimeOpen(false)}
                onApply={handleResetTimeApply}
            />

            <StatisticSettingsDialog
                isOpen={isStatisticSettingsOpen}
                settings={settings}
                saving={saving}
                onClose={() => setIsStatisticSettingsOpen(false)}
                onApply={handleStatisticSettingsApply}
            />
        </>
    )
}

function ReportToggleRow({
    label,
    checked,
    onChange,
}: {
    label: string
    checked: boolean
    onChange: (value: boolean) => void
}) {
    return (
        <div className="flex min-h-[46px] items-center justify-between gap-3 rounded-[24px] border border-border bg-bg-inset/70 px-3 py-2 transition-colors hover:border-accent-1/25 hover:bg-white/[0.035] sm:min-h-[58px] sm:px-4 sm:py-3">
            <span className="min-w-0 flex-1 pr-2 text-[13px] font-bold leading-snug text-text-primary sm:text-[14px]">
                {label}
                <span className="ml-1.5 inline-flex translate-y-[2px] align-middle sm:ml-2">
                    <SettingHelpButton label={label} compact />
                </span>
            </span>
            <ToggleSwitch checked={checked} onChange={onChange} compact />
        </div>
    )
}

function SettingActionButton({
    icon: Icon,
    title,
    subtitle,
    onClick,
}: {
    icon: LucideIcon
    title: string
    subtitle: string
    onClick: () => void
}) {
    return (
        <div className="group relative rounded-[24px] border border-border bg-bg-inset/70 transition-all hover:border-accent-1/30 hover:bg-white/[0.04]">
            <button
                type="button"
                onClick={onClick}
                className="flex min-h-[58px] w-full touch-manipulation items-center justify-between gap-3 rounded-[24px] px-3 py-2.5 pr-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-1/35 sm:min-h-[76px] sm:px-4 sm:py-3 sm:pr-14"
            >
                <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[24px] border border-accent-1/20 bg-accent-1/10 text-accent-1 sm:h-10 sm:w-10">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-black text-text-primary sm:text-[14px]">{title}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-text-muted sm:mt-1 sm:text-[12px]">{subtitle}</span>
                    </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent-1 sm:h-5 sm:w-5" />
            </button>
            <span className="absolute right-8 top-1/2 z-10 -translate-y-1/2 sm:right-10">
                <SettingHelpButton label={title} compact />
            </span>
        </div>
    )
}

function SettingsDialog({
    isOpen,
    title,
    icon: Icon,
    onClose,
    children,
    footer,
}: {
    isOpen: boolean
    title: string
    icon: LucideIcon
    onClose: () => void
    children: ReactNode
    footer: ReactNode
}) {
    if (!isOpen) return null

    return (
        <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-3 md:p-6">
            <button
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                className="pointer-events-auto fixed inset-0 cursor-default bg-black/75 backdrop-blur-sm"
            />

            <div
                onPointerDown={(event) => event.stopPropagation()}
                className="panel-solid pointer-events-auto relative z-10 flex max-h-[88vh] w-full max-w-[720px] flex-col overflow-hidden rounded-[24px]"
            >
                <div className="scan-line opacity-45" />
                <div className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-b border-border bg-bg-elevated/60 px-4 py-3 md:px-5 md:py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[24px] border border-accent-1/25 bg-accent-1/10 text-accent-1">
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex min-w-0 items-center gap-2">
                            <h3 className="truncate font-orbitron text-[15px] font-black uppercase tracking-normal text-text-primary md:text-[17px]">
                                {title}
                            </h3>
                            <SettingHelpButton label={title} />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-[24px] border border-accent-3/20 bg-accent-3/10 text-accent-3 transition-colors hover:bg-accent-3/20"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="relative z-10 flex-1 overflow-y-auto bg-bg-base/35 p-4 md:p-5">
                    {children}
                </div>

                <div className="relative z-10 flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-bg-elevated/55 px-4 py-3 sm:flex-row sm:justify-end md:px-5 md:py-4">
                    {footer}
                </div>
            </div>
        </div>
    )
}

function ResetTimeDialog({
    isOpen,
    settings,
    saving,
    onClose,
    onApply,
}: {
    isOpen: boolean
    settings: unknown
    saving: boolean
    onClose: () => void
    onApply: (draft: ResetTimeDraft) => Promise<void>
}) {
    const [resetType, setResetType] = useState<ResetType>(0)
    const [hourReset, setHourReset] = useState(0)
    const [giftResetTime, setGiftResetTime] = useState('00:00:00')
    const [giftResetDay, setGiftResetDay] = useState(0)
    const [dayGiftResetTime, setDayGiftResetTime] = useState('00:00:00')

    useEffect(() => {
        if (!isOpen) return

        setResetType(getGiftResetType(settings))
        setHourReset(normalizeHourReset(getNestedValue(settings, 'miscSettings.hourReset')))
        setGiftResetTime(normalizeTimeValue(getNestedValue(settings, 'miscSettings.giftResetTime')))
        setGiftResetDay(normalizeGiftResetDay(getNestedValue(settings, 'miscSettings.giftResetDay')))
        setDayGiftResetTime(normalizeTimeValue(getNestedValue(settings, 'miscSettings.dayGiftResetTime')))
    }, [isOpen, settings])

    const isDayBased = resetType === 1

    return (
        <SettingsDialog
            isOpen={isOpen}
            title="Set Reset Time"
            icon={Clock3}
            onClose={onClose}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex min-h-[42px] touch-manipulation items-center justify-center rounded-[24px] border border-border bg-bg-surface px-5 text-[13px] font-bold text-text-soft transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                            void onApply({
                                resetType,
                                hourReset,
                                giftResetTime: normalizeTimeValue(giftResetTime),
                                giftResetDay,
                                dayGiftResetTime: normalizeTimeValue(dayGiftResetTime),
                            })
                        }}
                        className="btn-primary min-h-[42px] touch-manipulation gap-2 px-5 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="rounded-[24px] border border-border bg-bg-inset/70 p-4">
                    <TacticalRadioGroup
                        name="gift-reset-type"
                        value={resetType}
                        onChange={(value) => setResetType(value)}
                        options={RESET_TYPE_OPTIONS}
                    />
                </div>

                <div className={`rounded-[24px] border border-border bg-bg-inset/70 p-4 transition-opacity ${isDayBased ? '' : 'opacity-50'}`}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[1fr_220px_160px] md:items-end">
                        <div className="sm:col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 text-[13px] font-black text-text-primary">
                                <span>Day Based</span>
                                <SettingHelpButton label="Day Based" />
                            </div>
                            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Reset Day / Time</div>
                        </div>
                        <div className={isDayBased ? '' : 'pointer-events-none'}>
                            <LabelText>Day</LabelText>
                            <TacticalSelect
                                value={String(giftResetDay)}
                                onChange={(value) => setGiftResetDay(normalizeGiftResetDay(value))}
                                options={GIFT_RESET_DAY_OPTIONS}
                            />
                        </div>
                        <div>
                            <LabelText>Time</LabelText>
                            <TimeInput
                                value={dayGiftResetTime}
                                onChange={setDayGiftResetTime}
                                disabled={!isDayBased}
                            />
                        </div>
                    </div>
                </div>

                <div className={`rounded-[24px] border border-border bg-bg-inset/70 p-4 transition-opacity ${!isDayBased ? '' : 'opacity-50'}`}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[1fr_220px_160px] md:items-end">
                        <div className="sm:col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 text-[13px] font-black text-text-primary">
                                <span>Hourly Based</span>
                                <SettingHelpButton label="Hourly Based" />
                            </div>
                            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Every / From</div>
                        </div>
                        <div className={!isDayBased ? '' : 'pointer-events-none'}>
                            <LabelText>Every</LabelText>
                            <TacticalSelect
                                value={String(hourReset)}
                                onChange={(value) => setHourReset(normalizeHourReset(value))}
                                options={HOUR_RESET_OPTIONS}
                            />
                        </div>
                        <div>
                            <LabelText>From</LabelText>
                            <TimeInput
                                value={giftResetTime}
                                onChange={setGiftResetTime}
                                disabled={isDayBased}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SettingsDialog>
    )
}

function StatisticSettingsDialog({
    isOpen,
    settings,
    saving,
    onClose,
    onApply,
}: {
    isOpen: boolean
    settings: unknown
    saving: boolean
    onClose: () => void
    onApply: (draft: StatisticSettingsDraft) => Promise<void>
}) {
    const [pointGoalHunt, setPointGoalHunt] = useState<number[]>([])
    const [pointGoalPurchase, setPointGoalPurchase] = useState<number[]>([])
    const [finalPointGoalHunt, setFinalPointGoalHunt] = useState(0)
    const [finalPointGoalPurchase, setFinalPointGoalPurchase] = useState(0)

    useEffect(() => {
        if (!isOpen) return

        setPointGoalHunt(normalizeStatArray(getNestedValue(settings, 'statSettings.pointGoalHunt'), [0, 1, 3, 9, 18]))
        setPointGoalPurchase(normalizeStatArray(getNestedValue(settings, 'statSettings.pointGoalPurchase'), [1, 2, 4, 8, 16]))
        setFinalPointGoalHunt(clampInteger(getNestedValue(settings, 'statSettings.finalPointGoalHunt'), 0, 9999))
        setFinalPointGoalPurchase(clampInteger(getNestedValue(settings, 'statSettings.finalPointGoalPurchase'), 0, 9999))
    }, [isOpen, settings])

    const updateHuntGoal = (index: number, value: number) => {
        setPointGoalHunt((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))
    }

    const updatePurchaseGoal = (index: number, value: number) => {
        setPointGoalPurchase((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))
    }

    return (
        <SettingsDialog
            isOpen={isOpen}
            title="Statistic Settings"
            icon={BarChart3}
            onClose={onClose}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex min-h-[42px] touch-manipulation items-center justify-center rounded-[24px] border border-border bg-bg-surface px-5 text-[13px] font-bold text-text-soft transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                            void onApply({
                                pointGoalHunt,
                                pointGoalPurchase,
                                finalPointGoalHunt,
                                finalPointGoalPurchase,
                            })
                        }}
                        className="btn-primary min-h-[42px] touch-manipulation gap-2 px-5 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <NumberField
                        label="Final Hunt Goal"
                        value={finalPointGoalHunt}
                        onChange={setFinalPointGoalHunt}
                    />
                    <NumberField
                        label="Final Purchase Goal"
                        value={finalPointGoalPurchase}
                        onChange={setFinalPointGoalPurchase}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                    <PointGoalGroup
                        title="Hunt Point Goals"
                        values={pointGoalHunt}
                        onChange={updateHuntGoal}
                    />
                    <PointGoalGroup
                        title="Purchase Point Goals"
                        values={pointGoalPurchase}
                        onChange={updatePurchaseGoal}
                    />
                </div>
            </div>
        </SettingsDialog>
    )
}

function PointGoalGroup({
    title,
    values,
    onChange,
}: {
    title: string
    values: number[]
    onChange: (index: number, value: number) => void
}) {
    return (
        <div className="rounded-[24px] border border-border bg-bg-inset/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.16em] text-text-muted">
                <span>{title}</span>
                <SettingHelpButton label={title} />
            </div>
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-2">
                {values.map((value, index) => (
                    <NumberField
                        key={`${title}-${index}`}
                        label={`Level ${index + 1}`}
                        value={value}
                        onChange={(nextValue) => onChange(index, nextValue)}
                    />
                ))}
            </div>
        </div>
    )
}

function NumberField({
    label,
    value,
    onChange,
}: {
    label: string
    value: number
    onChange: (value: number) => void
}) {
    return (
        <div className="block">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
                <span>{label}</span>
                <SettingHelpButton label={label} />
            </div>
            <input
                type="number"
                min={0}
                max={9999}
                value={value}
                onChange={(event) => onChange(clampInteger(event.target.value, 0, 9999))}
                className="input-field h-11 w-full text-center font-sans text-[14px] font-black text-accent-1"
            />
        </div>
    )
}

function LabelText({ children }: { children: ReactNode }) {
    const label = typeof children === 'string' ? children : undefined

    return (
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
            <span>{children}</span>
            {label && <SettingHelpButton label={label} />}
        </div>
    )
}

function TimeInput({
    value,
    onChange,
    disabled = false,
}: {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}) {
    return (
        <input
            type="time"
            min="00:00:00"
            max="23:59:59"
            step={1}
            value={normalizeTimeValue(value)}
            disabled={disabled}
            onChange={(event) => onChange(normalizeTimeValue(event.target.value))}
            onBlur={(event) => onChange(normalizeTimeValue(event.target.value))}
            className="input-field h-10 w-full font-sans text-[13px] font-black text-accent-1 disabled:cursor-not-allowed disabled:opacity-60"
        />
    )
}

function cloneSettings(settings: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(settings || {})) as Record<string, unknown>
}

function clampInteger(value: unknown, min: number, max: number) {
    const parsed = Math.trunc(Number(value))
    if (!Number.isFinite(parsed)) return min
    return Math.max(min, Math.min(max, parsed))
}

function normalizeHourReset(value: unknown) {
    const parsed = Math.trunc(Number(value))
    const hours = [24, 48, 72, 96, 120, 144, 168]

    if (hours.includes(parsed)) {
        return hours.indexOf(parsed)
    }

    return clampInteger(value, 0, HOUR_RESET_OPTIONS.length - 1)
}

function normalizeGiftResetDay(value: unknown) {
    return clampInteger(value, 0, GIFT_RESET_DAY_OPTIONS.length - 1)
}

function normalizeStatArray(value: unknown, fallback: number[]) {
    const source = Array.isArray(value) ? value : fallback
    return Array.from({ length: STAT_GOAL_COUNT }, (_, index) =>
        clampInteger(source[index] ?? fallback[index] ?? 0, 0, 9999)
    )
}

function normalizeTimeValue(value: unknown) {
    if (typeof value !== 'string') return '00:00:00'

    const rawValue = value.trim()
    if (!rawValue) return '00:00:00'

    const timeValue = rawValue.includes('.') ? rawValue.split('.').pop() || '' : rawValue
    const [rawHours, rawMinutes, rawSeconds = '0'] = timeValue.split(':')
    const parsedHours = Number(rawHours)
    const parsedMinutes = Number(rawMinutes)
    const parsedSeconds = Number(rawSeconds)

    if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes) || !Number.isFinite(parsedSeconds)) {
        return '00:00:00'
    }

    if (parsedHours > 23) return '23:59:59'

    const hours = clampInteger(parsedHours, 0, 23)
    const minutes = clampInteger(parsedMinutes, 0, 59)
    const seconds = clampInteger(parsedSeconds, 0, 59)

    return `${padTimePart(hours)}:${padTimePart(minutes)}:${padTimePart(seconds)}`
}

function padTimePart(value: number) {
    return String(value).padStart(2, '0')
}

function getGiftResetType(settings: unknown): ResetType {
    return Number(getNestedValue(settings, 'miscSettings.giftResetType')) === 1 ? 1 : 0
}

function getResetSummary(settings: unknown) {
    if (getGiftResetType(settings) === 1) {
        const day = GIFT_RESET_DAY_OPTIONS[normalizeGiftResetDay(getNestedValue(settings, 'miscSettings.giftResetDay'))]?.label || 'Sunday'
        const time = normalizeTimeValue(getNestedValue(settings, 'miscSettings.dayGiftResetTime'))
        return `${day} at ${time}`
    }

    const interval = HOUR_RESET_OPTIONS[normalizeHourReset(getNestedValue(settings, 'miscSettings.hourReset'))]?.label || HOUR_RESET_OPTIONS[0].label
    const time = normalizeTimeValue(getNestedValue(settings, 'miscSettings.giftResetTime'))
    return `${interval} from ${time}`
}

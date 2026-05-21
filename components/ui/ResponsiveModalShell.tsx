'use client'

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, Info, Loader2, Minus, Plus, Save, X, type LucideIcon } from 'lucide-react'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { getSettingHelp } from '@/lib/settingHelp'

export interface TabDef {
    id: string
    label: string
    icon: LucideIcon
}

interface ResponsiveModalShellProps {
    isOpen: boolean
    onClose: () => void
    title: string
    iggId: string | null
    headerIcon: LucideIcon
    tabs: TabDef[]
    loading?: boolean
    saving?: boolean
    onSave?: () => void
    saveLabel?: string
    statusLabel?: string
    renderSectionContent: (tabId: string, isMobile: boolean, isTablet: boolean) => ReactNode
    maxWidth?: string
}

interface ChoiceOption<T extends string | number> {
    value: T
    label: string
    hint?: string
}

const controlMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.18, ease: 'easeOut' },
}

function clampNumber(value: number, min: number, max: number) {
    if (Number.isNaN(value)) return min
    return Math.max(min, Math.min(max, value))
}

export function ResponsiveModalShell({
    isOpen,
    onClose,
    title,
    iggId,
    headerIcon: HeaderIcon,
    tabs,
    loading = false,
    saving = false,
    onSave,
    saveLabel = 'Close',
    statusLabel = 'Manual save to config',
    renderSectionContent,
    maxWidth = '940px',
}: ResponsiveModalShellProps) {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')
    const [openAccordion, setOpenAccordion] = useState<string | null>(tabs[0]?.id || null)
    const [isMobile, setIsMobile] = useState(false)
    const [isTablet, setIsTablet] = useState(false)
    const tabIds = useMemo(() => tabs.map((tab) => tab.id), [tabs])
    const firstTabId = tabIds[0] || ''
    const tabKey = tabIds.join('\u0001')
    const previousOpenRef = useRef(isOpen)
    const previousTabKeyRef = useRef(tabKey)

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            setIsMobile(width < 768)
            setIsTablet(width >= 768 && width < 1180)
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (!tabIds.includes(activeTab) && activeTab !== firstTabId) {
            setActiveTab(firstTabId)
        }
        if (openAccordion !== null && !tabIds.includes(openAccordion) && openAccordion !== (firstTabId || null)) {
            setOpenAccordion(firstTabId || null)
        }
    }, [activeTab, firstTabId, openAccordion, tabIds])

    useEffect(() => {
        const openedNow = isOpen && !previousOpenRef.current
        const tabsChanged = tabKey !== previousTabKeyRef.current

        if (isOpen && (openedNow || tabsChanged)) {
            setActiveTab(firstTabId)
            setOpenAccordion(firstTabId || null)
        }

        previousOpenRef.current = isOpen
        previousTabKeyRef.current = tabKey
    }, [firstTabId, isOpen, tabKey])

    useBodyScrollLock(isOpen)

    const hasTabs = tabs.length > 1
    const activeTabId = activeTab || tabs[0]?.id || ''
    const activeTabDef = tabs.find((tab) => tab.id === activeTabId) || tabs[0]
    const ActiveTabIcon = activeTabDef?.icon
    const saveAction = onSave || onClose
    const isManualSave = saveLabel.toLowerCase().includes('save')
    const SaveActionIcon = isManualSave ? Save : X

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <div className={`pointer-events-none fixed inset-0 z-50 flex ${isMobile ? 'items-stretch justify-center p-2' : 'items-center justify-center p-3 md:p-6'}`}>
                    <motion.button
                        type="button"
                        aria-label="Close modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transitionEnd: { pointerEvents: 'none' } }}
                        onClick={onClose}
                        className="pointer-events-auto fixed inset-0 z-0 cursor-default touch-manipulation bg-black/[0.82] backdrop-blur-md"
                    />

                    <motion.div
                        onPointerDown={(event) => event.stopPropagation()}
                        initial={{ scale: 0.96, opacity: 0, y: 14 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 14, transitionEnd: { pointerEvents: 'none' } }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ maxWidth }}
                        className={`panel-solid pointer-events-auto relative z-10 flex w-full flex-col overflow-hidden ${isMobile ? 'h-[calc(100dvh-1rem)] max-h-none rounded-md' : 'max-h-[90vh] rounded-lg'}`}
                    >
                        <div className="scan-line opacity-50" />

                        <div className={`relative z-10 shrink-0 border-b border-border bg-bg-elevated/60 ${isMobile ? 'px-3 py-2' : 'px-5 py-4'}`}>
                            <div className={`flex items-center justify-between ${isMobile ? 'gap-2' : 'gap-4'}`}>
                                <div className={`flex min-w-0 items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                                    <div className={`${isMobile ? 'h-8 w-8' : 'h-11 w-11'} flex shrink-0 items-center justify-center rounded-md border border-accent-1/25 bg-accent-1/10 text-accent-1 shadow-glow-mint`}>
                                        <HeaderIcon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="mb-0.5 flex items-center gap-2">
                                            <h2 className={`truncate font-orbitron font-black uppercase tracking-normal text-text-primary ${isMobile ? 'text-[14px]' : 'text-[18px]'}`}>
                                                {title}
                                            </h2>
                                            {saving && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-1" />}
                                        </div>
                                        <p className={`truncate font-mono uppercase text-text-muted ${isMobile ? 'text-[10px] tracking-[0.12em]' : 'text-[11px] tracking-[0.16em]'}`}>
                                            {iggId ? `IGG ID ${iggId}` : 'No IGG ID selected'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                    {!isMobile && (
                                        <span className="status-active text-[11px]">
                                            {saving ? 'Saving' : 'Manual save'}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className={`${isMobile ? 'h-8 w-8' : 'h-9 w-9'} flex touch-manipulation items-center justify-center rounded-md border border-accent-3/20 bg-accent-3/10 text-accent-3 transition-colors hover:bg-accent-3/20`}
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={`relative z-10 flex flex-1 overflow-hidden ${!isMobile && !isTablet && hasTabs ? 'flex-row' : 'flex-col'}`}>
                            {!isMobile && !isTablet && hasTabs && (
                                <aside className="flex w-[244px] shrink-0 flex-col border-r border-border bg-bg-inset/70">
                                    <div className="border-b border-border px-4 py-4">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Sections</div>
                                        <div className="mt-1 text-[13px] font-bold text-text-soft">{tabs.length} groups available</div>
                                    </div>
                                    <nav className="flex flex-1 flex-col gap-1 p-3">
                                        {tabs.map((tab) => {
                                            const TabIcon = tab.icon
                                            const selected = activeTab === tab.id

                                            return (
                                                <button
                                                    type="button"
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`relative flex w-full touch-manipulation items-center gap-3 rounded-md px-3 py-3 text-left text-[14px] font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-accent-1/35 ${selected
                                                        ? 'bg-accent-1/10 text-accent-1 shadow-[inset_0_0_0_1px_rgba(33,243,177,0.22),0_0_18px_rgba(33,243,177,0.1)]'
                                                        : 'text-text-muted hover:bg-white/[0.04] hover:text-text-primary'
                                                        }`}
                                                >
                                                    {selected && (
                                                        <motion.span
                                                            layoutId="desktopTabIndicator"
                                                            className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-accent-1 shadow-glow-mint"
                                                        />
                                                    )}
                                                    <TabIcon className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">{tab.label}</span>
                                                </button>
                                            )
                                        })}
                                    </nav>
                                </aside>
                            )}

                            {isTablet && hasTabs && (
                                <div className="flex w-full shrink-0 overflow-x-auto border-b border-border bg-bg-inset/70 scrollbar-none">
                                    {tabs.map((tab) => {
                                        const TabIcon = tab.icon
                                        const selected = activeTab === tab.id

                                        return (
                                            <button
                                                type="button"
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`relative flex min-h-[56px] touch-manipulation items-center gap-2 whitespace-nowrap px-5 text-[14px] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-1/35 ${selected
                                                    ? 'text-accent-1'
                                                    : 'text-text-muted hover:text-text-primary'
                                                    }`}
                                            >
                                                <TabIcon className="h-4 w-4" />
                                                {tab.label}
                                                {selected && (
                                                        <motion.span
                                                            layoutId="tabletTabIndicator"
                                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-1 shadow-glow-mint"
                                                        />
                                                    )}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {isMobile && hasTabs && (
                                <div className="flex-1 space-y-2 overflow-y-auto bg-bg-base/35 p-2.5 scrollbar-thin">
                                    {loading ? (
                                        <LoadingState compact />
                                    ) : (
                                        tabs.map((tab) => {
                                            const TabIcon = tab.icon
                                            const opened = openAccordion === tab.id

                                            return (
                                                <div key={tab.id} className="overflow-hidden rounded-md border border-border bg-bg-surface/85">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveTab(tab.id)
                                                            setOpenAccordion(opened ? null : tab.id)
                                                        }}
                                                        className="flex min-h-[44px] w-full touch-manipulation items-center justify-between gap-3 px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-1/35"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-2.5">
                                                            <TabIcon className={`h-4 w-4 shrink-0 ${opened ? 'text-accent-1' : 'text-text-muted'}`} />
                                                            <span className="truncate text-[13px] font-bold text-text-primary">{tab.label}</span>
                                                        </div>
                                                        <ChevronRight className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${opened ? 'rotate-90 text-accent-1' : ''}`} />
                                                    </button>
                                                    <AnimatePresence initial={false}>
                                                        {opened && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="border-t border-border p-2">
                                                                    {renderSectionContent(tab.id, isMobile, isTablet)}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}

                            {(!isMobile || !hasTabs) && (
                                <main className={`flex-1 overflow-y-auto bg-bg-base/35 scrollbar-thin ${isMobile ? 'p-4' : 'p-4 md:p-5'}`}>
                                    {loading ? (
                                        <LoadingState />
                                    ) : (
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeTabId}
                                                initial={{ opacity: 0, x: 14 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -14 }}
                                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                                className="min-h-full rounded-md border border-border bg-bg-surface/80 p-4 shadow-[0_18px_42px_rgba(0,0,0,0.18)] md:p-5"
                                            >
                                                {activeTabDef && ActiveTabIcon && (
                                                    <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent-1/20 bg-accent-1/10 text-accent-1">
                                                            <ActiveTabIcon className="h-5 w-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="truncate text-[15px] font-black text-text-primary">{activeTabDef.label}</h3>
                                                            <p className="mt-0.5 text-[12px] text-text-muted">{statusLabel}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {renderSectionContent(activeTabId, isMobile, isTablet)}
                                            </motion.div>
                                        </AnimatePresence>
                                    )}
                                </main>
                            )}
                        </div>

                        <footer className={`shrink-0 border-t border-border bg-bg-elevated/55 ${isMobile ? 'px-3 py-2' : 'relative flex items-center justify-between gap-4 px-5 py-4'}`}>
                            {isMobile ? (
                                isManualSave ? (
                                    <button
                                        type="button"
                                        onClick={saveAction}
                                        disabled={saving}
                                        className="btn-primary min-h-[40px] w-full touch-manipulation gap-2 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveActionIcon className="h-4 w-4" />}
                                        {saving ? 'Saving...' : saveLabel}
                                    </button>
                                ) : (
                                    <div className="truncate text-center text-[11px] text-text-muted">
                                        {saving ? 'Saving settings to config...' : `${statusLabel}. Apply from Protocols when ready.`}
                                    </div>
                                )
                            ) : (
                                <>
                                    <div className="text-[12px] text-text-muted">
                                        {saving ? 'Saving settings to config...' : `${statusLabel}. Use Protocol Apply Changes to run the script.`}
                                    </div>
                                    {isManualSave && (
                                        <button
                                            type="button"
                                            onClick={saveAction}
                                            disabled={saving}
                                            className="btn-primary touch-manipulation gap-2 text-[14px] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveActionIcon className="h-4 w-4" />}
                                            {saving ? 'Saving...' : saveLabel}
                                        </button>
                                    )}
                                </>
                            )}
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    return typeof document === 'undefined' ? null : createPortal(modal, document.body)
}

function LoadingState({ compact = false }: { compact?: boolean }) {
    return (
        <div className={`flex items-center justify-center ${compact ? 'min-h-[180px]' : 'min-h-[260px]'}`}>
            <div className={`flex flex-col items-center ${compact ? 'gap-2' : 'gap-3'}`}>
                <Loader2 className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} animate-spin text-accent-1`} />
                <div className={`${compact ? 'text-[10px] tracking-[0.14em]' : 'text-[12px] tracking-[0.18em]'} font-bold uppercase text-text-muted`}>Loading settings</div>
            </div>
        </div>
    )
}

interface HelpTooltipPosition {
    top: number
    left: number
    placement: 'top' | 'bottom'
}

export function SettingHelpButton({
    label,
    helpText,
    compact = false,
}: {
    label: string
    helpText?: string
    compact?: boolean
}) {
    const help = getSettingHelp(label, helpText)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [tooltipPosition, setTooltipPosition] = useState<HelpTooltipPosition | null>(null)

    if (!help) return null

    const showTooltip = () => {
        const button = buttonRef.current
        if (!button) return

        const rect = button.getBoundingClientRect()
        const tooltipWidth = 280
        const viewportMargin = 12
        const left = Math.max(
            viewportMargin + tooltipWidth / 2,
            Math.min(window.innerWidth - viewportMargin - tooltipWidth / 2, rect.left + rect.width / 2)
        )
        const showAbove = rect.bottom + 132 > window.innerHeight && rect.top > 132

        setTooltipPosition({
            left,
            top: showAbove ? rect.top - 8 : rect.bottom + 8,
            placement: showAbove ? 'top' : 'bottom',
        })
    }

    const hideTooltip = () => setTooltipPosition(null)

    return (
        <span className="inline-flex shrink-0">
            <button
                ref={buttonRef}
                type="button"
                aria-label={`${label} info`}
                title={help}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    if (tooltipPosition) {
                        hideTooltip()
                    } else {
                        showTooltip()
                    }
                }}
                className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} flex touch-manipulation items-center justify-center rounded-full border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan transition-colors hover:border-accent-cyan/50 hover:bg-accent-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/35`}
            >
                <Info className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} strokeWidth={2.6} />
            </button>

            {tooltipPosition && typeof document !== 'undefined' && createPortal(
                <div
                    className="pointer-events-none fixed z-[1000] w-[280px] rounded-md border border-accent-cyan/20 bg-bg-elevated px-3 py-2.5 text-left text-[12px] font-medium leading-relaxed text-text-soft shadow-panel"
                    style={{
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,
                        transform: tooltipPosition.placement === 'top' ? 'translate(-50%, -100%)' : 'translateX(-50%)',
                    }}
                >
                    {help}
                </div>,
                document.body
            )}
        </span>
    )
}

function ControlLabel({
    label,
    helpText,
    compact = false,
    toggle = false,
    mobile = false,
}: {
    label: string
    helpText?: string
    compact?: boolean
    toggle?: boolean
    mobile?: boolean
}) {
    const widthClass = compact
        ? 'w-full min-w-0'
        : toggle
            ? 'min-w-0 flex-1 pr-2'
            : 'min-w-[150px] flex-[1_1_150px] pr-2'

    const sizeClass = mobile ? 'text-[12px]' : 'text-[14px]'
    const helpOffsetClass = mobile ? 'ml-1.5 translate-y-[2px]' : 'ml-2 translate-y-[2px]'

    return (
        <span className={`${widthClass} block ${sizeClass} font-bold leading-snug text-text-primary break-words`}>
            {label}
            <span className={`${helpOffsetClass} inline-flex align-middle`}>
                <SettingHelpButton label={label} helpText={helpText} compact={mobile} />
            </span>
        </span>
    )
}

export function ToggleControl({
    label,
    checked,
    onChange,
    isMobile,
    disabled = false,
    helpText,
}: {
    label: string
    checked: boolean
    onChange: (v: boolean) => void
    isMobile?: boolean
    disabled?: boolean
    helpText?: string
}) {
    return (
        <motion.div
            {...controlMotion}
            className={`group flex items-center justify-between rounded-md border border-border bg-bg-inset/70 transition-all hover:border-accent-1/25 hover:bg-white/[0.035] ${isMobile ? 'min-h-[44px] gap-2 px-2.5 py-2' : 'min-h-[62px] gap-3 px-4 py-3'} ${disabled ? 'opacity-45 grayscale' : ''}`}
        >
            <ControlLabel label={label} helpText={helpText} toggle mobile={isMobile} />
            <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} compact={isMobile} />
        </motion.div>
    )
}

export function StepperControl({
    label,
    val,
    min = 0,
    max = 9999,
    onChange,
    isMobile,
    disabled = false,
    stacked = false,
    helpText,
}: {
    label: string
    val: number
    min?: number
    max?: number
    onChange: (v: number) => void
    isMobile?: boolean
    disabled?: boolean
    stacked?: boolean
    helpText?: string
}) {
    const updateValue = (nextValue: number) => onChange(clampNumber(nextValue, min, max))
    const isStacked = stacked
    const isMobileRow = isMobile && !isStacked
    const buttonSizeClass = isMobile ? 'h-7 w-7' : isStacked ? 'h-10 w-10' : 'h-8 w-8'

    return (
        <motion.div
            {...controlMotion}
            className={`rounded-md border border-border bg-bg-inset/70 transition-all hover:border-accent-1/25 hover:bg-white/[0.035] ${isMobile ? 'px-2.5 py-2' : 'px-4 py-3'} ${disabled ? 'opacity-45 grayscale' : ''}`}
        >
            <div className={`flex gap-x-3 ${isMobile ? 'items-center justify-between gap-y-0' : isStacked ? 'flex-col gap-y-3' : 'flex-wrap items-center justify-between gap-y-3'}`}>
                <ControlLabel label={label} helpText={helpText} compact={isStacked} toggle={isMobileRow} mobile={isMobile} />
                <div className={`flex items-center rounded-md border border-border bg-bg-base/80 ${isMobile ? 'gap-1 p-0.5' : 'gap-2 p-1'} ${isStacked ? 'w-full justify-between' : isMobileRow ? 'w-[128px] shrink-0' : 'w-[156px] shrink-0'}`}>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => updateValue(val - 1)}
                        className={`${buttonSizeClass} flex shrink-0 touch-manipulation items-center justify-center rounded-md bg-bg-surface text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed`}
                        aria-label={`Decrease ${label}`}
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <input
                        type="number"
                        min={min}
                        max={max}
                        value={val}
                        disabled={disabled}
                        onChange={(event) => updateValue(Number(event.target.value))}
                        className={`${isStacked ? 'min-w-0 flex-1' : 'w-16'} ${isMobile ? 'h-7 text-[13px]' : 'h-8 text-[14px]'} bg-transparent text-center font-mono font-black text-accent-1 outline-none disabled:cursor-not-allowed`}
                    />
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => updateValue(val + 1)}
                        className={`${buttonSizeClass} flex shrink-0 touch-manipulation items-center justify-center rounded-md bg-bg-surface text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed`}
                        aria-label={`Increase ${label}`}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export function InputControl({
    label,
    val,
    onChange,
    isMobile,
    disabled = false,
    type = 'text',
    placeholder = '',
    helpText,
}: {
    label: string
    val: string
    onChange: (v: string) => void
    isMobile?: boolean
    disabled?: boolean
    type?: string
    placeholder?: string
    helpText?: string
}) {
    return (
        <motion.div
            {...controlMotion}
            className={`rounded-md border border-border bg-bg-inset/70 transition-all hover:border-accent-1/25 hover:bg-white/[0.035] ${isMobile ? 'px-2.5 py-2' : 'px-4 py-3'} ${disabled ? 'opacity-45 grayscale' : ''}`}
        >
            <div className={`flex gap-x-3 ${isMobile ? 'items-center justify-between gap-y-0' : 'flex-wrap items-center justify-between gap-y-3'}`}>
                <ControlLabel label={label} helpText={helpText} toggle={isMobile} mobile={isMobile} />
                <input
                    type={type}
                    value={val}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className={`input-field font-mono text-accent-1 disabled:cursor-not-allowed ${isMobile ? 'min-h-[34px] w-[128px] shrink-0 px-2 text-[13px]' : 'min-w-[150px] flex-[1_1_180px] text-[14px]'}`}
                    {...(type === 'time' ? { step: '1' } : {})}
                />
            </div>
        </motion.div>
    )
}

export function ChoiceControl<T extends string | number>({
    label,
    value,
    options,
    onChange,
    isMobile,
    disabled = false,
    helpText,
}: {
    label: string
    value: T
    options: ChoiceOption<T>[]
    onChange: (value: T) => void
    isMobile?: boolean
    disabled?: boolean
    helpText?: string
}) {
    const gridClass = isMobile
        ? 'grid-cols-2'
        : options.length <= 3
            ? 'sm:grid-cols-3'
            : options.length <= 4
                ? 'sm:grid-cols-2 xl:grid-cols-4'
                : 'sm:grid-cols-2 xl:grid-cols-3'

    return (
        <motion.div
            {...controlMotion}
            className={`rounded-md border border-border bg-bg-inset/70 ${isMobile ? 'p-2.5' : 'p-4'} ${disabled ? 'opacity-45 grayscale' : ''}`}
        >
            <div className={`${isMobile ? 'mb-2 text-[10px] tracking-[0.12em]' : 'mb-3 text-[12px] tracking-[0.16em]'} flex items-center gap-2 font-black uppercase text-text-muted`}>
                <span>{label}</span>
                <SettingHelpButton label={label} helpText={helpText} compact={isMobile} />
            </div>
            <div className={`grid ${isMobile ? 'gap-1.5' : 'gap-2'} ${gridClass}`}>
                {options.map((option) => {
                    const selected = option.value === value

                    return (
                        <button
                            type="button"
                            key={String(option.value)}
                            disabled={disabled}
                            title={option.hint || getSettingHelp(option.label)}
                            onClick={() => onChange(option.value)}
                            className={`relative flex min-h-[44px] touch-manipulation items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-all ${selected
                                ? 'border-accent-1/45 bg-accent-1/10 text-text-primary shadow-[0_0_18px_rgba(33,243,177,0.12)]'
                                : 'border-border bg-bg-base/75 text-text-muted hover:border-accent-1/25 hover:bg-white/[0.04] hover:text-text-primary'
                                }`}
                        >
                            <span className="min-w-0">
                                <span className="block text-[13px] font-bold leading-tight">{option.label}</span>
                                {option.hint && <span className="mt-1 block text-[11px] leading-tight text-text-muted">{option.hint}</span>}
                            </span>
                            {selected && (
                                <motion.span
                                    layoutId={`${label}-choice-check`}
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-1 text-bg-base"
                                >
                                    <Check className="h-3 w-3" strokeWidth={4} />
                                </motion.span>
                            )}
                        </button>
                    )
                })}
            </div>
        </motion.div>
    )
}

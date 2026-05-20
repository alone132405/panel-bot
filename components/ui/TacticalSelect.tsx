'use client'

import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface Option {
    value: string
    label: string
}

interface TacticalSelectProps {
    value: string
    onChange: (value: string) => void
    options: Option[]
    placeholder?: string
    className?: string
}

export function TacticalSelect({ value, onChange, options, placeholder, className = '' }: TacticalSelectProps) {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
    const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom')
    const ref = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLUListElement>(null)

    const selected = options.find(o => o.value === value)

    const updateMenuPosition = useCallback(() => {
        const trigger = ref.current
        if (!trigger) return

        const rect = trigger.getBoundingClientRect()
        const desiredHeight = Math.min(280, options.length * 40 + 8)
        const belowSpace = window.innerHeight - rect.bottom - 10
        const aboveSpace = rect.top - 10
        const nextPlacement = belowSpace < desiredHeight && aboveSpace > belowSpace ? 'top' : 'bottom'
        const availableSpace = nextPlacement === 'top' ? aboveSpace : belowSpace

        setPlacement(nextPlacement)
        setMenuStyle({
            left: rect.left,
            width: rect.width,
            maxHeight: Math.max(120, Math.min(280, availableSpace)),
            ...(nextPlacement === 'top'
                ? { bottom: window.innerHeight - rect.top + 6 }
                : { top: rect.bottom + 6 }),
        })
    }, [options.length])

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as Node
            const outsideTrigger = Boolean(ref.current && !ref.current.contains(target))
            const outsideMenu = Boolean(!menuRef.current || !menuRef.current.contains(target))

            if (outsideTrigger && outsideMenu) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    useEffect(() => {
        if (!open) return

        updateMenuPosition()
        window.addEventListener('resize', updateMenuPosition)
        window.addEventListener('scroll', updateMenuPosition, true)

        return () => {
            window.removeEventListener('resize', updateMenuPosition)
            window.removeEventListener('scroll', updateMenuPosition, true)
        }
    }, [open, updateMenuPosition])

    return (
        <>
            <div ref={ref} className={`relative ${className}`}>
                <button
                    type="button"
                    onClick={() => {
                        if (!open) updateMenuPosition()
                        setOpen(prev => !prev)
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                        bg-[#0A0C14] border text-white
                        ${open
                            ? 'border-[#00FFB2] shadow-[0_0_10px_rgba(0,255,178,0.15)]'
                            : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,255,178,0.3)]'
                        }`}
                >
                    <span className={selected ? 'text-white' : 'text-gray-500'}>
                        {selected?.label ?? placeholder ?? 'Select...'}
                    </span>
                    <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-4 h-4 text-[#00FFB2] shrink-0" />
                    </motion.div>
                </button>
            </div>

            {mounted && createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.ul
                            ref={menuRef}
                            style={menuStyle}
                            initial={{ opacity: 0, y: placement === 'top' ? 6 : -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: placement === 'top' ? 6 : -6, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="fixed z-[120] overflow-y-auto rounded-xl border border-[rgba(0,255,178,0.15)] bg-[#0D1017] shadow-[0_8px_32px_rgba(0,0,0,0.5)] scrollbar-thin"
                        >
                            {options.map(opt => (
                                <li key={opt.value}>
                                    <button
                                        type="button"
                                        onClick={() => { onChange(opt.value); setOpen(false) }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150
                                            ${opt.value === value
                                                ? 'text-[#00FFB2] bg-[rgba(0,255,178,0.08)]'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}

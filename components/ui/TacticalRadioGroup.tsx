'use client'

import { motion } from 'framer-motion'
import { SettingHelpButton } from '@/components/ui/ResponsiveModalShell'

interface RadioOption<T extends string | number> {
    value: T
    label: string
}

interface TacticalRadioGroupProps<T extends string | number> {
    name: string
    value: T
    onChange: (value: T) => void
    options: RadioOption<T>[]
    className?: string
}

export function TacticalRadioGroup<T extends string | number>({
    name,
    value,
    onChange,
    options,
    className = '',
}: TacticalRadioGroupProps<T>) {
    return (
        <div role="radiogroup" aria-label={name} className={`grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-3 ${className}`}>
            {options.map(option => {
                const isSelected = option.value === value
                return (
                    <div
                        key={String(option.value)}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                onChange(option.value)
                            }
                        }}
                        className={`relative flex min-w-0 items-center gap-2.5 px-3 py-2.5 sm:px-4 rounded-[24px] text-sm font-medium
                            border transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#00FFB2]/35
                            ${isSelected
                                ? 'border-[#00FFB2] bg-[rgba(0,255,178,0.06)] text-white shadow-[0_0_12px_rgba(0,255,178,0.1)]'
                                : 'border-[rgba(255,255,255,0.07)] bg-[#0A0C14] text-gray-400 hover:border-[rgba(0,255,178,0.25)] hover:text-gray-200'
                            }`}
                    >
                        {/* Custom radio dot */}
                        <span className={`relative flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 transition-all duration-200
                            ${isSelected ? 'border-[#00FFB2]' : 'border-[rgba(255,255,255,0.2)]'}`}
                        >
                            {isSelected && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="w-2 h-2 rounded-full bg-[#00FFB2]"
                                />
                            )}
                        </span>
                        <span className="min-w-0 break-words">{option.label}</span>
                        <SettingHelpButton label={option.label} />
                    </div>
                )
            })}
        </div>
    )
}

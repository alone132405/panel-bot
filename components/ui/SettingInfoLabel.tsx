'use client'

import { SettingHelpButton } from '@/components/ui/ResponsiveModalShell'

interface SettingInfoLabelProps {
    label: string
    helpText?: string
    className?: string
}

export function SettingInfoLabel({
    label,
    helpText,
    className = 'text-sm font-bold text-text-primary',
}: SettingInfoLabelProps) {
    return (
        <span className={`min-w-0 max-w-full break-words leading-snug ${className}`}>
            {label}
            <span className="ml-2 inline-flex translate-y-[2px] align-middle">
                <SettingHelpButton label={label} helpText={helpText} />
            </span>
        </span>
    )
}


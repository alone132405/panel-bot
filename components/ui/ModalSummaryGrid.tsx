'use client'

import { type LucideIcon } from 'lucide-react'

export interface ModalSummaryItem {
    label: string
    value: string | number
    icon: LucideIcon
    tone?: 'mint' | 'cyan' | 'gold' | 'violet' | 'rose'
}

const toneClasses: Record<NonNullable<ModalSummaryItem['tone']>, string> = {
    mint: 'border-accent-1/20 bg-accent-1/10 text-accent-1',
    cyan: 'border-accent-cyan/20 bg-accent-cyan/10 text-accent-cyan',
    gold: 'border-accent-gold/20 bg-accent-gold/10 text-accent-gold',
    violet: 'border-accent-2/20 bg-accent-2/10 text-accent-2',
    rose: 'border-accent-3/20 bg-accent-3/10 text-accent-3',
}

export function ModalSummaryGrid({ items }: { items: ModalSummaryItem[] }) {
    const isFourItems = items.length === 4;
    const gridColsClass = isFourItems ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-3';

    return (
        <div className={`grid gap-3 ${gridColsClass}`}>
            {items.map((item) => {
                const Icon = item.icon
                const tone = item.tone || 'mint'

                return (
                    <div key={item.label} className={`rounded-[24px] border p-3 ${toneClasses[tone]}`}>
                        <div className="mb-2 flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                        </div>
                        <div className="truncate font-orbitron text-xl font-black">{item.value}</div>
                    </div>
                )
            })}
        </div>
    )
}

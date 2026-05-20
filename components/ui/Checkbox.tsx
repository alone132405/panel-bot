import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export function Checkbox({
    checked,
    onChange,
    disabled = false,
    compact = false,
}: {
    checked: boolean
    onChange: (v: boolean) => void
    disabled?: boolean
    compact?: boolean
}) {
    const sizeClass = compact ? 'h-5 w-5' : 'h-6 w-6'

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault()
                if (!disabled) {
                    onChange(!checked)
                }
            }}
            disabled={disabled}
            className={`relative flex shrink-0 touch-manipulation items-center justify-center rounded-[6px] transition-all duration-200 ${sizeClass} ${
                checked 
                ? 'bg-[#00FFB2] shadow-[0_0_12px_rgba(0,255,178,0.25)] border border-[#00FFB2]' 
                : 'bg-[#161B25] border border-[rgba(255,255,255,0.08)] shadow-inner hover:border-[rgba(255,255,255,0.2)]'
            } ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <motion.div
                initial={false}
                animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                <Check className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-[#080A0F]`} strokeWidth={4} />
            </motion.div>
        </button>
    )
}

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export function ToggleSwitch({
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
    const trackClass = compact ? 'h-[22px] w-[40px] p-[3px]' : 'h-[26px] w-[46px] p-1'
    const knobClass = compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'
    const knobOffset = 18

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault()
                onChange(!checked)
            }}
            disabled={disabled}
            className={`relative flex shrink-0 touch-manipulation items-center justify-start rounded-full transition-all duration-300 ${trackClass} ${
                checked 
                ? 'bg-[#00FFB2] shadow-[0_0_14px_rgba(0,255,178,0.25)] border border-[#00FFB2]' 
                : 'bg-[#161B25] border border-[rgba(255,255,255,0.08)] shadow-inner'
            } ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <motion.div
                className={`flex items-center justify-center rounded-full shadow-md ${knobClass} ${checked ? 'bg-[#080A0F]' : 'bg-[#6B7A99]'}`}
                animate={{ x: checked ? knobOffset : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                {checked && <Check className={`${compact ? 'h-[9px] w-[9px]' : 'h-[10px] w-[10px]'} text-[#00FFB2]`} strokeWidth={4} />}
            </motion.div>
        </button>
    )
}

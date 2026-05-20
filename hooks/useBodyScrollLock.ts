'use client'

import { useEffect } from 'react'

let activeLocks = 0
let originalOverflow: string | null = null
let originalPaddingRight: string | null = null

/**
 * Hook to lock body scroll when a modal/overlay is open
 * Prevents background scrolling when modals are displayed
 */
export function useBodyScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked) return

        const body = document.body
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

        if (activeLocks === 0) {
            originalOverflow = body.style.overflow
            originalPaddingRight = body.style.paddingRight

            body.style.overflow = 'hidden'

            if (scrollbarWidth > 0) {
                const currentPaddingRight = parseFloat(window.getComputedStyle(body).paddingRight) || 0
                body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
            }
        }

        activeLocks += 1

        return () => {
            activeLocks = Math.max(0, activeLocks - 1)

            if (activeLocks === 0) {
                body.style.overflow = originalOverflow ?? ''
                body.style.paddingRight = originalPaddingRight ?? ''
                originalOverflow = null
                originalPaddingRight = null
            }
        }
    }, [isLocked])
}

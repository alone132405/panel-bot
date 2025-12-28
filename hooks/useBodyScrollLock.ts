'use client'

import { useEffect } from 'react'

/**
 * Hook to lock body scroll when a modal/overlay is open
 * Prevents background scrolling when modals are displayed
 */
export function useBodyScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (isLocked) {
            // Save original overflow style
            const originalStyle = window.getComputedStyle(document.body).overflow

            // Prevent scrolling
            document.body.style.overflow = 'hidden'

            // Cleanup: restore original style when unmounted or isLocked becomes false
            return () => {
                document.body.style.overflow = originalStyle
            }
        }
    }, [isLocked])
}

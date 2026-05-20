'use client'

import { type DependencyList, useCallback, useEffect, useRef } from 'react'

export function useAutoSaveSettings(
    enabled: boolean,
    save: () => void,
    dependencies: DependencyList,
    delay = 650
) {
    const saveRef = useRef(save)
    const readyRef = useRef(false)
    const enabledRef = useRef(enabled)
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        saveRef.current = save
    }, [save])

    useEffect(() => {
        enabledRef.current = enabled
    }, [enabled])

    const flushPendingSave = useCallback(() => {
        if (!saveTimerRef.current) return

        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null

        if (enabledRef.current && readyRef.current) {
            saveRef.current()
        }
    }, [])

    useEffect(() => {
        readyRef.current = false

        if (!enabled) return

        const readyTimer = setTimeout(() => {
            readyRef.current = true
        }, 0)

        return () => {
            clearTimeout(readyTimer)
            flushPendingSave()
            readyRef.current = false
        }
    }, [enabled, flushPendingSave])

    useEffect(() => {
        if (!enabled || !readyRef.current) return

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current)
        }

        saveTimerRef.current = setTimeout(() => {
            saveTimerRef.current = null
            saveRef.current()
        }, delay)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies)

    useEffect(() => {
        return () => {
            flushPendingSave()
        }
    }, [flushPendingSave])
}

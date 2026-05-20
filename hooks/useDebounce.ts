import { useEffect, useRef, useCallback } from 'react'

export function useDebounce<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): (...args: Parameters<T>) => void {
    const callbackRef = useRef(callback)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const pendingCallsRef = useRef<Parameters<T>[]>([])

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const flushPendingCalls = useCallback(async () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }

        const pendingCalls = pendingCallsRef.current
        if (pendingCalls.length === 0) return

        pendingCallsRef.current = []

        const callsToRun: Parameters<T>[] = []
        const seenKeys = new Set<string>()

        for (let index = pendingCalls.length - 1; index >= 0; index -= 1) {
            const callArgs = pendingCalls[index]
            const firstArg = callArgs[0]

            if (typeof firstArg !== 'string') {
                callsToRun.unshift(callArgs)
                continue
            }

            if (seenKeys.has(firstArg)) continue
            seenKeys.add(firstArg)
            callsToRun.unshift(callArgs)
        }

        for (const callArgs of callsToRun) {
            await callbackRef.current(...callArgs)
        }
    }, [])

    useEffect(() => {
        return () => {
            void flushPendingCalls()
        }
    }, [flushPendingCalls])

    return useCallback(
        (...args: Parameters<T>) => {
            pendingCallsRef.current.push(args)

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(async () => {
                await flushPendingCalls()
            }, delay)
        },
        [delay, flushPendingCalls]
    )
}

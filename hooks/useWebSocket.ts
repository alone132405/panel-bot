import { useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useWebSocket(iggId: string | null, onSettingsUpdate: (data: any) => void) {
    useEffect(() => {
        if (!iggId) return

        // Initialize socket connection
        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_WS_URL || window.location.origin, {
                path: '/api/socket',
            })

            socket.on('connect', () => {
                console.log('WebSocket connected')
            })

            socket.on('disconnect', () => {
                console.log('WebSocket disconnected')
            })
        }

        // Subscribe to this IGG ID
        socket.emit('subscribe', iggId)

        // Listen for settings updates
        const handleSettingsUpdate = (data: any) => {
            if (data.iggId === iggId) {
                onSettingsUpdate(data)
            }
        }

        const handleSettingChanged = (data: any) => {
            if (data.iggId === iggId) {
                onSettingsUpdate(data)
            }
        }

        socket.on('settings-updated', handleSettingsUpdate)
        socket.on('setting-changed', handleSettingChanged)

        // Cleanup
        return () => {
            if (socket) {
                socket.emit('unsubscribe', iggId)
                socket.off('settings-updated', handleSettingsUpdate)
                socket.off('setting-changed', handleSettingChanged)
            }
        }
    }, [iggId, onSettingsUpdate])

    return socket
}

export function disconnectWebSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

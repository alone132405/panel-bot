
import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

let socket: Socket

export const useSocket = (iggId?: string) => {
    const [isConnected, setIsConnected] = useState(false)
    const [queueStatus, setQueueStatus] = useState<any>(null)
    const [automationStatus, setAutomationStatus] = useState<any>(null)

    useEffect(() => {
        let mounted = true

        const socketInitializer = async () => {
            await fetch('/api/socket')

            if (!mounted) return

            if (!(global as any).socket) {
                (global as any).socket = io(undefined as any, {
                    path: '/api/socket/io',
                    addTrailingSlash: false,
                })
            }

            const socket = (global as any).socket as Socket

            if (socket.connected) {
                setIsConnected(true)
                if (iggId) socket.emit('subscribe', iggId)
            }

            const onConnect = () => {
                if (!mounted) return
                setIsConnected(true)
                console.log('Socket connected')
                if (iggId) {
                    socket.emit('subscribe', iggId)
                }
            }

            const onDisconnect = () => {
                if (!mounted) return
                setIsConnected(false)
                console.log('Socket disconnected')
            }

            const onQueueUpdate = (data: any) => {
                if (mounted) setQueueStatus(data)
            }

            socket.on('connect', onConnect)
            socket.on('disconnect', onDisconnect)
            socket.on('queue_update', onQueueUpdate)

            const onAutomationStatus = (data: any) => {
                console.log('useSocket: received automation_status:', data)
                if (mounted) setAutomationStatus(data)
            }

            const onSettingsUpdated = (data: any) => {
                // Optional: handle general settings update if needed globally
            }

            const onBankSettingsUpdated = (data: any) => {
                // Since hooks are generic, we might just want to expose an event or state
                // For now, let's just log it. The specific page should probably listen if it needs granular control,
                // OR we add a bankSettings state here.
                // Given the architecture, let's keep it simple and just expose the event via a callback or state?
                // Actually, the simplest integration for the user is if this hook provides the data.
            }

            // NOTE: To properly support updating the specific page state, 
            // the page itself should probably listen to the socket or pass a callback.
            // PROPOSAL: We will return the socket instance so the page can listen, 
            // OR we add a generic listener pattern.
            // But to fix the user's issue "not linked", let's just verify the socket is receiving it.

            socket.on('automation_status', onAutomationStatus)
            // We expose the socket so components can add their own listeners for specific data

            // Clean up listeners on unmount/re-run
            return () => {
                console.log('useSocket: cleaning up for iggId:', iggId)
                socket.off('connect', onConnect)
                socket.off('disconnect', onDisconnect)
                socket.off('queue_update', onQueueUpdate)
                socket.off('automation_status', onAutomationStatus)
                if (iggId) {
                    console.log('useSocket: unsubscribing from:', iggId)
                    socket.emit('unsubscribe', iggId)
                }
            }
        }

        const cleanupPromise = socketInitializer()

        return () => {
            mounted = false
            cleanupPromise.then(cleanup => cleanup && cleanup())
        }
    }, [iggId])

    return { isConnected, socket: (global as any).socket, queueStatus, automationStatus }
}

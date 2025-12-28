
import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

let socket: Socket

export const useSocket = (iggId?: string) => {
    const [isConnected, setIsConnected] = useState(false)
    const [queueStatus, setQueueStatus] = useState<any>(null)
    const [automationStatus, setAutomationStatus] = useState<any>(null)

    useEffect(() => {
        const socketInitializer = async () => {
            await fetch('/api/socket')

            if (!socket) {
                socket = io(undefined as any, {
                    path: '/api/socket',
                    addTrailingSlash: false,
                })
            }

            socket.on('connect', () => {
                setIsConnected(true)
                if (iggId) {
                    socket.emit('subscribe', iggId)
                }
            })

            socket.on('disconnect', () => {
                setIsConnected(false)
            })

            socket.on('queue_update', (data) => {
                setQueueStatus(data)
            })

            socket.on('automation_status', (data) => {
                setAutomationStatus(data)
            })
        }

        socketInitializer()

        return () => {
            if (socket) {
                if (iggId) {
                    socket.emit('unsubscribe', iggId)
                }
                // We don't disconnect socket here as it might be shared
                socket.off('queue_update')
                socket.off('automation_status')
            }
        }
    }, [iggId])

    return { isConnected, socket, queueStatus, automationStatus }
}

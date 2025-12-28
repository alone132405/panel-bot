import { NextApiRequest } from 'next'
import { NextApiResponseServerIO } from '@/types/socket'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

export const config = {
    api: {
        bodyParser: false,
    },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        console.log('Setting up Socket.IO server...')

        const httpServer: HTTPServer = res.socket.server as any
        const io = new SocketIOServer(httpServer, {
            path: '/api/socket/io',
            addTrailingSlash: false,
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        })

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id)

            socket.on('subscribe', (iggId: string) => {
                socket.join(`igg-${iggId}`)
                console.log(`Client ${socket.id} subscribed to IGG ID: ${iggId}`)
            })

            socket.on('unsubscribe', (iggId: string) => {
                socket.leave(`igg-${iggId}`)
                console.log(`Client ${socket.id} unsubscribed from IGG ID: ${iggId}`)
            })

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id)
            })
        })

        res.socket.server.io = io

            // Store in global for development HMR access
            ; (global as any).io = io
    } else {
        console.log('Socket.IO server already running')
    }

    res.end()
}

export default ioHandler

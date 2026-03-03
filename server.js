const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        try {
            // Let Socket.IO handle these instead of Next.js returning 404
            if (req.url && req.url.startsWith('/api/socket/io')) {
                return
            }

            const parsedUrl = parse(req.url, true)
            handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })

    const io = new Server(httpServer, {
        path: '/api/socket/io',
        addTrailingSlash: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    })

    // Make io globally available for Next.js API routes (like the automation queue)
    global.io = io

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        socket.on('subscribe', (iggId) => {
            socket.join(`igg-${iggId}`)
            console.log(`Client ${socket.id} subscribed to IGG ID: ${iggId}`)
        })

        socket.on('unsubscribe', (iggId) => {
            socket.leave(`igg-${iggId}`)
            console.log(`Client ${socket.id} unsubscribed from IGG ID: ${iggId}`)
        })

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id)
        })
    })

    httpServer
        .once('error', (err) => {
            console.error(err)
            process.exit(1)
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`)
        })
})

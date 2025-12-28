import fs from 'fs/promises'
import path from 'path'
import chokidar from 'chokidar'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

// Config directory - can be set via environment variable
// Defaults to user specified path
const CONFIG_DIR = process.env.CONFIG_DIR || 'C:\\Users\\Administrator\\Downloads\\LordsBot-Release\\config'

// File system operations
export async function readSettingsFile(iggId: string): Promise<any> {
    const filePath = path.join(CONFIG_DIR, iggId, 'settings.json')
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
}

export async function readBankSettingsFile(iggId: string): Promise<any> {
    const filePath = path.join(CONFIG_DIR, iggId, 'banksettings.json')
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
}

export async function writeSettingsFile(iggId: string, settings: any): Promise<void> {
    const filePath = path.join(CONFIG_DIR, iggId, 'settings.json')
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8')
}

export async function writeBankSettingsFile(iggId: string, settings: any): Promise<void> {
    const filePath = path.join(CONFIG_DIR, iggId, 'banksettings.json')
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8')
}

export async function validateIggIdExists(iggId: string): Promise<boolean> {
    try {
        const folderPath = path.join(CONFIG_DIR, iggId)
        const stats = await fs.stat(folderPath)
        return stats.isDirectory()
    } catch {
        return false
    }
}

export function updateNestedProperty(obj: any, path: string, value: any): any {
    const keys = path.split('.')
    const result = JSON.parse(JSON.stringify(obj)) // Deep clone

    let current = result
    for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
            current[keys[i]] = {}
        }
        current = current[keys[i]]
    }

    current[keys[keys.length - 1]] = value
    return result
}

// WebSocket and File Watcher
let io: SocketIOServer | null = null
let watcher: chokidar.FSWatcher | null = null

export function initializeWebSocket(server: HTTPServer) {
    if (io) return io

    io = new SocketIOServer(server, {
        cors: {
            origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
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

    return io
}

export function initializeFileWatcher() {
    if (watcher) return watcher

    watcher = chokidar.watch([`${CONFIG_DIR}/*/settings.json`, `${CONFIG_DIR}/*/banksettings.json`], {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100,
        },
    })

    watcher.on('change', async (filePath) => {
        try {
            const iggId = path.basename(path.dirname(filePath))
            const fileName = path.basename(filePath)
            console.log(`File changed for IGG ID ${iggId}: ${fileName}`)

            if (fileName.toLowerCase() === 'banksettings.json') {
                const settings = await readBankSettingsFile(iggId)
                if (io) {
                    io.to(`igg-${iggId}`).emit('bank-settings-updated', {
                        iggId,
                        settings,
                        timestamp: new Date().toISOString(),
                    })
                }
            } else {
                // Default to settings.json
                const settings = await readSettingsFile(iggId)
                if (io) {
                    io.to(`igg-${iggId}`).emit('settings-updated', {
                        iggId,
                        settings,
                        timestamp: new Date().toISOString(),
                    })
                }
            }
        } catch (error) {
            console.error('Error processing file change:', error)
        }
    })

    watcher.on('error', (error) => {
        console.error('File watcher error:', error)
    })

    return watcher
}

export function getSocketIO(): SocketIOServer | null {
    return io
}

export function emitSettingsUpdate(iggId: string, path: string, value: any) {
    if (io) {
        io.to(`igg-${iggId}`).emit('setting-changed', {
            iggId,
            path,
            value,
            timestamp: new Date().toISOString(),
        })
    }
}

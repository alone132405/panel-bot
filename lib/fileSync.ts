import fs from 'fs/promises'
import path from 'path'
import chokidar from 'chokidar'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

export interface ConfigWriteResult {
    filePath: string
    bytes: number
    mtime: string
}

function getConfigRoot(): string {
    return path.resolve(
        process.env.CONFIG_DIR ||
        process.env.CONFIG_PATH ||
        process.env.EXTERNAL_CONFIG_ROOT ||
        path.join(process.cwd(), 'config')
    )
}

export function getConfigDir(): string {
    return getConfigRoot()
}

export function getConfigFilePath(iggId: string, fileName: string): string {
    return path.join(getConfigRoot(), iggId, fileName)
}

export function getReportsExportPath(iggId: string): string {
    return path.join(getConfigRoot(), iggId, 'stats', 'exported')
}

async function writeJsonFile(filePath: string, settings: any): Promise<ConfigWriteResult> {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8')

    const content = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(content)
    if (JSON.stringify(parsed) !== JSON.stringify(settings)) {
        throw new Error(`Config write verification failed for ${filePath}`)
    }

    const stat = await fs.stat(filePath)
    const result = {
        filePath,
        bytes: stat.size,
        mtime: stat.mtime.toISOString(),
    }
    return result
}

async function writeJsonConfigFile(iggId: string, fileName: string, settings: any): Promise<ConfigWriteResult> {
    return writeJsonFile(getConfigFilePath(iggId, fileName), settings)
}

async function readJsonFile(filePath: string): Promise<any> {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
}

// File system operations
export async function readSettingsFile(iggId: string): Promise<any> {
    return readJsonFile(getConfigFilePath(iggId, 'settings.json'))
}

export async function readBankSettingsFile(iggId: string): Promise<any> {
    return readJsonFile(getConfigFilePath(iggId, 'banksettings.json'))
}

export async function readManageGuildSettingsFile(iggId: string): Promise<any> {
    return readJsonFile(getConfigFilePath(iggId, 'manageGuild.json'))
}

export async function writeSettingsFile(iggId: string, settings: any): Promise<ConfigWriteResult> {
    return writeJsonConfigFile(iggId, 'settings.json', settings)
}

export async function writeBankSettingsFile(iggId: string, settings: any): Promise<ConfigWriteResult> {
    return writeJsonConfigFile(iggId, 'banksettings.json', settings)
}

export async function writeManageGuildSettingsFile(iggId: string, settings: any): Promise<ConfigWriteResult> {
    return writeJsonConfigFile(iggId, 'manageGuild.json', settings)
}

export function mergeBankSettingsWithManageGuild(bankSettings: any, manageGuildSettings: any): any {
    return {
        ...bankSettings,
        enableWhiteList: Boolean(manageGuildSettings?.enableAutoAccept || manageGuildSettings?.enableAutoRank),
        enableBlackList: Boolean(manageGuildSettings?.enableBlackList),
    }
}

export async function readMergedBankSettingsFile(iggId: string): Promise<any> {
    const bankSettings = await readBankSettingsFile(iggId)

    try {
        const manageGuildSettings = await readManageGuildSettingsFile(iggId)
        return mergeBankSettingsWithManageGuild(bankSettings, manageGuildSettings)
    } catch {
        return mergeBankSettingsWithManageGuild(bankSettings, {})
    }
}

export async function validateIggIdExists(iggId: string): Promise<boolean> {
    try {
        const folderPath = path.join(getConfigRoot(), iggId)
        const stats = await fs.stat(folderPath)
        return stats.isDirectory()
    } catch {
        return false
    }
}

function isArrayIndexKey(key: string): boolean {
    return /^\d+$/.test(key)
}

export function updateNestedProperty(obj: any, path: string, value: any): any {
    const keys = path.split('.')
    const result = JSON.parse(JSON.stringify(obj)) // Deep clone

    let current = result
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        const nextKey = keys[i + 1]

        if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
            current[key] = isArrayIndexKey(nextKey) ? [] : {}
        }

        current = current[key]
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
        // console.log('Client connected:', socket.id)

        socket.on('subscribe', (iggId: string) => {
            socket.join(`igg-${iggId}`)
            // console.log(`Client ${socket.id} subscribed to IGG ID: ${iggId}`)
        })

        socket.on('unsubscribe', (iggId: string) => {
            socket.leave(`igg-${iggId}`)
            // console.log(`Client ${socket.id} unsubscribed from IGG ID: ${iggId}`)
        })

        socket.on('disconnect', () => {
            // console.log('Client disconnected:', socket.id)
        })
    })

    return io
}

export function initializeFileWatcher() {
    if (watcher) return watcher

    const configDir = getConfigRoot()
    watcher = chokidar.watch([`${configDir}/*/settings.json`, `${configDir}/*/banksettings.json`, `${configDir}/*/manageGuild.json`], {
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
            // console.log(`File changed for IGG ID ${iggId}: ${fileName}`)

            if (fileName.toLowerCase() === 'banksettings.json' || fileName.toLowerCase() === 'manageguild.json') {
                const settings = await readMergedBankSettingsFile(iggId)
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

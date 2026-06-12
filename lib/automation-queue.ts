import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execFileAsync = promisify(execFile)

interface QueueItem {
    iggId: string
    io: any
}

declare global {
    var automationQueueInstance: AutomationQueue | undefined
}

class AutomationQueue {
    private static instance: AutomationQueue
    private queue: QueueItem[] = []
    private isRunning: boolean = false

    private constructor() { }

    public static getInstance(): AutomationQueue {
        if (!AutomationQueue.instance) {
            AutomationQueue.instance = new AutomationQueue()
        }
        return AutomationQueue.instance
    }

    public async enqueue(iggId: string, io: any) {
        if (this.queue.some(item => item.iggId === iggId)) {
            return
        }

        this.queue.push({ iggId, io })
        this.broadcastQueueStatus(io)

        if (!this.isRunning) {
            this.processNext(io).catch(err => console.error('Queue processing error:', err))
        }
    }

    public getStatus() {
        return {
            isRunning: this.isRunning,
            queueLength: this.queue.length,
            queuedIggIds: this.queue.map(item => item.iggId),
            currentItem: this.isRunning && this.queue.length > 0 ? this.queue[0].iggId : null
        }
    }

    private broadcastQueueStatus(io: any) {
        if (!io) {
            io = (global as any).io
        }
        if (!io) return

        io.emit('queue_update', this.getStatus())
    }

    private async processNext(io: any) {
        if (this.isRunning || this.queue.length === 0) return

        this.isRunning = true
        const item = this.queue[0]

        try {
            this.broadcastQueueStatus(io)

            if (io) {
                io.to(`igg-${item.iggId}`).emit('automation_status', {
                    status: 'processing',
                    message: 'Applying changes...',
                    timestamp: Date.now()
                })
            }

            await this.runAutomation(item.iggId)

            if (io) {
                io.to(`igg-${item.iggId}`).emit('automation_status', {
                    status: 'completed',
                    message: 'Changes applied successfully',
                    timestamp: Date.now()
                })
            }

        } catch (error: any) {
            console.error(`Automation failed for ${item.iggId}:`, error)
            if (io) {
                io.to(`igg-${item.iggId}`).emit('automation_status', {
                    status: 'error',
                    message: error.message || 'Automation failed',
                    timestamp: Date.now()
                })
            }
        } finally {
            this.queue.shift()
            this.isRunning = false
            this.broadcastQueueStatus(io)

            if (this.queue.length > 0) {
                this.processNext(io).catch(err => console.error('Queue processNext error:', err))
            }
        }
    }

    private async runAutomation(iggId: string): Promise<void> {
        try {
            const configDir = process.env.CONFIG_DIR || '';
            if (!configDir) {
                throw new Error("CONFIG_DIR is not defined in .env");
            }
            
            const triggerFile = path.join(configDir, `.reload_${iggId}`);
            await fs.writeFile(triggerFile, '');
        } catch (error: any) {
            throw new Error(`Failed to trigger reload: ${error.message}`);
        }
    }
}

export const automationQueue = global.automationQueueInstance || AutomationQueue.getInstance()

if (process.env.NODE_ENV !== 'production') {
    global.automationQueueInstance = automationQueue
}

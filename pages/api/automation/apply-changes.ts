import { NextApiRequest } from 'next'
import { NextApiResponseServerIO } from '@/types/socket'
import { prisma } from '@/lib/prisma'
import { automationQueue } from '@/lib/automation-queue'

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
    if (req.method === 'GET') {
        const status = automationQueue.getStatus()
        return res.status(200).json(status)
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { iggId } = req.body

        if (!iggId) {
            return res.status(400).json({ error: 'IGG ID is required' })
        }

        console.log('Received automation request for IGG ID:', iggId)

        const iggIdRecord = await prisma.iggId.findUnique({
            where: { iggId },
            include: { subscription: true }
        })

        if (!iggIdRecord) {
            return res.status(404).json({ error: 'IGG ID not found' })
        }

        if (iggIdRecord.subscription?.expiresAt && new Date(iggIdRecord.subscription.expiresAt) < new Date()) {
            return res.status(403).json({
                success: false,
                error: 'Subscription expired. Cannot apply changes.'
            })
        }

        const io = res.socket.server.io || (global as any).io

        // Use the singleton queue
        await automationQueue.enqueue(iggId, io)

        const status = automationQueue.getStatus()
        const queuePosition = status.queuedIggIds.indexOf(iggId) + (status.isRunning && status.queuedIggIds[0] !== iggId ? 1 : 0)

        return res.status(200).json({
            success: true,
            message: 'Request added to queue',
            queuePosition: queuePosition + 1
        })

    } catch (error: any) {
        console.error('Automation API error:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'Automation failed'
        })
    }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
    req: Request,
    { params }: { params: { iggId: string } }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const filePath = path.join(process.cwd(), 'config', params.iggId, 'banksettings.json')

        try {
            const content = await fs.readFile(filePath, 'utf-8')
            return NextResponse.json(JSON.parse(content))
        } catch {
            // Return default settings if file doesn't exist
            return NextResponse.json({
                enableBank: false,
                clearOutgoingData: true,
                clearOutgoingDataTime: 7,
                lastClearCheckTime: 0,
                ignoreBalance: false,
                allowAdminBalance: false,
                allowAdminSkipLimit: true,
                useBagRss: false,
                saveLogToFile: false,
                allowChatCommands: true,
                allowMailCommands: true,
                autoDeleteCmdMail: false,
                disableMailResponse: false,
                disableErrorResponse: false,
                cmdPrefix: '!',
                adminRssLimit: [0, 0, 0, 0, 0],
                maxSendLimit: 40000000,
                maxSendDistance: 50,
                BuildspamMinimum: 3,
                allowExternalCommands: false,
                guildCommands: [],
                accountData: [],
                outgoingData: []
            })
        }
    } catch (error) {
        console.error('Error reading bank settings:', error)
        return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { iggId: string } }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verify ownership and subscription
        const iggIdRecord = await prisma.iggId.findFirst({
            where: {
                iggId: params.iggId,
                userId: session.user.id,
            },
            include: {
                subscription: true,
            },
        })

        if (!iggIdRecord) {
            return NextResponse.json({ error: 'IGG ID not found or unauthorized' }, { status: 404 })
        }

        if (iggIdRecord.subscription?.expiresAt && new Date(iggIdRecord.subscription.expiresAt) < new Date()) {
            return NextResponse.json({
                error: 'Subscription expired. Please renew to make changes.'
            }, { status: 403 })
        }

        const settings = await req.json()
        const filePath = path.join(process.cwd(), 'config', params.iggId, 'banksettings.json')

        // Ensure directory exists
        const dirPath = path.dirname(filePath)
        await fs.mkdir(dirPath, { recursive: true })

        // Write settings to file
        await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving bank settings:', error)
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}

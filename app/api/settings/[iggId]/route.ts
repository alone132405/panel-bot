import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { ensureSettingsFile, updateNestedProperty, writeSettingsFile } from '@/lib/fileSync'

// GET settings for a specific IGG ID
export async function GET(
    req: NextRequest,
    { params }: { params: { iggId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { iggId } = params

        // Verify user owns this IGG ID
        const iggIdRecord = await prisma.iggId.findFirst({
            where: {
                iggId,
                userId: session.user.id,
            },
        })

        if (!iggIdRecord) {
            return NextResponse.json({ error: 'IGG ID not found or unauthorized' }, { status: 404 })
        }

        const settings = await ensureSettingsFile(iggId)

        return NextResponse.json(settings)
    } catch (error: any) {
        console.error('Error reading settings:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to read settings' },
            { status: 500 }
        )
    }
}

// PATCH - Update a specific setting
export async function PATCH(
    req: NextRequest,
    { params }: { params: { iggId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { iggId } = params
        const body = await req.json()
        const { path, value } = body

        if (!path) {
            return NextResponse.json({ error: 'Path is required' }, { status: 400 })
        }

        // Verify user owns this IGG ID
        const iggIdRecord = await prisma.iggId.findFirst({
            where: {
                iggId,
                userId: session.user.id,
            },
            include: {
                subscription: true,
            },
        })

        if (!iggIdRecord) {
            return NextResponse.json({ error: 'IGG ID not found or unauthorized' }, { status: 404 })
        }

        // Check subscription expiry
        if (iggIdRecord.subscription?.expiresAt && new Date(iggIdRecord.subscription.expiresAt) < new Date()) {
            return NextResponse.json({
                error: 'Subscription expired. Please renew to make changes.'
            }, { status: 403 })
        }

        if (!iggIdRecord) {
            return NextResponse.json({ error: 'IGG ID not found or unauthorized' }, { status: 404 })
        }

        const settings = await ensureSettingsFile(iggId)

        // Update the nested property
        const updatedSettings = updateNestedProperty(settings, path, value)

        const sync = await writeSettingsFile(iggId, updatedSettings)

        await prisma.iggId.update({
            where: { id: iggIdRecord.id },
            data: { lastSync: new Date() },
        })

        // Log the activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: 'UPDATE_SETTING',
                iggId,
                category: path.split('.')[0],
                details: { path, value, filePath: sync.filePath, mtime: sync.mtime },
            },
        })

        return NextResponse.json({
            success: true,
            synced: true,
            message: 'Setting saved successfully',
            path,
            value,
            filePath: sync.filePath,
            mtime: sync.mtime,
            bytes: sync.bytes,
        })
    } catch (error: any) {
        console.error('Error updating setting:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update setting' },
            { status: 500 }
        )
    }
}

// PUT - Save entire settings object
export async function PUT(
    req: NextRequest,
    { params }: { params: { iggId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { iggId } = params
        const settings = await req.json()

        // Verify user owns this IGG ID
        const iggIdRecord = await prisma.iggId.findFirst({
            where: {
                iggId,
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

        const sync = await writeSettingsFile(iggId, settings)

        await prisma.iggId.update({
            where: { id: iggIdRecord.id },
            data: { lastSync: new Date() },
        })

        // Log the activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: 'SAVE_SETTINGS',
                iggId,
                category: 'all',
                details: { message: 'Saved all settings', filePath: sync.filePath, mtime: sync.mtime },
            },
        })

        return NextResponse.json({
            success: true,
            synced: true,
            message: 'Settings saved successfully',
            filePath: sync.filePath,
            mtime: sync.mtime,
            bytes: sync.bytes,
        })
    } catch (error: any) {
        console.error('Error saving settings:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to save settings' },
            { status: 500 }
        )
    }
}

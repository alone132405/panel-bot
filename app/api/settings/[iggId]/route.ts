import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { readSettingsFile, writeSettingsFile, updateNestedProperty } from '@/lib/fileSync'

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

        // Read settings from JSON file
        const settings = await readSettingsFile(iggId)

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
        })

        if (!iggIdRecord) {
            return NextResponse.json({ error: 'IGG ID not found or unauthorized' }, { status: 404 })
        }

        // Read current settings
        const settings = await readSettingsFile(iggId)

        // Update the nested property
        const updatedSettings = updateNestedProperty(settings, path, value)

        // Write back to file
        await writeSettingsFile(iggId, updatedSettings)

        // Update last sync time
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
                details: { path, value },
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Setting updated successfully',
            path,
            value,
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
        })

        if (!iggIdRecord) {
            return NextResponse.json({ error: 'IGG ID not found or unauthorized' }, { status: 404 })
        }

        // Write entire settings object to file
        await writeSettingsFile(iggId, settings)

        // Update last sync time
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
                details: { message: 'Saved all settings' },
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Settings saved successfully',
        })
    } catch (error: any) {
        console.error('Error saving settings:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to save settings' },
            { status: 500 }
        )
    }
}

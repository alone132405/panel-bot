import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
    const authError = await requireAdmin(req as any)
    if (authError) return authError

    try {
        const { userId, iggId, displayName } = await req.json()

        if (!userId || !iggId) {
            return NextResponse.json(
                { error: 'userId and iggId are required' },
                { status: 400 }
            )
        }

        // Verify IGG ID folder exists
        const configPath = path.join(process.cwd(), 'config', iggId)
        try {
            await fs.access(configPath)
        } catch {
            // Create the config folder if it doesn't exist
            try {
                await fs.mkdir(configPath, { recursive: true })
                // Create a default settings.json
                await fs.writeFile(
                    path.join(configPath, 'settings.json'),
                    JSON.stringify({}, null, 2),
                    'utf-8'
                )
            } catch (mkdirError) {
                return NextResponse.json(
                    { error: 'Failed to create config directory for IGG ID' },
                    { status: 500 }
                )
            }
        }

        // Check if IGG ID is already assigned
        const existing = await prisma.iggId.findUnique({
            where: { iggId },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'IGG ID is already assigned to another user' },
                { status: 409 }
            )
        }

        // Assign IGG ID to user
        const assignment = await prisma.iggId.create({
            data: {
                iggId,
                userId,
                displayName: displayName || null,
                isActive: true,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        })

        // If this is the first IGG ID for the user, set it as selected
        const userIggIds = await prisma.iggId.count({
            where: { userId },
        })

        if (userIggIds === 1) {
            await prisma.user.update({
                where: { id: userId },
                data: { selectedIggId: iggId },
            })
        }

        // Log the activity
        await prisma.activityLog.create({
            data: {
                userId,
                action: 'IGG_ID_ASSIGNED',
                iggId,
                category: 'ADMIN',
                details: {
                    assignedBy: 'admin',
                },
            },
        })

        return NextResponse.json({
            success: true,
            assignment,
        })
    } catch (error) {
        console.error('Error assigning IGG ID:', error)
        return NextResponse.json(
            { error: 'Failed to assign IGG ID' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request) {
    const authError = await requireAdmin(req as any)
    if (authError) return authError

    try {
        const { userId, iggId } = await req.json()

        if (!userId || !iggId) {
            return NextResponse.json(
                { error: 'userId and iggId are required' },
                { status: 400 }
            )
        }

        // Delete the assignment
        await prisma.iggId.delete({
            where: {
                iggId,
                userId,
            },
        })

        // If this was the selected IGG ID, clear it
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { selectedIggId: true },
        })

        if (user?.selectedIggId === iggId) {
            // Get the first remaining IGG ID for this user
            const remainingIggId = await prisma.iggId.findFirst({
                where: { userId },
                select: { iggId: true },
            })

            await prisma.user.update({
                where: { id: userId },
                data: { selectedIggId: remainingIggId?.iggId || null },
            })
        }

        // Log the activity
        await prisma.activityLog.create({
            data: {
                userId,
                action: 'IGG_ID_REVOKED',
                iggId,
                category: 'ADMIN',
                details: {
                    revokedBy: 'admin',
                },
            },
        })

        return NextResponse.json({
            success: true,
            message: 'IGG ID revoked successfully',
        })
    } catch (error) {
        console.error('Error revoking IGG ID:', error)
        return NextResponse.json(
            { error: 'Failed to revoke IGG ID' },
            { status: 500 }
        )
    }
}

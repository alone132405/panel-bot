import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function GET(req: Request) {
    const authError = await requireAdmin(req as any)
    if (authError) return authError

    try {
        const configPath = path.join(process.cwd(), 'config')

        // Read all directories in config folder
        const entries = await fs.readdir(configPath, { withFileTypes: true })
        const iggIdFolders = entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)

        // Get all assigned IGG IDs from database
        const assignedIggIds = await prisma.iggId.findMany({
            select: {
                iggId: true,
                userId: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        })

        // Create a map of assigned IGG IDs
        const assignmentMap = new Map(
            assignedIggIds.map((item) => [
                item.iggId,
                {
                    userId: item.userId,
                    userName: item.user.name,
                    userEmail: item.user.email,
                },
            ])
        )

        // Combine folder list with assignment info
        const iggIds = iggIdFolders.map((iggId) => ({
            iggId,
            isAssigned: assignmentMap.has(iggId),
            assignedTo: assignmentMap.get(iggId) || null,
        }))

        return NextResponse.json({ iggIds })
    } catch (error) {
        console.error('Error fetching IGG IDs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch IGG IDs' },
            { status: 500 }
        )
    }
}

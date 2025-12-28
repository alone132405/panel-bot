import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { validateIggIdExists } from '@/lib/fileSync'

// Get all IGG IDs for the current user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const iggIds = await prisma.iggId.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(iggIds)
    } catch (error) {
        console.error('Error fetching IGG IDs:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Assign a new IGG ID to the current user
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { iggId, displayName } = body

        if (!iggId) {
            return NextResponse.json({ error: 'IGG ID is required' }, { status: 400 })
        }

        // Check if IGG ID folder exists in config directory
        const exists = await validateIggIdExists(iggId)
        if (!exists) {
            return NextResponse.json(
                { error: `IGG ID ${iggId} not found in config directory` },
                { status: 404 }
            )
        }

        // Check if IGG ID is already assigned
        const existing = await prisma.iggId.findUnique({
            where: { iggId },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'This IGG ID is already assigned to a user' },
                { status: 400 }
            )
        }

        // Create the IGG ID assignment
        const newIggId = await prisma.iggId.create({
            data: {
                iggId,
                displayName: displayName || iggId,
                userId: session.user.id,
                isActive: true,
                status: 'OFFLINE',
            },
        })

        return NextResponse.json(newIggId, { status: 201 })
    } catch (error: any) {
        console.error('Error assigning IGG ID:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

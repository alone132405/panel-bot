'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// GET - Fetch admin requests for a specific IGG ID or all pending
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const iggId = searchParams.get('iggId')
        const status = searchParams.get('status')

        const where: any = {}

        if (iggId) {
            where.iggId = iggId
        }

        if (status) {
            where.status = status
        }

        const requests = await prisma.adminRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ requests })
    } catch (error) {
        console.error('Error fetching admin requests:', error)
        return NextResponse.json(
            { error: 'Failed to fetch admin requests' },
            { status: 500 }
        )
    }
}

// POST - Create a new admin request
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { iggId, adminUserId, adminName, requestType = 'ADD' } = body

        if (!iggId || !adminUserId || !adminName) {
            return NextResponse.json(
                { error: 'Missing required fields: iggId, adminUserId, adminName' },
                { status: 400 }
            )
        }

        // Check if request already exists
        const existingRequest = await prisma.adminRequest.findFirst({
            where: {
                iggId,
                adminUserId,
                requestType,
                status: 'PENDING'
            }
        })

        if (existingRequest) {
            return NextResponse.json(
                { error: 'A pending request already exists for this user' },
                { status: 409 }
            )
        }

        // Create new request
        const adminRequest = await prisma.adminRequest.create({
            data: {
                requesterId: session.user.id,
                iggId,
                adminUserId,
                adminName,
                requestType,
                status: 'PENDING'
            }
        })

        return NextResponse.json({
            success: true,
            request: adminRequest
        })
    } catch (error) {
        console.error('Error creating admin request:', error)
        return NextResponse.json(
            { error: 'Failed to create admin request' },
            { status: 500 }
        )
    }
}

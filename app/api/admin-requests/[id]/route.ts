'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

interface RouteParams {
    params: { id: string }
}

// PUT - Approve or reject a request
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const body = await request.json()
        const { status } = body

        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be APPROVED or REJECTED' },
                { status: 400 }
            )
        }

        // Get the request details first
        const requestDetails = await prisma.adminRequest.findUnique({
            where: { id: params.id }
        })

        if (!requestDetails) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        // If approving, update the settings file
        if (status === 'APPROVED') {
            try {
                const { readSettingsFile, writeSettingsFile } = await import('@/lib/fileSync')
                const settings = await readSettingsFile(requestDetails.iggId)

                if (!settings.accountData) {
                    settings.accountData = []
                }

                if (requestDetails.requestType === 'DELETE') {
                    // Remove user
                    settings.accountData = settings.accountData.filter((u: any) =>
                        u.UserID !== parseInt(requestDetails.adminUserId)
                    )
                } else {
                    // Add user (default to ADD if null/undefined)
                    // Check if user already exists to avoid duplicates
                    const exists = settings.accountData.some((u: any) =>
                        u.UserID === parseInt(requestDetails.adminUserId)
                    )

                    if (!exists) {
                        const newUser = {
                            UserID: parseInt(requestDetails.adminUserId),
                            AccountName: requestDetails.adminName,
                            highAuth: false,
                            deferAccountName: '',
                            DeferID: 0,
                            accountBalance: [0, 0, 0, 0, 0],
                            socialID: 0
                        }
                        settings.accountData.push(newUser)
                    }
                }

                await writeSettingsFile(requestDetails.iggId, settings)
            } catch (error) {
                console.error('Error updating settings file:', error)
                return NextResponse.json(
                    { error: 'Failed to update settings file' },
                    { status: 500 }
                )
            }
        }

        const adminRequest = await prisma.adminRequest.update({
            where: { id: params.id },
            data: { status }
        })

        return NextResponse.json({
            success: true,
            request: adminRequest
        })
    } catch (error) {
        console.error('Error updating admin request:', error)
        return NextResponse.json(
            { error: 'Failed to update admin request' },
            { status: 500 }
        )
    }
}

// DELETE - Delete a request
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.adminRequest.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting admin request:', error)
        return NextResponse.json(
            { error: 'Failed to delete admin request' },
            { status: 500 }
        )
    }
}

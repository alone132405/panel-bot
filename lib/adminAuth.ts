import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function requireAdmin(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
            { error: 'Forbidden - Admin access required' },
            { status: 403 }
        )
    }

    return null // No error, proceed
}

export async function getAuthenticatedUser(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return null
    }

    return session.user
}

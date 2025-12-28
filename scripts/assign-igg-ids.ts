import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function assignIggIds() {
    try {
        // Get the first user (or create one if needed)
        const user = await prisma.user.findFirst()

        if (!user) {
            console.error('No users found. Please create a user first via signup.')
            return
        }

        console.log(`Found user: ${user.email} (${user.id})`)

        // IGG IDs from the config directory
        const iggIdsToAssign = ['1221923663', '987303841']

        for (const iggId of iggIdsToAssign) {
            // Check if already assigned
            const existing = await prisma.iggId.findUnique({
                where: { iggId },
            })

            if (existing) {
                console.log(`IGG ID ${iggId} already assigned`)
                continue
            }

            // Assign the IGG ID
            const assigned = await prisma.iggId.create({
                data: {
                    iggId,
                    displayName: `Account ${iggId}`,
                    userId: user.id,
                    isActive: true,
                    status: 'OFFLINE',
                },
            })

            console.log(`✅ Assigned IGG ID ${iggId} to user ${user.email}`)
        }

        console.log('\n✅ IGG ID assignment complete!')
    } catch (error) {
        console.error('Error assigning IGG IDs:', error)
    } finally {
        await prisma.$disconnect()
    }
}

assignIggIds()

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
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
        const exportedPath = path.join(process.cwd(), 'config', params.iggId, 'stats', 'exported')

        // Check if directory exists
        try {
            await fs.access(exportedPath)
        } catch {
            // Directory doesn't exist, return empty array
            return NextResponse.json({ files: [] })
        }

        const files = await fs.readdir(exportedPath)

        // Get file info for each file
        const fileInfos = await Promise.all(
            files.map(async (filename) => {
                const filePath = path.join(exportedPath, filename)
                const stats = await fs.stat(filePath)

                // Try to extract date from filename (e.g., "report_2024-12-25.json" or "2024-12-25_stats.txt")
                const dateMatch = filename.match(/(\d{4}[-_]?\d{2}[-_]?\d{2})/)
                let parsedDate = null
                if (dateMatch) {
                    const dateStr = dateMatch[1].replace(/_/g, '-')
                    parsedDate = new Date(dateStr).toISOString()
                }

                return {
                    filename,
                    size: stats.size,
                    createdAt: stats.birthtime.toISOString(),
                    modifiedAt: stats.mtime.toISOString(),
                    parsedDate,
                    isFile: stats.isFile()
                }
            })
        )

        // Filter only files (not directories)
        const onlyFiles = fileInfos.filter(f => f.isFile)

        return NextResponse.json({ files: onlyFiles })
    } catch (error) {
        console.error('Error reading reports:', error)
        return NextResponse.json(
            { error: 'Failed to read reports' },
            { status: 500 }
        )
    }
}

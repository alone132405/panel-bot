import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import fs from 'fs/promises'
import path from 'path'
import * as XLSX from 'xlsx'

export async function GET(
    req: Request,
    { params }: { params: { iggId: string, filename: string } }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        let basePath: string

        if (process.env.EXTERNAL_CONFIG_ROOT) {
            basePath = path.join(process.env.EXTERNAL_CONFIG_ROOT, params.iggId, 'stats', 'exported')
        } else {
            basePath = path.join(process.cwd(), 'config', params.iggId, 'stats', 'exported')
        }

        // Try to read settings.json for custom reports path
        try {
            const settingsPath = path.join(process.cwd(), 'config', params.iggId, 'settings.json')
            const settingsContent = await fs.readFile(settingsPath, 'utf-8')
            const settings = JSON.parse(settingsContent)

            if (settings.reportsPath) {
                basePath = settings.reportsPath
            }
        } catch (e) {
            // Use default path if settings fail
        }

        const filePath = path.join(basePath, params.filename)

        // Security check - ensure path doesn't escape the directory
        const normalizedPath = path.normalize(filePath)
        const exportedDir = path.join(process.cwd(), 'config', params.iggId, 'stats', 'exported')
        if (!normalizedPath.startsWith(exportedDir)) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
        }

        // Check if file exists
        try {
            await fs.access(filePath)
        } catch {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        const stats = await fs.stat(filePath)
        const extension = path.extname(params.filename).toLowerCase()

        // Handle Excel files
        if (extension === '.xlsx' || extension === '.xls') {
            const buffer = await fs.readFile(filePath)
            const workbook = XLSX.read(buffer, { type: 'buffer' })

            // Get all sheets data
            const sheets: { [key: string]: any[] } = {}
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName]
                // Use defval to ensure empty cells are included as empty strings
                sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: ''
                })
            })

            return NextResponse.json({
                filename: params.filename,
                fileType: 'excel',
                sheets,
                sheetNames: workbook.SheetNames,
                size: stats.size,
                modifiedAt: stats.mtime.toISOString()
            })
        }

        // Handle text/JSON files
        const content = await fs.readFile(filePath, 'utf-8')

        let parsedContent = null
        if (params.filename.endsWith('.json')) {
            try {
                parsedContent = JSON.parse(content)
            } catch {
                // Not valid JSON, return as text
            }
        }

        return NextResponse.json({
            filename: params.filename,
            fileType: 'text',
            content,
            parsedContent,
            size: stats.size,
            modifiedAt: stats.mtime.toISOString()
        })
    } catch (error) {
        console.error('Error reading file:', error)
        return NextResponse.json(
            { error: 'Failed to read file' },
            { status: 500 }
        )
    }
}

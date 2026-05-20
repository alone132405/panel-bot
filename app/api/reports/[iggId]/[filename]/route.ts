import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getReportsExportPath } from '@/lib/fileSync'
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

    const { searchParams } = new URL(req.url)
    const isDownload = searchParams.get('download') === 'true'

    try {
        const basePath = getReportsExportPath(params.iggId)

        const filePath = path.join(basePath, params.filename)

        // Security check - ensure path doesn't escape the directory
        const resolvedBase = path.resolve(basePath)
        const resolvedPath = path.resolve(filePath)
        const baseWithTrailing = resolvedBase.endsWith(path.sep) ? resolvedBase : resolvedBase + path.sep

        const isSafe = process.platform === 'win32'
            ? resolvedPath.toLowerCase().startsWith(baseWithTrailing.toLowerCase())
            : resolvedPath.startsWith(baseWithTrailing)

        if (!isSafe) {
            console.error('Security violation: Path traversal attempt or invalid path', {
                resolvedPath,
                baseWithTrailing
            })
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

        // Handle raw download
        if (isDownload) {
            const buffer = await fs.readFile(filePath)

            let contentType = 'application/octet-stream'
            if (extension === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            else if (extension === '.xls') contentType = 'application/vnd.ms-excel'
            else if (extension === '.txt') contentType = 'text/plain'
            else if (extension === '.json') contentType = 'application/json'

            return new Response(buffer, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${params.filename}"`,
                    'Content-Length': stats.size.toString(),
                }
            })
        }

        // Handle Excel files (Preview)
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

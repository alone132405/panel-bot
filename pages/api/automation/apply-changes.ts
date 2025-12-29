import { NextApiRequest } from 'next'
import { NextApiResponseServerIO } from '@/types/socket'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

const execAsync = promisify(exec)

interface QueueItem {
    iggId: string
}

let isRunning = false
const queue: QueueItem[] = []

const broadcastQueueStatus = (io: any) => {
    if (!io) return
    io.emit('queue_update', {
        isRunning,
        queueLength: queue.length,
        queuedIggIds: queue.map(item => item.iggId),
        currentItem: isRunning && queue.length > 0 ? queue[0].iggId : null
    })
}

async function processQueue(io: any) {
    if (isRunning || queue.length === 0) return

    isRunning = true
    const item = queue[0]
    if (!item) {
        isRunning = false
        return
    }

    broadcastQueueStatus(io)

    if (io) {
        io.to(`igg-${item.iggId}`).emit('automation_status', {
            status: 'processing',
            message: 'Applying changes...',
            timestamp: Date.now()
        })
    }

    try {
        await runAutomation(item.iggId)
        queue.shift()

        if (io) {
            io.to(`igg-${item.iggId}`).emit('automation_status', {
                status: 'completed',
                message: 'Changes applied successfully',
                timestamp: Date.now()
            })
        }
    } catch (error: any) {
        queue.shift()

        if (io) {
            io.to(`igg-${item.iggId}`).emit('automation_status', {
                status: 'error',
                message: error.message || 'Automation failed',
                timestamp: Date.now()
            })
        }
    } finally {
        isRunning = false
        broadcastQueueStatus(io)

        if (queue.length > 0) {
            processQueue(io)
        }
    }
}

async function runAutomation(iggId: string): Promise<{ success: boolean; message: string; output: string }> {
    console.log('Running automation for IGG ID:', iggId)

    // ============================================
    // MAIN WINDOW COORDINATES (relative to window at 0,0)
    // ============================================
    const SEARCH_BOX_X = 994
    const SEARCH_BOX_Y = 142
    const ACCOUNT_X = 391
    const ACCOUNT_Y = 216
    const CLOSE_X = 450
    const CLOSE_Y = 14
    const FINAL_X = 745
    const FINAL_Y = 145

    // ============================================
    // POPUP WINDOW COORDINATES (relative to popup window position!)
    // ============================================
    const POPUP_FUNCTIONS_X = 159
    const POPUP_FUNCTIONS_Y = 60
    const POPUP_RELOAD_X = 182
    const POPUP_RELOAD_Y = 83
    // ============================================

    const scriptContent = `
Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int X, int Y);
    
    [DllImport("user32.dll")]
    public static extern void mouse_event(int dwFlags, int dx, int dy, int dwData, int dwExtraInfo);
    
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    
    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }
    
    public const int MOUSEEVENTF_LEFTDOWN = 0x02;
    public const int MOUSEEVENTF_LEFTUP = 0x04;
    public const int SW_RESTORE = 9;
}
"@

function Click($x, $y) {
    [Win32]::SetCursorPos($x, $y)
    Start-Sleep -Milliseconds 100
    [Win32]::mouse_event([Win32]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 50
    [Win32]::mouse_event([Win32]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 100
}

function DoubleClick($x, $y) {
    Click $x $y
    Start-Sleep -Milliseconds 50
    Click $x $y
}

Write-Output "=== AUTOMATION START ==="
Write-Output "Searching for Lords Mobile Bot..."

$botProcess = Get-Process | Where-Object { $_.MainWindowTitle -like "*Lords Mobile Bot*" } | Select-Object -First 1

if (-not $botProcess) {
    Write-Output "ERROR: Lords Mobile Bot not found!"
    exit 1
}

Write-Output "Found: $($botProcess.MainWindowTitle)"
$mainHwnd = $botProcess.MainWindowHandle

if ([Win32]::IsIconic($mainHwnd)) {
    Write-Output "Restoring minimized window..."
    [Win32]::ShowWindow($mainHwnd, [Win32]::SW_RESTORE)
    Start-Sleep -Seconds 1
}

Write-Output "Resizing window to 1024x768 at (0,0)..."
[Win32]::MoveWindow($mainHwnd, 0, 0, 1024, 768, $true)
Start-Sleep -Milliseconds 500

[Win32]::SetForegroundWindow($mainHwnd)
Start-Sleep -Seconds 1

$mainRect = New-Object Win32+RECT
[Win32]::GetWindowRect($mainHwnd, [ref]$mainRect) | Out-Null
Write-Output "Main Window at: ($($mainRect.Left), $($mainRect.Top))"

$baseX = $mainRect.Left
$baseY = $mainRect.Top

# Step 1: Click search box
$searchX = $baseX + ${SEARCH_BOX_X}
$searchY = $baseY + ${SEARCH_BOX_Y}
Write-Output "Step 1: Click Search at ($searchX, $searchY)"
Click $searchX $searchY
Start-Sleep -Milliseconds 500
Click $searchX $searchY
Start-Sleep -Milliseconds 500

# Step 2: Paste IGG ID
Write-Output "Step 2: Paste IGG ID ${iggId}"
Set-Clipboard -Value "${iggId}"
[System.Windows.Forms.SendKeys]::SendWait("^a")
Start-Sleep -Milliseconds 100
[System.Windows.Forms.SendKeys]::SendWait("{DELETE}")
Start-Sleep -Milliseconds 100
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Seconds 2

# Step 3: Double-click account
$accX = $baseX + ${ACCOUNT_X}
$accY = $baseY + ${ACCOUNT_Y}
Write-Output "Step 3: Double-click Account at ($accX, $accY)"
DoubleClick $accX $accY
Start-Sleep -Seconds 3

# Step 4: Detect popup by checking foreground window
Write-Output "Step 4: Detecting popup window..."
$popupHwnd = [Win32]::GetForegroundWindow()
$popupRect = New-Object Win32+RECT
[Win32]::GetWindowRect($popupHwnd, [ref]$popupRect) | Out-Null

Write-Output "Popup detected at: ($($popupRect.Left), $($popupRect.Top))"

# Click Functions tab (relative to popup)
$funcX = $popupRect.Left + ${POPUP_FUNCTIONS_X}
$funcY = $popupRect.Top + ${POPUP_FUNCTIONS_Y}
Write-Output "Step 5: Click Functions at ($funcX, $funcY)"
Click $funcX $funcY
Start-Sleep -Seconds 1

# Click Reload Settings (relative to popup)
$reloadX = $popupRect.Left + ${POPUP_RELOAD_X}
$reloadY = $popupRect.Top + ${POPUP_RELOAD_Y}
Write-Output "Step 6: Click Reload Settings at ($reloadX, $reloadY)"
Click $reloadX $reloadY
Start-Sleep -Seconds 2

# Close popup
$closeX = $baseX + ${CLOSE_X}
$closeY = $baseY + ${CLOSE_Y}
Write-Output "Step 7: Click to close at ($closeX, $closeY)"
Click $closeX $closeY
Start-Sleep -Seconds 1

# Final cleanup
$finalX = $baseX + ${FINAL_X}
$finalY = $baseY + ${FINAL_Y}
Write-Output "Step 8: Final click at ($finalX, $finalY)"
Click $finalX $finalY
Start-Sleep -Seconds 1

Write-Output "=== AUTOMATION COMPLETE ==="
`

    const scriptPath = path.join(process.cwd(), 'temp_automation.ps1')
    await fs.writeFile(scriptPath, scriptContent, 'utf-8')

    console.log('Script written to:', scriptPath)

    const { stdout, stderr } = await execAsync(
        `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`
    )

    console.log('PowerShell output:', stdout)
    if (stderr) console.log('PowerShell stderr:', stderr)

    try {
        await fs.unlink(scriptPath)
    } catch (e) {
        // Ignore cleanup errors
    }

    if (stdout.includes('ERROR:')) {
        throw new Error('Lords Mobile Bot application not found. Please open it manually.')
    }

    return {
        success: true,
        message: 'Automation completed',
        output: stdout
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
    if (req.method === 'GET') {
        return res.status(200).json({
            isRunning,
            queueLength: queue.length,
            queuedIggIds: queue.map(item => item.iggId)
        })
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { iggId } = req.body

        if (!iggId) {
            return res.status(400).json({ error: 'IGG ID is required' })
        }

        console.log('Received automation request for IGG ID:', iggId)

        const iggIdRecord = await prisma.iggId.findUnique({
            where: { iggId },
            include: { subscription: true }
        })

        if (iggIdRecord?.subscription?.expiresAt && new Date(iggIdRecord.subscription.expiresAt) < new Date()) {
            return res.status(403).json({
                success: false,
                error: 'Subscription expired. Cannot apply changes.'
            })
        }

        const queuePosition = queue.length + (isRunning ? 1 : 0)
        const io = res.socket.server.io || (global as any).io

        queue.push({ iggId })
        processQueue(io).catch(err => console.error('Queue processing error:', err))

        return res.status(200).json({
            success: true,
            message: 'Automation started in background',
            queuePosition
        })

    } catch (error: any) {
        console.error('Automation error:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'Automation failed',
            details: error.stderr || error.stdout || ''
        })
    }
}

import { NextApiRequest } from 'next'
import { NextApiResponseServerIO } from '@/types/socket'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

const execAsync = promisify(exec)

// Queue system for automation
interface QueueItem {
    iggId: string
}

let isRunning = false
const queue: QueueItem[] = []

// Broadcast queue status to all connected clients
const broadcastQueueStatus = (io: any) => {
    if (!io) return
    io.emit('queue_update', {
        isRunning,
        queueLength: queue.length,
        queuedIggIds: queue.map(item => item.iggId),
        currentItem: isRunning && queue.length > 0 ? queue[0].iggId : null // Note: This might need refinement if current is shifted out
    })
}

// Check if it is safe to run automation (Headless/Console session)
async function checkSafeToRun(): Promise<boolean> {
    try {
        const { stdout } = await execAsync('quser')
        // Output format:
        //  USERNAME              SESSIONNAME        ID  STATE   IDLE TIME  LOGON TIME
        // >Administrator         rdp-tcp#0           2  Active          .  12/12/2024 10:00
        // >Administrator         console             1  Active          .  12/12/2024 10:00

        // We look for the line starting with '>' (current session)
        const lines = stdout.split('\n')
        const currentSessionLine = lines.find(line => line.trim().startsWith('>'))

        if (!currentSessionLine) return true // Default to true if current session not marked (unlikely)

        // Basic parsing - split by whitespace
        const parts = currentSessionLine.trim().split(/\s+/)
        // parts[0] is >USERNAME
        // parts[1] is SESSIONNAME (usually)

        // If session name includes 'rdp' or 'tcp', it's likely an RDP session -> UNSAFE
        const sessionName = parts[1].toLowerCase()
        if (sessionName.includes('rdp') || sessionName.includes('tcp')) {
            console.log('Detected active RDP session:', parts[1], '- Pausing automation.')
            return false
        }

        // If 'console', it's safe (Headless)
        if (sessionName.includes('console')) {
            return true
        }

        return true // Default safe
    } catch (error) {
        console.error('Error checking session state:', error)
        return true // Fail open? Or fail closed? user wants safety. But if quser fails, we might be safe.
    }
}

async function processQueue(io: any) {
    if (isRunning || queue.length === 0) return

    // Check if safe to run (RDP check)
    const isSafe = await checkSafeToRun()
    if (!isSafe) {
        // Not safe, wait and try again
        if (io) {
            // Notify user that we are waiting
            const item = queue[0]
            io.to(`igg-${item.iggId}`).emit('automation_status', {
                status: 'waiting',
                message: 'Waiting for RDP to disconnect (Headless Mode)...'
            })
        }
        setTimeout(() => processQueue(io), 5000) // Check again in 5 seconds
        return
    }

    isRunning = true
    const item = queue[0] // Peek at first item, don't shift yet so we can show it as "processing"

    // Broadcast that we are starting
    broadcastQueueStatus(io)

    // Notify specific channel for this IGG ID that it's starting
    if (io) {
        io.to(`igg-${item.iggId}`).emit('automation_status', { status: 'processing', message: 'Applying changes...' })
    }

    try {
        const result = await runAutomation(item.iggId)

        // Remove from queue after done
        queue.shift()

        if (io) {
            io.to(`igg-${item.iggId}`).emit('automation_status', { status: 'completed', message: 'Changes applied successfully' })
        }
    } catch (error: any) {
        // Remove from queue after error
        queue.shift()

        if (io) {
            io.to(`igg-${item.iggId}`).emit('automation_status', { status: 'error', message: error.message || 'Automation failed' })
        }
    } finally {
        isRunning = false
        broadcastQueueStatus(io)

        // Process next item in queue
        if (queue.length > 0) {
            processQueue(io)
        }
    }
}

async function runAutomation(iggId: string): Promise<{ success: boolean; message: string; output: string }> {
    console.log('Running automation for IGG ID:', iggId)

    // Create PowerShell script file
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
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    
    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

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
    public const int SW_MAXIMIZE = 3;
}
"@

function Click-At {
    param([int]$x, [int]$y)
    [Win32]::SetCursorPos($x, $y)
    Start-Sleep -Milliseconds 200
    [Win32]::mouse_event([Win32]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 50
    [Win32]::mouse_event([Win32]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
}

function DoubleClick-At {
    param([int]$x, [int]$y)
    Click-At -x $x -y $y
    Start-Sleep -Milliseconds 100
    Click-At -x $x -y $y
}

# Find Lords Mobile Bot window
Write-Output "Searching for Lords Mobile Bot application..."
$botProcess = $null
$processes = Get-Process | Where-Object { $_.MainWindowTitle -ne "" }
foreach ($proc in $processes) {
    if ($proc.MainWindowTitle -like "*Lords Mobile Bot*") {
        $botProcess = $proc
        Write-Output "Found application: $($proc.MainWindowTitle)"
        break
    }
}

if ($botProcess) {
    # App is running - bring to foreground and RESIZE
    Write-Output "Lords Mobile Bot is running. Preparing window..."
    
    $hwnd = $botProcess.MainWindowHandle
    
    # Check if window is minimized
    if ([Win32]::IsIconic($hwnd)) {
        Write-Output "Window is minimized. Restoring..."
        [Win32]::ShowWindow($hwnd, [Win32]::SW_RESTORE)
        Start-Sleep -Seconds 1
    }
    
    # Restore (un-maximize) to ensure we can resize it
    [Win32]::ShowWindow($hwnd, [Win32]::SW_RESTORE)
    Start-Sleep -Milliseconds 500

    # Force Resize to 1024x768 at 0,0
    Write-Output "Forcing window size to 1024x768 at (0,0)..."
    [Win32]::MoveWindow($hwnd, 0, 0, 1024, 768, $true)
    Start-Sleep -Milliseconds 500
    
    # Bring to foreground
    [Win32]::SetForegroundWindow($hwnd)
    Start-Sleep -Seconds 1
} else {
    Write-Output "ERROR: Lords Mobile Bot application not found. Please open it manually."
    exit 1
}

# Get Main Window Position for Relative Clicks
$mainRect = New-Object Win32+RECT
[Win32]::GetWindowRect($hwnd, [ref]$mainRect) | Out-Null
Write-Output "Main Window detected at ($($mainRect.Left), $($mainRect.Top))"

Write-Output "Window ready. Starting automation..."
Start-Sleep -Seconds 1

# Step 0: Wake Up / Focus Click (Title Bar)
$focusX = $mainRect.Left + 500
$focusY = $mainRect.Top + 10
Write-Output "Attempting to focus window at ($focusX, $focusY)..."
Click-At -x $focusX -y $focusY
Start-Sleep -Milliseconds 500

# Step 1: Search Option - Relative (998, 134)
$searchX = $mainRect.Left + 998
$searchY = $mainRect.Top + 134

Write-Output "Step 1: Clicking 'Search' at ($searchX, $searchY)"
Click-At -x $searchX -y $searchY
Start-Sleep -Seconds 2

Write-Output "Step 2: Pasting IGG ID: ${iggId}"
Set-Clipboard -Value "${iggId}"
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Seconds 2

# Step 3: Double Click Account - Relative (342, 216)
$accX = $mainRect.Left + 342
$accY = $mainRect.Top + 216

Write-Output "Step 3: Double-clicking Account at ($accX, $accY)"
DoubleClick-At -x $accX -y $accY
Write-Output "Waiting 3 seconds for Account Window to open..."
Start-Sleep -Seconds 3

# Handle Popup Window
$popupHwnd = [Win32]::GetForegroundWindow()
$rect = New-Object Win32+RECT
[Win32]::GetWindowRect($popupHwnd, [ref]$rect) | Out-Null

Write-Output "Account Window detected at ($($rect.Left), $($rect.Top))"

# Calculate Absolute Coordinates
# Functions: Relative (175, 53)
$funcX = $rect.Left + 175
$funcY = $rect.Top + 53

# Reload: Relative (194, 114)
$reloadX = $rect.Left + 194
$reloadY = $rect.Top + 114

Write-Output "Step 4: Clicking 'Functions' at ($funcX, $funcY)"
Click-At -x $funcX -y $funcY
Start-Sleep -Seconds 2

Write-Output "Step 5: Clicking 'Reload Settings' at ($reloadX, $reloadY)"
Click-At -x $reloadX -y $reloadY
Start-Sleep -Seconds 2

# Step 6: Final Click 1 - Main Window Relative (951, 388)
$final1X = $mainRect.Left + 951
$final1Y = $mainRect.Top + 388

Write-Output "Step 6: Final Click 1 at ($final1X, $final1Y)"
Click-At -x $final1X -y $final1Y
Start-Sleep -Seconds 2

# Step 7: Final Click 2 - Main Window Relative (744, 149)
$final2X = $mainRect.Left + 744
$final2Y = $mainRect.Top + 149

Write-Output "Step 7: Final Click 2 at ($final2X, $final2Y)"
Click-At -x $final2X -y $final2Y
Start-Sleep -Seconds 2

Write-Output "SUCCESS: Automation completed"
`

    // Write script to temp file
    const scriptPath = path.join(process.cwd(), 'temp_automation.ps1')
    await fs.writeFile(scriptPath, scriptContent, 'utf-8')

    console.log('Script written to:', scriptPath)

    // Execute PowerShell script
    const { stdout, stderr } = await execAsync(
        `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`,
        { timeout: 120000 } // 2 minute timeout
    )

    console.log('PowerShell stdout:', stdout)
    if (stderr) {
        console.log('PowerShell stderr:', stderr)
    }

    // Clean up temp file
    try {
        await fs.unlink(scriptPath)
    } catch (e) {
        // Ignore cleanup errors
    }

    // Check if there was an error
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

        // Verify Subscription
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

        // Queue info
        const queuePosition = queue.length + (isRunning ? 1 : 0)

        // Get IO instance, trying both standard attachment and global fallback (for dev)
        const io = res.socket.server.io || (global as any).io

        // Broadcast that we have a new item (if io is available)
        if (io) {
            // We could broadcast queue updates here immediately
        }

        // Add to queue
        queue.push({ iggId })

        // Trigger processing (fire and forget)
        // We catch errors here just to prevent unhandled promise rejections, 
        // but the main error handling happens inside processQueue via sockets
        processQueue(io).catch(err => console.error('Queue processing error:', err))

        // Return immediately
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

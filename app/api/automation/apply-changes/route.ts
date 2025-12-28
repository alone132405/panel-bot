import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

// Queue system for automation
interface QueueItem {
    iggId: string
    resolve: (value: any) => void
    reject: (error: any) => void
}

let isRunning = false
const queue: QueueItem[] = []

async function processQueue() {
    if (isRunning || queue.length === 0) return

    isRunning = true
    const item = queue.shift()!

    try {
        const result = await runAutomation(item.iggId)
        item.resolve(result)
    } catch (error) {
        item.reject(error)
    } finally {
        isRunning = false
        // Process next item in queue
        if (queue.length > 0) {
            processQueue()
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

export async function POST(request: NextRequest) {
    try {
        const { iggId } = await request.json()

        if (!iggId) {
            return NextResponse.json({ error: 'IGG ID is required' }, { status: 400 })
        }

        console.log('Received automation request for IGG ID:', iggId)

        // Check queue position
        const queuePosition = queue.length + (isRunning ? 1 : 0)

        if (queuePosition > 0) {
            console.log(`Request queued at position ${queuePosition + 1}`)
        }

        // Create a promise that will be resolved when this request is processed
        const result = await new Promise<any>((resolve, reject) => {
            queue.push({ iggId, resolve, reject })
            processQueue()
        })

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Automation error:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Automation failed',
            details: error.stderr || error.stdout || ''
        }, { status: 500 })
    }
}

// GET endpoint to check queue status
export async function GET() {
    return NextResponse.json({
        isRunning,
        queueLength: queue.length,
        queuedIggIds: queue.map(item => item.iggId)
    })
}

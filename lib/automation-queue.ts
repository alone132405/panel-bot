import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

interface QueueItem {
    iggId: string
    io: any
}

declare global {
    var automationQueueInstance: AutomationQueue | undefined
}

class AutomationQueue {
    private static instance: AutomationQueue
    private queue: QueueItem[] = []
    private isRunning: boolean = false

    private constructor() { }

    public static getInstance(): AutomationQueue {
        if (!AutomationQueue.instance) {
            AutomationQueue.instance = new AutomationQueue()
        }
        return AutomationQueue.instance
    }

    public async enqueue(iggId: string, io: any) {
        // If already waiting in queue, skip (the waiting run will pick up all current changes)
        if (this.queue.some(item => item.iggId === iggId)) {
            console.log(`IGG ID ${iggId} is already waiting in the queue.`)
            return
        }

        this.queue.push({ iggId, io })
        console.log(`Enqueued IGG ID: ${iggId}. Queue size: ${this.queue.length}`)

        this.broadcastQueueStatus(io)

        // Start processing if not already running
        if (!this.isRunning) {
            this.processNext(io).catch(err => console.error('Queue processing error:', err))
        }
    }

    public getStatus() {
        return {
            isRunning: this.isRunning,
            queueLength: this.queue.length,
            queuedIggIds: this.queue.map(item => item.iggId),
            currentItem: this.isRunning && this.queue.length > 0 ? this.queue[0].iggId : null
        }
    }

    private broadcastQueueStatus(io: any) {
        if (!io) {
            io = (global as any).io
        }
        if (!io) return

        io.emit('queue_update', this.getStatus())
    }

    private async processNext(io: any) {
        if (this.isRunning || this.queue.length === 0) return

        this.isRunning = true
        const item = this.queue[0]

        try {
            this.broadcastQueueStatus(io)

            // 1. Wait for RDP disconnect
            await this.waitForConsoleSession(io, item.iggId)

            // 2. Processing status
            if (io) {
                io.to(`igg-${item.iggId}`).emit('automation_status', {
                    status: 'processing',
                    message: 'Applying changes...',
                    timestamp: Date.now()
                })
            }

            // 3. Run Automation
            await this.runAutomation(item.iggId)

            // 4. Success status
            if (io) {
                io.to(`igg-${item.iggId}`).emit('automation_status', {
                    status: 'completed',
                    message: 'Changes applied successfully',
                    timestamp: Date.now()
                })
            }

        } catch (error: any) {
            console.error(`Automation failed for ${item.iggId}:`, error)
            if (io) {
                io.to(`igg-${item.iggId}`).emit('automation_status', {
                    status: 'error',
                    message: error.message || 'Automation failed',
                    timestamp: Date.now()
                })
            }
        } finally {
            this.queue.shift()
            this.isRunning = false
            this.broadcastQueueStatus(io)

            if (this.queue.length > 0) {
                this.processNext(io).catch(err => console.error('Queue processNext error:', err))
            }
        }
    }

    private async isConsoleSession(): Promise<boolean> {
        try {
            const { stdout } = await execAsync('quser')
            const lines = stdout.split('\n')
            const currentSessionLine = lines.find(line => line.trim().startsWith('>'))

            if (!currentSessionLine) return true

            const parts = currentSessionLine.trim().split(/\s+/)
            const sessionName = parts[1]?.toLowerCase() || ''

            if (sessionName.includes('rdp') || sessionName.includes('tcp')) {
                return false
            }

            return true
        } catch (error) {
            console.error('Error checking session:', error)
            return true
        }
    }

    private async waitForConsoleSession(io: any, iggId: string): Promise<void> {
        let isConsole = await this.isConsoleSession()

        while (!isConsole) {
            console.log('RDP detected. Waiting for disconnect...')

            if (io) {
                io.to(`igg-${iggId}`).emit('automation_status', {
                    status: 'waiting',
                    message: 'RDP connected. Waiting for disconnect (use disconnect_headless.bat)...',
                    timestamp: Date.now()
                })
            }

            await new Promise(resolve => setTimeout(resolve, 5000))
            isConsole = await this.isConsoleSession()
        }
    }

    private async runAutomation(iggId: string): Promise<void> {
        console.log('Running automation for IGG ID:', iggId)

        // Coordinates
        const SEARCH_BOX_X = 994
        const SEARCH_BOX_Y = 142
        const ACCOUNT_X = 391
        const ACCOUNT_Y = 216
        const CLOSE_X = 450
        const CLOSE_Y = 14
        const FINAL_X = 745
        const FINAL_Y = 145

        const POPUP_FUNCTIONS_X = 159
        const POPUP_FUNCTIONS_Y = 60
        const POPUP_RELOAD_X = 390
        const POPUP_RELOAD_Y = 300

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

    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DllImport("user32.dll")]
    public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

    [DllImport("kernel32.dll")]
    public static extern uint GetCurrentThreadId();

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
    public const int SW_SHOW = 5;

    public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    public static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);
    public const uint SWP_NOMOVE = 0x0002;
    public const uint SWP_NOSIZE = 0x0001;
    public const uint SWP_SHOWWINDOW = 0x0040;
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
    Start-Sleep -Milliseconds 100
    Click $x $y
}

function ForceForeground($targetHwnd) {
    $currentHwnd = [Win32]::GetForegroundWindow()
    
    if ($currentHwnd -ne $targetHwnd) {
        $currentThreadId = [Win32]::GetCurrentThreadId()
        $targetProcId = 0
        $targetThreadId = [Win32]::GetWindowThreadProcessId($targetHwnd, [ref]$targetProcId)
        $fgProcId = 0
        $fgThreadId = [Win32]::GetWindowThreadProcessId($currentHwnd, [ref]$fgProcId)
        
        [Win32]::AttachThreadInput($currentThreadId, $fgThreadId, $true) | Out-Null
        
        [Win32]::SetWindowPos($targetHwnd, [Win32]::HWND_TOPMOST, 0, 0, 0, 0, [Win32]::SWP_NOMOVE -bor [Win32]::SWP_NOSIZE) | Out-Null
        [Win32]::SetWindowPos($targetHwnd, [Win32]::HWND_NOTOPMOST, 0, 0, 0, 0, [Win32]::SWP_NOMOVE -bor [Win32]::SWP_NOSIZE -bor [Win32]::SWP_SHOWWINDOW) | Out-Null
        
        [Win32]::ShowWindow($targetHwnd, [Win32]::SW_SHOW) | Out-Null
        [Win32]::SetForegroundWindow($targetHwnd) | Out-Null
        
        [Win32]::AttachThreadInput($currentThreadId, $fgThreadId, $false) | Out-Null
    }
}

Write-Output "=== AUTOMATION START ==="
Write-Output "Searching for Lords Mobile Bot..."

$botProcess = Get-Process | Where-Object { $_.MainWindowTitle -like "*Lords Mobile Bot*" } | Select-Object -First 1

if (-not $botProcess) {
    Write-Output "ERROR: Lords Mobile Bot not found!"
    Write-Output "--- DEBUG: Current Window Titles ---"
    Get-Process | Where-Object { $_.MainWindowTitle } | Select-Object -ExpandProperty MainWindowTitle -First 5 | ForEach-Object { Write-Output "Found Window: $_" }
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

Write-Output "Forcing window to foreground..."
ForceForeground $mainHwnd
Start-Sleep -Seconds 1

$fgNow = [Win32]::GetForegroundWindow()
if ($fgNow -eq $mainHwnd) {
    Write-Output "SUCCESS: Window is now in foreground"
} else {
    Write-Output "WARNING: Window may not be in foreground. Trying again..."
    ForceForeground $mainHwnd
    Start-Sleep -Seconds 1
}

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

# Step 4: Detect popup by waiting for foreground window to change from main
Write-Output "Step 4: Detecting account popup..."
$popupHwnd = [IntPtr]::Zero
$startTime = Get-Date
while ($true) {
    $currentFg = [Win32]::GetForegroundWindow()
    # If the foreground window changed and is NOT the main window, it's our popup
    if ($currentFg -ne $mainHwnd -and $currentFg -ne [IntPtr]::Zero) {
        $popupHwnd = $currentFg
        Write-Output "SUCCESS: Account popup detected. Handle: $popupHwnd"
        break
    }
    
    if ((New-TimeSpan -Start $startTime -End (Get-Date)).TotalSeconds -gt 10) {
        Write-Output "WARNING: Timeout waiting for separate popup window. Falling back to main window."
        $popupHwnd = $mainHwnd
        break
    }
    Start-Sleep -Milliseconds 500
}

$popupRect = New-Object Win32+RECT
[Win32]::GetWindowRect($popupHwnd, [ref]$popupRect) | Out-Null

Write-Output "Popup Window Rect: Left=$($popupRect.Left), Top=$($popupRect.Top), Right=$($popupRect.Right), Bottom=$($popupRect.Bottom)"
Write-Output "Clicking relative to popup at ($($popupRect.Left), $($popupRect.Top))"

# Functions tab (relative to popup)
$funcX = $popupRect.Left + ${POPUP_FUNCTIONS_X}
$funcY = $popupRect.Top + ${POPUP_FUNCTIONS_Y}
Write-Output "Step 5: Click Functions at ($funcX, $funcY)"
Click $funcX $funcY
Start-Sleep -Seconds 1

# Reload Settings (relative to main)
$reloadX = $baseX + ${POPUP_RELOAD_X}
$reloadY = $baseY + ${POPUP_RELOAD_Y}
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
        const scriptPath = path.join(process.cwd(), `temp_automation_${iggId}.ps1`)
        await fs.writeFile(scriptPath, scriptContent, 'utf-8')

        try {
            const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`)
            console.log('PowerShell output:', stdout)

            if (stdout.includes('ERROR:')) {
                throw new Error('Lords Mobile Bot application not found.')
            }
        } finally {
            try {
                await fs.unlink(scriptPath)
            } catch (e) { }
        }
    }
}

// Ensure singleton persists across HMR in development
export const automationQueue = global.automationQueueInstance || AutomationQueue.getInstance()

if (process.env.NODE_ENV !== 'production') {
    global.automationQueueInstance = automationQueue
}

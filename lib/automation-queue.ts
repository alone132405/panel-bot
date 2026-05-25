import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execFileAsync = promisify(execFile)

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
        // If already queued, skip the duplicate request.
        if (this.queue.some(item => item.iggId === iggId)) {
            // console.log(`IGG ID ${iggId} is already queued.`)
            return
        }

        this.queue.push({ iggId, io })
        // console.log(`Enqueued IGG ID: ${iggId}. Queue size: ${this.queue.length}`)

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

            await this.waitForConsoleSession(io, item.iggId)

            if (io) {
                io.to(`igg-${item.iggId}`).emit('automation_status', {
                    status: 'processing',
                    message: 'Applying changes...',
                    timestamp: Date.now()
                })
            }

            await this.runAutomation(item.iggId)

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
            const result = await execFileAsync('quser', [], { windowsHide: true, encoding: 'utf8' })
            const stdout = String(result.stdout || '')
            const lines = stdout.split('\n')
            const currentSessionLine = lines.find(line => line.trim().startsWith('>'))

            if (!currentSessionLine) return true

            const parts = currentSessionLine.trim().split(/\s+/)
            const sessionName = parts[1]?.toLowerCase() || ''

            return !(sessionName.includes('rdp') || sessionName.includes('tcp'))
        } catch (error) {
            console.error('Error checking session:', error)
            return true
        }
    }

    private async waitForConsoleSession(io: any, iggId: string): Promise<void> {
        let isConsole = await this.isConsoleSession()

        while (!isConsole) {
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
        // console.log('Running automation for IGG ID:', iggId)

        // Coordinates
        const SEARCH_ICON_X = 1277
        const SEARCH_ICON_Y = 143
        const SEARCH_FIELD_X = 1116
        const SEARCH_FIELD_Y = 147
        const FIRST_RESULT_X = 386
        const FIRST_RESULT_Y = 217
        const OUTSIDE_POPUP_X = 1018
        const OUTSIDE_POPUP_Y = 149

        const POPUP_ANCHOR_X = 181
        const POPUP_ANCHOR_Y = 179
        const POPUP_FUNCTIONS_X = 155
        const POPUP_FUNCTIONS_Y = 52
        const POPUP_RELOAD_X = 144
        const POPUP_RELOAD_Y = 110
        const MAIN_REQUIRED_X = Math.max(SEARCH_ICON_X, SEARCH_FIELD_X, FIRST_RESULT_X, OUTSIDE_POPUP_X, POPUP_ANCHOR_X + POPUP_FUNCTIONS_X, POPUP_ANCHOR_X + POPUP_RELOAD_X)
        const MAIN_REQUIRED_Y = Math.max(SEARCH_ICON_Y, SEARCH_FIELD_Y, FIRST_RESULT_Y, OUTSIDE_POPUP_Y, POPUP_ANCHOR_Y + POPUP_FUNCTIONS_Y, POPUP_ANCHOR_Y + POPUP_RELOAD_Y)
        const MIN_WINDOW_WIDTH = 1024
        const MIN_DESKTOP_HEIGHT = 640

        const scriptContent = `
Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class Win32 {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

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
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DllImport("user32.dll")]
    public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount);

    [DllImport("kernel32.dll")]
    public static extern uint GetCurrentThreadId();

    public static IntPtr[] GetVisibleWindowsForProcess(uint processId) {
        List<IntPtr> windows = new List<IntPtr>();

        EnumWindows(delegate(IntPtr hWnd, IntPtr lParam) {
            uint windowProcessId = 0;
            GetWindowThreadProcessId(hWnd, out windowProcessId);

            if (windowProcessId == processId && IsWindowVisible(hWnd)) {
                windows.Add(hWnd);
            }

            return true;
        }, IntPtr.Zero);

        return windows.ToArray();
    }

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
    public const uint SWP_NOZORDER = 0x0004;
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

function Assert-InteractiveDesktop {
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    if ($screen.Width -lt ${MIN_WINDOW_WIDTH} -or $screen.Height -lt ${MIN_DESKTOP_HEIGHT}) {
        Write-Output "ERROR: Active desktop is $($screen.Width)x$($screen.Height). Automation needs at least ${MIN_WINDOW_WIDTH}x${MIN_DESKTOP_HEIGHT} for the configured click positions."
        exit 1
    }

    Write-Output "Screen: $($screen.Width)x$($screen.Height)"
}

function Get-WindowBase($hwnd) {
    $rect = New-Object Win32+RECT
    [Win32]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
    return [PSCustomObject]@{
        X = $rect.Left
        Y = $rect.Top
        Rect = $rect
    }
}

function Write-WindowBase($base, $label) {
    Write-Output "$label Window at: ($($base.X), $($base.Y))"
}

function Get-ClampedPoint($base, $relativeX, $relativeY, $margin) {
    $windowWidth = $base.Rect.Right - $base.Rect.Left
    $windowHeight = $base.Rect.Bottom - $base.Rect.Top
    $safeX = [Math]::Min([Math]::Max($relativeX, $margin), $windowWidth - $margin)
    $safeY = [Math]::Min([Math]::Max($relativeY, $margin), $windowHeight - $margin)

    return [PSCustomObject]@{
        X = $base.X + $safeX
        Y = $base.Y + $safeY
        RelativeX = $safeX
        RelativeY = $safeY
    }
}

function Move-WindowTopLeft($hwnd, $label) {
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
    Write-Host "Moving $label window to top-left at ($($screen.Left), $($screen.Top))..."
    [Win32]::SetWindowPos($hwnd, [IntPtr]::Zero, $screen.Left, $screen.Top, 0, 0, [Win32]::SWP_NOSIZE -bor [Win32]::SWP_NOZORDER -bor [Win32]::SWP_SHOWWINDOW) | Out-Null
    Start-Sleep -Milliseconds 500
    return (Get-WindowBase $hwnd)
}

function Ensure-WindowClickArea($hwnd, $base, $label, $requiredX, $requiredY, $canMaximize) {
    $windowWidth = $base.Rect.Right - $base.Rect.Left
    $windowHeight = $base.Rect.Bottom - $base.Rect.Top

    if (($windowWidth -le $requiredX -or $windowHeight -le $requiredY) -and $canMaximize) {
        Write-Host "$label window is $($windowWidth)x$($windowHeight), maximizing for click area..."
        [Win32]::ShowWindow($hwnd, 3) | Out-Null
        Start-Sleep -Seconds 1
        $base = Get-WindowBase $hwnd
        $windowWidth = $base.Rect.Right - $base.Rect.Left
        $windowHeight = $base.Rect.Bottom - $base.Rect.Top
    }

    if ($windowWidth -le $requiredX -or $windowHeight -le $requiredY) {
        Write-Output "ERROR: $label window is $($windowWidth)x$($windowHeight). Needed click area reaches relative ($requiredX, $requiredY)."
        exit 1
    }

    $screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
    $margin = 8
    $targetX = $base.X + $requiredX
    $targetY = $base.Y + $requiredY
    $newX = $base.X
    $newY = $base.Y

    if ($targetX -gt ($screen.Right - $margin)) {
        $newX = $newX - ($targetX - ($screen.Right - $margin))
    }
    if ($targetY -gt ($screen.Bottom - $margin)) {
        $newY = $newY - ($targetY - ($screen.Bottom - $margin))
    }
    if ($newX -lt ($screen.Left + $margin)) {
        $newX = $screen.Left + $margin
    }
    if ($newY -lt ($screen.Top + $margin)) {
        $newY = $screen.Top + $margin
    }

    if ($newX -ne $base.X -or $newY -ne $base.Y) {
        Write-Host "Moving $label window to ($newX, $newY) so click targets stay on-screen..."
        [Win32]::SetWindowPos($hwnd, [IntPtr]::Zero, $newX, $newY, 0, 0, [Win32]::SWP_NOSIZE -bor [Win32]::SWP_NOZORDER -bor [Win32]::SWP_SHOWWINDOW) | Out-Null
        Start-Sleep -Milliseconds 500
        $base = Get-WindowBase $hwnd
        $windowWidth = $base.Rect.Right - $base.Rect.Left
        $windowHeight = $base.Rect.Bottom - $base.Rect.Top
    }

    Write-Host "$label window size: $($windowWidth)x$($windowHeight)"
    return $base
}

Write-Output "=== AUTOMATION START ==="
Assert-InteractiveDesktop
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
$botProcessId = [uint32]$botProcess.Id

if ([Win32]::IsIconic($mainHwnd)) {
    Write-Output "Restoring minimized window..."
    [Win32]::ShowWindow($mainHwnd, [Win32]::SW_RESTORE)
    Start-Sleep -Seconds 1
}

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

$mainBase = Get-WindowBase $mainHwnd
Write-WindowBase $mainBase "Main"
$mainBase = Move-WindowTopLeft $mainHwnd "Main"
Write-WindowBase $mainBase "Main"
$mainBase = Ensure-WindowClickArea $mainHwnd $mainBase "Main" ${MAIN_REQUIRED_X} ${MAIN_REQUIRED_Y} $true
Write-WindowBase $mainBase "Main"

# Step 1: Click search icon
$searchIconX = $mainBase.X + ${SEARCH_ICON_X}
$searchIconY = $mainBase.Y + ${SEARCH_ICON_Y}
Write-Output "Step 1: Click search icon at ($searchIconX, $searchIconY)"
Click $searchIconX $searchIconY
Start-Sleep -Milliseconds 500

# Step 2: Click search field and paste IGG ID
$mainBase = Get-WindowBase $mainHwnd
Write-WindowBase $mainBase "Main"
$searchFieldX = $mainBase.X + ${SEARCH_FIELD_X}
$searchFieldY = $mainBase.Y + ${SEARCH_FIELD_Y}
Write-Output "Step 2: Paste IGG ID ${iggId} into search field at ($searchFieldX, $searchFieldY)"
Click $searchFieldX $searchFieldY
Start-Sleep -Milliseconds 200
Set-Clipboard -Value "${iggId}"
[System.Windows.Forms.SendKeys]::SendWait("^a")
Start-Sleep -Milliseconds 100
[System.Windows.Forms.SendKeys]::SendWait("{DELETE}")
Start-Sleep -Milliseconds 100
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Seconds 1

# Step 3: Double-click first search result
$mainBase = Get-WindowBase $mainHwnd
Write-WindowBase $mainBase "Main"
$firstResultX = $mainBase.X + ${FIRST_RESULT_X}
$firstResultY = $mainBase.Y + ${FIRST_RESULT_Y}
Write-Output "Step 3: Double-click first result at ($firstResultX, $firstResultY)"
DoubleClick $firstResultX $firstResultY
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

    $processWindows = [Win32]::GetVisibleWindowsForProcess($botProcessId)
    foreach ($window in $processWindows) {
        if ($window -ne $mainHwnd -and $window -ne [IntPtr]::Zero) {
            $popupHwnd = $window
            Write-Output "SUCCESS: Account popup detected from process windows. Handle: $popupHwnd"
            break
        }
    }
    if ($popupHwnd -ne [IntPtr]::Zero) {
        break
    }
    
    if ((New-TimeSpan -Start $startTime -End (Get-Date)).TotalSeconds -gt 10) {
        Write-Output "ERROR: Timeout waiting for account popup window."
        $fgTitle = New-Object System.Text.StringBuilder 256
        [Win32]::GetWindowText($currentFg, $fgTitle, $fgTitle.Capacity) | Out-Null
        Write-Output "DEBUG: Current foreground window title: $($fgTitle.ToString())"
        exit 1
    }
    Start-Sleep -Milliseconds 500
}

ForceForeground $popupHwnd
Start-Sleep -Milliseconds 300

$mainBase = Get-WindowBase $mainHwnd
$popupBaseX = $mainBase.X + ${POPUP_ANCHOR_X}
$popupBaseY = $mainBase.Y + ${POPUP_ANCHOR_Y}
Write-Output "Popup visual anchor at: ($popupBaseX, $popupBaseY)"

# Functions tab (relative to popup)
$funcX = $popupBaseX + ${POPUP_FUNCTIONS_X}
$funcY = $popupBaseY + ${POPUP_FUNCTIONS_Y}
Write-Output "Step 5: Click Functions at ($funcX, $funcY)"
DoubleClick $funcX $funcY
Start-Sleep -Seconds 1

# Reload Settings (relative to popup)
ForceForeground $popupHwnd
Start-Sleep -Milliseconds 300
$mainBase = Get-WindowBase $mainHwnd
$popupBaseX = $mainBase.X + ${POPUP_ANCHOR_X}
$popupBaseY = $mainBase.Y + ${POPUP_ANCHOR_Y}
$reloadX = $popupBaseX + ${POPUP_RELOAD_X}
$reloadY = $popupBaseY + ${POPUP_RELOAD_Y}
Write-Output "Step 6: Click Reload Settings at ($reloadX, $reloadY)"
Click $reloadX $reloadY
Start-Sleep -Seconds 2

# Click outside popup.
$mainBase = Get-WindowBase $mainHwnd
Write-WindowBase $mainBase "Main"
$outsideX = $mainBase.X + ${OUTSIDE_POPUP_X}
$outsideY = $mainBase.Y + ${OUTSIDE_POPUP_Y}
Write-Output "Step 7: Click outside popup at ($outsideX, $outsideY)"
Click $outsideX $outsideY
Start-Sleep -Milliseconds 500

Write-Output "=== AUTOMATION COMPLETE ==="
`
        const scriptPath = path.join(process.cwd(), `temp_automation_${iggId}.ps1`)
        await fs.writeFile(scriptPath, scriptContent, 'utf-8')

        try {
            let stdout = '';
            try {
                const result = await execFileAsync(
                    'powershell.exe',
                    ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
                    { windowsHide: true }
                )
                stdout = String(result.stdout || '');
            } catch (execError: any) {
                stdout = String(execError.stdout || '');
                const stderr = String(execError.stderr || '');
                // console.log('PowerShell exec error output:', stdout);
                // console.log('PowerShell exec stderr:', stderr);

                if (stdout.includes('ERROR:')) {
                    const lines = stdout.split('\n');
                    const errLine = lines.find((l: string) => l.includes('ERROR:'));
                    throw new Error(errLine ? errLine.trim() : 'Lords Mobile Bot application not found.');
                }

                if (stderr) {
                    throw new Error(`PowerShell Error: ${stderr.trim().split('\n')[0]}`);
                }

                throw new Error('Automation script failed to execute (code 1).');
            }

            // console.log('PowerShell output:', stdout)

            if (stdout.includes('ERROR:')) {
                const lines = stdout.split('\n')
                const errLine = lines.find((line: string) => line.includes('ERROR:'))
                throw new Error(errLine ? errLine.trim() : 'Automation failed.')
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

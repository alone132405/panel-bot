
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
    # App is running - bring to foreground and maximize
    Write-Output "Lords Mobile Bot is running. Bringing to foreground..."
    
    $hwnd = $botProcess.MainWindowHandle
    
    # Check if window is minimized
    if ([Win32]::IsIconic($hwnd)) {
        Write-Output "Window is minimized. Restoring..."
        [Win32]::ShowWindow($hwnd, [Win32]::SW_RESTORE)
        Start-Sleep -Seconds 1
    }
    
    # Maximize the window
    Write-Output "Maximizing window..."
    [Win32]::ShowWindow($hwnd, [Win32]::SW_MAXIMIZE)
    Start-Sleep -Milliseconds 500
    
    # Bring to foreground
    [Win32]::SetForegroundWindow($hwnd)
    Start-Sleep -Seconds 1
} else {
    # App is not running - try to find it in taskbar and click
    Write-Output "Lords Mobile Bot not found in running processes."
    Write-Output "Looking for it in taskbar..."
    
    # Try to find the process (might be running but without visible window)
    $allProcesses = Get-Process | Where-Object { $_.ProcessName -like "*Lords*" -or $_.ProcessName -like "*Bot*" }
    
    if ($allProcesses) {
        foreach ($proc in $allProcesses) {
            Write-Output "Found process: $($proc.ProcessName)"
            if ($proc.MainWindowHandle -ne [IntPtr]::Zero) {
                [Win32]::ShowWindow($proc.MainWindowHandle, [Win32]::SW_RESTORE)
                [Win32]::ShowWindow($proc.MainWindowHandle, [Win32]::SW_MAXIMIZE)
                [Win32]::SetForegroundWindow($proc.MainWindowHandle)
                Start-Sleep -Seconds 1
                break
            }
        }
    } else {
        Write-Output "ERROR: Lords Mobile Bot application not found. Please open it manually."
        exit 1
    }
}

Write-Output "Window ready. Starting automation..."
Start-Sleep -Seconds 1

Write-Output "Step 1: Clicking at (1906, 118)"
Click-At -x 1906 -y 118
Start-Sleep -Seconds 2

Write-Output "Step 2: Pasting IGG ID: 987303841"
Set-Clipboard -Value "987303841"
[System.Windows.Forms.SendKeys]::SendWait("^a")
Start-Sleep -Milliseconds 200
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Seconds 2

Write-Output "Step 3: Double-clicking at (404, 197)"
DoubleClick-At -x 404 -y 197
Start-Sleep -Seconds 2

Write-Output "Step 4: Clicking at (340, 226)"
Click-At -x 340 -y 226
Start-Sleep -Seconds 2

Write-Output "Step 5: Clicking at (314, 283)"
Click-At -x 314 -y 283
Start-Sleep -Seconds 2

Write-Output "Step 6: Clicking at (1654, 121)"
Click-At -x 1654 -y 121
Start-Sleep -Seconds 2

Write-Output "SUCCESS: Automation completed"

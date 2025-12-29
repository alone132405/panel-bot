# ===========================================
# COORDINATE FINDER SCRIPT (with Relative Coordinates)
# ===========================================

Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class Win32Helper {
    [DllImport("user32.dll")]
    public static extern bool GetCursorPos(out POINT lpPoint);
    
    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hWnd);
    
    [StructLayout(LayoutKind.Sequential)]
    public struct POINT {
        public int X;
        public int Y;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    public const int SW_RESTORE = 9;
}
"@

Write-Host "=============================================="
Write-Host "    COORDINATE FINDER (with Relative)"
Write-Host "=============================================="
Write-Host ""

# Find Lords Mobile Bot
$botProcess = Get-Process | Where-Object { $_.MainWindowTitle -like "*Lords Mobile Bot*" } | Select-Object -First 1

if (-not $botProcess) {
    Write-Host "ERROR: Lords Mobile Bot not found!" -ForegroundColor Red
    Write-Host "Please open Lords Mobile Bot and run this script again."
    Read-Host "Press Enter to exit"
    exit 1
}

$hwnd = $botProcess.MainWindowHandle
Write-Host "Found: $($botProcess.MainWindowTitle)" -ForegroundColor Green
Write-Host ""

# Restore if minimized
if ([Win32Helper]::IsIconic($hwnd)) {
    Write-Host "Restoring minimized window..."
    [Win32Helper]::ShowWindow($hwnd, [Win32Helper]::SW_RESTORE)
    Start-Sleep -Seconds 1
}

# Position window at 0,0 with size 1024x768
Write-Host "Positioning window at (0,0) with size 1024x768..."
[Win32Helper]::MoveWindow($hwnd, 0, 0, 1024, 768, $true)
Start-Sleep -Milliseconds 500
[Win32Helper]::SetForegroundWindow($hwnd)

# Get window position
$windowRect = New-Object Win32Helper+RECT
[Win32Helper]::GetWindowRect($hwnd, [ref]$windowRect) | Out-Null

Write-Host ""
Write-Host "Window Position: ($($windowRect.Left), $($windowRect.Top))" -ForegroundColor Cyan
Write-Host "Window Size: $($windowRect.Right - $windowRect.Left) x $($windowRect.Bottom - $windowRect.Top)" -ForegroundColor Cyan
Write-Host ""
Write-Host "=============================================="
Write-Host "CONTROLS:"
Write-Host "  SPACE  = Capture coordinate"
Write-Host "  R      = Set reference point (for popup)"
Write-Host "  ESC    = Exit"
Write-Host "=============================================="
Write-Host ""

$captured = @()
$referencePoint = $null

while ($true) {
    # Get current mouse position
    $point = New-Object Win32Helper+POINT
    [Win32Helper]::GetCursorPos([ref]$point) | Out-Null
    
    # Calculate relative to main window
    $relX = $point.X - $windowRect.Left
    $relY = $point.Y - $windowRect.Top
    
    # Calculate relative to reference point (if set)
    $refRelX = "-"
    $refRelY = "-"
    if ($referencePoint) {
        $refRelX = $point.X - $referencePoint.X
        $refRelY = $point.Y - $referencePoint.Y
    }
    
    # Display
    $display = "Screen: ($($point.X), $($point.Y)) | Relative to Window: ($relX, $relY)"
    if ($referencePoint) {
        $display += " | Relative to Ref: ($refRelX, $refRelY)"
    }
    Write-Host "`r$display          " -NoNewline
    
    # Check for key press
    if ([System.Console]::KeyAvailable) {
        $key = [System.Console]::ReadKey($true)
        
        if ($key.Key -eq "Spacebar") {
            $entry = @{
                ScreenX = $point.X
                ScreenY = $point.Y
                RelWindowX = $relX
                RelWindowY = $relY
                RelRefX = $refRelX
                RelRefY = $refRelY
            }
            $captured += $entry
            Write-Host ""
            Write-Host ">>> CAPTURED #$($captured.Count):" -ForegroundColor Green
            Write-Host "    Screen: ($($point.X), $($point.Y))" -ForegroundColor Yellow
            Write-Host "    Relative to Window: ($relX, $relY)" -ForegroundColor Yellow
            if ($referencePoint) {
                Write-Host "    Relative to Reference: ($refRelX, $refRelY)" -ForegroundColor Yellow
            }
        }
        elseif ($key.Key -eq "R") {
            $referencePoint = @{ X = $point.X; Y = $point.Y }
            Write-Host ""
            Write-Host ">>> REFERENCE POINT SET: ($($point.X), $($point.Y))" -ForegroundColor Magenta
            Write-Host "    (Use this for popup window top-left corner)" -ForegroundColor Magenta
        }
        elseif ($key.Key -eq "Escape") {
            break
        }
    }
    
    Start-Sleep -Milliseconds 50
}

Write-Host ""
Write-Host ""
Write-Host "=============================================="
Write-Host "         CAPTURED COORDINATES"
Write-Host "=============================================="

for ($i = 0; $i -lt $captured.Count; $i++) {
    $c = $captured[$i]
    Write-Host ""
    Write-Host "Point $($i + 1):" -ForegroundColor Cyan
    Write-Host "  Screen:            ($($c.ScreenX), $($c.ScreenY))"
    Write-Host "  Relative to Window: ($($c.RelWindowX), $($c.RelWindowY))" -ForegroundColor Green
    if ($c.RelRefX -ne "-") {
        Write-Host "  Relative to Ref:   ($($c.RelRefX), $($c.RelRefY))" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=============================================="
Write-Host "HOW TO USE THESE VALUES:"
Write-Host "=============================================="
Write-Host ""
Write-Host "For MAIN WINDOW elements (search box, account, etc.):"
Write-Host "  Use 'Relative to Window' values" -ForegroundColor Green
Write-Host "  Example: SEARCH_BOX_X = $($captured[0].RelWindowX)" -ForegroundColor Green
Write-Host ""
Write-Host "For POPUP elements (functions, reload settings):"
Write-Host "  1. Press R when mouse is at popup's TOP-LEFT corner"
Write-Host "  2. Then capture buttons - use 'Relative to Ref' values" -ForegroundColor Yellow
Write-Host "  Example: POPUP_FUNCTIONS_X = $($captured[2].RelRefX)" -ForegroundColor Yellow
Write-Host "=============================================="
Write-Host ""
Read-Host "Press Enter to exit"

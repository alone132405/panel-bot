# ===========================================
# COORDINATE FINDER SCRIPT (with Relative Coordinates, no resize)
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
Write-Host "    COORDINATE FINDER (with Relative, no resize)"
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

# Keep the bot window exactly as-is so coordinate capture matches the live UI.
Write-Host "Using current bot window position and size. Resize/move it manually first if needed."
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
Write-Host "  SPACE  = Capture next named coordinate"
Write-Host "  R      = Set reference point (for popup)"
Write-Host "  ESC    = Exit"
Write-Host ""
Write-Host "Recommended capture order:"
Write-Host "  Main window: SEARCH_ICON, SEARCH_FIELD, FIRST_RESULT, OUTSIDE_POPUP"
Write-Host "  Popup: press R on popup top-left, then capture POPUP_FUNCTIONS, POPUP_RELOAD, CLOSE_SIGN"
Write-Host ""
Write-Host "Important: do not send Screen values. Send only the final NAME=x,y block."
Write-Host "=============================================="
Write-Host ""

$captured = @()
$referencePoint = $null
$referenceRelWindow = $null
$mainLabels = @("SEARCH_ICON", "SEARCH_FIELD", "FIRST_RESULT", "OUTSIDE_POPUP")
$popupLabels = @("POPUP_FUNCTIONS", "POPUP_RELOAD", "CLOSE_SIGN")
$mainCaptureIndex = 0
$popupCaptureIndex = 0

while ($true) {
    # Get current mouse position
    $point = New-Object Win32Helper+POINT
    [Win32Helper]::GetCursorPos([ref]$point) | Out-Null

    # Refresh the bot window position each loop so main-relative coordinates remain valid.
    [Win32Helper]::GetWindowRect($hwnd, [ref]$windowRect) | Out-Null
    
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
    $display = "DO NOT SEND Screen: ($($point.X), $($point.Y)) | Main relative: ($relX, $relY)"
    if ($referencePoint) {
        $display += " | Popup relative: ($refRelX, $refRelY)"
    }
    Write-Host "`r$display          " -NoNewline
    
    # Check for key press
    if ([System.Console]::KeyAvailable) {
        $key = [System.Console]::ReadKey($true)
        
        if ($key.Key -eq "Spacebar") {
            if ($referencePoint) {
                if ($popupCaptureIndex -lt $popupLabels.Count) {
                    $label = $popupLabels[$popupCaptureIndex]
                } else {
                    $label = "POPUP_EXTRA_$($popupCaptureIndex + 1)"
                }
                $useX = $refRelX
                $useY = $refRelY
                $source = "Popup relative"
                $popupCaptureIndex++
            } else {
                if ($mainCaptureIndex -lt $mainLabels.Count) {
                    $label = $mainLabels[$mainCaptureIndex]
                } else {
                    $label = "MAIN_EXTRA_$($mainCaptureIndex + 1)"
                }
                $useX = $relX
                $useY = $relY
                $source = "Main relative"
                $mainCaptureIndex++
            }

            $entry = @{
                Label = $label
                UseX = $useX
                UseY = $useY
                Source = $source
                ScreenX = $point.X
                ScreenY = $point.Y
                RelWindowX = $relX
                RelWindowY = $relY
                RelRefX = $refRelX
                RelRefY = $refRelY
            }
            $captured += $entry
            Write-Host ""
            Write-Host ">>> CAPTURED $label from $source" -ForegroundColor Green
            Write-Host "    USE: $label=$useX,$useY" -ForegroundColor Green
            Write-Host "    Diagnostic only, do not send: Screen=($($point.X),$($point.Y))" -ForegroundColor DarkGray
        }
        elseif ($key.Key -eq "R") {
            $referencePoint = @{ X = $point.X; Y = $point.Y }
            $referenceRelWindow = @{ X = $relX; Y = $relY }
            $popupCaptureIndex = 0
            Write-Host ""
            Write-Host ">>> REFERENCE POINT SET: ($($point.X), $($point.Y))" -ForegroundColor Magenta
            Write-Host "    USE: POPUP_ANCHOR=$relX,$relY" -ForegroundColor Green
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
    Write-Host "$($c.Label):" -ForegroundColor Cyan
    Write-Host "  USE: $($c.Label)=$($c.UseX),$($c.UseY)" -ForegroundColor Green
    Write-Host "  Source: $($c.Source)"
    Write-Host "  Screen diagnostic only: ($($c.ScreenX), $($c.ScreenY))" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "=============================================="
Write-Host "COPY THIS BLOCK TO CHAT:"
Write-Host "=============================================="
if ($referenceRelWindow) {
    Write-Host "POPUP_ANCHOR=$($referenceRelWindow.X),$($referenceRelWindow.Y)" -ForegroundColor Green
}
foreach ($c in $captured) {
    Write-Host "$($c.Label)=$($c.UseX),$($c.UseY)" -ForegroundColor Green
}
Write-Host "=============================================="
Write-Host ""
Read-Host "Press Enter to exit"

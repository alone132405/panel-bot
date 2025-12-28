Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class Win32 {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
    
    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }
}
"@

while ($true) {
    $hwnd = [Win32]::GetForegroundWindow()
    $sb = New-Object System.Text.StringBuilder 256
    [Win32]::GetWindowText($hwnd, $sb, 256) | Out-Null
    
    $rect = New-Object Win32+RECT
    [Win32]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
    
    $pos = [System.Windows.Forms.Cursor]::Position
    
    # Calculate relative coordinates
    $relX = $pos.X - $rect.Left
    $relY = $pos.Y - $rect.Top
    
    Write-Host "Window: $($sb.ToString())" -ForegroundColor Cyan
    Write-Host "Screen Pos: ($($pos.X), $($pos.Y)) | Window Relative: ($relX, $relY)" -NoNewline
    Write-Host "`r" -NoNewline
    
    Start-Sleep -Milliseconds 200
}

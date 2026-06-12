while ($true) {
    $proc = Get-Process -Name "LordsMobileBot" -ErrorAction SilentlyContinue
    if (!$proc) {
        Write-Host "Bot closed! Copying new LoginHook.dll..."
        Copy-Item "I:\LordsBot-Release-bot\LoginHook\bin\Release\net8.0-windows\LoginHook.dll" "I:\LordsBot-Release-bot\LoginHook.dll" -Force
        if ($?) {
            Write-Host "Success! New LoginHook.dll is installed."
        } else {
            Write-Host "Failed to copy."
        }
        break
    }
    Start-Sleep -Seconds 2
}

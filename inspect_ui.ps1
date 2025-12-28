Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

Write-Host "Searching for Lords Mobile Bot..."
$proc = Get-Process | Where-Object { $_.MainWindowTitle -like "*Lords Mobile Bot*" } | Select-Object -First 1

if (!$proc) { 
    Write-Host "ERROR: Bot not found. Please open it." -ForegroundColor Red
    exit 
}

Write-Host "Found Window: $($proc.MainWindowTitle)" -ForegroundColor Green

try {
    $root = [System.Windows.Automation.AutomationElement]::FromHandle($proc.MainWindowHandle)
    
    # Function to print element tree
    function Dump-Tree($element, $indent) {
        $children = $element.FindAll([System.Windows.Automation.TreeScope]::Children, [System.Windows.Automation.Condition]::TrueCondition)
        
        foreach ($child in $children) {
            $name = $child.Current.Name
            $type = $child.Current.LocalizedControlType
            
            if ([string]::IsNullOrWhiteSpace($name)) { $name = "[No Name]" }
            
            Write-Host "$indent [$type] $name"
            
            # Don't recurse too deep
            if ($indent.Length -lt 6) {
                Dump-Tree $child "$indent  "
            }
        }
    }

    Write-Host "`nScanning UI Elements (this might take a moment)..."
    Dump-Tree $root ""

} catch {
    Write-Host "Error scanning UI: $_" -ForegroundColor Red
}

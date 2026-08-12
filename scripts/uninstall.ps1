$installDir = "$env:LOCALAPPDATA\USBSound"

Write-Host "Starting USB Sound Notifier uninstallation..." -ForegroundColor Cyan

$process = Get-Process -Name "usbsound" -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Name "usbsound" -Force
    Write-Host "[v] Application (usbsound) stopped successfully." -ForegroundColor Green
}

$registryPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$regName = "USBSoundDaemon"
try {
    Remove-ItemProperty -Path $registryPath -Name $regName -ErrorAction Stop
    Write-Host "[v] Application removed from Windows Startup." -ForegroundColor Green
}
catch {
    Write-Host "[v] Startup key not found or already removed." -ForegroundColor Yellow
}

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -like "*$installDir*") {
    $newPath = ($userPath -split ';' | Where-Object { $_ -ne $installDir -and $_ -ne "" }) -join ';'
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "[v] Application directory removed from PATH." -ForegroundColor Green
}
else {
    Write-Host "[v] Application directory not found in PATH." -ForegroundColor Yellow
}

if (Test-Path $installDir) {
    Remove-Item -Path $installDir -Recurse -Force
    Write-Host "[v] Installation directory $installDir removed successfully." -ForegroundColor Green
}

Write-Host "`nUninstallation Complete! USB Sound Notifier has been removed from your system." -ForegroundColor Cyan
Start-Sleep -Seconds 3

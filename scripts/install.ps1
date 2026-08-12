$installDir = "$env:LOCALAPPDATA\USBSound"
$exeName = "usbsound.exe"
$targetExe = "$installDir\$exeName"

Write-Host "Starting USB Sound Notifier installation..." -ForegroundColor Cyan

if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
    Write-Host "[v] Directory $installDir created successfully." -ForegroundColor Green
}

if (Test-Path ".\dist\usbsound-win.exe") {
    Copy-Item ".\dist\usbsound-win.exe" -Destination $targetExe -Force
    Write-Host "[v] Application copied successfully." -ForegroundColor Green
} else {
    Write-Host "[x] File dist\usbsound-win.exe not found. Please build the application first." -ForegroundColor Red
    exit
}

$registryPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$regName = "USBSoundDaemon"
$regValue = "`"$targetExe`" start"
Set-ItemProperty -Path $registryPath -Name $regName -Value $regValue
Write-Host "[v] Application added to Windows Startup." -ForegroundColor Green

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$installDir*") {
    $newPath = $userPath + ";$installDir"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "[v] Application directory added to PATH." -ForegroundColor Green
} else {
    Write-Host "[v] Application directory is already in PATH." -ForegroundColor Yellow
}

Write-Host "`nInstallation Complete! You can now use the 'usbsound' command in CMD/PowerShell." -ForegroundColor Cyan
Write-Host "The application will also run automatically in the background (start parameter) on Windows startup." -ForegroundColor Cyan

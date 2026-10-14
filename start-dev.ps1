# VaxiTrack AI PowerShell Dev Launcher
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Starting VaxiTrack AI Dev Server..." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot
& "C:\Program Files\nodejs\npm.cmd" run dev

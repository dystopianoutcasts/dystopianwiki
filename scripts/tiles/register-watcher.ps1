<#
.SYNOPSIS
  T52: register the render watcher as a Windows scheduled task for the current user.

.DESCRIPTION
  Creates (or replaces) the scheduled task "OutcastAurora map watcher", which runs
  scripts/tiles/watch-rebuild.ps1 hidden at logon of the current user, with
  -ExecutionPolicy Bypass, no time limit, one instance at a time, and up to 3 restarts a
  minute apart when it fails. It never creates, reads or writes the key file: the owner
  creates %USERPROFILE%\.aurora\watcher.key first (deploy.md, "Rebuild from the admin page").

  Run from the repo root:
    powershell -ExecutionPolicy Bypass -File scripts/tiles/register-watcher.ps1

.PARAMETER DryRun
  Build the task definition and print it without registering anything.
#>
param([switch]$DryRun)

$ErrorActionPreference = 'Stop'
$TaskName = 'OutcastAurora map watcher'
$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Watcher = Join-Path $PSScriptRoot 'watch-rebuild.ps1'
if (-not (Test-Path -LiteralPath $Watcher)) { throw "watcher script not found: $Watcher" }
$User = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

$arguments = "-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$Watcher`""
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $arguments -WorkingDirectory $Repo
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $User
$settings = New-ScheduledTaskSettingsSet -Hidden -MultipleInstances IgnoreNew `
  -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit ([TimeSpan]::Zero) -StartWhenAvailable `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId $User -LogonType Interactive -RunLevel Limited

Write-Host "task:      $TaskName"
Write-Host "user:      $User (at logon, hidden, limited rights)"
Write-Host "runs:      powershell.exe $arguments"
Write-Host "in:        $Repo"
Write-Host 'restarts:  3 times, 1 minute apart, on failure; no time limit; one instance'

if ($DryRun) {
  Write-Host 'dry run: nothing registered'
  return
}

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
  -Description 'OutcastAurora: renders and publishes the live map when an admin presses Rebuild map (T52). Log: %USERPROFILE%\.aurora\watcher.log' `
  -Force | Out-Null

Write-Host ''
Write-Host "registered. It starts at your next logon. From PowerShell:"
Write-Host "  start now:  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "  stop:       Stop-ScheduledTask -TaskName '$TaskName'"
Write-Host "  status:     Get-ScheduledTask -TaskName '$TaskName' | Get-ScheduledTaskInfo"
Write-Host "  remove:     Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
Write-Host "From Git Bash:"
Write-Host "  start now:  schtasks //Run //TN '$TaskName'"
Write-Host "  stop:       schtasks //End //TN '$TaskName'"
Write-Host "  remove:     schtasks //Delete //TN '$TaskName' //F"
Write-Host "Log: $env:USERPROFILE\.aurora\watcher.log"

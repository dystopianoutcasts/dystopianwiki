<#
.SYNOPSIS
  T52: the render watcher. Polls for admin-requested map rebuilds and runs them on this PC.

.DESCRIPTION
  Every -IntervalSeconds (60): checks the key file's permissions, reads the Supabase service
  role key from it, calls aurora.claim_map_rebuild(<hostname>), and when a request comes
  back runs `npx tsx scripts/tiles/rebuild-map.ts --request-file <file> --worker <hostname>`
  from the repo root and waits for it (a render takes about 40 minutes). rebuild-map.ts
  sends the heartbeats and the final finish_map_rebuild itself.

  The key file lives OUTSIDE every repo: %USERPROFILE%\.aurora\watcher.key, one line. The
  owner creates it once (deploy.md, "Rebuild from the admin page"). The watcher refuses to
  start when anyone but the current user has access to it, never logs the key, never
  writes it anywhere, and hands it to rebuild-map.ts only through the AURORA_SERVICE_KEY
  environment variable of that one child process.

  Log: %USERPROFILE%\.aurora\watcher.log, rotated to watcher.log.1 at 5 MB.
  Single instance: %USERPROFILE%\.aurora\watcher.lock is held open for the process's life.
  Network errors are logged and retried on the next poll.

.PARAMETER Once
  Poll once and exit (a by-hand check).

.PARAMETER CheckKeyOnly
  Check the key file's permissions and exit (0 ok, 2 refused). Never reads the key.
#>
param(
  [string]$StateDir = (Join-Path $env:USERPROFILE '.aurora'),
  [string]$KeyPath = '',
  [string]$SupabaseUrl = 'https://gwubcipchkwthsorhcky.supabase.co',
  [int]$IntervalSeconds = 60,
  [switch]$Once,
  [switch]$CheckKeyOnly
)

$ErrorActionPreference = 'Stop'
if (-not $KeyPath) { $KeyPath = Join-Path $StateDir 'watcher.key' }
$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$LogPath = Join-Path $StateDir 'watcher.log'
$LockPath = Join-Path $StateDir 'watcher.lock'
$RequestPath = Join-Path $StateDir 'request.json'
$MaxLogBytes = 5MB
$Worker = $env:COMPUTERNAME
$script:Secret = $null
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Hide-Secret([string]$Text) {
  if ($script:Secret -and $script:Secret.Length -ge 8 -and $Text) { return $Text.Replace($script:Secret, '[redacted]') }
  return $Text
}

function Write-Log([string]$Message) {
  $line = '[{0}] {1}' -f ([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')), (Hide-Secret $Message)
  try {
    if ((Test-Path -LiteralPath $LogPath) -and ((Get-Item -LiteralPath $LogPath).Length -gt $MaxLogBytes)) {
      Move-Item -LiteralPath $LogPath -Destination "$LogPath.1" -Force
    }
    [System.IO.File]::AppendAllText($LogPath, $line + "`r`n")
  } catch {
    # A log write must never stop the watcher.
  }
  Write-Host $line
}

# Only the current user may have any access to the key file: no inherited entries, no
# SYSTEM, no Administrators, no Everyone. Reads the security descriptor, never the content.
function Test-KeyFileAcl([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    return "key file not found: $Path (the owner creates it once; deploy.md, Rebuild from the admin page)"
  }
  $me = [System.Security.Principal.WindowsIdentity]::GetCurrent()
  $fix = ("Fix: icacls `"{0}`" /inheritance:r /grant:r `"{1}:F`"" -f $Path, $env:USERNAME)
  try { $acl = Get-Acl -LiteralPath $Path }
  catch { return ("cannot read the permissions of the key file ({0}); refusing. {1}" -f $_.Exception.Message, $fix) }
  $mine = $false
  foreach ($rule in $acl.Access) {
    # An inherited entry is refused even when it is the current user's: the folder's
    # inheritance can widen later. The key file must carry only explicit entries.
    if ($rule.IsInherited) {
      return ("key file has an inherited permission entry ({0}); only explicit entries for {1} are allowed. {2}" -f $rule.IdentityReference.Value, $me.Name, $fix)
    }
    try { $sid = $rule.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value }
    catch { $sid = $rule.IdentityReference.Value }
    if ($sid -ne $me.User.Value) {
      return ("key file is accessible to {0}; only {1} may have access. {2}" -f $rule.IdentityReference.Value, $me.Name, $fix)
    }
    if ($rule.AccessControlType -eq 'Allow') { $mine = $true }
  }
  if (-not $mine) { return "key file grants the current user no access: $Path" }
  return $null
}

function Read-Key {
  $k = ([System.IO.File]::ReadAllText($KeyPath)).Trim()
  if (-not $k) { throw 'the key file is empty' }
  return $k
}

function Invoke-Rpc([string]$Key, [string]$Fn, [hashtable]$Body) {
  $headers = @{
    'apikey'          = $Key
    'Authorization'   = "Bearer $Key"
    'Content-Profile' = 'aurora'
    'Accept-Profile'  = 'aurora'
  }
  $json = $Body | ConvertTo-Json -Compress -Depth 5
  return Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$SupabaseUrl/rest/v1/rpc/$Fn" -Headers $headers `
    -ContentType 'application/json' -Body ([System.Text.Encoding]::UTF8.GetBytes($json)) -TimeoutSec 30
}

function Invoke-Rebuild([string]$Key, [string]$RowJson, $Id) {
  [System.IO.File]::WriteAllText($RequestPath, $RowJson, (New-Object System.Text.UTF8Encoding($false)))
  Write-Log "request #$Id claimed; running rebuild-map.ts"
  $code = 1
  $env:AURORA_SERVICE_KEY = $Key
  $prev = $ErrorActionPreference
  Push-Location $Repo
  try {
    # Continue: in Windows PowerShell a native command's stderr arrives as error records.
    $ErrorActionPreference = 'Continue'
    & npx.cmd tsx scripts/tiles/rebuild-map.ts --request-file $RequestPath --worker $Worker 2>&1 |
      ForEach-Object { Write-Log ('  ' + $_) }
    $code = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $prev
    Remove-Item Env:AURORA_SERVICE_KEY -ErrorAction SilentlyContinue
    Pop-Location
    Remove-Item -LiteralPath $RequestPath -ErrorAction SilentlyContinue
  }
  Write-Log "request #${Id}: rebuild-map.ts exited $code"
  # 0 done, 1 failed (already reported), 3 stopped (cancelled or expired). Anything else
  # means it died before reporting; close the request so the admin page does not wait for
  # the 120-minute expiry. A request already closed answers false and is left alone.
  if ($code -ne 0 -and $code -ne 1 -and $code -ne 3) {
    try {
      Invoke-Rpc $Key 'finish_map_rebuild' @{ p_id = $Id; p_status = 'failed'; p_log = "watcher: rebuild-map.ts exited $code without reporting; see watcher.log on $Worker"; p_commit_sha = $null } | Out-Null
    } catch { Write-Log ("could not mark request #$Id failed: " + $_.Exception.Message) }
  }
}

if (-not (Test-Path -LiteralPath $StateDir)) { New-Item -ItemType Directory -Path $StateDir | Out-Null }

$aclError = Test-KeyFileAcl $KeyPath
if ($CheckKeyOnly) {
  if ($aclError) { Write-Host "refused: $aclError"; exit 2 }
  Write-Host "key file permissions ok: $KeyPath"
  exit 0
}

try {
  $lock = [System.IO.File]::Open($LockPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
} catch {
  Write-Host "another watcher holds $LockPath; exiting"
  exit 0
}

try {
  if ($aclError) { Write-Log "refusing to start: $aclError"; exit 2 }
  Write-Log "watcher started on $Worker (repo $Repo, every $IntervalSeconds s)"
  while ($true) {
    $key = $null
    try {
      $aclError = Test-KeyFileAcl $KeyPath
      if ($aclError) { Write-Log "refusing to continue: $aclError"; exit 2 }
      $key = Read-Key
      $script:Secret = $key
      $resp = Invoke-Rpc $key 'claim_map_rebuild' @{ p_worker = $Worker }
      $content = [string]$resp.Content
      $rows = @((ConvertFrom-Json $content) | Where-Object { $null -ne $_ })
      if ($rows.Count -gt 0) {
        # The raw response (a one-row array) goes to rebuild-map.ts as is: re-serialising it
        # in Windows PowerShell can turn a one-element array into a scalar.
        Invoke-Rebuild $key $content $rows[0].id
      }
    } catch {
      Write-Log ("poll failed, retrying in $IntervalSeconds s: " + $_.Exception.Message)
    } finally {
      $key = $null
    }
    if ($Once) { break }
    Start-Sleep -Seconds $IntervalSeconds
  }
} finally {
  $script:Secret = $null
  $lock.Dispose()
}

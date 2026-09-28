<#
.SYNOPSIS
  Render the top-down base layer of the server's world with pzmap2dzi.

.DESCRIPTION
  Writes a pzmap2dzi config from pzmap2dzi.conf.template.yaml, runs deploy, unpack
  and `render base_top`, then prints tile counts and bytes per pyramid level for
  layer 0 and refuses (exit 2) if the pyramid exceeds -BudgetGB.

  pzmap2dzi is third-party code cloned OUTSIDE this repo. The commit T04 rendered
  with is pinned below; a different checkout only warns.

.EXAMPLE
  ./scripts/tiles/render.ps1 -GamePath R:\Games\Steam\steamapps\common\ProjectZomboid -Out R:\tmp\pzmap2dzi\out
#>
param(
  [Parameter(Mandatory)][string]$GamePath,
  [Parameter(Mandatory)][string]$Out,
  [string]$ModRoot = '',
  [string]$RepoPath = 'R:\tmp\pzmap2dzi\repo',
  [string]$Python = 'R:\tmp\pzmap2dzi\venv\Scripts\python.exe',
  # Drop this many of the deepest pyramid levels (each halves resolution, ~4x fewer bytes).
  [int]$OmitLevels = 0,
  [double]$BudgetGB = 9.5,
  # Write the config, print its path and stop. For checking the config without a 30 minute render.
  [switch]$ConfigOnly
)

$ErrorActionPreference = 'Stop'
$PinnedCommit = '5025122c1a6de655122d79ef84dfcb40a632ea68'

if (-not (Test-Path -LiteralPath (Join-Path $GamePath 'media'))) { throw "GamePath has no media folder: $GamePath" }
if (-not (Test-Path -LiteralPath $Python)) { throw "pzmap2dzi venv python not found: $Python" }
if (-not (Test-Path -LiteralPath (Join-Path $RepoPath 'main.py'))) { throw "pzmap2dzi clone not found: $RepoPath" }
if (-not $ModRoot) { $ModRoot = Join-Path (Split-Path (Split-Path $GamePath)) 'workshop\content\108600' }

$head = (& git -C $RepoPath rev-parse HEAD).Trim()
if ($head -ne $PinnedCommit) { Write-Warning "pzmap2dzi is at $head, not the pinned $PinnedCommit. Results may differ from T04." }

$fwd = { param($p) [System.IO.Path]::GetFullPath($p).Replace([string][char]92, '/') }
$conf = (Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'pzmap2dzi.conf.template.yaml')).
  Replace('{{PZ_ROOT}}', (& $fwd $GamePath)).
  Replace('{{OUT}}', (& $fwd $Out)).
  Replace('{{MOD_ROOT}}', (& $fwd $ModRoot)).
  Replace('{{OMIT_LEVELS}}', "$OmitLevels")
$confPath = Join-Path $RepoPath 'conf\aurora-render.yaml'
# .NET write: Windows PowerShell 5.1 Set-Content -Encoding utf8 adds a BOM, which the YAML loader may reject.
[System.IO.File]::WriteAllText($confPath, $conf, (New-Object System.Text.UTF8Encoding($false)))
if ($ConfigOnly) { Write-Host "config written: $confPath"; return }

$clock = [System.Diagnostics.Stopwatch]::StartNew()
Push-Location $RepoPath
try {
  foreach ($step in @(@('deploy'), @('unpack'), @('render', 'base_top'))) {
    Write-Host "== pzmap2dzi $($step -join ' ')"
    & $Python main.py -c 'conf/aurora-render.yaml' @step
    if ($LASTEXITCODE -ne 0) { throw "pzmap2dzi $($step -join ' ') failed with exit code $LASTEXITCODE" }
  }
} finally { Pop-Location }
Write-Host ("render finished in {0:N0} s" -f $clock.Elapsed.TotalSeconds)

$layer0 = Join-Path $Out 'html\map_data\base_top\layer0_files'
if (-not (Test-Path -LiteralPath $layer0)) { throw "expected pyramid missing: $layer0" }
$totalBytes = 0L
Write-Host 'layer 0: level, tiles, MB'
foreach ($lv in (Get-ChildItem -LiteralPath $layer0 -Directory | Sort-Object { [int]$_.Name })) {
  $files = Get-ChildItem -LiteralPath $lv.FullName -File
  $bytes = ($files | Measure-Object Length -Sum).Sum
  $totalBytes += $bytes
  Write-Host ('{0,5} {1,7} {2,9:N2}' -f $lv.Name, $files.Count, ($bytes / 1MB))
}
Write-Host ('layer 0 total: {0:N1} MB' -f ($totalBytes / 1MB))

$all = (Get-ChildItem -LiteralPath (Join-Path $Out 'html\map_data\base_top') -Recurse -File | Measure-Object Length -Sum).Sum
if ($all / 1GB -gt $BudgetGB) {
  Write-Host ('pyramid is {0:N2} GB, over the {1} GB budget. Re-run with a higher -OmitLevels.' -f ($all / 1GB), $BudgetGB) -ForegroundColor Red
  exit 2
}
Write-Host ('all floors: {0:N1} MB (budget {1} GB): ok' -f ($all / 1MB), $BudgetGB)

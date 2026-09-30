<#
.SYNOPSIS
  Render the top-down base layer of the server's world with pzmap2dzi.

.DESCRIPTION
  Writes a pzmap2dzi config from pzmap2dzi.conf.template.yaml, runs deploy, unpack
  and `render base_top`, then prints tile counts and bytes per pyramid level for
  layer 0 and refuses (exit 2) if the pyramid exceeds -BudgetGB.

  -ModMaps renders each named map (see scripts/tiles/describe-mod-maps.ts and
  mod-maps/) as an extra pyramid at html/map_data/mod_maps/<name>/<Layer>, sharing
  the base grid (dzi_cell_range: all_mod_maps for every map, set in the template).
  After the render, every pyramid's map_info.json geometry is printed side by side
  and compared to the base's; a mismatch refuses with exit 3. The combined cell
  union is then checked against the 128-cell (32,768 square) gate that keeps the
  pyramid from gaining a level; over that gate refuses with exit 4.

  pzmap2dzi is third-party code cloned OUTSIDE this repo. The commit T04 rendered
  with is pinned below; a different checkout only warns.

.EXAMPLE
  ./scripts/tiles/render.ps1 -GamePath R:\Games\Steam\steamapps\common\ProjectZomboid -Out R:\tmp\pzmap2dzi\out

.EXAMPLE
  ./scripts/tiles/render.ps1 -GamePath R:\Games\Steam\steamapps\common\ProjectZomboid -Out R:\tmp\pzmap2dzi\out-t45 -ModMaps sd_cc

.NOTES
  Two commands take a render from nothing to published:
    ./scripts/tiles/render.ps1 -GamePath <pz install> -Out <out dir>
    npx tsx scripts/tiles/publish-tiles.ts --from <out dir>\html\map_data\base_top --to <aurora-site clone>
#>
param(
  [Parameter(Mandatory)][string]$GamePath,
  [Parameter(Mandatory)][string]$Out,
  [string]$ModRoot = '',
  [string]$RepoPath = 'R:\tmp\pzmap2dzi\repo',
  [string]$Python = 'R:\tmp\pzmap2dzi\venv\Scripts\python.exe',
  # pzmap2dzi's own layer registry (render.py RENDER_CMD): base_top is the ground-floor
  # tile pyramid T04 already renders; zombie_top is the static spawn-density layer (T22
  # Part C). Both use the same TopDZI geometry, so nothing else here needs to change.
  [string]$Layer = 'base_top',
  # Drop this many of the deepest pyramid levels (each halves resolution, ~4x fewer bytes).
  [int]$OmitLevels = 0,
  [double]$BudgetGB = 9.5,
  # Map names (pzmap2dzi map_conf keys), in Map= order, vanilla excluded. Each one needs
  # its own map_conf entry - see scripts/tiles/describe-mod-maps.ts and mod-maps/. Every
  # entry renders as a SEPARATE pyramid at html/map_data/mod_maps/<name>/<Layer>, sharing
  # the base grid because the template sets dzi_cell_range: all_mod_maps for every map.
  [string[]]$ModMaps = @(),
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
$modMapsConfDir = Join-Path $PSScriptRoot 'mod-maps'
# YAML flow sequence, e.g. ['sd_cc'] or [] when no mod maps are rendered (falsy in the
# Python reader, same as the key being absent - the vanilla-only path is unchanged).
# @(...) forces array semantics even for a single -ModMaps value, where the pipeline
# would otherwise unwrap to a bare scalar and break -join.
$modMapNames = @($ModMaps | ForEach-Object { "'$_'" })
$modMapsYaml = '[' + ($modMapNames -join ', ') + ']'
$conf = (Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'pzmap2dzi.conf.template.yaml')).
  Replace('{{PZ_ROOT}}', (& $fwd $GamePath)).
  Replace('{{OUT}}', (& $fwd $Out)).
  Replace('{{MOD_ROOT}}', (& $fwd $ModRoot)).
  Replace('{{OMIT_LEVELS}}', "$OmitLevels").
  Replace('{{MOD_MAPS_CONF}}', (& $fwd $modMapsConfDir)).
  Replace('{{MOD_MAPS}}', $modMapsYaml)
$confPath = Join-Path $RepoPath 'conf\aurora-render.yaml'
# .NET write: Windows PowerShell 5.1 Set-Content -Encoding utf8 adds a BOM, which the YAML loader may reject.
[System.IO.File]::WriteAllText($confPath, $conf, (New-Object System.Text.UTF8Encoding($false)))
if ($ConfigOnly) { Write-Host "config written: $confPath"; return }

$clock = [System.Diagnostics.Stopwatch]::StartNew()
# make-tiles-json.ts reads these two files back from the render root (the
# parent of -Out) to fill tiles.json's source.renderedAt / renderSeconds.
$renderRoot = Split-Path $Out
if (-not (Test-Path -LiteralPath $renderRoot)) { New-Item -ItemType Directory -Path $renderRoot | Out-Null }
[System.IO.File]::WriteAllText((Join-Path $renderRoot 'render-start.txt'), [DateTimeOffset]::UtcNow.ToUnixTimeSeconds())
Push-Location $RepoPath
try {
  foreach ($step in @(@('deploy'), @('unpack'), @('render', $Layer))) {
    Write-Host "== pzmap2dzi $($step -join ' ')"
    & $Python main.py -c 'conf/aurora-render.yaml' @step
    if ($LASTEXITCODE -ne 0) { throw "pzmap2dzi $($step -join ' ') failed with exit code $LASTEXITCODE" }
  }
} finally { Pop-Location }
[System.IO.File]::WriteAllText((Join-Path $renderRoot 'render-end.txt'), [DateTimeOffset]::UtcNow.ToUnixTimeSeconds())
Write-Host ("render finished in {0:N0} s" -f $clock.Elapsed.TotalSeconds)

$layer0 = Join-Path $Out "html\map_data\$Layer\layer0_files"
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

# --- geometry: every pyramid (base and each mod overlay) shares dzi_cell_range:
# all_mod_maps, so they must all come out with the same width, height, cell origin
# and pyramid depth - that IS what "one more tile layer on the base grid" means. A
# mismatch here means a pyramid was built against a different cell union (stale
# config, a map missing from map_conf, etc.) and must not be published.
function Get-PyramidGeometry([string]$PyramidDir) {
  $infoPath = Join-Path $PyramidDir 'map_info.json'
  if (-not (Test-Path -LiteralPath $infoPath)) { throw "expected map_info.json missing: $infoPath" }
  $info = Get-Content -Raw -LiteralPath $infoPath | ConvertFrom-Json
  $levelsDir = Join-Path $PyramidDir 'layer0_files'
  if (-not (Test-Path -LiteralPath $levelsDir)) { throw "expected pyramid missing: $levelsDir" }
  $levels = @(Get-ChildItem -LiteralPath $levelsDir -Directory | ForEach-Object { [int]$_.Name } | Sort-Object)
  [PSCustomObject]@{
    w = $info.w; h = $info.h; x0 = $info.x0; y0 = $info.y0
    cellSize = $info.cell_size
    levelCount = $levels.Count
    levels = $levels
  }
}

$baseGeom = Get-PyramidGeometry (Join-Path $Out "html\map_data\$Layer")
Write-Host 'geometry: pyramid, w, h, x0, y0, levels'
Write-Host ('{0,-12} {1,6} {2,6} {3,6} {4,6} {5,6}' -f 'base', $baseGeom.w, $baseGeom.h, $baseGeom.x0, $baseGeom.y0, $baseGeom.levelCount)
$geometryMismatch = $false
foreach ($modMapName in $ModMaps) {
  $modGeom = Get-PyramidGeometry (Join-Path $Out "html\map_data\mod_maps\$modMapName\$Layer")
  Write-Host ('{0,-12} {1,6} {2,6} {3,6} {4,6} {5,6}' -f $modMapName, $modGeom.w, $modGeom.h, $modGeom.x0, $modGeom.y0, $modGeom.levelCount)
  if ($modGeom.w -ne $baseGeom.w -or $modGeom.h -ne $baseGeom.h -or
      $modGeom.x0 -ne $baseGeom.x0 -or $modGeom.y0 -ne $baseGeom.y0 -or
      $modGeom.levelCount -ne $baseGeom.levelCount -or
      (Compare-Object $modGeom.levels $baseGeom.levels)) {
    Write-Host "geometry mismatch: $modMapName differs from base" -ForegroundColor Red
    $geometryMismatch = $true
  }
}
if ($geometryMismatch) {
  Write-Host 'a mod pyramid does not share the base grid; not safe to publish as an overlay' -ForegroundColor Red
  exit 3
}

# --- 128-cell gate: at cell_size squares per cell (256 in B42), 128 cells is 32,768
# squares - the width at which the pyramid would gain a level (maxLevel = ceil(log2(w)))
# and break the owner's zoom numbers (T45 Facts). Checked on the base geometry because
# every map now shares the same all_mod_maps cell union.
$cellsWide = $baseGeom.w / $baseGeom.cellSize
$cellsHigh = $baseGeom.h / $baseGeom.cellSize
if ($cellsWide -gt 128 -or $cellsHigh -gt 128) {
  Write-Host ("cell union is {0} x {1} cells, over the 128-cell (32,768 square) gate; the pyramid would gain a level. STOP: do not publish." -f $cellsWide, $cellsHigh) -ForegroundColor Red
  exit 4
}
Write-Host ("cell union: {0} x {1} cells: within the 128-cell gate" -f $cellsWide, $cellsHigh)

$all = (Get-ChildItem -LiteralPath (Join-Path $Out "html\map_data\$Layer") -Recurse -File | Measure-Object Length -Sum).Sum
if ($all / 1GB -gt $BudgetGB) {
  Write-Host ('pyramid is {0:N2} GB, over the {1} GB budget. Re-run with a higher -OmitLevels.' -f ($all / 1GB), $BudgetGB) -ForegroundColor Red
  exit 2
}
Write-Host ('all floors: {0:N1} MB (budget {1} GB): ok' -f ($all / 1MB), $BudgetGB)

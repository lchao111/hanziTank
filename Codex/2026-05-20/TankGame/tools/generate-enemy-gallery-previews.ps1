[CmdletBinding()]
param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $ProjectRoot "assets/sprites/enemies/gallery"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

function Resolve-AssetPath {
  param([string]$RelativePath)
  return Join-Path $ProjectRoot ($RelativePath -replace "/", [IO.Path]::DirectorySeparatorChar)
}

$sources = @{
  enemyTank = @{
    Path = "assets/sprites/enemies/enemy-tank-spritesheet.png"
    FrameWidth = 224
    FrameHeight = 144
    Columns = 4
  }
  regularEnemyTank = @{
    Path = "assets/sprites/enemies/regular-enemy-tank-spritesheet.png"
    FrameWidth = 469
    FrameHeight = 300
    Columns = 6
  }
  regularInfantry = @{
    Path = "assets/sprites/enemies/regular-infantry-spritesheet.png"
    FrameWidth = 469
    FrameHeight = 300
    Columns = 6
  }
  grenadier = @{
    Path = "assets/sprites/enemies/grenadier-spritesheet.png"
    FrameWidth = 469
    FrameHeight = 300
    Columns = 6
  }
  bossTankDismantler = @{
    Path = "assets/sprites/enemies/tank-dismantler-spritesheet.png"
    FrameWidth = 224
    FrameHeight = 224
    Columns = 6
  }
}

function Get-SpritesheetFrame {
  param(
    [hashtable]$Source,
    [int]$Frame
  )

  $sourcePath = Resolve-AssetPath $Source.Path
  $sourceBitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
  try {
    $column = $Frame % $Source.Columns
    $row = [Math]::Floor($Frame / $Source.Columns)
    $sourceRect = [System.Drawing.Rectangle]::new(
      [int]($column * $Source.FrameWidth),
      [int]($row * $Source.FrameHeight),
      [int]$Source.FrameWidth,
      [int]$Source.FrameHeight
    )
    return $sourceBitmap.Clone($sourceRect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  }
  finally {
    $sourceBitmap.Dispose()
  }
}

function Trim-TransparentPixels {
  param([System.Drawing.Bitmap]$Bitmap)

  $minX = $Bitmap.Width
  $minY = $Bitmap.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $Bitmap.Height; $y += 1) {
    for ($x = 0; $x -lt $Bitmap.Width; $x += 1) {
      if ($Bitmap.GetPixel($x, $y).A -gt 10) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt $minX -or $maxY -lt $minY) {
    return $Bitmap.Clone([System.Drawing.Rectangle]::new(0, 0, $Bitmap.Width, $Bitmap.Height), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  }

  $padding = 8
  $left = [Math]::Max(0, $minX - $padding)
  $top = [Math]::Max(0, $minY - $padding)
  $right = [Math]::Min($Bitmap.Width - 1, $maxX + $padding)
  $bottom = [Math]::Min($Bitmap.Height - 1, $maxY + $padding)
  $rect = [System.Drawing.Rectangle]::new($left, $top, $right - $left + 1, $bottom - $top + 1)
  return $Bitmap.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

function Draw-FittedBitmap {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Bitmap]$Bitmap,
    [hashtable]$Placement
  )

  $targetX = [double]$Placement.X
  $targetY = [double]$Placement.Y
  $targetWidth = [double]$Placement.Width
  $targetHeight = [double]$Placement.Height
  $scale = [Math]::Min($targetWidth / $Bitmap.Width, $targetHeight / $Bitmap.Height)
  $drawWidth = $Bitmap.Width * $scale
  $drawHeight = $Bitmap.Height * $scale
  $drawX = $targetX + (($targetWidth - $drawWidth) / 2)
  $drawY = $targetY + (($targetHeight - $drawHeight) / 2)
  $dest = [System.Drawing.RectangleF]::new([float]$drawX, [float]$drawY, [float]$drawWidth, [float]$drawHeight)
  $Graphics.DrawImage($Bitmap, $dest)
}

function New-GalleryFrameCanvas {
  param(
    [hashtable]$Source,
    [int]$Frame,
    [array]$Placements
  )

  $frameBitmap = Get-SpritesheetFrame -Source $Source -Frame $Frame
  $trimmed = Trim-TransparentPixels -Bitmap $frameBitmap
  $canvas = [System.Drawing.Bitmap]::new(256, 192, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $canvas.SetResolution(96, 96)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    foreach ($placement in $Placements) {
      Draw-FittedBitmap -Graphics $graphics -Bitmap $trimmed -Placement $placement
    }
  }
  finally {
    $graphics.Dispose()
    $trimmed.Dispose()
    $frameBitmap.Dispose()
  }

  return $canvas
}

function New-GalleryPreview {
  param([hashtable]$Spec)

  $source = $sources[$Spec.Source]
  if (-not $source) { throw "Unknown source '$($Spec.Source)' for $($Spec.Output)." }

  $canvas = New-GalleryFrameCanvas -Source $source -Frame $Spec.Frame -Placements $Spec.Placements

  $outputPath = Join-Path $outputDir $Spec.Output
  try {
    $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $canvas.Dispose()
  }

  Write-Host "Generated $outputPath"
}

function New-GallerySheet {
  param([hashtable]$Spec)

  $source = $sources[$Spec.Source]
  if (-not $source) { throw "Unknown source '$($Spec.Source)' for $($Spec.Output)." }

  $columns = 4
  $frameWidth = 256
  $frameHeight = 192
  $rows = [Math]::Ceiling($Spec.Frames.Count / $columns)
  $sheet = [System.Drawing.Bitmap]::new($frameWidth * $columns, $frameHeight * $rows, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  try {
    $sheet.SetResolution(96, 96)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    for ($index = 0; $index -lt $Spec.Frames.Count; $index += 1) {
      $frameCanvas = New-GalleryFrameCanvas -Source $source -Frame $Spec.Frames[$index] -Placements $Spec.Placements
      try {
        $column = $index % $columns
        $row = [Math]::Floor($index / $columns)
        $graphics.DrawImage($frameCanvas, [System.Drawing.Rectangle]::new($column * $frameWidth, $row * $frameHeight, $frameWidth, $frameHeight))
      }
      finally {
        $frameCanvas.Dispose()
      }
    }
  }
  finally {
    $graphics.Dispose()
  }

  $outputPath = Join-Path $outputDir $Spec.Output
  try {
    $sheet.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $sheet.Dispose()
  }

  Write-Host "Generated $outputPath"
}

$singleWide = @(@{ X = 8; Y = 20; Width = 240; Height = 140 })
$singleInfantry = @(@{ X = 34; Y = 4; Width = 188; Height = 184 })
$droneSwarmPlacements = @(
  @{ X = 18; Y = 24; Width = 92; Height = 58 },
  @{ X = 146; Y = 24; Width = 92; Height = 58 },
  @{ X = 77; Y = 58; Width = 102; Height = 66 },
  @{ X = 34; Y = 112; Width = 82; Height = 52 },
  @{ X = 140; Y = 112; Width = 82; Height = 52 }
)
$wolfPackPlacements = @(
  @{ X = 4; Y = 68; Width = 124; Height = 76 },
  @{ X = 62; Y = 26; Width = 146; Height = 92 },
  @{ X = 132; Y = 82; Width = 120; Height = 74 }
)
$fleaSwarmPlacements = @(
  @{ X = 26; Y = 50; Width = 70; Height = 44 },
  @{ X = 96; Y = 28; Width = 76; Height = 48 },
  @{ X = 164; Y = 62; Width = 66; Height = 42 },
  @{ X = 54; Y = 120; Width = 62; Height = 40 },
  @{ X = 124; Y = 112; Width = 72; Height = 46 }
)

$previewSpecs = @(
  @{ Output = "tank-preview.png"; Source = "enemyTank"; Frame = 0; Placements = $singleWide },
  @{ Output = "armored-tank-preview.png"; Source = "regularEnemyTank"; Frame = 0; Placements = $singleWide },
  @{ Output = "self-destruct-truck-interim-preview.png"; Source = "regularEnemyTank"; Frame = 6; Placements = @(@{ X = 4; Y = 18; Width = 248; Height = 146 }) },
  @{ Output = "regular-soldier-preview.png"; Source = "regularInfantry"; Frame = 0; Placements = $singleInfantry },
  @{ Output = "grenadier-preview.png"; Source = "grenadier"; Frame = 0; Placements = $singleInfantry },
  @{ Output = "rpg-soldier-preview.png"; Source = "grenadier"; Frame = 6; Placements = @(@{ X = 24; Y = 4; Width = 208; Height = 184 }) },
  @{ Output = "heavy-soldier-preview.png"; Source = "regularInfantry"; Frame = 18; Placements = @(@{ X = 24; Y = 0; Width = 208; Height = 188 }) },
  @{ Output = "spring-soldier-interim-preview.png"; Source = "regularInfantry"; Frame = 1; Placements = @(@{ X = 32; Y = 0; Width = 192; Height = 188 }) },
  @{ Output = "drone-swarm-interim-preview.png"; Source = "enemyTank"; Frame = 1; Placements = $droneSwarmPlacements },
  @{ Output = "mechanical-wolf-pack-interim-preview.png"; Source = "regularEnemyTank"; Frame = 1; Placements = $wolfPackPlacements },
  @{ Output = "mechanical-fleas-interim-preview.png"; Source = "enemyTank"; Frame = 2; Placements = $fleaSwarmPlacements },
  @{ Output = "tank-dismantler-preview.png"; Source = "bossTankDismantler"; Frame = 0; Placements = @(@{ X = 28; Y = 0; Width = 200; Height = 190 }) }
)

$previewSpecs | ForEach-Object { New-GalleryPreview -Spec $_ }

$sheetSpecs = @(
  @{ Output = "self-destruct-truck-interim-spritesheet.png"; Source = "regularEnemyTank"; Frames = @(0, 1, 2, 3, 6, 7, 8, 9); Placements = @(@{ X = 4; Y = 18; Width = 248; Height = 146 }) },
  @{ Output = "spring-soldier-interim-spritesheet.png"; Source = "regularInfantry"; Frames = @(0, 1, 2, 3, 6, 7, 8, 9); Placements = @(@{ X = 32; Y = 0; Width = 192; Height = 188 }) },
  @{ Output = "drone-swarm-interim-spritesheet.png"; Source = "enemyTank"; Frames = @(0, 1, 2, 3, 4, 5, 6, 7); Placements = $droneSwarmPlacements },
  @{ Output = "mechanical-wolf-pack-interim-spritesheet.png"; Source = "regularEnemyTank"; Frames = @(0, 1, 2, 3, 6, 7, 8, 9); Placements = $wolfPackPlacements },
  @{ Output = "mechanical-fleas-interim-spritesheet.png"; Source = "enemyTank"; Frames = @(0, 1, 2, 3, 4, 5, 6, 7); Placements = $fleaSwarmPlacements }
)

$sheetSpecs | ForEach-Object { New-GallerySheet -Spec $_ }

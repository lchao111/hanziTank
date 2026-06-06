[CmdletBinding()]
param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $ProjectRoot "assets/sprites/enemies"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$source = @{
  Path = "assets/sprites/enemies/enemy-tank-spritesheet.png"
  FrameWidth = 224
  FrameHeight = 144
  Columns = 4
}

function Resolve-AssetPath {
  param([string]$RelativePath)
  return Join-Path $ProjectRoot ($RelativePath -replace "/", [IO.Path]::DirectorySeparatorChar)
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

  $padding = 6
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

function New-AccentColor {
  param([int]$Index)
  $colors = @(
    [System.Drawing.Color]::FromArgb(232, 250, 204, 21),
    [System.Drawing.Color]::FromArgb(232, 245, 158, 11),
    [System.Drawing.Color]::FromArgb(232, 251, 146, 60),
    [System.Drawing.Color]::FromArgb(232, 253, 224, 71),
    [System.Drawing.Color]::FromArgb(232, 234, 179, 8)
  )
  return $colors[$Index % $colors.Count]
}

function Draw-StateCue {
  param(
    [System.Drawing.Graphics]$Graphics,
    [array]$Placements,
    [string]$State,
    [int]$FrameIndex,
    [int]$VariantIndex
  )

  $accent = New-AccentColor $VariantIndex
  $pen = [System.Drawing.Pen]::new($accent, 3)
  $thinPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(190, 255, 247, 173), 2)
  $sparkPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(230, 255, 255, 220), 2)
  $brush = [System.Drawing.SolidBrush]::new($accent)
  $smokeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(78, 55, 65, 70))
  try {
    foreach ($placement in $Placements) {
      $cx = [float]($placement.X + $placement.Width * 0.5)
      $cy = [float]($placement.Y + $placement.Height * 0.42)
      $Graphics.FillEllipse($brush, $cx - 4, $cy - 4, 8, 8)
      if ($State -eq "charge") {
        $grow = 4 + $FrameIndex * 3
        $Graphics.DrawEllipse($pen, [float]($placement.X - $grow), [float]($placement.Y - $grow), [float]($placement.Width + $grow * 2), [float]($placement.Height + $grow * 2))
      }
      if ($State -eq "attack") {
        $Graphics.DrawLine($pen, $cx - 8, $cy, [float]($placement.X - 18 - $FrameIndex * 5), $cy)
        $Graphics.FillEllipse($brush, [float]($placement.X - 24 - $FrameIndex * 5), $cy - 4, 8, 8)
      }
      if ($State -eq "hit") {
        $Graphics.DrawLine($sparkPen, $cx - 16, $cy - 18, $cx - 4, $cy - 4)
        $Graphics.DrawLine($sparkPen, $cx + 12, $cy - 14, $cx + 1, $cy - 2)
        $Graphics.DrawLine($sparkPen, $cx - 4, $cy + 12, $cx + 12, $cy + 4)
      }
      if ($State -eq "death") {
        $Graphics.FillEllipse($smokeBrush, $cx - 22, $cy + 10, 44, 18)
        $Graphics.DrawLine($thinPen, $cx - 10, $cy, $cx - 28, $cy + 20)
        $Graphics.DrawLine($thinPen, $cx + 10, $cy, $cx + 28, $cy + 18)
      }
    }
    if ($State -eq "split") {
      $Graphics.DrawLine($thinPen, 128, 96, 52 - $FrameIndex * 4, 48 - $FrameIndex * 2)
      $Graphics.DrawLine($thinPen, 128, 96, 204 + $FrameIndex * 4, 48 - $FrameIndex * 2)
      $Graphics.DrawLine($thinPen, 128, 96, 62 - $FrameIndex * 3, 148 + $FrameIndex * 2)
      $Graphics.DrawLine($thinPen, 128, 96, 196 + $FrameIndex * 3, 148 + $FrameIndex * 2)
    }
  }
  finally {
    $pen.Dispose()
    $thinPen.Dispose()
    $sparkPen.Dispose()
    $brush.Dispose()
    $smokeBrush.Dispose()
  }
}

function New-DroneFrame {
  param(
    [int]$SourceFrame,
    [array]$Placements,
    [string]$State,
    [int]$FrameIndex,
    [int]$VariantIndex = 0
  )

  $frameBitmap = Get-SpritesheetFrame -Source $source -Frame $SourceFrame
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
    Draw-StateCue -Graphics $graphics -Placements $Placements -State $State -FrameIndex $FrameIndex -VariantIndex $VariantIndex
  }
  finally {
    $graphics.Dispose()
    $trimmed.Dispose()
    $frameBitmap.Dispose()
  }

  return $canvas
}

$swarmPlacements = @(
  @{ X = 18; Y = 24; Width = 92; Height = 58 },
  @{ X = 146; Y = 24; Width = 92; Height = 58 },
  @{ X = 77; Y = 58; Width = 102; Height = 66 },
  @{ X = 34; Y = 112; Width = 82; Height = 52 },
  @{ X = 140; Y = 112; Width = 82; Height = 52 }
)
$variantPlacements = @(
  @(@{ X = 76; Y = 42; Width = 108; Height = 78 }),
  @(@{ X = 70; Y = 34; Width = 118; Height = 84 }),
  @(@{ X = 82; Y = 36; Width = 100; Height = 80 }),
  @(@{ X = 74; Y = 50; Width = 112; Height = 72 }),
  @(@{ X = 66; Y = 32; Width = 126; Height = 88 })
)

$columns = 4
$rows = 11
$frameWidth = 256
$frameHeight = 192
$sheet = [System.Drawing.Bitmap]::new($columns * $frameWidth, $rows * $frameHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$sheetGraphics = [System.Drawing.Graphics]::FromImage($sheet)
try {
  $sheet.SetResolution(96, 96)
  $sheetGraphics.Clear([System.Drawing.Color]::Transparent)
  $bossRows = @(
    @{ State = "idle"; SourceStart = 0 },
    @{ State = "charge"; SourceStart = 0 },
    @{ State = "attack"; SourceStart = 4 },
    @{ State = "hit"; SourceStart = 8 },
    @{ State = "split"; SourceStart = 0 },
    @{ State = "death"; SourceStart = 12 }
  )

  for ($row = 0; $row -lt $bossRows.Count; $row += 1) {
    for ($column = 0; $column -lt $columns; $column += 1) {
      $spec = $bossRows[$row]
      $frame = New-DroneFrame -SourceFrame (($spec.SourceStart + $column) % 16) -Placements $swarmPlacements -State $spec.State -FrameIndex $column -VariantIndex $column
      try {
        $sheetGraphics.DrawImage($frame, [System.Drawing.Rectangle]::new($column * $frameWidth, $row * $frameHeight, $frameWidth, $frameHeight))
      }
      finally {
        $frame.Dispose()
      }
    }
  }

  $variantStates = @("idle", "attack", "hit", "death")
  for ($variant = 0; $variant -lt 5; $variant += 1) {
    for ($column = 0; $column -lt $columns; $column += 1) {
      $state = $variantStates[$column]
      $frame = New-DroneFrame -SourceFrame (($variant * 2 + $column) % 16) -Placements $variantPlacements[$variant] -State $state -FrameIndex $column -VariantIndex $variant
      try {
        $sheetGraphics.DrawImage($frame, [System.Drawing.Rectangle]::new($column * $frameWidth, (6 + $variant) * $frameHeight, $frameWidth, $frameHeight))
      }
      finally {
        $frame.Dispose()
      }
    }
  }
}
finally {
  $sheetGraphics.Dispose()
}

$sheetPath = Join-Path $outputDir "drone-swarm-boss-interim-spritesheet.png"
try {
  $sheet.Save($sheetPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $sheet.Dispose()
}
Write-Host "Generated $sheetPath"

$preview = New-DroneFrame -SourceFrame 0 -Placements $swarmPlacements -State "idle" -FrameIndex 0 -VariantIndex 0
try {
  $previewPath = Join-Path $outputDir "drone-swarm-boss-interim-preview.png"
  $preview.Save($previewPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host "Generated $previewPath"
}
finally {
  $preview.Dispose()
}

for ($variant = 0; $variant -lt 5; $variant += 1) {
  $drone = New-DroneFrame -SourceFrame (($variant * 2) % 16) -Placements $variantPlacements[$variant] -State "idle" -FrameIndex 0 -VariantIndex $variant
  try {
    $dronePath = Join-Path $outputDir "drone-swarm-boss-drone-$($variant + 1).png"
    $drone.Save($dronePath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Generated $dronePath"
  }
  finally {
    $drone.Dispose()
  }
}

param(
  [string]$SourcePath = "assets/source/tank-breaker-robot-reference.png",
  [string]$OutputPath = "assets/sprites/enemies/tank-dismantler-spritesheet.png",
  [int]$FrameWidth = 224,
  [int]$FrameHeight = 224,
  [switch]$KeepWhiteBackground
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

if (-not (Test-Path $SourcePath)) {
  throw "Reference image not found: $SourcePath. Save the uploaded Tank Breaker Robot image there, then rerun this script."
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $SourcePath))
$outputDir = Split-Path $OutputPath -Parent
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

# Coordinates are normalized from the supplied 1024x561 reference layout:
# top row = walk frames, bottom row = attack frames. They intentionally crop
# inside each grid cell to avoid frame numbers and grid borders.
$sourceWidth = [double]$source.Width
$sourceHeight = [double]$source.Height
$gridLeft = [int][Math]::Round($sourceWidth * 0.018)
$gridRight = [int][Math]::Round($sourceWidth * 0.985)
$cellWidth = ($gridRight - $gridLeft) / 6.0
$rows = @(
  @{ Top = $sourceHeight * 0.174; Height = $sourceHeight * 0.285; ContentTopPad = 0.035; ContentBottomPad = 0.000 },
  @{ Top = $sourceHeight * 0.584; Height = $sourceHeight * 0.370; ContentTopPad = 0.030; ContentBottomPad = 0.000 }
)

$out = New-Object System.Drawing.Bitmap ($FrameWidth * 6), ($FrameHeight * 2), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($out)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$graphics.Clear([System.Drawing.Color]::Transparent)

function IsWhiteLike([System.Drawing.Color]$color) {
  return $color.R -gt 238 -and $color.G -gt 238 -and $color.B -gt 238
}

function FindOpaqueBounds([System.Drawing.Bitmap]$bitmap) {
  $minX = $bitmap.Width
  $minY = $bitmap.Height
  $maxX = -1
  $maxY = -1
  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      $pixel = $bitmap.GetPixel($x, $y)
      if ($pixel.A -gt 0) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if ($maxX -lt 0) { return [System.Drawing.Rectangle]::new(0, 0, $bitmap.Width, $bitmap.Height) }
  return [System.Drawing.Rectangle]::new($minX, $minY, $maxX - $minX + 1, $maxY - $minY + 1)
}

for ($rowIndex = 0; $rowIndex -lt 2; $rowIndex++) {
  $row = $rows[$rowIndex]
  for ($col = 0; $col -lt 6; $col++) {
    $cropX = [int][Math]::Round($gridLeft + $cellWidth * $col + $cellWidth * 0.030)
    $cropY = [int][Math]::Round($row.Top + $row.Height * $row.ContentTopPad)
    $cropW = [int][Math]::Round($cellWidth * 0.925)
    $cropH = [int][Math]::Round($row.Height * (1.0 - $row.ContentTopPad - $row.ContentBottomPad))
    $cropRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropW, $cropH)

    $cell = New-Object System.Drawing.Bitmap $cropRect.Width, $cropRect.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    for ($y = 0; $y -lt $cropRect.Height; $y++) {
      for ($x = 0; $x -lt $cropRect.Width; $x++) {
        $pixel = $source.GetPixel($cropRect.X + $x, $cropRect.Y + $y)
        if (-not $KeepWhiteBackground -and (IsWhiteLike $pixel)) {
          $cell.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } else {
          $cell.SetPixel($x, $y, $pixel)
        }
      }
    }

    $bounds = FindOpaqueBounds $cell
    $maxDrawW = $FrameWidth - 18
    $maxDrawH = $FrameHeight - 16
    $scale = [Math]::Min($maxDrawW / [double]$bounds.Width, $maxDrawH / [double]$bounds.Height)
    $drawW = [int][Math]::Round($bounds.Width * $scale)
    $drawH = [int][Math]::Round($bounds.Height * $scale)
    $destX = $col * $FrameWidth + [int][Math]::Round(($FrameWidth - $drawW) / 2)
    $destY = $rowIndex * $FrameHeight + [int][Math]::Round($FrameHeight - $drawH - 6)
    $dest = [System.Drawing.Rectangle]::new($destX, $destY, $drawW, $drawH)
    $graphics.DrawImage($cell, $dest, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
    $cell.Dispose()
  }
}

$out.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$out.Dispose()
$source.Dispose()
Write-Host "Cropped spritesheet: $OutputPath"

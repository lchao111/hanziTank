param(
  [string]$InputPath = "$HOME\Downloads\Gemini_Generated_Image_1mu9pk1mu9pk1mu9.png",
  [string]$SourceCopyPath = "assets/source/codex-book-reference.png",
  [string]$OutputPath = "assets/sprites/ui/codex-book-spritesheet.png",
  [int]$FrameWidth = 512,
  [int]$FrameHeight = 512
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

if (-not (Test-Path $InputPath)) { throw "Codex book source image not found: $InputPath" }

$sourceCopyDir = Split-Path $SourceCopyPath -Parent
if ($sourceCopyDir -and -not (Test-Path $sourceCopyDir)) { New-Item -ItemType Directory -Path $sourceCopyDir -Force | Out-Null }
Copy-Item -Path $InputPath -Destination $SourceCopyPath -Force

$outputDir = Split-Path $OutputPath -Parent
if ($outputDir -and -not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

function Remove-GreenScreen([System.Drawing.Bitmap]$bitmap) {
  $rect = [System.Drawing.Rectangle]::new(0, 0, $bitmap.Width, $bitmap.Height)
  $data = $bitmap.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $byteCount = [Math]::Abs($data.Stride) * $bitmap.Height
    $bytes = New-Object byte[] $byteCount
    [Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $byteCount)
    for ($y = 0; $y -lt $bitmap.Height; $y += 1) {
      $rowOffset = $y * [Math]::Abs($data.Stride)
      for ($x = 0; $x -lt $bitmap.Width; $x += 1) {
        $offset = $rowOffset + $x * 4
        $blue = [int]$bytes[$offset]
        $green = [int]$bytes[$offset + 1]
        $red = [int]$bytes[$offset + 2]
        if ($green -gt 110 -and $green -gt ($red * 1.18) -and $green -gt ($blue * 1.18)) {
          $bytes[$offset + 3] = if ($green -lt 170) { 18 } else { 0 }
        }
      }
    }
    [Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $byteCount)
  } finally {
    $bitmap.UnlockBits($data)
  }
}

function Get-ContentBounds([System.Drawing.Bitmap]$bitmap) {
  $minX = $bitmap.Width
  $minY = $bitmap.Height
  $maxX = -1
  $maxY = -1
  for ($y = 0; $y -lt $bitmap.Height; $y += 1) {
    for ($x = 0; $x -lt $bitmap.Width; $x += 1) {
      if ($bitmap.GetPixel($x, $y).A -gt 18) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if ($maxX -lt $minX -or $maxY -lt $minY) {
    return [System.Drawing.Rectangle]::new(0, 0, $bitmap.Width, $bitmap.Height)
  }
  $padding = 18
  $left = [Math]::Max(0, $minX - $padding)
  $top = [Math]::Max(0, $minY - $padding)
  $right = [Math]::Min($bitmap.Width - 1, $maxX + $padding)
  $bottom = [Math]::Min($bitmap.Height - 1, $maxY + $padding)
  return [System.Drawing.Rectangle]::new($left, $top, $right - $left + 1, $bottom - $top + 1)
}

function Copy-SourceFrame([System.Drawing.Bitmap]$source, [System.Drawing.Rectangle]$sourceRect) {
  $frame = New-Object System.Drawing.Bitmap $sourceRect.Width, $sourceRect.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($frame)
  try {
    $graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $sourceRect.Width, $sourceRect.Height), $sourceRect.X, $sourceRect.Y, $sourceRect.Width, $sourceRect.Height, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $graphics.Dispose()
  }
  Remove-GreenScreen $frame
  return $frame
}

function Draw-CodexFrame([System.Drawing.Graphics]$graphics, [System.Drawing.Bitmap]$frame, [System.Drawing.Rectangle]$bounds, [int]$column, [double]$scaleFactor, [int]$offsetY, [bool]$glow) {
  $originX = $column * $FrameWidth
  if ($glow) {
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(90, 255, 206, 77))
    try { $graphics.FillEllipse($brush, $originX + 58, 74, $FrameWidth - 116, $FrameHeight - 126) } finally { $brush.Dispose() }
  }
  $scale = [Math]::Min(($FrameWidth - 34) / [double]$bounds.Width, ($FrameHeight - 34) / [double]$bounds.Height) * $scaleFactor
  $drawWidth = [int][Math]::Round($bounds.Width * $scale)
  $drawHeight = [int][Math]::Round($bounds.Height * $scale)
  $dstX = $originX + [int][Math]::Round(($FrameWidth - $drawWidth) / 2)
  $dstY = [int][Math]::Round(($FrameHeight - $drawHeight) / 2) + $offsetY
  $dst = [System.Drawing.Rectangle]::new($dstX, $dstY, $drawWidth, $drawHeight)
  $graphics.DrawImage($frame, $dst, $bounds.X, $bounds.Y, $bounds.Width, $bounds.Height, [System.Drawing.GraphicsUnit]::Pixel)
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $InputPath))
try {
  $halfWidth = [int]($source.Width / 2)
  $closed = Copy-SourceFrame $source ([System.Drawing.Rectangle]::new(0, 0, $halfWidth, $source.Height))
  $open = Copy-SourceFrame $source ([System.Drawing.Rectangle]::new($halfWidth, 0, $source.Width - $halfWidth, $source.Height))
  try {
    $closedBounds = Get-ContentBounds $closed
    $openBounds = Get-ContentBounds $open
    $columns = 6
    $output = New-Object System.Drawing.Bitmap ($FrameWidth * $columns), $FrameHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($output)
    try {
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
      $graphics.Clear([System.Drawing.Color]::Transparent)
      Draw-CodexFrame $graphics $closed $closedBounds 0 0.92 0 $false
      Draw-CodexFrame $graphics $closed $closedBounds 1 1.00 -2 $true
      Draw-CodexFrame $graphics $closed $closedBounds 2 0.86 14 $false
      Draw-CodexFrame $graphics $open $openBounds 3 0.82 10 $true
      Draw-CodexFrame $graphics $open $openBounds 4 0.94 2 $true
      Draw-CodexFrame $graphics $open $openBounds 5 1.00 0 $true
    } finally {
      $graphics.Dispose()
    }
    $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $output.Dispose()
  } finally {
    $closed.Dispose()
    $open.Dispose()
  }
} finally {
  $source.Dispose()
}

Write-Host "Copied Codex Book source: $SourceCopyPath"
Write-Host "Generated Codex Book spritesheet: $OutputPath"
Write-Host "Output grid: 6x1, frame: ${FrameWidth}x${FrameHeight}"
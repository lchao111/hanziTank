param(
  [string]$SourcePath = '',
  [int]$FrameWidth = 469,
  [int]$FrameHeight = 300,
  [int]$Columns = 6,
  [int]$Rows = 5
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $projectRoot 'assets/sprites/enemies/target-dummy-spritesheet.png'

Add-Type -AssemblyName System.Drawing

if (!$SourcePath) {
  $SourcePath = Join-Path $env:USERPROFILE 'Downloads\target-dummy-source.png'
}

if (!(Test-Path $SourcePath)) {
  throw "Source image not found: $SourcePath"
}

$source = [System.Drawing.Bitmap]::new($SourcePath)
$out = [System.Drawing.Bitmap]::new($FrameWidth * $Columns, $FrameHeight * $Rows, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($out)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$attributes = [System.Drawing.Imaging.ImageAttributes]::new()
$attributes.SetColorKey([System.Drawing.Color]::FromArgb(0, 130, 0), [System.Drawing.Color]::FromArgb(120, 255, 120))

for ($row = 0; $row -lt $Rows; $row += 1) {
  for ($column = 0; $column -lt $Columns; $column += 1) {
    $sourceX = [Math]::Min($column * $FrameWidth, $source.Width - $FrameWidth)
    $sourceY = [Math]::Min($row * $FrameHeight, $source.Height - $FrameHeight)
    $destX = $column * $FrameWidth
    $destY = $row * $FrameHeight
    $destRect = [System.Drawing.Rectangle]::new($destX, $destY, $FrameWidth, $FrameHeight)
    $graphics.DrawImage($source, $destRect, $sourceX, $sourceY, $FrameWidth, $FrameHeight, [System.Drawing.GraphicsUnit]::Pixel, $attributes)
  }
}

[System.IO.Directory]::CreateDirectory((Split-Path -Parent $outputPath)) | Out-Null
$out.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$attributes.Dispose()
$graphics.Dispose()
$out.Dispose()
$source.Dispose()

Write-Host "Wrote $outputPath from $SourcePath using ${Columns}x${Rows} frames of ${FrameWidth}x${FrameHeight}."
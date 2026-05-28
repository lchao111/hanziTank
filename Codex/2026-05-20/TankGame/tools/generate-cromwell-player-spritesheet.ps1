param(
  [string]$InputPath = "$HOME\Downloads\Gemini_Generated_Image_le6o7tle6o7tle6o.png",
  [string]$SourceCopyPath = "assets/source/cromwell-player-reference.png",
  [string]$OutputPath = "assets/sprites/tanks/cromwell-player-tank-spritesheet.png",
  [int]$Columns = 6,
  [int]$Rows = 5,
  [int]$FrameWidth = 224,
  [int]$FrameHeight = 144
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

if (-not (Test-Path $InputPath)) { throw "Cromwell source image not found: $InputPath" }

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
        if ($green -gt 105 -and $green -gt ($red * 1.25) -and $green -gt ($blue * 1.25)) {
          $bytes[$offset + 3] = if ($green -lt 155) { 36 } else { 0 }
        }
      }
    }
    [Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $byteCount)
  } finally {
    $bitmap.UnlockBits($data)
  }
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $InputPath))
try {
  $output = New-Object System.Drawing.Bitmap ($FrameWidth * $Columns), ($FrameHeight * $Rows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($output)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.Clear([System.Drawing.Color]::Transparent)

    $cellWidth = [double]$source.Width / $Columns
    $cellHeight = [double]$source.Height / $Rows
    for ($row = 0; $row -lt $Rows; $row += 1) {
      for ($column = 0; $column -lt $Columns; $column += 1) {
        $srcX = [int][Math]::Round($column * $cellWidth)
        $srcY = [int][Math]::Round($row * $cellHeight)
        $nextX = [int][Math]::Round(($column + 1) * $cellWidth)
        $nextY = [int][Math]::Round(($row + 1) * $cellHeight)
        $srcWidth = [Math]::Max(1, $nextX - $srcX)
        $srcHeight = [Math]::Max(1, $nextY - $srcY)

        $frame = New-Object System.Drawing.Bitmap $srcWidth, $srcHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $frameGraphics = [System.Drawing.Graphics]::FromImage($frame)
        try {
          $frameGraphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $srcWidth, $srcHeight), $srcX, $srcY, $srcWidth, $srcHeight, [System.Drawing.GraphicsUnit]::Pixel)
        } finally {
          $frameGraphics.Dispose()
        }
        Remove-GreenScreen $frame

        $dst = [System.Drawing.Rectangle]::new($column * $FrameWidth, $row * $FrameHeight, $FrameWidth, $FrameHeight)
        $graphics.DrawImage($frame, $dst, 0, 0, $frame.Width, $frame.Height, [System.Drawing.GraphicsUnit]::Pixel)
        $frame.Dispose()
      }
    }
  } finally {
    $graphics.Dispose()
  }
  $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $output.Dispose()
} finally {
  $source.Dispose()
}

Write-Host "Copied Cromwell source: $SourceCopyPath"
Write-Host "Generated Cromwell player spritesheet: $OutputPath"
Write-Host "Output grid: ${Columns}x${Rows}, frame: ${FrameWidth}x${FrameHeight}"
param(
  [string]$SourcePath = "assets/source/wwii-common-tank-spritesheet.png",
  [string]$OutputPath = "assets/sprites/tanks/player-tank-spritesheet.png",
  [int]$FrameWidth = 224,
  [int]$FrameHeight = 144,
  [int]$Columns = 6,
  [int]$Rows = 3
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

if (-not (Test-Path $SourcePath)) {
  throw "Reference image not found: $SourcePath"
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $SourcePath))
try {
  if (($source.Width % $Columns) -ne 0 -or ($source.Height % $Rows) -ne 0) {
    throw "Source image dimensions $($source.Width)x$($source.Height) are not evenly divisible by ${Columns}x${Rows}."
  }

  $cellWidth = [int]($source.Width / $Columns)
  $cellHeight = [int]($source.Height / $Rows)
  $outputDir = Split-Path $OutputPath -Parent
  if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

  $out = New-Object System.Drawing.Bitmap ($FrameWidth * $Columns), ($FrameHeight * $Rows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($out)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.Clear([System.Drawing.Color]::Transparent)

    function ConvertGreenToTransparent([System.Drawing.Bitmap]$bitmap) {
      for ($y = 0; $y -lt $bitmap.Height; $y++) {
        for ($x = 0; $x -lt $bitmap.Width; $x++) {
          $pixel = $bitmap.GetPixel($x, $y)
          $greenDominance = $pixel.G - [Math]::Max($pixel.R, $pixel.B)
          if ($pixel.G -gt 130 -and $greenDominance -gt 54) {
            $bitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
          } elseif ($pixel.G -gt 92 -and $greenDominance -gt 18) {
            $alpha = [Math]::Max(0, [Math]::Min(255, 255 - (($greenDominance - 18) * 5)))
            $despilledGreen = [Math]::Min($pixel.G, [Math]::Max($pixel.R, $pixel.B) + 12)
            $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $despilledGreen, $pixel.B))
          }
        }
      }
    }

    for ($row = 0; $row -lt $Rows; $row++) {
      for ($col = 0; $col -lt $Columns; $col++) {
        $sourceRect = [System.Drawing.Rectangle]::new($col * $cellWidth, $row * $cellHeight, $cellWidth, $cellHeight)
        $cell = New-Object System.Drawing.Bitmap $cellWidth, $cellHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
          $cellGraphics = [System.Drawing.Graphics]::FromImage($cell)
          try {
            $cellGraphics.DrawImage($source, 0, 0, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
          } finally {
            $cellGraphics.Dispose()
          }

          ConvertGreenToTransparent $cell
          $destRect = [System.Drawing.Rectangle]::new($col * $FrameWidth, $row * $FrameHeight, $FrameWidth, $FrameHeight)
          $graphics.DrawImage($cell, $destRect, 0, 0, $cell.Width, $cell.Height, [System.Drawing.GraphicsUnit]::Pixel)
        } finally {
          $cell.Dispose()
        }
      }
    }

    $out.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $out.Dispose()
  }
} finally {
  $source.Dispose()
}

Write-Host "Cropped player tank spritesheet: $OutputPath"
Write-Host "Source cell: ${cellWidth}x${cellHeight}, output frame: ${FrameWidth}x${FrameHeight}"

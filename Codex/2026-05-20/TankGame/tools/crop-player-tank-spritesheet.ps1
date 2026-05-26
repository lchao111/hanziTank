param(
  [string]$SourcePath = "assets/source/wwii-common-tank-spritesheet.png",
  [string]$OutputPath = "assets/sprites/tanks/player-tank-spritesheet.png",
  [int]$FrameWidth = 224,
  [int]$FrameHeight = 144,
  [int]$Columns = 6,
  [int]$Rows = 3
)

Add-Type -AssemblyName System.Drawing
$drawingAssembly = [System.Drawing.Bitmap].Assembly.Location
$primitiveAssembly = [System.Drawing.Rectangle].Assembly.Location
Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class ChromaKeyHelper {
  public static void ConvertGreenToTransparent(Bitmap bitmap) {
    Rectangle rect = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
    BitmapData data = bitmap.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    try {
      int byteCount = Math.Abs(data.Stride) * bitmap.Height;
      byte[] bytes = new byte[byteCount];
      Marshal.Copy(data.Scan0, bytes, 0, byteCount);
      for (int y = 0; y < bitmap.Height; y++) {
        int row = y * data.Stride;
        for (int x = 0; x < bitmap.Width; x++) {
          int i = row + x * 4;
          int b = bytes[i];
          int g = bytes[i + 1];
          int r = bytes[i + 2];
          int a = bytes[i + 3];
          int maxRb = Math.Max(r, b);
          int greenDominance = g - maxRb;
          double greenRatio = Math.Min(g / (double)Math.Max(1, r), g / (double)Math.Max(1, b));
          if (g > 96 && greenDominance > 28 && greenRatio > 1.34) {
            bytes[i + 3] = 0;
          } else if (g > 58 && greenDominance > 10 && greenRatio > 1.16) {
            int alpha = Math.Max(0, Math.Min(255, 255 - ((greenDominance - 10) * 7)));
            int despilledGreen = Math.Min(g, maxRb + 12);
            bytes[i + 1] = (byte)despilledGreen;
            bytes[i + 3] = (byte)Math.Min(a, alpha);
          }
        }
      }
      Marshal.Copy(bytes, 0, data.Scan0, byteCount);
    } finally {
      bitmap.UnlockBits(data);
    }
  }
}
"@ -ReferencedAssemblies $drawingAssembly,$primitiveAssembly
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
      [ChromaKeyHelper]::ConvertGreenToTransparent($bitmap)
    }

    function ApplyWeakTint([System.Drawing.Bitmap]$bitmap) {
      for ($y = 0; $y -lt $bitmap.Height; $y++) {
        for ($x = 0; $x -lt $bitmap.Width; $x++) {
          $pixel = $bitmap.GetPixel($x, $y)
          if ($pixel.A -eq 0) { continue }
          $r = [Math]::Min(255, [int]($pixel.R * 0.72 + 28))
          $g = [Math]::Min(255, [int]($pixel.G * 0.70 + 25))
          $b = [Math]::Min(255, [int]($pixel.B * 0.62 + 18))
          $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $r, $g, $b))
        }
      }
    }

    function ApplyDestroyedTint([System.Drawing.Bitmap]$bitmap, [int]$frameIndex) {
      for ($y = 0; $y -lt $bitmap.Height; $y++) {
        for ($x = 0; $x -lt $bitmap.Width; $x++) {
          $pixel = $bitmap.GetPixel($x, $y)
          if ($pixel.A -eq 0) { continue }
          $r = [Math]::Min(255, [int]($pixel.R * 0.45 + 20))
          $g = [Math]::Min(255, [int]($pixel.G * 0.42 + 18))
          $b = [Math]::Min(255, [int]($pixel.B * 0.38 + 16))
          $alpha = if ($frameIndex -ge 4 -and $y -lt ($bitmap.Height * 0.55)) { [Math]::Max(72, $pixel.A - 56) } else { $pixel.A }
          $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
        }
      }
    }

    function AddSmoke([System.Drawing.Graphics]$g, [int]$frameX, [int]$frameY, [int]$frameIndex, [bool]$heavy) {
      $count = if ($heavy) { 7 + $frameIndex } else { 3 + [Math]::Floor($frameIndex / 2) }
      for ($i = 0; $i -lt $count; $i++) {
        $alpha = if ($heavy) { [Math]::Max(45, 150 - $i * 10) } else { [Math]::Max(35, 110 - $i * 12) }
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, 45, 52, 48))
        $x = $frameX + 88 + (($i * 23 + $frameIndex * 9) % 76)
        $y = $frameY + 18 + (($i * 17) % 46)
        $size = 16 + (($i * 7 + $frameIndex * 3) % 30)
        $g.FillEllipse($brush, $x, $y, $size, [int]($size * 0.72))
        $brush.Dispose()
      }
    }

    function AddWreckOverlay([System.Drawing.Graphics]$g, [int]$frameX, [int]$frameY, [int]$frameIndex) {
      $fire = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(190, 239, 98, 31))
      $core = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(210, 254, 215, 102))
      $char = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(132, 24, 24, 22))
      $g.FillRectangle($char, $frameX + 24, $frameY + 72, 152, 28)
      if ($frameIndex -ge 1) {
        $g.FillEllipse($fire, $frameX + 72, $frameY + 55, 28 + $frameIndex * 5, 18 + $frameIndex * 3)
        $g.FillEllipse($core, $frameX + 82, $frameY + 59, 12 + $frameIndex * 2, 9 + $frameIndex)
      }
      $fire.Dispose(); $core.Dispose(); $char.Dispose()
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
Write-Host "Source cell: ${cellWidth}x${cellHeight}, output frame: ${FrameWidth}x${FrameHeight}, output grid: ${Columns}x${Rows}"

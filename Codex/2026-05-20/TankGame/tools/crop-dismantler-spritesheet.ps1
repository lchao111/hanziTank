param(
  [string]$SourcePath = "assets/source/tank-dismantler-level5-boss-reference.png",
  [string]$OutputPath = "assets/sprites/enemies/tank-dismantler-spritesheet.png",
  [int]$FrameWidth = 224,
  [int]$FrameHeight = 224,
  [int]$Columns = 6,
  [int]$Rows = 5,
  [switch]$KeepGreenBackground
)

Add-Type -AssemblyName System.Drawing
$drawingAssembly = [System.Drawing.Bitmap].Assembly.Location
$primitiveAssembly = [System.Drawing.Rectangle].Assembly.Location
Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class BossChromaKeyHelper {
  public static void ConvertGreenToTransparent(Bitmap bitmap) {
    Rectangle rect = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
    BitmapData data = bitmap.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    try {
      int byteCount = Math.Abs(data.Stride) * bitmap.Height;
      byte[] bytes = new byte[byteCount];
      Marshal.Copy(data.Scan0, bytes, 0, byteCount);
      for (int pixelY = 0; pixelY < bitmap.Height; pixelY++) {
        int rowOffset = pixelY * data.Stride;
        for (int pixelX = 0; pixelX < bitmap.Width; pixelX++) {
          int index = rowOffset + pixelX * 4;
          int blue = bytes[index];
          int green = bytes[index + 1];
          int red = bytes[index + 2];
          int alpha = bytes[index + 3];
          int maxRedBlue = Math.Max(red, blue);
          int greenDominance = green - maxRedBlue;
          double greenRatio = Math.Min(green / (double)Math.Max(1, red), green / (double)Math.Max(1, blue));

          if (green > 100 && greenDominance > 30 && greenRatio > 1.32) {
            bytes[index + 3] = 0;
          } else if (green > 52 && greenDominance > 8 && greenRatio > 1.12) {
            int softenedAlpha = Math.Max(0, Math.Min(255, 255 - ((greenDominance - 8) * 7)));
            int despilledGreen = Math.Min(green, maxRedBlue + 10);
            bytes[index + 1] = (byte)despilledGreen;
            bytes[index + 3] = (byte)Math.Min(alpha, softenedAlpha);
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
  throw "Reference image not found: $SourcePath. Save the uploaded level 5 Boss image there, then rerun this script."
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $SourcePath))
try {
  $outputDir = Split-Path $OutputPath -Parent
  if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

  $cellWidth = $source.Width / [double]$Columns
  $cellHeight = $source.Height / [double]$Rows
  $out = New-Object System.Drawing.Bitmap ($FrameWidth * $Columns), ($FrameHeight * $Rows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($out)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.Clear([System.Drawing.Color]::Transparent)

    function ConvertGreenToTransparent([System.Drawing.Bitmap]$bitmap) {
      [BossChromaKeyHelper]::ConvertGreenToTransparent($bitmap)
    }

    function FindOpaqueBounds([System.Drawing.Bitmap]$bitmap) {
      $minX = $bitmap.Width
      $minY = $bitmap.Height
      $maxX = -1
      $maxY = -1
      for ($pixelY = 0; $pixelY -lt $bitmap.Height; $pixelY++) {
        for ($pixelX = 0; $pixelX -lt $bitmap.Width; $pixelX++) {
          $pixel = $bitmap.GetPixel($pixelX, $pixelY)
          if ($pixel.A -gt 0) {
            if ($pixelX -lt $minX) { $minX = $pixelX }
            if ($pixelY -lt $minY) { $minY = $pixelY }
            if ($pixelX -gt $maxX) { $maxX = $pixelX }
            if ($pixelY -gt $maxY) { $maxY = $pixelY }
          }
        }
      }
      if ($maxX -lt 0) { return [System.Drawing.Rectangle]::new(0, 0, $bitmap.Width, $bitmap.Height) }
      return [System.Drawing.Rectangle]::new($minX, $minY, $maxX - $minX + 1, $maxY - $minY + 1)
    }

    for ($rowIndex = 0; $rowIndex -lt $Rows; $rowIndex++) {
      for ($columnIndex = 0; $columnIndex -lt $Columns; $columnIndex++) {
        $cropLeft = [int][Math]::Round($columnIndex * $cellWidth)
        $cropTop = [int][Math]::Round($rowIndex * $cellHeight)
        $cropRight = [int][Math]::Round(($columnIndex + 1) * $cellWidth)
        $cropBottom = [int][Math]::Round(($rowIndex + 1) * $cellHeight)
        $cropRect = [System.Drawing.Rectangle]::new($cropLeft, $cropTop, $cropRight - $cropLeft, $cropBottom - $cropTop)

        $cell = New-Object System.Drawing.Bitmap $cropRect.Width, $cropRect.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
          $cellGraphics = [System.Drawing.Graphics]::FromImage($cell)
          try {
            $cellGraphics.DrawImage($source, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
          } finally {
            $cellGraphics.Dispose()
          }

          if (-not $KeepGreenBackground) { ConvertGreenToTransparent $cell }
          $bounds = FindOpaqueBounds $cell
          $scale = [Math]::Min(($FrameWidth - 12) / [double]$bounds.Width, ($FrameHeight - 12) / [double]$bounds.Height)
          $drawWidth = [int][Math]::Round($bounds.Width * $scale)
          $drawHeight = [int][Math]::Round($bounds.Height * $scale)
          $destLeft = $columnIndex * $FrameWidth + [int][Math]::Round(($FrameWidth - $drawWidth) / 2)
          $destTop = $rowIndex * $FrameHeight + [int][Math]::Round($FrameHeight - $drawHeight - 6)
          $destRect = [System.Drawing.Rectangle]::new($destLeft, $destTop, $drawWidth, $drawHeight)
          $graphics.DrawImage($cell, $destRect, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
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

Write-Host "Cropped level 5 Boss spritesheet: $OutputPath"
Write-Host "Rows: 1 driving, 2 normal firing, 3 heavy firing, 4 damaged, 5 destroyed/flame/explode"
Write-Host "Frame size: ${FrameWidth}x${FrameHeight}; output grid: ${Columns}x${Rows}"

param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
  [string]$SourceDownload = (Join-Path $HOME "Downloads\Gemini_Generated_Image_q7b6iaq7b6iaq7b6.png"),
  [int]$Columns = 6,
  [int]$Rows = 5,
  [int]$FrameWidth = 469,
  [int]$FrameHeight = 300
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
if (-not ("BouncingTankBossChroma" -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing, System.Drawing.Common, System.Drawing.Primitives @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public sealed class BouncingTankBossFrameQc {
  public int Frame { get; set; }
  public bool HasAlpha { get; set; }
  public int AlphaX { get; set; }
  public int AlphaY { get; set; }
  public int AlphaWidth { get; set; }
  public int AlphaHeight { get; set; }
  public int GreenResiduePixels { get; set; }
  public bool EdgeTouch { get; set; }
}

public static class BouncingTankBossChroma {
  private static bool IsGreen(int red, int green, int blue) {
    int maxRedBlue = Math.Max(red, blue);
    int greenDominance = green - maxRedBlue;
    double greenRatio = Math.Min(
      green / (double)Math.Max(1, red),
      green / (double)Math.Max(1, blue)
    );
    if (green > 80 && greenDominance > 18 && greenRatio > 1.15) return true;
    if (green > 18 && red < 42 && blue < 42 && greenDominance > 6) return true;
    return false;
  }

  public static BouncingTankBossFrameQc ProcessFrame(Bitmap bitmap, int frameIndex) {
    Rectangle rect = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
    BitmapData data = bitmap.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    int stride = Math.Abs(data.Stride);
    int byteCount = stride * bitmap.Height;
    byte[] bytes = new byte[byteCount];
    Marshal.Copy(data.Scan0, bytes, 0, byteCount);
    int minX = bitmap.Width;
    int minY = bitmap.Height;
    int maxX = -1;
    int maxY = -1;
    int greenResidue = 0;
    bool edgeTouch = false;

    for (int y = 0; y < bitmap.Height; y += 1) {
      int rowOffset = y * stride;
      for (int x = 0; x < bitmap.Width; x += 1) {
        int offset = rowOffset + x * 4;
        int blue = bytes[offset];
        int green = bytes[offset + 1];
        int red = bytes[offset + 2];
        int alpha = bytes[offset + 3];
        int maxRedBlue = Math.Max(red, blue);
        int greenDominance = green - maxRedBlue;
        double greenRatio = Math.Min(
          green / (double)Math.Max(1, red),
          green / (double)Math.Max(1, blue)
        );
        bool border = x == 0 || y == 0 || x == bitmap.Width - 1 || y == bitmap.Height - 1;
        bool background = alpha < 12 || IsGreen(red, green, blue) || border;
        if (background) {
          bytes[offset + 3] = 0;
          continue;
        }
        if (green > 45 && greenDominance > 14 && greenRatio > 1.08) {
          bytes[offset + 1] = (byte)Math.Min(green, maxRedBlue + 12);
          bytes[offset + 3] = (byte)Math.Min(alpha, Math.Max(96, 255 - ((greenDominance - 12) * 4)));
        }
        alpha = bytes[offset + 3];
        if (alpha <= 16) continue;
        red = bytes[offset + 2];
        green = bytes[offset + 1];
        blue = bytes[offset];
        if (IsGreen(red, green, blue)) greenResidue += 1;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (border) edgeTouch = true;
      }
    }

    Marshal.Copy(bytes, 0, data.Scan0, byteCount);
    bitmap.UnlockBits(data);
    return new BouncingTankBossFrameQc {
      Frame = frameIndex,
      HasAlpha = maxX >= minX && maxY >= minY,
      AlphaX = minX,
      AlphaY = minY,
      AlphaWidth = maxX >= minX ? maxX - minX + 1 : 0,
      AlphaHeight = maxY >= minY ? maxY - minY + 1 : 0,
      GreenResiduePixels = greenResidue,
      EdgeTouch = edgeTouch
    };
  }
}
"@
}
Write-Host "Starting Bouncing Tank Boss asset generation..."

$sourceDir = Join-Path $ProjectRoot "assets\source\enemy-candidates"
$enemyDir = Join-Path $ProjectRoot "assets\sprites\enemies"
$galleryDir = Join-Path $enemyDir "gallery"
New-Item -ItemType Directory -Path $sourceDir -Force | Out-Null
New-Item -ItemType Directory -Path $enemyDir -Force | Out-Null
New-Item -ItemType Directory -Path $galleryDir -Force | Out-Null

$sourceCopyPath = Join-Path $sourceDir "bouncing-tank-boss-reference.png"
$sheetPath = Join-Path $enemyDir "bouncing-tank-boss-spritesheet.png"
$previewPath = Join-Path $galleryDir "bouncing-tank-boss-preview.png"
$metaPath = Join-Path $sourceDir "bouncing-tank-boss-pipeline-meta.json"

if (-not (Test-Path $sourceCopyPath)) {
  if (-not (Test-Path $SourceDownload)) { throw "Missing Bouncing Tank Boss source: $SourceDownload" }
  Copy-Item -Path $SourceDownload -Destination $sourceCopyPath -Force
  Write-Host "Imported source: $sourceCopyPath"
}
Write-Host "Loading source: $sourceCopyPath"

function Test-GreenBackgroundRgb([int]$red, [int]$green, [int]$blue) {
  $maxRedBlue = [Math]::Max($red, $blue)
  $greenDominance = $green - $maxRedBlue
  $greenRatio = [Math]::Min(
    $green / [double][Math]::Max(1, $red),
    $green / [double][Math]::Max(1, $blue)
  )
  if ($green -gt 80 -and $greenDominance -gt 18 -and $greenRatio -gt 1.15) { return $true }
  if ($green -gt 18 -and $red -lt 42 -and $blue -lt 42 -and $greenDominance -gt 6) { return $true }
  return $false
}

function Remove-GreenBackground([System.Drawing.Bitmap]$bitmap) {
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
        $alpha = [int]$bytes[$offset + 3]
        $maxRedBlue = [Math]::Max($red, $blue)
        $greenDominance = $green - $maxRedBlue
        $greenRatio = [Math]::Min(
          $green / [double][Math]::Max(1, $red),
          $green / [double][Math]::Max(1, $blue)
        )
        if ($alpha -lt 12 -or (Test-GreenBackgroundRgb $red $green $blue)) {
          $bytes[$offset + 3] = 0
        } elseif ($green -gt 45 -and $greenDominance -gt 14 -and $greenRatio -gt 1.08) {
          $bytes[$offset + 1] = [byte][Math]::Min($green, $maxRedBlue + 12)
          $bytes[$offset + 3] = [byte][Math]::Min($alpha, [Math]::Max(96, 255 - (($greenDominance - 12) * 4)))
        }
      }
    }
    [Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $byteCount)
  } finally {
    $bitmap.UnlockBits($data)
  }
}

function Clear-Border([System.Drawing.Bitmap]$bitmap) {
  $transparent = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
  for ($x = 0; $x -lt $bitmap.Width; $x += 1) {
    $bitmap.SetPixel($x, 0, $transparent)
    $bitmap.SetPixel($x, $bitmap.Height - 1, $transparent)
  }
  for ($y = 0; $y -lt $bitmap.Height; $y += 1) {
    $bitmap.SetPixel(0, $y, $transparent)
    $bitmap.SetPixel($bitmap.Width - 1, $y, $transparent)
  }
}

function Get-AlphaBounds([System.Drawing.Bitmap]$bitmap) {
  $minX = $bitmap.Width
  $minY = $bitmap.Height
  $maxX = -1
  $maxY = -1
  for ($y = 0; $y -lt $bitmap.Height; $y += 1) {
    for ($x = 0; $x -lt $bitmap.Width; $x += 1) {
      if ($bitmap.GetPixel($x, $y).A -le 16) { continue }
      if ($x -lt $minX) { $minX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
  if ($maxX -lt $minX -or $maxY -lt $minY) { return $null }
  return [System.Drawing.Rectangle]::new($minX, $minY, $maxX - $minX + 1, $maxY - $minY + 1)
}

function Get-FrameQc([System.Drawing.Bitmap]$bitmap) {
  $rect = [System.Drawing.Rectangle]::new(0, 0, $bitmap.Width, $bitmap.Height)
  $data = $bitmap.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $stride = [Math]::Abs($data.Stride)
    $byteCount = $stride * $bitmap.Height
    $bytes = New-Object byte[] $byteCount
    [Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $byteCount)
    $minX = $bitmap.Width
    $minY = $bitmap.Height
    $maxX = -1
    $maxY = -1
    $greenResidue = 0
    $edgeTouch = $false
    for ($y = 0; $y -lt $bitmap.Height; $y += 1) {
      $rowOffset = $y * $stride
      for ($x = 0; $x -lt $bitmap.Width; $x += 1) {
        $offset = $rowOffset + $x * 4
        $alpha = [int]$bytes[$offset + 3]
        if ($alpha -le 16) { continue }
        $blue = [int]$bytes[$offset]
        $green = [int]$bytes[$offset + 1]
        $red = [int]$bytes[$offset + 2]
        if (Test-GreenBackgroundRgb $red $green $blue) { $greenResidue += 1 }
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
        if ($x -eq 0 -or $y -eq 0 -or $x -eq ($bitmap.Width - 1) -or $y -eq ($bitmap.Height - 1)) { $edgeTouch = $true }
      }
    }
    return [pscustomobject][ordered]@{
      alphaBounds = if ($maxX -ge $minX -and $maxY -ge $minY) { @{ x = $minX; y = $minY; width = $maxX - $minX + 1; height = $maxY - $minY + 1 } } else { $null }
      greenResiduePixels = $greenResidue
      edgeTouch = $edgeTouch
    }
  } finally {
    $bitmap.UnlockBits($data)
  }
}

function Export-Preview([System.Drawing.Bitmap]$frame, [string]$path) {
  $previewWidth = 256
  $previewHeight = 192
  $bounds = Get-AlphaBounds $frame
  if (-not $bounds) { throw "Could not find visible Bouncing Tank Boss pixels for preview." }
  $preview = [System.Drawing.Bitmap]::new($previewWidth, $previewHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($preview)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $scale = [Math]::Min(($previewWidth * 0.86) / [double]$bounds.Width, ($previewHeight * 0.76) / [double]$bounds.Height)
    $drawWidth = [int][Math]::Round($bounds.Width * $scale)
    $drawHeight = [int][Math]::Round($bounds.Height * $scale)
    $drawX = [int][Math]::Round(($previewWidth - $drawWidth) / 2)
    $drawY = [int][Math]::Round(($previewHeight - $drawHeight) / 2)
    $graphics.DrawImage($frame, [System.Drawing.Rectangle]::new($drawX, $drawY, $drawWidth, $drawHeight), $bounds.X, $bounds.Y, $bounds.Width, $bounds.Height, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $graphics.Dispose()
  }
  $preview.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $preview.Dispose()
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $sourceCopyPath))
$sourceWidth = $source.Width
$sourceHeight = $source.Height
$sheet = [System.Drawing.Bitmap]::new($FrameWidth * $Columns, $FrameHeight * $Rows, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$sheetGraphics = [System.Drawing.Graphics]::FromImage($sheet)
$frameStats = @()
$firstFrame = $null
try {
  $sheetGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $sheetGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $sheetGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $sheetGraphics.Clear([System.Drawing.Color]::Transparent)
  for ($row = 0; $row -lt $Rows; $row += 1) {
    Write-Host "Processing row $($row + 1) of $Rows..."
    for ($column = 0; $column -lt $Columns; $column += 1) {
      $frameIndex = $row * $Columns + $column
      $srcX = [int][Math]::Round($column * $source.Width / [double]$Columns)
      $srcY = [int][Math]::Round($row * $source.Height / [double]$Rows)
      $nextX = [int][Math]::Round(($column + 1) * $source.Width / [double]$Columns)
      $nextY = [int][Math]::Round(($row + 1) * $source.Height / [double]$Rows)
      $cell = [System.Drawing.Bitmap]::new($FrameWidth, $FrameHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      $cellGraphics = [System.Drawing.Graphics]::FromImage($cell)
      try {
        $cellGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $cellGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $cellGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $cellGraphics.Clear([System.Drawing.Color]::Transparent)
        $cellGraphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $FrameWidth, $FrameHeight), $srcX, $srcY, $nextX - $srcX, $nextY - $srcY, [System.Drawing.GraphicsUnit]::Pixel)
      } finally {
        $cellGraphics.Dispose()
      }
      $qc = [BouncingTankBossChroma]::ProcessFrame($cell, $frameIndex)
      $frameStats += [pscustomobject][ordered]@{
        frame = $frameIndex
        sourceRect = @{ x = $srcX; y = $srcY; width = $nextX - $srcX; height = $nextY - $srcY }
        alphaBounds = if ($qc.HasAlpha) { @{ x = $qc.AlphaX; y = $qc.AlphaY; width = $qc.AlphaWidth; height = $qc.AlphaHeight } } else { $null }
        greenResiduePixels = $qc.GreenResiduePixels
        edgeTouch = $qc.EdgeTouch
      }
      if ($frameIndex -eq 0) { $firstFrame = $cell.Clone() }
      $sheetGraphics.DrawImage($cell, $column * $FrameWidth, $row * $FrameHeight, $FrameWidth, $FrameHeight)
      $cell.Dispose()
    }
  }
  $sheet.Save($sheetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Export-Preview $firstFrame $previewPath
} finally {
  if ($firstFrame) { $firstFrame.Dispose() }
  $sheetGraphics.Dispose()
  $sheet.Dispose()
  $source.Dispose()
}

$meta = [pscustomobject][ordered]@{
  source = "assets/source/enemy-candidates/bouncing-tank-boss-reference.png"
  spritesheet = "assets/sprites/enemies/bouncing-tank-boss-spritesheet.png"
  galleryPreview = "assets/sprites/enemies/gallery/bouncing-tank-boss-preview.png"
  sourceWidth = $sourceWidth
  sourceHeight = $sourceHeight
  columns = $Columns
  rows = $Rows
  frameWidth = $FrameWidth
  frameHeight = $FrameHeight
  processing = "Copied user-provided Gemini bouncing tank boss sheet, chroma-keyed green background, despilled green edges, normalized to 469x300 Phaser frames, and exported a transparent gallery preview."
  qc = @{
    greenResiduePixels = ($frameStats | Measure-Object -Property greenResiduePixels -Sum).Sum
    edgeTouchFrames = @($frameStats | Where-Object { $_.edgeTouch } | ForEach-Object { $_.frame })
    frameStats = $frameStats
  }
}
$meta | ConvertTo-Json -Depth 8 | Set-Content -Path $metaPath -Encoding UTF8

Write-Host "Generated Bouncing Tank Boss spritesheet: $sheetPath"
Write-Host "Generated Bouncing Tank Boss preview: $previewPath"
Write-Host "Wrote Bouncing Tank Boss metadata: $metaPath"
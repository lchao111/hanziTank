param(
  [string]$InputPath = "$HOME\Downloads\Tiger1.png",
  [string]$SourceCopyPath = "assets/source/war-prep-tank-previews/tiger-i-player-reference.png",
  [string]$OutputPath = "assets/sprites/tanks/tiger-i-player-tank-spritesheet.png",
  [string]$MetaPath = "assets/source/war-prep-tank-previews/tiger-i-player-pipeline-meta.json",
  [int]$Columns = 6,
  [int]$Rows = 5,
  [int]$FrameWidth = 224,
  [int]$FrameHeight = 144
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $InputPath)) { throw "Tiger I source image not found: $InputPath" }

$sourceCopyDir = Split-Path $SourceCopyPath -Parent
if ($sourceCopyDir -and -not (Test-Path -LiteralPath $sourceCopyDir)) {
  New-Item -ItemType Directory -Path $sourceCopyDir -Force | Out-Null
}
Copy-Item -LiteralPath $InputPath -Destination $SourceCopyPath -Force

$outputDir = Split-Path $OutputPath -Parent
if ($outputDir -and -not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$metaDir = Split-Path $MetaPath -Parent
if ($metaDir -and -not (Test-Path -LiteralPath $metaDir)) {
  New-Item -ItemType Directory -Path $metaDir -Force | Out-Null
}

$drawingAssembly = [System.Drawing.Bitmap].Assembly.Location
$primitiveAssembly = [System.Drawing.Rectangle].Assembly.Location
Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public sealed class TigerIChromaStats {
  public int Frame { get; set; }
  public long TransparentPixels { get; set; }
  public long DespilledPixels { get; set; }
  public long VisiblePixels { get; set; }
}

public sealed class TigerIFrameQc {
  public int Frame { get; set; }
  public long VisiblePixels { get; set; }
  public bool TouchesEdge { get; set; }
  public long GreenResiduePixels { get; set; }
}

public static class TigerIImageHelper {
  public static bool IsGreenBackground(int red, int green, int blue) {
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

  public static bool IsStrongGreenResidue(int red, int green, int blue) {
    int maxRedBlue = Math.Max(red, blue);
    int greenDominance = green - maxRedBlue;
    double greenRatio = Math.Min(
      green / (double)Math.Max(1, red),
      green / (double)Math.Max(1, blue)
    );
    return green > 96 && red < 92 && blue < 92 && greenDominance > 32 && greenRatio > 1.28;
  }

  public static void ClearFrameBorders(Bitmap bitmap, int frameWidth, int frameHeight, int columns, int rows, int borderPixels) {
    Color transparent = Color.FromArgb(0, 0, 0, 0);
    for (int row = 0; row < rows; row++) {
      int frameY = row * frameHeight;
      for (int column = 0; column < columns; column++) {
        int frameX = column * frameWidth;
        for (int inset = 0; inset < borderPixels; inset++) {
          int left = frameX + inset;
          int right = frameX + frameWidth - 1 - inset;
          int top = frameY + inset;
          int bottom = frameY + frameHeight - 1 - inset;
          for (int x = frameX; x < frameX + frameWidth; x++) {
            bitmap.SetPixel(x, top, transparent);
            bitmap.SetPixel(x, bottom, transparent);
          }
          for (int y = frameY; y < frameY + frameHeight; y++) {
            bitmap.SetPixel(left, y, transparent);
            bitmap.SetPixel(right, y, transparent);
          }
        }
      }
    }
  }

  public static long RemoveStrongGreenResidue(Bitmap bitmap) {
    long removed = 0;
    for (int y = 0; y < bitmap.Height; y++) {
      for (int x = 0; x < bitmap.Width; x++) {
        Color pixel = bitmap.GetPixel(x, y);
        if (pixel.A <= 16) continue;
        if (!IsStrongGreenResidue(pixel.R, pixel.G, pixel.B)) continue;
        bitmap.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
        removed += 1;
      }
    }
    return removed;
  }

  public static TigerIChromaStats RemoveGreenScreen(Bitmap bitmap, int frameIndex) {
    Rectangle rect = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
    BitmapData data = bitmap.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    TigerIChromaStats stats = new TigerIChromaStats { Frame = frameIndex };
    try {
      int byteCount = Math.Abs(data.Stride) * bitmap.Height;
      byte[] bytes = new byte[byteCount];
      Marshal.Copy(data.Scan0, bytes, 0, byteCount);
      for (int y = 0; y < bitmap.Height; y++) {
        int rowOffset = y * Math.Abs(data.Stride);
        for (int x = 0; x < bitmap.Width; x++) {
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

          bool isBackground = IsGreenBackground(red, green, blue);
          if (alpha < 12 || isBackground) {
            bytes[offset + 3] = 0;
            stats.TransparentPixels += 1;
          } else if (green > 45 && greenDominance > 14 && greenRatio > 1.08) {
            bytes[offset + 1] = (byte)Math.Min(green, maxRedBlue + 14);
            bytes[offset + 3] = (byte)Math.Min(alpha, Math.Max(80, 255 - ((greenDominance - 12) * 5)));
            stats.DespilledPixels += 1;
            stats.VisiblePixels += 1;
          } else {
            stats.VisiblePixels += 1;
          }
        }
      }
      Marshal.Copy(bytes, 0, data.Scan0, byteCount);
    } finally {
      bitmap.UnlockBits(data);
    }
    return stats;
  }

  public static TigerIFrameQc AnalyzeFrame(Bitmap bitmap, int frameIndex, int x, int y, int width, int height) {
    TigerIFrameQc qc = new TigerIFrameQc { Frame = frameIndex };
    for (int py = y; py < y + height; py++) {
      for (int px = x; px < x + width; px++) {
        Color pixel = bitmap.GetPixel(px, py);
        if (pixel.A <= 16) continue;
        qc.VisiblePixels += 1;
        if (px == x || px == x + width - 1 || py == y || py == y + height - 1) {
          qc.TouchesEdge = true;
        }
        if (IsStrongGreenResidue(pixel.R, pixel.G, pixel.B)) {
          qc.GreenResiduePixels += 1;
        }
      }
    }
    return qc;
  }
}
"@ -ReferencedAssemblies $drawingAssembly,$primitiveAssembly

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

function Remove-GreenScreen([System.Drawing.Bitmap]$bitmap) {
  $rect = [System.Drawing.Rectangle]::new(0, 0, $bitmap.Width, $bitmap.Height)
  $data = $bitmap.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $transparentPixels = 0L
  $despilledPixels = 0L
  $visiblePixels = 0L
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

        $isBackground = Test-GreenBackgroundRgb $red $green $blue
        if ($alpha -lt 12 -or $isBackground) {
          $bytes[$offset + 3] = 0
          $transparentPixels += 1
        } elseif ($green -gt 45 -and $greenDominance -gt 14 -and $greenRatio -gt 1.08) {
          $bytes[$offset + 1] = [byte][Math]::Min($green, $maxRedBlue + 14)
          $bytes[$offset + 3] = [byte][Math]::Min($alpha, [Math]::Max(80, 255 - (($greenDominance - 12) * 5)))
          $despilledPixels += 1
          $visiblePixels += 1
        } else {
          $visiblePixels += 1
        }
      }
    }
    [Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $byteCount)
  } finally {
    $bitmap.UnlockBits($data)
  }

  return [ordered]@{
    transparentPixels = $transparentPixels
    despilledPixels = $despilledPixels
    visiblePixels = $visiblePixels
  }
}

function Get-FrameQc([System.Drawing.Bitmap]$bitmap, [int]$frameIndex, [int]$x, [int]$y, [int]$width, [int]$height) {
  $visiblePixels = 0L
  $greenResiduePixels = 0L
  $touchesEdge = $false

  for ($py = $y; $py -lt ($y + $height); $py += 1) {
    for ($px = $x; $px -lt ($x + $width); $px += 1) {
      $pixel = $bitmap.GetPixel($px, $py)
      if ($pixel.A -le 16) { continue }
      $visiblePixels += 1
      if ($px -eq $x -or $px -eq ($x + $width - 1) -or $py -eq $y -or $py -eq ($y + $height - 1)) {
        $touchesEdge = $true
      }
      if (Test-GreenBackgroundRgb ([int]$pixel.R) ([int]$pixel.G) ([int]$pixel.B)) {
        $greenResiduePixels += 1
      }
    }
  }

  return [ordered]@{
    frame = $frameIndex
    visiblePixels = $visiblePixels
    touchesEdge = $touchesEdge
    greenResiduePixels = $greenResiduePixels
  }
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $SourceCopyPath))
try {
  $sourceWidth = $source.Width
  $sourceHeight = $source.Height
  $sourceCellWidth = $sourceWidth / [double]$Columns
  $sourceCellHeight = $sourceHeight / [double]$Rows
  $outputWidth = $FrameWidth * $Columns
  $outputHeight = $FrameHeight * $Rows
  $sourceFrameRects = @()
  $chromaStats = @()

  $output = New-Object System.Drawing.Bitmap $outputWidth, $outputHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($output)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.Clear([System.Drawing.Color]::Transparent)

    for ($row = 0; $row -lt $Rows; $row += 1) {
      for ($column = 0; $column -lt $Columns; $column += 1) {
        $frameIndex = $row * $Columns + $column
        $srcX = [int][Math]::Round($column * $sourceCellWidth)
        $srcY = [int][Math]::Round($row * $sourceCellHeight)
        $nextX = [int][Math]::Round(($column + 1) * $sourceCellWidth)
        $nextY = [int][Math]::Round(($row + 1) * $sourceCellHeight)
        $srcWidth = [Math]::Max(1, [Math]::Min($sourceWidth - $srcX, $nextX - $srcX))
        $srcHeight = [Math]::Max(1, [Math]::Min($sourceHeight - $srcY, $nextY - $srcY))

        $sourceFrameRects += [ordered]@{
          frame = $frameIndex
          x = $srcX
          y = $srcY
          width = $srcWidth
          height = $srcHeight
        }

        $frame = New-Object System.Drawing.Bitmap $srcWidth, $srcHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $frameGraphics = [System.Drawing.Graphics]::FromImage($frame)
        try {
          $frameGraphics.DrawImage(
            $source,
            [System.Drawing.Rectangle]::new(0, 0, $srcWidth, $srcHeight),
            $srcX,
            $srcY,
            $srcWidth,
            $srcHeight,
            [System.Drawing.GraphicsUnit]::Pixel
          )
        } finally {
          $frameGraphics.Dispose()
        }

        $stats = [TigerIImageHelper]::RemoveGreenScreen($frame, $frameIndex)
        $chromaStats += [pscustomobject][ordered]@{
          frame = $frameIndex
          transparentPixels = $stats.TransparentPixels
          despilledPixels = $stats.DespilledPixels
          visiblePixels = $stats.VisiblePixels
        }

        $dst = [System.Drawing.Rectangle]::new($column * $FrameWidth, $row * $FrameHeight, $FrameWidth, $FrameHeight)
        $graphics.DrawImage($frame, $dst, 0, 0, $frame.Width, $frame.Height, [System.Drawing.GraphicsUnit]::Pixel)
        $frame.Dispose()
      }
    }
    [TigerIImageHelper]::ClearFrameBorders($output, $FrameWidth, $FrameHeight, $Columns, $Rows, 1)
    $finalGreenResiduePixelsRemoved = [TigerIImageHelper]::RemoveStrongGreenResidue($output)
  } finally {
    $graphics.Dispose()
  }

  $frameQc = @()
  for ($row = 0; $row -lt $Rows; $row += 1) {
    for ($column = 0; $column -lt $Columns; $column += 1) {
      $frameIndex = $row * $Columns + $column
      $qc = [TigerIImageHelper]::AnalyzeFrame($output, $frameIndex, ($column * $FrameWidth), ($row * $FrameHeight), $FrameWidth, $FrameHeight)
      $frameQc += [pscustomobject][ordered]@{
        frame = $qc.Frame
        visiblePixels = $qc.VisiblePixels
        touchesEdge = $qc.TouchesEdge
        greenResiduePixels = $qc.GreenResiduePixels
      }
    }
  }

  $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $cornerAlpha = [ordered]@{
    topLeft = $output.GetPixel(0, 0).A
    topRight = $output.GetPixel($outputWidth - 1, 0).A
    bottomLeft = $output.GetPixel(0, $outputHeight - 1).A
    bottomRight = $output.GetPixel($outputWidth - 1, $outputHeight - 1).A
  }
  $output.Dispose()

  $edgeTouchFrames = @($frameQc | Where-Object { $_.touchesEdge } | ForEach-Object { $_.frame })
  $greenResiduePixels = [int64](($frameQc | Measure-Object -Property greenResiduePixels -Sum).Sum)
  $sourceHash = (Get-FileHash -LiteralPath $SourceCopyPath -Algorithm SHA256).Hash
  $outputHash = (Get-FileHash -LiteralPath $OutputPath -Algorithm SHA256).Hash

  $meta = [ordered]@{
    id = "tiger-i-player-tank-spritesheet"
    generatedOn = "2026-05-30"
    processing = "Copied user-provided Tiger1.png into project source, chroma-keyed green background, despilled green edges, resized each logical grid frame into stable Phaser frames, and cleared a one-pixel transparent border around each fixed frame to remove scaled grid-edge residue. No generated or procedural creative art was added."
    source = [ordered]@{
      originalInput = $InputPath
      projectCopy = $SourceCopyPath
      sha256 = $sourceHash
      width = $sourceWidth
      height = $sourceHeight
      logicalColumns = $Columns
      logicalRows = $Rows
      logicalCellWidth = $sourceCellWidth
      logicalCellHeight = $sourceCellHeight
      sourceFrameRects = $sourceFrameRects
    }
    output = [ordered]@{
      path = $OutputPath
      sha256 = $outputHash
      width = $outputWidth
      height = $outputHeight
      columns = $Columns
      rows = $Rows
      frameWidth = $FrameWidth
      frameHeight = $FrameHeight
    }
    frameRanges = [ordered]@{
      idle = @(0, 1, 2, 3, 4, 5)
      fire = @(6, 7, 8, 9, 10, 11)
      heavyFire = @(12, 13, 14, 15, 16, 17)
      hit = @(18, 19, 20, 21, 22, 23)
      weak = @(18, 19, 20, 21, 22, 23)
      destroyed = @(24, 25, 26, 27, 28, 29)
    }
    qc = [ordered]@{
      transparentCornerAlpha = $cornerAlpha
      greenResiduePixels = $greenResiduePixels
      finalGreenResiduePixelsRemoved = $finalGreenResiduePixelsRemoved
      edgeTouchFrames = $edgeTouchFrames
      frameQc = $frameQc
      chromaStats = $chromaStats
    }
  }

  $meta | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $MetaPath -Encoding UTF8
} finally {
  $source.Dispose()
}

Write-Host "Copied Tiger I source: $SourceCopyPath"
Write-Host "Generated Tiger I player spritesheet: $OutputPath"
Write-Host "Generated Tiger I QC metadata: $MetaPath"
Write-Host "Source image: ${sourceWidth}x${sourceHeight}, logical grid: ${Columns}x${Rows}, logical cell: $([Math]::Round($sourceCellWidth, 3))x$([Math]::Round($sourceCellHeight, 3))"
Write-Host "Output grid: ${Columns}x${Rows}, frame: ${FrameWidth}x${FrameHeight}, sheet: ${outputWidth}x${outputHeight}"

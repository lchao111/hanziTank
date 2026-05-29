param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
  [int]$OutputWidth = 512,
  [int]$OutputHeight = 320
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path $ProjectRoot "assets\source\war-prep-tank-previews"
$outputDir = Join-Path $ProjectRoot "assets\sprites\tanks\war-prep"
New-Item -ItemType Directory -Path $sourceDir -Force | Out-Null
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$tankSources = @(
  @{
    Id = "tank_sherman"
    Slug = "sherman"
    SourcePath = Join-Path $ProjectRoot "assets\source\wwii-common-tank-spritesheet.png"
    SourceColumns = 6
    SourceRows = 3
    FallbackDownload = $null
  },
  @{
    Id = "tank_tiger"
    Slug = "tiger-i"
    SourcePath = Join-Path $sourceDir "tiger-i-player-reference.png"
    SourceColumns = 6
    SourceRows = 5
    FallbackDownload = Join-Path $HOME "Downloads\Gemini_Generated_Image_uh86whuh86whuh86.png"
  },
  @{
    Id = "tank_panzer4"
    Slug = "panzer-iv"
    SourcePath = Join-Path $sourceDir "panzer-iv-player-reference.png"
    SourceColumns = 6
    SourceRows = 5
    FallbackDownload = Join-Path $HOME "Downloads\Gemini_Generated_Image_gg3g93gg3g93gg3g.png"
  },
  @{
    Id = "tank_is2"
    Slug = "is-2"
    SourcePath = Join-Path $ProjectRoot "assets\source\is2-player-reference.png"
    SourceColumns = 6
    SourceRows = 5
    FallbackDownload = $null
  },
  @{
    Id = "tank_t34"
    Slug = "t-34"
    SourcePath = Join-Path $sourceDir "t-34-player-reference.png"
    SourceColumns = 6
    SourceRows = 5
    FallbackDownload = Join-Path $HOME "Downloads\Gemini_Generated_Image_9zhsdz9zhsdz9zhs.png"
  },
  @{
    Id = "tank_cromwell"
    Slug = "cromwell"
    SourcePath = Join-Path $ProjectRoot "assets\source\cromwell-player-reference.png"
    SourceColumns = 6
    SourceRows = 5
    FallbackDownload = $null
  },
  @{
    Id = "tank_churchill"
    Slug = "churchill"
    SourcePath = Join-Path $sourceDir "churchill-player-reference.png"
    SourceColumns = 6
    SourceRows = 5
    FallbackDownload = Join-Path $HOME "Downloads\Gemini_Generated_Image_ifft2kifft2kifft.png"
  }
)

function Test-GreenBackgroundPixel([System.Drawing.Color]$pixel) {
  if ($pixel.A -lt 12) { return $true }

  $red = [int]$pixel.R
  $green = [int]$pixel.G
  $blue = [int]$pixel.B
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

        $isBackground = (
          ($green -gt 80 -and $greenDominance -gt 18 -and $greenRatio -gt 1.15) -or
          ($green -gt 18 -and $red -lt 42 -and $blue -lt 42 -and $greenDominance -gt 6)
        )

        if ($alpha -lt 12 -or $isBackground) {
          $bytes[$offset + 3] = 0
        } elseif ($green -gt 45 -and $greenDominance -gt 14 -and $greenRatio -gt 1.08) {
          $bytes[$offset + 1] = [byte][Math]::Min($green, $maxRedBlue + 14)
          $bytes[$offset + 3] = [byte][Math]::Min($alpha, [Math]::Max(80, 255 - (($greenDominance - 12) * 5)))
        }
      }
    }

    [Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $byteCount)
  } finally {
    $bitmap.UnlockBits($data)
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

  if ($maxX -lt $minX -or $maxY -lt $minY) {
    throw "Could not find visible tank pixels after background removal."
  }

  return [System.Drawing.Rectangle]::new($minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1))
}

function New-TransparentPreview([System.Drawing.Bitmap]$frame, [string]$outputPath, [int]$width, [int]$height) {
  Remove-GreenBackground $frame
  $bounds = Get-AlphaBounds $frame

  $safeWidth = [Math]::Round($width * 0.90)
  $safeHeight = [Math]::Round($height * 0.72)
  $scale = [Math]::Min($safeWidth / [double]$bounds.Width, $safeHeight / [double]$bounds.Height)
  $drawWidth = [int][Math]::Round($bounds.Width * $scale)
  $drawHeight = [int][Math]::Round($bounds.Height * $scale)
  $drawX = [int][Math]::Round(($width - $drawWidth) / 2)
  $drawY = [int][Math]::Round(($height - $drawHeight) / 2) + 6

  if (($drawY + $drawHeight) -gt ($height - 12)) {
    $drawY = $height - 12 - $drawHeight
  }
  if ($drawY -lt 12) { $drawY = 12 }

  $preview = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($preview)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $dest = [System.Drawing.Rectangle]::new($drawX, $drawY, $drawWidth, $drawHeight)
    $graphics.DrawImage($frame, $dest, $bounds.X, $bounds.Y, $bounds.Width, $bounds.Height, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $graphics.Dispose()
  }

  $preview.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $preview.Dispose()
}

foreach ($tank in $tankSources) {
  if (-not (Test-Path $tank.SourcePath)) {
    if ($tank.FallbackDownload -and (Test-Path $tank.FallbackDownload)) {
      Copy-Item -Path $tank.FallbackDownload -Destination $tank.SourcePath -Force
      Write-Host "Imported source for $($tank.Id): $($tank.SourcePath)"
    } else {
      throw "Missing source for $($tank.Id): $($tank.SourcePath)"
    }
  }

  $source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $tank.SourcePath))
  try {
    $cellWidth = [double]$source.Width / [int]$tank.SourceColumns
    $cellHeight = [double]$source.Height / [int]$tank.SourceRows
    $srcX = 0
    $srcY = 0
    $srcWidth = [int][Math]::Round($cellWidth)
    $srcHeight = [int][Math]::Round($cellHeight)
    $frame = New-Object System.Drawing.Bitmap $srcWidth, $srcHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $frameGraphics = [System.Drawing.Graphics]::FromImage($frame)
    try {
      $frameGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $frameGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
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

    $outputPath = Join-Path $outputDir "$($tank.Slug).png"
    New-TransparentPreview $frame $outputPath $OutputWidth $OutputHeight
    $frame.Dispose()
    Write-Host "Generated $($tank.Id) preview: $outputPath"
  } finally {
    $source.Dispose()
  }
}

Write-Host "War Prep tank previews generated in $outputDir"

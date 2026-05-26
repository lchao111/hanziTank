param(
  [string]$InputPath = "assets/sprites/tanks/player-tank-spritesheet.png",
  [string]$OutputPath = "assets/sprites/tanks/player-tank-spritesheet.png",
  [int]$FrameWidth = 224,
  [int]$FrameHeight = 144,
  [int]$Columns = 6
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

if (-not (Test-Path $InputPath)) { throw "Input sheet not found: $InputPath" }

function AddSmoke([System.Drawing.Graphics]$graphics, [int]$frameX, [int]$frameY, [int]$frameIndex, [bool]$heavy) {
  $count = if ($heavy) { 8 + $frameIndex } else { 4 + [Math]::Floor($frameIndex / 2) }
  for ($i = 0; $i -lt $count; $i++) {
    $alpha = if ($heavy) { [Math]::Max(42, 152 - $i * 9) } else { [Math]::Max(34, 112 - $i * 11) }
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, 48, 54, 50))
    $x = $frameX + 76 + (($i * 23 + $frameIndex * 13) % 82)
    $y = $frameY + 12 + (($i * 17) % 48)
    $size = 17 + (($i * 7 + $frameIndex * 5) % 32)
    $graphics.FillEllipse($brush, $x, $y, $size, [int]($size * 0.72))
    $brush.Dispose()
  }
}

function AddWreckOverlay([System.Drawing.Graphics]$graphics, [int]$frameX, [int]$frameY, [int]$frameIndex) {
  $char = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(116, 19, 19, 18))
  $fire = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(186, 238, 92, 30))
  $core = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(216, 255, 213, 96))
  $graphics.FillRectangle($char, $frameX + 28, $frameY + 78, 154, 26)
  if ($frameIndex -ge 1) {
    $graphics.FillEllipse($fire, $frameX + 74, $frameY + 58, 24 + $frameIndex * 5, 16 + $frameIndex * 2)
    $graphics.FillEllipse($core, $frameX + 82, $frameY + 62, 10 + $frameIndex * 2, 8 + $frameIndex)
  }
  $char.Dispose(); $fire.Dispose(); $core.Dispose()
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $InputPath))
try {
  if ($source.Width -ne ($FrameWidth * $Columns) -or $source.Height -lt ($FrameHeight * 3)) {
    throw "Expected at least a ${Columns}x3 sheet of $FrameWidth x $FrameHeight frames; got $($source.Width)x$($source.Height)."
  }

  $outputRows = 5
  $out = New-Object System.Drawing.Bitmap ($FrameWidth * $Columns), ($FrameHeight * $outputRows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($out)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.Clear([System.Drawing.Color]::Transparent)

    $fullWidth = $FrameWidth * $Columns
    for ($row = 0; $row -lt 3; $row++) {
      $src = [System.Drawing.Rectangle]::new(0, $row * $FrameHeight, $fullWidth, $FrameHeight)
      $dst = [System.Drawing.Rectangle]::new(0, $row * $FrameHeight, $fullWidth, $FrameHeight)
      $graphics.DrawImage($source, $dst, $src, [System.Drawing.GraphicsUnit]::Pixel)
    }

    function NewColorMatrixAttributes([single[]]$values) {
      $matrix = New-Object System.Drawing.Imaging.ColorMatrix
      for ($row = 0; $row -lt 5; $row++) {
        for ($col = 0; $col -lt 5; $col++) {
          $matrix[$row, $col] = $values[$row * 5 + $col]
        }
      }
      $attributes = New-Object System.Drawing.Imaging.ImageAttributes
      $attributes.SetColorMatrix($matrix)
      return $attributes
    }

    $weakAttributes = NewColorMatrixAttributes ([single[]](
      0.62, 0.06, 0.04, 0, 0,
      0.04, 0.60, 0.04, 0, 0,
      0.03, 0.05, 0.52, 0, 0,
      0,    0,    0,    1, 0,
      0.08, 0.08, 0.05, 0, 1
    ))
    $destroyedAttributes = NewColorMatrixAttributes ([single[]](
      0.34, 0.06, 0.04, 0, 0,
      0.05, 0.32, 0.04, 0, 0,
      0.04, 0.05, 0.30, 0, 0,
      0,    0,    0,    0.92, 0,
      0.05, 0.04, 0.03, 0, 1
    ))

    for ($col = 0; $col -lt $Columns; $col++) {
      $sourceX = $col * $FrameWidth
      $weakSrc = [System.Drawing.Rectangle]::new($sourceX, 0, $FrameWidth, $FrameHeight)
      $weakDst = [System.Drawing.Rectangle]::new($sourceX, 3 * $FrameHeight, $FrameWidth, $FrameHeight)
      $graphics.DrawImage($source, $weakDst, $weakSrc.X, $weakSrc.Y, $weakSrc.Width, $weakSrc.Height, [System.Drawing.GraphicsUnit]::Pixel, $weakAttributes)

      $destroyedSrc = [System.Drawing.Rectangle]::new($sourceX, 2 * $FrameHeight, $FrameWidth, $FrameHeight)
      $destroyedDst = [System.Drawing.Rectangle]::new($sourceX, 4 * $FrameHeight, $FrameWidth, $FrameHeight)
      $graphics.DrawImage($source, $destroyedDst, $destroyedSrc.X, $destroyedSrc.Y, $destroyedSrc.Width, $destroyedSrc.Height, [System.Drawing.GraphicsUnit]::Pixel, $destroyedAttributes)

      AddSmoke $graphics $sourceX (3 * $FrameHeight) $col $false
      AddSmoke $graphics $sourceX (4 * $FrameHeight) $col $true
      AddWreckOverlay $graphics $sourceX (4 * $FrameHeight) $col
    }
  } finally {
    if ($weakAttributes) { $weakAttributes.Dispose() }
    if ($destroyedAttributes) { $destroyedAttributes.Dispose() }
    $graphics.Dispose()
  }

  $source.Dispose()
  $source = $null
  $tempOutputPath = if ((Resolve-Path $InputPath).Path -eq (Resolve-Path $OutputPath -ErrorAction SilentlyContinue).Path) { "$OutputPath.tmp.png" } else { $OutputPath }
  $out.Save($tempOutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $out.Dispose()
  if ($tempOutputPath -ne $OutputPath) {
    Move-Item -Force $tempOutputPath $OutputPath
  }
} finally {
  if ($source) { $source.Dispose() }
}

Write-Host "Extended player tank spritesheet: $OutputPath"
Write-Host "Output grid: ${Columns}x5, frame: ${FrameWidth}x${FrameHeight}"

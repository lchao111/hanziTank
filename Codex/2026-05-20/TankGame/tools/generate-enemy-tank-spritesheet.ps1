Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$frameWidth = 224
$frameHeight = 144
$columns = 4
$rows = 4
$outputPath = Join-Path (Resolve-Path '.').Path 'assets\sprites\enemies\enemy-tank-spritesheet.png'
$outputDir = Split-Path $outputPath -Parent
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

$bitmap = New-Object System.Drawing.Bitmap ($frameWidth * $columns), ($frameHeight * $rows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.Clear([System.Drawing.Color]::Transparent)

function New-Brush($hex, $alpha = 255) {
  $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
  return New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B))
}

function New-Pen($hex, $width = 2, $alpha = 255) {
  $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)), $width
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function New-Point($x, $y) { return New-Object System.Drawing.PointF ([single]$x), ([single]$y) }

function Add-RoundedRect($targetGraphics, $x, $y, $width, $height, $radius, $fillBrush, $strokePen = $null) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  $targetGraphics.FillPath($fillBrush, $path)
  if ($strokePen) { $targetGraphics.DrawPath($strokePen, $path) }
  $path.Dispose()
}

function Add-Polygon($targetGraphics, $points, $fillBrush, $strokePen = $null) {
  $pointArray = [System.Drawing.PointF[]]$points
  $targetGraphics.FillPolygon($fillBrush, $pointArray)
  if ($strokePen) { $targetGraphics.DrawPolygon($strokePen, $pointArray) }
}

function Add-Smoke($targetGraphics, $x, $y, $count, $alpha) {
  for ($index = 0; $index -lt $count; $index += 1) {
    $brush = New-Brush '#2f3942' ([Math]::Max(24, $alpha - $index * 13))
    $smokeX = $x + (($index * 17) % 48) - 20
    $smokeY = $y - (($index * 13) % 42)
    $size = 14 + (($index * 9) % 26)
    $targetGraphics.FillEllipse($brush, $smokeX, $smokeY, $size, [int]($size * 0.74))
    $brush.Dispose()
  }
}

function Add-Sparks($targetGraphics, $x, $y, $count, $spread = 1.0) {
  $yellowPen = New-Pen '#ffd166' 3 235
  $orangePen = New-Pen '#ff6b2f' 2 225
  for ($index = 0; $index -lt $count; $index += 1) {
    $angle = ($index * 43) * [Math]::PI / 180
    $length = (9 + (($index * 13) % 28)) * $spread
    $activePen = if ($index % 2 -eq 0) { $yellowPen } else { $orangePen }
    $targetGraphics.DrawLine($activePen, [single]$x, [single]$y, [single]($x + [Math]::Cos($angle) * $length), [single]($y + [Math]::Sin($angle) * $length))
  }
  $yellowPen.Dispose()
  $orangePen.Dispose()
}

function Add-EnemyTankFrame($targetGraphics, $originX, $originY, $row, $frame) {
  $isIdle = $row -eq 0
  $isFire = $row -eq 1
  $isHit = $row -eq 2
  $isDestroyed = $row -eq 3
  $phase = [Math]::Sin(($frame / 4.0) * [Math]::PI * 2)
  $shiftX = 0
  $shiftY = 0
  if ($isIdle) { $shiftY = [int]($phase * 2) }
  if ($isFire) { $shiftX = @(0, -10, -5, -1)[$frame] }
  if ($isHit) { $shiftX = @(0, 8, -7, 3)[$frame] }
  if ($isDestroyed) { $shiftY = @(0, 4, 9, 14)[$frame] }

  $baseX = $originX + 21 + $shiftX
  $baseY = $originY + 21 + $shiftY
  $outlinePen = New-Pen '#0b0d0c' 4
  $thinPen = New-Pen '#2b211c' 2
  $blackBrush = New-Brush '#10100e'
  $trackBrush = New-Brush '#1d1d19'
  $wheelBrush = New-Brush '#3b342b'
  $hullColor = if ($isDestroyed) { '#654d3f' } else { '#9f4a36' }
  $hullDarkColor = if ($isDestroyed) { '#3b302b' } else { '#662a22' }
  $turretColor = if ($isDestroyed) { '#6b5445' } else { '#b35b43' }
  $hullBrush = New-Brush $hullColor
  $hullDarkBrush = New-Brush $hullDarkColor
  $turretBrush = New-Brush $turretColor
  $highlightBrush = New-Brush '#d68a62' 150

  $targetGraphics.FillEllipse((New-Brush '#050505' 72), $baseX + 4, $baseY + 94, 162, 18)
  Add-RoundedRect $targetGraphics ($baseX + 7) ($baseY + 71) 150 31 10 $trackBrush $outlinePen
  for ($wheel = 0; $wheel -lt 7; $wheel += 1) {
    $wheelX = $baseX + 24 + $wheel * 19
    $wheelY = $baseY + 87
    $targetGraphics.FillEllipse($blackBrush, $wheelX - 8, $wheelY - 8, 16, 16)
    $targetGraphics.FillEllipse($wheelBrush, $wheelX - 5, $wheelY - 5, 10, 10)
  }
  $targetGraphics.DrawLine($thinPen, $baseX + 12, $baseY + 75, $baseX + 150, $baseY + 75)
  $targetGraphics.DrawLine($thinPen, $baseX + 13, $baseY + 100, $baseX + 145, $baseY + 100)

  Add-Polygon $targetGraphics @(
    (New-Point ($baseX + 4) ($baseY + 60)), (New-Point ($baseX + 26) ($baseY + 37)),
    (New-Point ($baseX + 120) ($baseY + 35)), (New-Point ($baseX + 153) ($baseY + 54)),
    (New-Point ($baseX + 164) ($baseY + 73)), (New-Point ($baseX + 9) ($baseY + 74))
  ) $hullBrush $outlinePen
  Add-Polygon $targetGraphics @(
    (New-Point ($baseX + 28) ($baseY + 37)), (New-Point ($baseX + 120) ($baseY + 35)),
    (New-Point ($baseX + 139) ($baseY + 47)), (New-Point ($baseX + 22) ($baseY + 50))
  ) $hullDarkBrush $thinPen
  Add-Polygon $targetGraphics @(
    (New-Point ($baseX + 31) ($baseY + 51)), (New-Point ($baseX + 91) ($baseY + 48)),
    (New-Point ($baseX + 87) ($baseY + 58)), (New-Point ($baseX + 38) ($baseY + 60))
  ) $highlightBrush $null
  Add-RoundedRect $targetGraphics ($baseX + 65) ($baseY + 19) 64 25 7 $turretBrush $outlinePen
  Add-RoundedRect $targetGraphics ($baseX + 121) ($baseY + 23) 74 10 3 $hullDarkBrush $outlinePen
  Add-RoundedRect $targetGraphics ($baseX + 189) ($baseY + 21) 17 14 3 $hullDarkBrush $outlinePen

  for ($rivet = 0; $rivet -lt 5; $rivet += 1) {
    $targetGraphics.FillEllipse($blackBrush, $baseX + 43 + $rivet * 23, $baseY + 56, 5, 5)
  }

  if ($isFire -and $frame -ge 1 -and $frame -le 2) {
    Add-Polygon $targetGraphics @(
      (New-Point ($baseX + 205) ($baseY + 25)), (New-Point ($baseX + 224) ($baseY + 12)),
      (New-Point ($baseX + 217) ($baseY + 27)), (New-Point ($baseX + 224) ($baseY + 38)),
      (New-Point ($baseX + 205) ($baseY + 34))
    ) (New-Brush '#ff6b2f' 228) $null
    Add-Polygon $targetGraphics @(
      (New-Point ($baseX + 205) ($baseY + 27)), (New-Point ($baseX + 217) ($baseY + 21)),
      (New-Point ($baseX + 213) ($baseY + 29)), (New-Point ($baseX + 219) ($baseY + 34)),
      (New-Point ($baseX + 205) ($baseY + 33))
    ) (New-Brush '#fff2a1' 240) $null
    $targetGraphics.FillEllipse((New-Brush '#ffffff' 75), $baseX + 183, $baseY + 15, 36, 28)
  }

  if ($isHit) {
    $targetGraphics.FillEllipse((New-Brush '#ffffff' @(28, 90, 54, 24)[$frame]), $baseX + 36, $baseY + 28, 92, 42)
    $targetGraphics.FillEllipse((New-Brush '#fff2a1' @(22, 70, 46, 20)[$frame]), $baseX + 70, $baseY + 16, 62, 31)
    $sparkXs = @(($baseX + 116), ($baseX + 71), ($baseX + 148), ($baseX + 102))
    $sparkYs = @(($baseY + 38), ($baseY + 58), ($baseY + 48), ($baseY + 32))
    Add-Sparks $targetGraphics $sparkXs[$frame] $sparkYs[$frame] (9 + $frame * 2) 1.0
    $targetGraphics.FillEllipse((New-Brush '#1f2937' 110), $baseX + 82, $baseY + 24, 24, 14)
  }

  if ($isDestroyed) {
    Add-Smoke $targetGraphics ($baseX + 82) ($baseY + 17) (6 + $frame * 2) 170
    $targetGraphics.FillRectangle((New-Brush '#151514' 150), $baseX + 19, $baseY + 48, 131, 31)
    if ($frame -ge 1) { Add-Sparks $targetGraphics ($baseX + 86) ($baseY + 58) (11 + $frame * 4) 1.2 }
    if ($frame -ge 2) {
      Add-Polygon $targetGraphics @(
        (New-Point ($baseX + 48) ($baseY + 35)), (New-Point ($baseX + 78) ($baseY + 17)),
        (New-Point ($baseX + 113) ($baseY + 34)), (New-Point ($baseX + 93) ($baseY + 47))
      ) (New-Brush '#2a2521') (New-Pen '#0d0c0a' 2)
    }
    if ($frame -eq 3) {
      Add-RoundedRect $targetGraphics ($baseX + 128) ($baseY + 31) 54 8 3 (New-Brush '#1f1b18') (New-Pen '#0d0c0a' 2)
    }
  }

  foreach ($resource in @($outlinePen, $thinPen, $blackBrush, $trackBrush, $wheelBrush, $hullBrush, $hullDarkBrush, $turretBrush, $highlightBrush)) {
    $resource.Dispose()
  }
}

for ($row = 0; $row -lt $rows; $row += 1) {
  for ($column = 0; $column -lt $columns; $column += 1) {
    Add-EnemyTankFrame $graphics ($column * $frameWidth) ($row * $frameHeight) $row $column
  }
}

$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
Write-Host "Generated $outputPath"
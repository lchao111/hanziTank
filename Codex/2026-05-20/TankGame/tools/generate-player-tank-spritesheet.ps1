Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$frameWidth = 224
$frameHeight = 144
$columns = 4
$rows = 5
$outputPath = Join-Path (Resolve-Path '.').Path 'assets\sprites\tanks\player-tank-spritesheet.png'
$outputDir = Split-Path $outputPath -Parent
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

$bitmap = New-Object System.Drawing.Bitmap ($frameWidth * $columns), ($frameHeight * $rows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.Clear([System.Drawing.Color]::Transparent)

function Brush($hex, $alpha = 255) {
  $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
  return New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B))
}

function PenC($hex, $width = 2, $alpha = 255) {
  $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)), $width
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function PointF($x, $y) { return New-Object System.Drawing.PointF ([single]$x), ([single]$y) }

function FillPoly($g, $points, $fill, $stroke = $null) {
  $array = [System.Drawing.PointF[]]$points
  $g.FillPolygon($fill, $array)
  if ($stroke) { $g.DrawPolygon($stroke, $array) }
}

function FillRoundRect($g, $x, $y, $w, $h, $r, $fill, $stroke = $null) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $g.FillPath($fill, $path)
  if ($stroke) { $g.DrawPath($stroke, $path) }
  $path.Dispose()
}

function DrawSmoke($g, $x, $y, $count, $alpha) {
  for ($i = 0; $i -lt $count; $i++) {
    $brush = Brush '#2f3942' ([Math]::Max(30, $alpha - $i * 14))
    $sx = $x + (($i * 19) % 42) - 18
    $sy = $y - (($i * 11) % 38)
    $size = 14 + (($i * 7) % 22)
    $g.FillEllipse($brush, $sx, $sy, $size, [int]($size * 0.72))
    $brush.Dispose()
  }
}

function DrawSparks($g, $x, $y, $count) {
  $yellow = PenC '#ffd166' 3 230
  $orange = PenC '#ff7a2f' 2 220
  for ($i = 0; $i -lt $count; $i++) {
    $angle = ($i * 41) * [Math]::PI / 180
    $len = 9 + (($i * 11) % 28)
    $activePen = if ($i % 2 -eq 0) { $yellow } else { $orange }
    $g.DrawLine($activePen, [single]$x, [single]$y, [single]($x + [Math]::Cos($angle) * $len), [single]($y + [Math]::Sin($angle) * $len))
  }
  $yellow.Dispose(); $orange.Dispose()
}

function DrawTankFrame($g, $ox, $oy, $row, $frame) {
  $idle = $row -eq 0
  $fire = $row -eq 1
  $hit = $row -eq 2
  $weak = $row -eq 3
  $destroyed = $row -eq 4
  $phase = [Math]::Sin(($frame / 4.0) * [Math]::PI * 2)
  $shiftX = 0
  $shiftY = 0
  if ($idle) { $shiftY = [int]($phase * 2) }
  if ($fire) { $shiftX = @(0, -8, -4, 0)[$frame] }
  if ($hit) { $shiftX = @(0, -6, 6, -2)[$frame] }
  if ($destroyed) { $shiftY = @(0, 3, 8, 12)[$frame] }

  $x = $ox + 24 + $shiftX
  $y = $oy + 21 + $shiftY
  $outline = PenC '#0c0f0c' 4
  $thin = PenC '#2c3027' 2
  $track = Brush '#1c201b'
  $trackLight = Brush '#34382f'
  $hullColor = if ($weak -or $destroyed) { '#78735b' } else { '#aaa27e' }
  $hullDarkColor = if ($weak -or $destroyed) { '#4d4b3d' } else { '#6d6a52' }
  $turretColor = if ($weak -or $destroyed) { '#817a60' } else { '#b9af86' }
  $hull = Brush $hullColor
  $hullDark = Brush $hullDarkColor
  $turret = Brush $turretColor
  $black = Brush '#10130f'

  $g.FillEllipse((Brush '#050505' 70), $x + 4, $y + 93, 158, 17)
  FillRoundRect $g ($x + 6) ($y + 70) 146 30 10 $track $outline
  for ($wheel = 0; $wheel -lt 7; $wheel++) {
    $wx = $x + 22 + $wheel * 18
    $wy = $y + 86
    $g.FillEllipse($black, $wx - 8, $wy - 8, 16, 16)
    $g.FillEllipse($hullDark, $wx - 5, $wy - 5, 10, 10)
  }
  $g.DrawLine($thin, $x + 11, $y + 73, $x + 145, $y + 73)
  $g.DrawLine($thin, $x + 12, $y + 99, $x + 142, $y + 99)

  FillPoly $g @(
    (PointF ($x + 4) ($y + 59)), (PointF ($x + 28) ($y + 35)),
    (PointF ($x + 119) ($y + 34)), (PointF ($x + 151) ($y + 55)),
    (PointF ($x + 161) ($y + 72)), (PointF ($x + 9) ($y + 73))
  ) $hull $outline
  FillPoly $g @(
    (PointF ($x + 29) ($y + 35)), (PointF ($x + 119) ($y + 34)),
    (PointF ($x + 138) ($y + 47)), (PointF ($x + 20) ($y + 49))
  ) $hullDark $thin
  FillRoundRect $g ($x + 64) ($y + 19) 63 24 6 $turret $outline
  FillRoundRect $g ($x + 119) ($y + 23) 73 10 3 $hullDark $outline
  FillRoundRect $g ($x + 186) ($y + 21) 18 14 3 $hullDark $outline
  for ($riv = 0; $riv -lt 5; $riv++) { $g.FillEllipse($black, $x + 42 + $riv * 23, $y + 56, 5, 5) }

  if ($fire -and $frame -ge 1 -and $frame -le 2) {
    FillPoly $g @(
      (PointF ($x + 203) ($y + 25)), (PointF ($x + 222) ($y + 12)),
      (PointF ($x + 215) ($y + 27)), (PointF ($x + 224) ($y + 38)),
      (PointF ($x + 202) ($y + 34))
    ) (Brush '#ff7a2f' 220) $null
    FillPoly $g @(
      (PointF ($x + 203) ($y + 27)), (PointF ($x + 215) ($y + 21)),
      (PointF ($x + 211) ($y + 29)), (PointF ($x + 218) ($y + 34)),
      (PointF ($x + 203) ($y + 33))
    ) (Brush '#fff2a1' 230) $null
  }

  if ($hit) {
    $flashAlpha = @(28, 85, 48, 22)[$frame]
    $g.FillRectangle((Brush '#ffffff' $flashAlpha), $ox + 12, $oy + 12, 190, 108)
    $sparkXOptions = @(($x + 118), ($x + 72), ($x + 146), ($x + 102))
    $sparkYOptions = @(($y + 38), ($y + 58), ($y + 48), ($y + 31))
    $sparkX = $sparkXOptions[$frame]
    $sparkY = $sparkYOptions[$frame]
    DrawSparks $g $sparkX $sparkY (8 + $frame)
  }

  if ($weak) {
    DrawSmoke $g ($x + 80) ($y + 24) (3 + $frame) 125
    $g.FillEllipse((Brush '#f97316' 180), $x + 70, $y + 50, 13, 11)
    $g.FillEllipse((Brush '#facc15' 160), $x + 74, $y + 52, 6, 6)
  }

  if ($destroyed) {
    DrawSmoke $g ($x + 80) ($y + 18) (5 + $frame * 2) 165
    if ($frame -ge 1) { DrawSparks $g ($x + 84) ($y + 60) (10 + $frame * 3) }
    $g.FillRectangle((Brush '#1a1a18' 120), $x + 20, $y + 45, 126, 34)
    if ($frame -ge 2) {
      FillPoly $g @(
        (PointF ($x + 45) ($y + 34)), (PointF ($x + 76) ($y + 16)),
        (PointF ($x + 111) ($y + 34)), (PointF ($x + 92) ($y + 46))
      ) (Brush '#2b2a23') (PenC '#0d0d0b' 2)
    }
  }

  foreach ($obj in @($outline,$thin,$track,$trackLight,$hull,$hullDark,$turret,$black)) { $obj.Dispose() }
}

for ($row = 0; $row -lt $rows; $row++) {
  for ($col = 0; $col -lt $columns; $col++) {
    DrawTankFrame $graphics ($col * $frameWidth) ($row * $frameHeight) $row $col
  }
}

$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
Write-Host "Generated $outputPath"

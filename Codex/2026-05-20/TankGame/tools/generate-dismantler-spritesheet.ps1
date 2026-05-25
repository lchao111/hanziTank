[System.Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseApprovedVerbs', '')]
param(
  [string]$OutputPath = "assets/sprites/enemies/tank-dismantler-spritesheet.png",
  [int]$FrameWidth = 224,
  [int]$FrameHeight = 224
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$outputDir = Split-Path $OutputPath -Parent
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

$sheet = New-Object System.Drawing.Bitmap ($FrameWidth * 6), ($FrameHeight * 2), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($sheet)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.Clear([System.Drawing.Color]::Transparent)

function C([string]$hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function Brush([string]$hex) {
  return New-Object System.Drawing.SolidBrush (C $hex)
}

function Pen([string]$hex, [float]$width = 3) {
  $pen = New-Object System.Drawing.Pen (C $hex), $width
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function Points([double[]]$values) {
  [System.Drawing.PointF[]]$points = [System.Drawing.PointF[]]::new([int]($values.Length / 2))
  for ($i = 0; $i -lt $values.Length; $i += 2) {
    $points[$i / 2] = [System.Drawing.PointF]::new([float]$values[$i], [float]$values[$i + 1])
  }
  return ,$points
}

function AddPolygonShape($g, [double[]]$values, [string]$fill, [string]$stroke = "#111611", [float]$strokeWidth = 4) {
  [System.Drawing.PointF[]]$pts = Points $values
  $b = Brush $fill
  $p = Pen $stroke $strokeWidth
  $g.FillPolygon($b, $pts)
  $g.DrawPolygon($p, $pts)
  $b.Dispose(); $p.Dispose()
}

function AddRoundedRectShape($g, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r, [string]$fill, [string]$stroke = "#111611", [float]$strokeWidth = 4) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $b = Brush $fill
  $p = Pen $stroke $strokeWidth
  $g.FillPath($b, $path)
  $g.DrawPath($p, $path)
  $b.Dispose(); $p.Dispose(); $path.Dispose()
}

function AddRotatedRectShape($g, [float]$cx, [float]$cy, [float]$w, [float]$h, [float]$angle, [string]$fill, [string]$stroke = "#111611", [float]$strokeWidth = 4) {
  $state = $g.Save()
  $g.TranslateTransform($cx, $cy)
  $g.RotateTransform($angle)
  AddRoundedRectShape $g (-$w / 2) (-$h / 2) $w $h 6 $fill $stroke $strokeWidth
  $g.Restore($state)
}

function AddEllipseShape($g, [float]$x, [float]$y, [float]$w, [float]$h, [string]$fill, [float]$alpha = 1) {
  $color = C $fill
  if ($alpha -lt 1) { $color = [System.Drawing.Color]::FromArgb([int](255 * $alpha), $color) }
  $brush = New-Object System.Drawing.SolidBrush $color
  $g.FillEllipse($brush, $x, $y, $w, $h)
  $brush.Dispose()
}

function AddLineShape($g, [float]$x1, [float]$y1, [float]$x2, [float]$y2, [string]$color, [float]$width = 4) {
  $p = Pen $color $width
  $g.DrawLine($p, $x1, $y1, $x2, $y2)
  $p.Dispose()
}

function AddMuzzleFlashShape($g, [float]$x, [float]$y, [float]$scale = 1) {
  AddPolygonShape $g @(
    $x, ($y - 22 * $scale), ($x + 10 * $scale), ($y - 6 * $scale),
    ($x + 28 * $scale), $y, ($x + 10 * $scale), ($y + 6 * $scale),
    $x, ($y + 22 * $scale), ($x - 7 * $scale), ($y + 6 * $scale),
    ($x - 24 * $scale), $y, ($x - 7 * $scale), ($y - 6 * $scale)
  ) "#ffb22e" "#3d1e08" 2
  AddEllipseShape $g ($x - 9 * $scale) ($y - 9 * $scale) (18 * $scale) (18 * $scale) "#fff0a3" 0.95
}

function AddDismantlerFrame($g, [int]$frameX, [int]$frameY, [int]$index, [bool]$attack) {
  $x = $frameX
  $y = $frameY
  $bob = @(1, -1, 0, 2, -1, 1)[$index]
  $lean = @(0, -2, 1, 2, -1, 0)[$index]
  $leg = @(-6, 3, 7, -4, 5, -2)[$index]
  $armSwing = @(2, -8, -14, -6, 5, 11)[$index]
  if ($attack) {
    $bob = @(0, -2, -6, -3, 2, 1)[$index]
    $lean = @(0, 4, 7, 5, 1, 0)[$index]
    $armSwing = @(-18, -42, -68, -26, 16, 28)[$index]
    $leg = @(0, 2, 7, 3, -4, -2)[$index]
  }

  AddEllipseShape $g ($x + 42) ($y + 199) 140 14 "#000000" 0.25

  $cx = $x + 124 + $lean
  $baseY = $y + 91 + $bob

  AddRotatedRectShape $g ($x + 91 - $leg) ($y + 168) 25 63 -8 "#2b362e" "#0e120f" 5
  AddRotatedRectShape $g ($x + 142 + $leg) ($y + 168) 25 63 7 "#2b362e" "#0e120f" 5
  AddRoundedRectShape $g ($x + 62 - $leg) ($y + 195) 50 19 5 "#1b241e" "#0e120f" 5
  AddRoundedRectShape $g ($x + 127 + $leg) ($y + 195) 50 19 5 "#1b241e" "#0e120f" 5

  AddPolygonShape $g @(
    ($cx - 60), ($baseY + 3), ($cx - 35), ($baseY - 36),
    ($cx + 32), ($baseY - 39), ($cx + 63), ($baseY + 2),
    ($cx + 45), ($baseY + 77), ($cx - 46), ($baseY + 78)
  ) "#334137" "#0f1511" 6

  AddPolygonShape $g @(
    ($cx - 46), ($baseY + 10), ($cx - 22), ($baseY - 12),
    ($cx + 31), ($baseY - 11), ($cx + 45), ($baseY + 11),
    ($cx + 31), ($baseY + 56), ($cx - 30), ($baseY + 57)
  ) "#26342d" "#0f1511" 3
  AddLineShape $g ($cx - 31) ($baseY + 19) ($cx - 6) ($baseY + 18) "#7b896f" 2
  AddLineShape $g ($cx + 5) ($baseY + 45) ($cx + 31) ($baseY + 43) "#7b896f" 2
  AddEllipseShape $g ($cx - 36) ($baseY + 39) 12 12 "#ff9e27" 1
  AddEllipseShape $g ($cx - 33) ($baseY + 42) 5 5 "#ffe08b" 1

  AddRoundedRectShape $g ($cx - 40) ($baseY - 63) 79 39 8 "#2e3d34" "#0f1511" 5
  AddRoundedRectShape $g ($cx - 20) ($baseY - 54) 38 12 4 "#172018" "#0f1511" 3
  AddRoundedRectShape $g ($cx - 15) ($baseY - 50) 30 5 3 "#ffad2f" "#ffad2f" 1
  AddRoundedRectShape $g ($cx + 9) ($baseY - 34) 34 36 12 "#1d2724" "#0f1511" 4
  AddRoundedRectShape $g ($cx + 15) ($baseY - 27) 24 22 8 "#3d4b54" "#0f1511" 3

  AddRotatedRectShape $g ($cx - 70) ($baseY - 2) 34 22 -20 "#3b4a3f" "#0f1511" 5
  AddRotatedRectShape $g ($cx + 60) ($baseY - 1) 34 22 20 "#3b4a3f" "#0f1511" 5

  $leftArmAngle = -8 + $armSwing * 0.15
  $rightArmAngle = 28 - $armSwing * 0.25
  $weaponAngle = -10
  if ($attack) {
    $leftArmAngle = @(-18, -45, -68, -38, -12, -8)[$index]
    $rightArmAngle = @(25, -10, -48, -18, 18, 32)[$index]
    $weaponAngle = @(-16, -28, -34, -15, -7, -10)[$index]
  }
  AddRotatedRectShape $g ($cx - 89) ($baseY + 26) 24 60 $leftArmAngle "#7b543f" "#0f1511" 5
  AddRotatedRectShape $g ($cx - 105) ($baseY + 13) 25 50 ($leftArmAngle - 78) "#42534a" "#0f1511" 5
  AddRotatedRectShape $g ($cx + 74) ($baseY + 32) 24 58 $rightArmAngle "#9b6b52" "#0f1511" 5

  $hammerX = $cx + 104
  $hammerY = $baseY + 67
  if ($attack) {
    $hammerX = $cx + @(88, 76, 48, 69, 91, 98)[$index]
    $hammerY = $baseY + @(34, 1, -27, 23, 71, 86)[$index]
  }
  AddRotatedRectShape $g $hammerX $hammerY 32 48 ($rightArmAngle - 12) "#53606b" "#0f1511" 5
  AddEllipseShape $g ($hammerX - 16) ($hammerY - 25) 31 18 "#1b2529" 1

  $cannonX = $cx - 69
  $cannonY = $baseY - 50
  if ($attack -and $index -eq 5) { $cannonY -= 8 }
  AddRotatedRectShape $g ($cannonX - 18) ($cannonY + 2) 58 17 $weaponAngle "#1c2421" "#0f1511" 4
  AddRotatedRectShape $g ($cannonX - 43) ($cannonY + 8) 31 23 $weaponAngle "#4b3c36" "#0f1511" 4
  AddRotatedRectShape $g ($cannonX + 8) ($cannonY + 6) 38 20 $weaponAngle "#4a594d" "#0f1511" 4

  if ($attack -and ($index -eq 2 -or $index -eq 3)) {
    AddMuzzleFlashShape $g ($x + 46) ($y + 101) 0.78
    AddLineShape $g ($x + 38) ($y + 101) ($x + 15) ($y + 101) "#fff0a3" 2
  }
  if ($attack -and $index -eq 4) {
    AddEllipseShape $g ($cx + 45) ($baseY + 109) 64 25 "#ff7a1f" 0.72
    AddEllipseShape $g ($cx + 58) ($baseY + 116) 36 13 "#ffe08b" 0.86
  }
  if ($attack -and $index -eq 5) {
    AddEllipseShape $g ($cx + 70) ($baseY + 112) 26 15 "#253039" 0.8
    AddEllipseShape $g ($cx + 90) ($baseY + 104) 19 12 "#253039" 0.55
  }

  AddLineShape $g ($cx - 35) ($baseY + 64) ($cx - 14) ($baseY + 63) "#6d7b69" 2
  AddLineShape $g ($cx + 14) ($baseY + 63) ($cx + 35) ($baseY + 61) "#6d7b69" 2
}

for ($i = 0; $i -lt 6; $i++) {
  AddDismantlerFrame $graphics ($i * $FrameWidth) 0 $i $false
  AddDismantlerFrame $graphics ($i * $FrameWidth) $FrameHeight $i $true
}

$sheet.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$sheet.Dispose()
Write-Host "Generated Tank Dismantler spritesheet: $OutputPath"
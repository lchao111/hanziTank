param(
  [string]$OutputPath = "assets/sprites/ui/switch-general-button.png",
  [int]$Size = 512
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$outputDir = Split-Path $OutputPath -Parent
if ($outputDir -and -not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

function Color([int]$a, [int]$r, [int]$g, [int]$b) {
  return [System.Drawing.Color]::FromArgb($a, $r, $g, $b)
}

function Rect([int]$x, [int]$y, [int]$w, [int]$h) {
  return [System.Drawing.Rectangle]::new($x, $y, $w, $h)
}

function RoundedPath([System.Drawing.Rectangle]$rect, [int]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function FillRounded([System.Drawing.Graphics]$graphics, [System.Drawing.Rectangle]$rect, [int]$radius, [System.Drawing.Brush]$brush) {
  $path = RoundedPath $rect $radius
  try { $graphics.FillPath($brush, $path) } finally { $path.Dispose() }
}

function StrokeRounded([System.Drawing.Graphics]$graphics, [System.Drawing.Rectangle]$rect, [int]$radius, [System.Drawing.Pen]$pen) {
  $path = RoundedPath $rect $radius
  try { $graphics.DrawPath($pen, $path) } finally { $path.Dispose() }
}

function Draw-General([System.Drawing.Graphics]$graphics, [int]$centerX, [int]$baseY, [bool]$facingRight) {
  $uniform = New-Object System.Drawing.SolidBrush (Color 255 31 38 32)
  $uniformLight = New-Object System.Drawing.SolidBrush (Color 255 74 88 54)
  $trim = New-Object System.Drawing.Pen (Color 220 198 160 72), 5
  $outline = New-Object System.Drawing.Pen (Color 210 12 15 13), 7
  try {
    $shoulders = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shoulders.AddBezier($centerX - 76, $baseY + 46, $centerX - 54, $baseY - 6, $centerX - 24, $baseY - 20, $centerX, $baseY - 18)
    $shoulders.AddBezier($centerX + 24, $baseY - 20, $centerX + 58, $baseY - 4, $centerX + 82, $baseY + 46, $centerX + 82, $baseY + 64)
    $shoulders.AddLine($centerX + 82, $baseY + 64, $centerX - 76, $baseY + 64)
    $shoulders.CloseFigure()
    $graphics.FillPath($uniform, $shoulders)
    $graphics.DrawPath($outline, $shoulders)
    $shoulders.Dispose()

    $headX = if ($facingRight) { $centerX - 27 } else { $centerX - 42 }
    $graphics.FillEllipse($uniform, $headX, $baseY - 108, 76, 92)
    $graphics.DrawEllipse($outline, $headX, $baseY - 108, 76, 92)
    [System.Drawing.Point[]]$nose = if ($facingRight) {
      @([System.Drawing.Point]::new($centerX + 38, $baseY - 68), [System.Drawing.Point]::new($centerX + 72, $baseY - 52), [System.Drawing.Point]::new($centerX + 36, $baseY - 42))
    } else {
      @([System.Drawing.Point]::new($centerX - 2, $baseY - 68), [System.Drawing.Point]::new($centerX - 36, $baseY - 52), [System.Drawing.Point]::new($centerX - 1, $baseY - 42))
    }
    $graphics.FillPolygon($uniform, $nose)

    [System.Drawing.Point[]]$cap = if ($facingRight) {
      @([System.Drawing.Point]::new($centerX - 46, $baseY - 104), [System.Drawing.Point]::new($centerX + 24, $baseY - 130), [System.Drawing.Point]::new($centerX + 88, $baseY - 102), [System.Drawing.Point]::new($centerX + 48, $baseY - 84), [System.Drawing.Point]::new($centerX - 44, $baseY - 82))
    } else {
      @([System.Drawing.Point]::new($centerX + 42, $baseY - 104), [System.Drawing.Point]::new($centerX - 28, $baseY - 130), [System.Drawing.Point]::new($centerX - 92, $baseY - 102), [System.Drawing.Point]::new($centerX - 52, $baseY - 84), [System.Drawing.Point]::new($centerX + 44, $baseY - 82))
    }
    $graphics.FillPolygon($uniform, $cap)
    $graphics.DrawPolygon($outline, $cap)
    $badgeX = if ($facingRight) { $centerX + 10 } else { $centerX - 34 }
    $graphics.FillEllipse($uniformLight, $badgeX, $baseY - 113, 20, 20)
    $graphics.DrawEllipse($trim, $badgeX + 2, $baseY - 111, 16, 16)
    $graphics.DrawLine($trim, $centerX - 36, $baseY - 36, $centerX - 12, $baseY + 34)
    $graphics.DrawLine($trim, $centerX + 34, $baseY - 36, $centerX + 10, $baseY + 34)
  } finally {
    $uniform.Dispose()
    $uniformLight.Dispose()
    $trim.Dispose()
    $outline.Dispose()
  }
}

function Draw-Arrow([System.Drawing.Graphics]$graphics, [bool]$top) {
  $gold = New-Object System.Drawing.Pen (Color 235 221 164 42), 18
  $dark = New-Object System.Drawing.Pen (Color 160 92 69 24), 26
  $shine = New-Object System.Drawing.Pen (Color 210 255 218 91), 7
  $brush = New-Object System.Drawing.SolidBrush (Color 238 221 164 42)
  try {
    foreach ($pen in @($dark, $gold, $shine)) {
      $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
      $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    }
    if ($top) {
      foreach ($pen in @($dark, $gold, $shine)) { $graphics.DrawBezier($pen, 170, 184, 212, 104, 322, 104, 365, 184) }
      $graphics.FillPolygon($brush, [System.Drawing.Point[]]@([System.Drawing.Point]::new(352, 150), [System.Drawing.Point]::new(404, 188), [System.Drawing.Point]::new(344, 207)))
    } else {
      foreach ($pen in @($dark, $gold, $shine)) { $graphics.DrawBezier($pen, 342, 328, 298, 408, 190, 408, 147, 328) }
      $graphics.FillPolygon($brush, [System.Drawing.Point[]]@([System.Drawing.Point]::new(160, 362), [System.Drawing.Point]::new(108, 324), [System.Drawing.Point]::new(168, 305)))
    }
  } finally {
    $gold.Dispose()
    $dark.Dispose()
    $shine.Dispose()
    $brush.Dispose()
  }
}

$bitmap = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
try {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $shadow = New-Object System.Drawing.SolidBrush (Color 92 18 16 12)
  try { $graphics.FillEllipse($shadow, 58, 432, 396, 48) } finally { $shadow.Dispose() }

  $outerRect = Rect 54 48 404 404
  $outerBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $outerRect, (Color 255 218 178 77), (Color 255 68 74 60), 45
  try { FillRounded $graphics $outerRect 54 $outerBrush } finally { $outerBrush.Dispose() }
  $outerPen = New-Object System.Drawing.Pen (Color 230 20 22 18), 12
  try { StrokeRounded $graphics $outerRect 54 $outerPen } finally { $outerPen.Dispose() }

  $metalRect = Rect 72 66 368 368
  $metal = New-Object System.Drawing.Drawing2D.LinearGradientBrush $metalRect, (Color 255 238 206 108), (Color 255 94 77 44), 90
  try { FillRounded $graphics $metalRect 42 $metal } finally { $metal.Dispose() }

  $panelRect = Rect 101 98 310 304
  $panel = New-Object System.Drawing.Drawing2D.LinearGradientBrush $panelRect, (Color 255 99 112 72), (Color 255 47 59 39), 90
  try { FillRounded $graphics $panelRect 34 $panel } finally { $panel.Dispose() }
  $innerPen = New-Object System.Drawing.Pen (Color 230 16 18 15), 9
  try { StrokeRounded $graphics $panelRect 34 $innerPen } finally { $innerPen.Dispose() }
  $highlightPen = New-Object System.Drawing.Pen (Color 120 255 232 157), 5
  try { $graphics.DrawArc($highlightPen, 116, 111, 280, 260, 205, 118) } finally { $highlightPen.Dispose() }

  $paperBrush = New-Object System.Drawing.SolidBrush (Color 235 215 183 103)
  $paperPen = New-Object System.Drawing.Pen (Color 155 75 61 36), 4
  try {
    FillRounded $graphics (Rect 142 144 92 150) 13 $paperBrush
    StrokeRounded $graphics (Rect 142 144 92 150) 13 $paperPen
    FillRounded $graphics (Rect 278 144 92 150) 13 $paperBrush
    StrokeRounded $graphics (Rect 278 144 92 150) 13 $paperPen
    $graphics.DrawLine($paperPen, 158, 181, 218, 181)
    $graphics.DrawLine($paperPen, 158, 207, 214, 207)
    $graphics.DrawLine($paperPen, 294, 181, 354, 181)
    $graphics.DrawLine($paperPen, 298, 207, 350, 207)
  } finally {
    $paperBrush.Dispose()
    $paperPen.Dispose()
  }

  Draw-General $graphics 177 322 $true
  Draw-General $graphics 335 322 $false

  $glow = New-Object System.Drawing.SolidBrush (Color 86 255 204 68)
  try { $graphics.FillEllipse($glow, 188, 188, 136, 136) } finally { $glow.Dispose() }
  Draw-Arrow $graphics $true
  Draw-Arrow $graphics $false

  $centerRing = New-Object System.Drawing.Pen (Color 210 255 230 113), 12
  try { $graphics.DrawEllipse($centerRing, 214, 214, 84, 84) } finally { $centerRing.Dispose() }

  $random = [System.Random]::new(20260529)
  for ($i = 0; $i -lt 95; $i += 1) {
    $alpha = $random.Next(18, 56)
    $tone = $random.Next(145, 232)
    $brush = New-Object System.Drawing.SolidBrush (Color $alpha $tone $tone ([Math]::Max(80, $tone - 64)))
    try { $graphics.FillRectangle($brush, $random.Next(82, 428), $random.Next(76, 424), $random.Next(1, 4), $random.Next(1, 4)) } finally { $brush.Dispose() }
  }
} finally {
  $graphics.Dispose()
}

$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()

Write-Host "Generated Switch General button: $OutputPath"
Write-Host "Output size: ${Size}x${Size}"
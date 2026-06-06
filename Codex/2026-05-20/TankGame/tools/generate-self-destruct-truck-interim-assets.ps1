[CmdletBinding()]
param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$enemyDir = Join-Path $ProjectRoot "assets/sprites/enemies"
$effectDir = Join-Path $ProjectRoot "assets/sprites/effects"
$galleryDir = Join-Path $ProjectRoot "assets/sprites/enemies/gallery"
$sourceDir = Join-Path $ProjectRoot "assets/source/enemy-candidates"
New-Item -ItemType Directory -Force -Path $enemyDir, $effectDir, $galleryDir, $sourceDir | Out-Null

$truckSheetPath = Join-Path $enemyDir "self-destruct-truck-interim-spritesheet.png"
$explosionSheetPath = Join-Path $effectDir "self-destruct-truck-explosion-interim-spritesheet.png"
$galleryPreviewPath = Join-Path $galleryDir "self-destruct-truck-interim-preview.png"
$metaPath = Join-Path $sourceDir "self-destruct-truck-interim-pipeline-meta.json"

$frameWidth = 469
$frameHeight = 300
$columns = 6
$rows = 5
$explosionFrameWidth = 320
$explosionFrameHeight = 192
$explosionColumns = 4
$explosionRows = 2

function Color-Rgba {
  param([int]$R, [int]$G, [int]$B, [int]$A = 255)
  return [System.Drawing.Color]::FromArgb($A, $R, $G, $B)
}

function New-Brush {
  param([System.Drawing.Color]$Color)
  return [System.Drawing.SolidBrush]::new($Color)
}

function New-Pen {
  param([System.Drawing.Color]$Color, [float]$Width = 1)
  $pen = [System.Drawing.Pen]::new($Color, $Width)
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function New-RoundedPath {
  param(
    [System.Drawing.RectangleF]$Rect,
    [float]$Radius
  )

  $diameter = [Math]::Max(1, $Radius * 2)
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddArc($Rect.X, $Rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($Rect.Right - $diameter, $Rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($Rect.Right - $diameter, $Rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($Rect.X, $Rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRect {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.RectangleF]$Rect,
    [float]$Radius,
    [System.Drawing.Color]$Fill,
    [System.Drawing.Color]$Stroke,
    [float]$StrokeWidth = 4
  )

  $path = New-RoundedPath -Rect $Rect -Radius $Radius
  $brush = New-Brush $Fill
  $pen = New-Pen $Stroke $StrokeWidth
  try {
    $Graphics.FillPath($brush, $path)
    $Graphics.DrawPath($pen, $path)
  }
  finally {
    $pen.Dispose()
    $brush.Dispose()
    $path.Dispose()
  }
}

function Fill-Polygon {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.PointF[]]$Points,
    [System.Drawing.Color]$Fill,
    [System.Drawing.Color]$Stroke,
    [float]$StrokeWidth = 4
  )

  $brush = New-Brush $Fill
  $pen = New-Pen $Stroke $StrokeWidth
  try {
    $Graphics.FillPolygon($brush, $Points)
    $Graphics.DrawPolygon($pen, $Points)
  }
  finally {
    $pen.Dispose()
    $brush.Dispose()
  }
}

function Fill-Ellipse {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [System.Drawing.Color]$Fill,
    [System.Drawing.Color]$Stroke = [System.Drawing.Color]::Transparent,
    [float]$StrokeWidth = 1
  )

  $brush = New-Brush $Fill
  try {
    $Graphics.FillEllipse($brush, $X, $Y, $Width, $Height)
  }
  finally {
    $brush.Dispose()
  }

  if ($Stroke.A -gt 0 -and $StrokeWidth -gt 0) {
    $pen = New-Pen $Stroke $StrokeWidth
    try { $Graphics.DrawEllipse($pen, $X, $Y, $Width, $Height) }
    finally { $pen.Dispose() }
  }
}

function Draw-Line {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$X1,
    [float]$Y1,
    [float]$X2,
    [float]$Y2,
    [System.Drawing.Color]$Color,
    [float]$Width = 2
  )

  $pen = New-Pen $Color $Width
  try { $Graphics.DrawLine($pen, $X1, $Y1, $X2, $Y2) }
  finally { $pen.Dispose() }
}

function Draw-ScratchTexture {
  param(
    [System.Drawing.Graphics]$Graphics,
    [int]$Seed,
    [float]$MinX,
    [float]$MinY,
    [float]$MaxX,
    [float]$MaxY
  )

  $random = [System.Random]::new($Seed)
  for ($index = 0; $index -lt 22; $index += 1) {
    $x = $MinX + $random.NextDouble() * ($MaxX - $MinX)
    $y = $MinY + $random.NextDouble() * ($MaxY - $MinY)
    $length = 8 + $random.NextDouble() * 28
    Draw-Line $Graphics $x $y ($x + $length) ($y + ($random.NextDouble() * 6 - 3)) (Color-Rgba 255 221 153 40) (1.2 + $random.NextDouble() * 1.4)
  }
}

function Draw-SmokePuffs {
  param(
    [System.Drawing.Graphics]$Graphics,
    [int]$Seed,
    [float]$BaseX,
    [float]$BaseY,
    [int]$Count,
    [float]$Spread,
    [float]$AlphaScale = 1
  )

  $random = [System.Random]::new($Seed)
  for ($index = 0; $index -lt $Count; $index += 1) {
    $size = 18 + $random.NextDouble() * 28
    $x = $BaseX + ($random.NextDouble() - 0.5) * $Spread
    $y = $BaseY - $index * (7 + $random.NextDouble() * 6) + ($random.NextDouble() - 0.5) * 10
    $alpha = [int]([Math]::Min(150, [Math]::Max(36, ((118 - $index * 9) * $AlphaScale))))
    Fill-Ellipse $Graphics $x $y $size ($size * 0.72) (Color-Rgba 54 58 56 $alpha) (Color-Rgba 23 18 16 ([int]($alpha * 0.25))) 1.2
  }
}

function Draw-Wheel {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Radius,
    [int]$Phase
  )

  Fill-Ellipse $Graphics ($X - $Radius) ($Y - $Radius) ($Radius * 2) ($Radius * 2) (Color-Rgba 27 31 32) (Color-Rgba 61 38 26) 4
  Fill-Ellipse $Graphics ($X - $Radius * 0.62) ($Y - $Radius * 0.62) ($Radius * 1.24) ($Radius * 1.24) (Color-Rgba 77 74 67) (Color-Rgba 19 20 20) 2.5
  Fill-Ellipse $Graphics ($X - $Radius * 0.22) ($Y - $Radius * 0.22) ($Radius * 0.44) ($Radius * 0.44) (Color-Rgba 195 126 61) (Color-Rgba 49 33 25) 2
  for ($i = 0; $i -lt 6; $i += 1) {
    $angle = (($i * 60) + ($Phase * 18)) * [Math]::PI / 180
    Draw-Line $Graphics $X $Y ($X + [Math]::Cos($angle) * $Radius * 0.54) ($Y + [Math]::Sin($angle) * $Radius * 0.54) (Color-Rgba 38 36 32 180) 2
  }
}

function Draw-TruckBody {
  param(
    [System.Drawing.Graphics]$Graphics,
    [int]$Frame,
    [int]$State,
    [int]$Column
  )

  $outline = Color-Rgba 61 38 26
  $deepOutline = Color-Rgba 35 25 20
  $rust = Color-Rgba 141 61 44
  $rustDark = Color-Rgba 95 44 35
  $rustLight = Color-Rgba 205 108 68
  $olive = Color-Rgba 94 92 52
  $khaki = Color-Rgba 166 139 74
  $amber = Color-Rgba 255 190 78

  $jitterX = 0
  $jitterY = 0
  $angle = 0
  if ($State -eq 0) {
    $jitterY = [Math]::Sin($Column * [Math]::PI / 3) * 2
  }
  elseif ($State -eq 1) {
    $jitterX = ($Column % 2) * -2
    $angle = (($Column % 2) * 2) - 1
  }
  elseif ($State -eq 2) {
    $jitterX = -8 - $Column * 3
    $jitterY = [Math]::Sin($Column) * 1.5
    $angle = -1.5 + $Column * 0.18
  }
  elseif ($State -eq 3 -and $Column -lt 3) {
    $jitterX = 8 - $Column * 5
    $jitterY = -2 + $Column
    $angle = 7 - $Column * 5
  }
  elseif ($State -eq 3) {
    $jitterX = (($Column % 2) * 6) - 3
    $jitterY = -3
    $angle = (($Column % 2) * 4) - 2
  }

  Fill-Ellipse $Graphics (88 + $jitterX) 208 286 31 (Color-Rgba 18 18 16 70)

  $truckTransform = $Graphics.Save()
  $Graphics.TranslateTransform(234 + $jitterX, 159 + $jitterY)
  $Graphics.RotateTransform($angle)
  try {
    if ($State -eq 2) {
      for ($i = 0; $i -lt 5; $i += 1) {
        Draw-Line $Graphics (112 + $i * 8) (-30 + $i * 10) (165 + $i * 16) (-24 + $i * 8) (Color-Rgba 255 206 116 (95 - $i * 10)) (5 - $i * 0.35)
      }
    }

    Fill-RoundedRect $Graphics ([System.Drawing.RectangleF]::new(-128, -24, 264, 73)) 15 $rustDark $deepOutline 7
    Fill-RoundedRect $Graphics ([System.Drawing.RectangleF]::new(-116, -34, 250, 61)) 13 $rust $outline 5
    Fill-RoundedRect $Graphics ([System.Drawing.RectangleF]::new(-102, -15, 214, 18)) 8 (Color-Rgba 88 47 35) (Color-Rgba 49 33 25) 2.5

    $cabPoints = [System.Drawing.PointF[]]@(
      [System.Drawing.PointF]::new(-128, -38),
      [System.Drawing.PointF]::new(-84, -68),
      [System.Drawing.PointF]::new(-16, -61),
      [System.Drawing.PointF]::new(-7, 8),
      [System.Drawing.PointF]::new(-118, 13)
    )
    Fill-Polygon $Graphics $cabPoints $rust $outline 5
    Fill-Polygon $Graphics ([System.Drawing.PointF[]]@(
      [System.Drawing.PointF]::new(-100, -49),
      [System.Drawing.PointF]::new(-79, -59),
      [System.Drawing.PointF]::new(-52, -55),
      [System.Drawing.PointF]::new(-55, -28),
      [System.Drawing.PointF]::new(-96, -25)
    )) (Color-Rgba 77 105 101 205) (Color-Rgba 35 25 20) 3
    Fill-Polygon $Graphics ([System.Drawing.PointF[]]@(
      [System.Drawing.PointF]::new(-43, -54),
      [System.Drawing.PointF]::new(-20, -50),
      [System.Drawing.PointF]::new(-17, -27),
      [System.Drawing.PointF]::new(-45, -29)
    )) (Color-Rgba 65 88 86 200) (Color-Rgba 35 25 20) 3

    Fill-RoundedRect $Graphics ([System.Drawing.RectangleF]::new(7, -77, 118, 76)) 8 $olive $outline 5
    Fill-RoundedRect $Graphics ([System.Drawing.RectangleF]::new(19, -66, 92, 50)) 5 (Color-Rgba 117 104 58) (Color-Rgba 56 42 24) 2.5
    for ($stripe = 0; $stripe -lt 4; $stripe += 1) {
      Draw-Line $Graphics (24 + $stripe * 23) -19 (48 + $stripe * 23) -63 (Color-Rgba 255 196 71 170) 7
      Draw-Line $Graphics (30 + $stripe * 23) -19 (54 + $stripe * 23) -63 (Color-Rgba 95 44 35 120) 3
    }

    Fill-RoundedRect $Graphics ([System.Drawing.RectangleF]::new(-143, -3, 34, 25)) 8 (Color-Rgba 71 65 54) $deepOutline 4
    for ($spike = 0; $spike -lt 3; $spike += 1) {
      $top = -8 + $spike * 12
      Fill-Polygon $Graphics ([System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(-158, $top + 4),
        [System.Drawing.PointF]::new(-139, $top - 3),
        [System.Drawing.PointF]::new(-139, $top + 11)
      )) (Color-Rgba 126 113 94) $deepOutline 2.2
    }

    Fill-RoundedRect $Graphics ([System.Drawing.RectangleF]::new(-121, 26, 244, 23)) 10 (Color-Rgba 44 42 35) $deepOutline 3
    $wheelPhase = $Frame
    Draw-Wheel $Graphics -88 43 23 $wheelPhase
    Draw-Wheel $Graphics -27 45 25 ($wheelPhase + 1)
    Draw-Wheel $Graphics 54 45 25 ($wheelPhase + 2)
    Draw-Wheel $Graphics 111 43 23 ($wheelPhase + 3)

    for ($rivet = 0; $rivet -lt 13; $rivet += 1) {
      $rx = -94 + $rivet * 17
      Fill-Ellipse $Graphics $rx -22 5 5 (Color-Rgba 226 151 84 185) (Color-Rgba 75 43 30 110) 0.7
    }

    Draw-ScratchTexture $Graphics (1770 + $Frame) -112 -28 124 17

    if ($State -eq 1 -or ($State -eq 3 -and $Column -ge 3)) {
      $lightAlpha = if ($Column % 2 -eq 0) { 235 } else { 120 }
      Fill-Ellipse $Graphics -140 -20 25 15 (Color-Rgba 255 210 87 $lightAlpha) (Color-Rgba 82 45 26 180) 2
      Fill-Ellipse $Graphics 78 -86 42 16 (Color-Rgba 255 77 58 ([int]($lightAlpha * 0.5)))
      for ($ring = 0; $ring -lt 2; $ring += 1) {
        $pen = New-Pen (Color-Rgba 255 184 74 ([int](80 - $ring * 22))) (3 - $ring * 0.5)
        try { $Graphics.DrawEllipse($pen, -162 - $ring * 6, -68 - $ring * 6, 324 + $ring * 12, 154 + $ring * 12) }
        finally { $pen.Dispose() }
      }
    }

    if ($State -eq 2) {
      Draw-SmokePuffs $Graphics (881 + $Frame) 139 20 4 62 0.72
      for ($dust = 0; $dust -lt 5; $dust += 1) {
        Fill-Ellipse $Graphics (118 + $dust * 16) (36 + ($dust % 2) * 6) (42 - $dust * 3) 14 (Color-Rgba 176 136 92 (88 - $dust * 10))
      }
    }

    if ($State -eq 3 -and $Column -lt 3) {
      Draw-SmokePuffs $Graphics (998 + $Frame) -118 -50 (5 + $Column) 68 0.92
      for ($spark = 0; $spark -lt 8; $spark += 1) {
        $sparkAngle = ($spark * 42 + $Column * 18) * [Math]::PI / 180
        Draw-Line $Graphics -94 -18 (-94 + [Math]::Cos($sparkAngle) * (26 + $spark * 3)) (-18 + [Math]::Sin($sparkAngle) * (18 + $spark * 2)) (Color-Rgba 255 188 78 150) 2.4
      }
    }

    if ($State -eq 3 -and $Column -ge 3) {
      $pulse = 32 + ($Column - 3) * 18
      Fill-Ellipse $Graphics (42 - $pulse / 2) (-48 - $pulse / 2) $pulse $pulse (Color-Rgba 255 169 64 56) (Color-Rgba 255 226 122 120) 3
      Draw-SmokePuffs $Graphics (1200 + $Frame) 95 -68 (3 + $Column - 3) 42 0.62
    }
  }
  finally {
    $Graphics.Restore($truckTransform)
  }
}

function Draw-DebrisFrame {
  param(
    [System.Drawing.Graphics]$Graphics,
    [int]$Frame,
    [int]$Column
  )

  Fill-Ellipse $Graphics 98 211 278 29 (Color-Rgba 18 18 16 70)
  $random = [System.Random]::new(4400 + $Frame)
  $progress = $Column / 5.0
  $centerX = 234
  $centerY = 160

  for ($piece = 0; $piece -lt 18; $piece += 1) {
    $angle = ($piece / 18.0) * [Math]::PI * 2 + $progress * 1.4
    $distance = 18 + $progress * (42 + $random.NextDouble() * 80)
    $x = $centerX + [Math]::Cos($angle) * $distance + ($random.NextDouble() - 0.5) * 18
    $y = $centerY + [Math]::Sin($angle) * ($distance * 0.45) - $progress * (6 + $random.NextDouble() * 30)
    $w = 12 + $random.NextDouble() * 32
    $h = 8 + $random.NextDouble() * 19
    $color = if ($piece % 3 -eq 0) { Color-Rgba 110 55 39 230 } elseif ($piece % 3 -eq 1) { Color-Rgba 75 82 67 230 } else { Color-Rgba 44 40 34 230 }
    $pieceTransform = $Graphics.Save()
    $Graphics.TranslateTransform($x, $y)
    $Graphics.RotateTransform(($random.NextDouble() * 110 - 55) + $Column * 12)
    try {
      Fill-RoundedRect $Graphics ([System.Drawing.RectangleF]::new(-$w / 2, -$h / 2, $w, $h)) 4 $color (Color-Rgba 35 25 20 230) 2
    }
    finally {
      $Graphics.Restore($pieceTransform)
    }
  }

  Draw-SmokePuffs $Graphics (5100 + $Frame) 236 145 (10 + $Column * 2) (150 + $Column * 18) (1.0 - $progress * 0.18)
  for ($spark = 0; $spark -lt (10 - [Math]::Min(7, $Column)); $spark += 1) {
    $angle = $random.NextDouble() * [Math]::PI * 2
    Draw-Line $Graphics $centerX $centerY ($centerX + [Math]::Cos($angle) * (40 + $random.NextDouble() * 90)) ($centerY + [Math]::Sin($angle) * (24 + $random.NextDouble() * 60)) (Color-Rgba 255 196 85 (180 - $Column * 22)) (2 + $random.NextDouble() * 3)
  }
}

function Draw-TruckFrame {
  param(
    [System.Drawing.Bitmap]$Sheet,
    [int]$Frame
  )

  $column = $Frame % $columns
  $row = [Math]::Floor($Frame / $columns)
  $graphics = [System.Drawing.Graphics]::FromImage($Sheet)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $frameTransform = $graphics.Save()
    $graphics.TranslateTransform($column * $frameWidth, $row * $frameHeight)
    if ($row -eq 4) {
      Draw-DebrisFrame $graphics $Frame $column
    }
    else {
      Draw-TruckBody $graphics $Frame $row $column
    }
  }
  finally {
    if ($frameTransform) { $graphics.Restore($frameTransform) }
    $graphics.Dispose()
  }
}

function Draw-ExplosionFrame {
  param(
    [System.Drawing.Bitmap]$Sheet,
    [int]$Frame
  )

  $column = $Frame % $explosionColumns
  $row = [Math]::Floor($Frame / $explosionColumns)
  $xOffset = $column * $explosionFrameWidth
  $yOffset = $row * $explosionFrameHeight
  $graphics = [System.Drawing.Graphics]::FromImage($Sheet)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.TranslateTransform($xOffset, $yOffset)

    $phase = $Frame / 7.0
    $cx = 160
    $cy = 104
    $core = 22 + $phase * 88
    $smoke = 38 + $phase * 130
    $alpha = [int](230 - $phase * 120)

    if ($Frame -lt 5) {
      Fill-Ellipse $graphics ($cx - $smoke / 2) ($cy - $smoke / 2) $smoke ($smoke * 0.78) (Color-Rgba 88 68 54 ([int](58 + $phase * 62)))
      Fill-Ellipse $graphics ($cx - $core / 2) ($cy - $core / 2) $core $core (Color-Rgba 255 115 44 ([int]$alpha)) (Color-Rgba 255 228 132 ([int](160 - $phase * 42))) 4
      Fill-Ellipse $graphics ($cx - $core * 0.32) ($cy - $core * 0.32) ($core * 0.64) ($core * 0.64) (Color-Rgba 255 238 158 ([int](230 - $phase * 80)))
      Fill-Ellipse $graphics ($cx - $core * 0.16) ($cy - $core * 0.16) ($core * 0.32) ($core * 0.32) (Color-Rgba 255 255 238 ([int](220 - $phase * 100)))
    }

    $random = [System.Random]::new(7300 + $Frame)
    for ($ring = 0; $ring -lt 3; $ring += 1) {
      $size = 52 + $phase * 150 + $ring * 26
      $pen = New-Pen (Color-Rgba 255 206 92 ([int]([Math]::Max(20, 150 - $phase * 120 - $ring * 28)))) (5 - $ring)
      try { $graphics.DrawEllipse($pen, $cx - $size / 2, $cy - $size / 2, $size, $size * 0.72) }
      finally { $pen.Dispose() }
    }

    for ($spark = 0; $spark -lt (28 - $Frame * 2); $spark += 1) {
      $angle = $random.NextDouble() * [Math]::PI * 2
      $dist = 22 + $phase * 95 + $random.NextDouble() * 48
      $sx = $cx + [Math]::Cos($angle) * $dist
      $sy = $cy + [Math]::Sin($angle) * ($dist * 0.62)
      Draw-Line $graphics ($cx + [Math]::Cos($angle) * 20) ($cy + [Math]::Sin($angle) * 14) $sx $sy (Color-Rgba 255 205 95 ([int]([Math]::Max(30, 185 - $Frame * 16)))) (2 + $random.NextDouble() * 3)
    }

    Draw-SmokePuffs $graphics (7600 + $Frame) $cx ($cy + 10) (7 + $Frame) (118 + $Frame * 8) ([Math]::Max(0.32, 0.92 - $phase * 0.28))
  }
  finally {
    $graphics.Dispose()
  }
}

function Count-NonTransparentPixels {
  param([System.Drawing.Bitmap]$Bitmap)
  $count = 0
  for ($y = 0; $y -lt $Bitmap.Height; $y += 1) {
    for ($x = 0; $x -lt $Bitmap.Width; $x += 1) {
      if ($Bitmap.GetPixel($x, $y).A -gt 10) { $count += 1 }
    }
  }
  return $count
}

function Test-EdgeTouch {
  param([System.Drawing.Bitmap]$Bitmap)
  for ($x = 0; $x -lt $Bitmap.Width; $x += 1) {
    if ($Bitmap.GetPixel($x, 0).A -gt 10 -or $Bitmap.GetPixel($x, $Bitmap.Height - 1).A -gt 10) { return $true }
  }
  for ($y = 0; $y -lt $Bitmap.Height; $y += 1) {
    if ($Bitmap.GetPixel(0, $y).A -gt 10 -or $Bitmap.GetPixel($Bitmap.Width - 1, $y).A -gt 10) { return $true }
  }
  return $false
}

function New-GalleryPreview {
  param([System.Drawing.Bitmap]$SourceSheet)
  $preview = [System.Drawing.Bitmap]::new(256, 192, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($preview)
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $sourceRect = [System.Drawing.Rectangle]::new(0, 0, $frameWidth, $frameHeight)
    $targetRect = [System.Drawing.Rectangle]::new(0, 10, 256, 164)
    $graphics.DrawImage($SourceSheet, $targetRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
    $preview.Save($galleryPreviewPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $preview.Dispose()
  }
}

$truckSheet = [System.Drawing.Bitmap]::new($frameWidth * $columns, $frameHeight * $rows, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$explosionSheet = [System.Drawing.Bitmap]::new($explosionFrameWidth * $explosionColumns, $explosionFrameHeight * $explosionRows, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

try {
  $truckGraphics = [System.Drawing.Graphics]::FromImage($truckSheet)
  try { $truckGraphics.Clear([System.Drawing.Color]::Transparent) }
  finally { $truckGraphics.Dispose() }
  for ($frame = 0; $frame -lt ($columns * $rows); $frame += 1) {
    Draw-TruckFrame $truckSheet $frame
  }
  $truckSheet.Save($truckSheetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  New-GalleryPreview $truckSheet

  $explosionGraphics = [System.Drawing.Graphics]::FromImage($explosionSheet)
  try { $explosionGraphics.Clear([System.Drawing.Color]::Transparent) }
  finally { $explosionGraphics.Dispose() }
  for ($frame = 0; $frame -lt ($explosionColumns * $explosionRows); $frame += 1) {
    Draw-ExplosionFrame $explosionSheet $frame
  }
  $explosionSheet.Save($explosionSheetPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $meta = [ordered]@{
    status = "interim-derived-bitmap-pending-final-generation"
    generatedBitmapAssets = $false
    reason = "Built-in image generation was not exposed in this sandbox; this package is deterministic interim raster art for runtime wiring and QC only."
    created = "2026-05-30"
    truckSpritesheet = [ordered]@{
      path = "assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png"
      frameWidth = $frameWidth
      frameHeight = $frameHeight
      columns = $columns
      rows = $rows
      width = $frameWidth * $columns
      height = $frameHeight * $rows
      nonTransparentPixels = Count-NonTransparentPixels $truckSheet
      edgeTouch = Test-EdgeTouch $truckSheet
      frames = [ordered]@{
        idle = @(0, 1, 2, 3, 4, 5)
        reloadWarning = @(6, 7, 8, 9, 10, 11)
        charge = @(12, 13, 14, 15, 16, 17)
        hitSmokeJolt = @(18, 19, 20)
        explosionWindup = @(21, 22, 23)
        destroyed = @(24, 25, 26, 27, 28, 29)
      }
    }
    explosionSpritesheet = [ordered]@{
      path = "assets/sprites/effects/self-destruct-truck-explosion-interim-spritesheet.png"
      frameWidth = $explosionFrameWidth
      frameHeight = $explosionFrameHeight
      columns = $explosionColumns
      rows = $explosionRows
      width = $explosionFrameWidth * $explosionColumns
      height = $explosionFrameHeight * $explosionRows
      nonTransparentPixels = Count-NonTransparentPixels $explosionSheet
      edgeTouch = Test-EdgeTouch $explosionSheet
      effectFrames = @(0, 1, 2, 3, 4, 5, 6, 7)
    }
    galleryPreview = [ordered]@{
      path = "assets/sprites/enemies/gallery/self-destruct-truck-interim-preview.png"
      width = 256
      height = 192
    }
  }

  $meta | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 $metaPath
}
finally {
  $truckSheet.Dispose()
  $explosionSheet.Dispose()
}

Write-Host "Generated $truckSheetPath"
Write-Host "Generated $explosionSheetPath"
Write-Host "Generated $galleryPreviewPath"
Write-Host "Generated $metaPath"

param(
  [string]$OutputDir = "assets/sprites/effects",
  [int]$FrameWidth = 320,
  [int]$FrameHeight = 192,
  [int]$Columns = 4
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }

function New-Canvas([int]$width, [int]$height) {
  return New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

function Set-HighQuality([System.Drawing.Graphics]$graphics) {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
}

function Convert-HexColor([string]$hex, [int]$alpha = 255) {
  $value = $hex.TrimStart("#")
  $red = [Convert]::ToInt32($value.Substring(0, 2), 16)
  $green = [Convert]::ToInt32($value.Substring(2, 2), 16)
  $blue = [Convert]::ToInt32($value.Substring(4, 2), 16)
  return [System.Drawing.Color]::FromArgb($alpha, $red, $green, $blue)
}

function New-SolidBrush([string]$hex, [int]$alpha = 255) {
  return New-Object System.Drawing.SolidBrush (Convert-HexColor $hex $alpha)
}

function New-Pen([string]$hex, [float]$width = 1, [int]$alpha = 255) {
  $pen = New-Object System.Drawing.Pen (Convert-HexColor $hex $alpha), $width
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function Draw-SoftEllipse(
  [System.Drawing.Graphics]$graphics,
  [float]$x,
  [float]$y,
  [float]$width,
  [float]$height,
  [string]$hex,
  [int]$alpha
) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $rect = [System.Drawing.RectangleF]::new($x - ($width / 2), $y - ($height / 2), $width, $height)
  $path.AddEllipse($rect)
  $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush $path
  try {
    $color = Convert-HexColor $hex $alpha
    $brush.CenterColor = $color
    $brush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, $color.R, $color.G, $color.B))
    $graphics.FillEllipse($brush, $rect)
  } finally {
    $brush.Dispose()
    $path.Dispose()
  }
}

function Draw-Star(
  [System.Drawing.Graphics]$graphics,
  [float]$x,
  [float]$y,
  [float]$outer,
  [float]$inner,
  [int]$points,
  [string]$fill,
  [int]$alpha,
  [float]$rotation = -90
) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  for ($index = 0; $index -lt ($points * 2); $index += 1) {
    $radius = if ($index % 2 -eq 0) { $outer } else { $inner }
    $angle = (($rotation + ($index * 180 / $points)) * [Math]::PI) / 180
    $point = [System.Drawing.PointF]::new($x + [Math]::Cos($angle) * $radius, $y + [Math]::Sin($angle) * $radius)
    if ($index -eq 0) { $path.StartFigure() }
    if ($index -eq 0) { $path.AddLine($point, $point) } else { $path.AddLine($path.GetLastPoint(), $point) }
  }
  $path.CloseFigure()
  $brush = New-SolidBrush $fill $alpha
  $pen = New-Pen "#3a2a1a" 3 180
  try {
    $graphics.FillPath($brush, $path)
    $graphics.DrawPath($pen, $path)
  } finally {
    $brush.Dispose()
    $pen.Dispose()
    $path.Dispose()
  }
}

function Draw-Shell(
  [System.Drawing.Graphics]$graphics,
  [float]$x,
  [float]$y,
  [float]$length,
  [float]$height,
  [float]$angle,
  [string]$body,
  [string]$nose,
  [string]$band,
  [string]$outline = "#3a2a1a"
) {
  $state = $graphics.Save()
  try {
    $graphics.TranslateTransform($x, $y)
    $graphics.RotateTransform($angle)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    [System.Drawing.PointF[]]$points = @(
      [System.Drawing.PointF]::new(-$length / 2, -$height / 2),
      [System.Drawing.PointF]::new($length * 0.24, -$height / 2),
      [System.Drawing.PointF]::new($length / 2, 0),
      [System.Drawing.PointF]::new($length * 0.24, $height / 2),
      [System.Drawing.PointF]::new(-$length / 2, $height / 2)
    )
    $path.AddPolygon($points)
    $fill = New-Object System.Drawing.Drawing2D.LinearGradientBrush ([System.Drawing.RectangleF]::new(-$length / 2, -$height / 2, $length, $height)), (Convert-HexColor $body 255), (Convert-HexColor $nose 255), 0
    $outlinePen = New-Pen $outline 4 235
    $bandBrush = New-SolidBrush $band 225
    $shinePen = New-Pen "#fff7c2" 3 130
    try {
      $graphics.FillPath($fill, $path)
      $graphics.FillRectangle($bandBrush, [System.Drawing.RectangleF]::new(-$length * 0.2, -$height / 2, $length * 0.12, $height))
      $graphics.DrawLine($shinePen, -$length * 0.34, -$height * 0.22, $length * 0.2, -$height * 0.22)
      $graphics.DrawPath($outlinePen, $path)
    } finally {
      $fill.Dispose()
      $outlinePen.Dispose()
      $bandBrush.Dispose()
      $shinePen.Dispose()
      $path.Dispose()
    }
  } finally {
    $graphics.Restore($state)
  }
}

function Draw-Plate(
  [System.Drawing.Graphics]$graphics,
  [float]$x,
  [float]$y,
  [float]$width,
  [float]$height,
  [float]$angle
) {
  $state = $graphics.Save()
  try {
    $graphics.TranslateTransform($x, $y)
    $graphics.RotateTransform($angle)
    $rect = [System.Drawing.RectangleF]::new(-$width / 2, -$height / 2, $width, $height)
    $fill = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, (Convert-HexColor "#475569" 245), (Convert-HexColor "#dbe4ef" 245), 35
    $pen = New-Pen "#263241" 5 240
    $rivet = New-SolidBrush "#f9d56b" 220
    try {
      $graphics.FillRectangle($fill, $rect)
      $graphics.DrawRectangle($pen, $rect.X, $rect.Y, $rect.Width, $rect.Height)
      foreach ($rx in @(($width * -0.32), ($width * 0.32))) {
        foreach ($ry in @(($height * -0.25), ($height * 0.25))) {
          $graphics.FillEllipse($rivet, $rx - 4, $ry - 4, 8, 8)
        }
      }
    } finally {
      $fill.Dispose()
      $pen.Dispose()
      $rivet.Dispose()
    }
  } finally {
    $graphics.Restore($state)
  }
}

function Draw-Sparks([System.Drawing.Graphics]$graphics, [float]$x, [float]$y, [string]$color, [int]$count, [int]$seed, [float]$spread = 72) {
  $random = [System.Random]::new($seed)
  for ($index = 0; $index -lt $count; $index += 1) {
    $angle = $random.NextDouble() * [Math]::PI * 2
    $distance = 18 + $random.NextDouble() * $spread
    $length = 8 + $random.NextDouble() * 22
    $pen = New-Pen $color (2 + $random.NextDouble() * 2) 220
    try {
      $sx = $x + [Math]::Cos($angle) * $distance
      $sy = $y + [Math]::Sin($angle) * $distance
      $graphics.DrawLine($pen, $sx, $sy, $sx + [Math]::Cos($angle) * $length, $sy + [Math]::Sin($angle) * $length)
    } finally {
      $pen.Dispose()
    }
  }
}

function Draw-Wrench([System.Drawing.Graphics]$graphics, [float]$x, [float]$y, [float]$scale) {
  $pen = New-Pen "#dcfce7" (8 * $scale) 235
  $shadowPen = New-Pen "#14532d" (13 * $scale) 180
  try {
    $graphics.DrawLine($shadowPen, $x - 28 * $scale, $y + 28 * $scale, $x + 20 * $scale, $y - 20 * $scale)
    $graphics.DrawLine($pen, $x - 28 * $scale, $y + 28 * $scale, $x + 20 * $scale, $y - 20 * $scale)
    $graphics.DrawArc($shadowPen, $x + 8 * $scale, $y - 42 * $scale, 42 * $scale, 42 * $scale, 38, 250)
    $graphics.DrawArc($pen, $x + 8 * $scale, $y - 42 * $scale, 42 * $scale, 42 * $scale, 38, 250)
  } finally {
    $pen.Dispose()
    $shadowPen.Dispose()
  }
}

function Draw-Plus([System.Drawing.Graphics]$graphics, [float]$x, [float]$y, [float]$size) {
  $brush = New-SolidBrush "#bbf7d0" 235
  $outline = New-Pen "#14532d" 4 210
  try {
    $graphics.FillRectangle($brush, $x - $size * 0.16, $y - $size * 0.5, $size * 0.32, $size)
    $graphics.FillRectangle($brush, $x - $size * 0.5, $y - $size * 0.16, $size, $size * 0.32)
    $graphics.DrawRectangle($outline, $x - $size * 0.16, $y - $size * 0.5, $size * 0.32, $size)
    $graphics.DrawRectangle($outline, $x - $size * 0.5, $y - $size * 0.16, $size, $size * 0.32)
  } finally {
    $brush.Dispose()
    $outline.Dispose()
  }
}

function Draw-SmokeCloud([System.Drawing.Graphics]$graphics, [float]$x, [float]$y, [float]$scale, [int]$seed) {
  $random = [System.Random]::new($seed)
  foreach ($index in 0..10) {
    $px = $x + ($random.NextDouble() - 0.5) * 130 * $scale
    $py = $y + ($random.NextDouble() - 0.5) * 70 * $scale
    $size = (34 + $random.NextDouble() * 58) * $scale
    $alpha = [int](88 + $random.NextDouble() * 68)
    Draw-SoftEllipse $graphics $px $py ($size * 1.18) $size "#cbd5e1" $alpha
    Draw-SoftEllipse $graphics ($px + 8 * $scale) ($py + 4 * $scale) ($size * 0.82) ($size * 0.66) "#475569" ([int]($alpha * 0.5))
  }
}

function Draw-Frame([System.Drawing.Bitmap]$sheet, [int]$frame, [scriptblock]$drawBlock) {
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  try {
    Set-HighQuality $graphics
    $state = $graphics.Save()
    try {
      $graphics.TranslateTransform($frame * $FrameWidth, 0)
      & $drawBlock $graphics $frame
    } finally {
      $graphics.Restore($state)
    }
  } finally {
    $graphics.Dispose()
  }
}

function Save-Sheet([string]$fileName, [scriptblock]$drawBlock) {
  $path = Join-Path $OutputDir $fileName
  $sheet = New-Canvas ($FrameWidth * $Columns) $FrameHeight
  try {
    for ($frame = 0; $frame -lt $Columns; $frame += 1) {
      Draw-Frame $sheet $frame $drawBlock
    }
    $sheet.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $sheet.Dispose()
  }
  Write-Host "Generated $path"
}

Save-Sheet "armor-piercing-shell-spritesheet.png" {
  param($graphics, $frame)
  $x = 88 + $frame * 26
  $y = 86 - [Math]::Sin($frame * 0.75) * 9
  Draw-SoftEllipse $graphics ($x - 52) ($y + 4) (110 + $frame * 10) 34 "#fef3c7" (68 + $frame * 16)
  Draw-Shell $graphics $x $y 136 30 -8 "#475569" "#fff7c2" "#b45309"
  if ($frame -ge 1) {
    Draw-Plate $graphics 232 96 70 76 -8
    Draw-Sparks $graphics 205 94 "#fde68a" (12 + $frame * 5) (110 + $frame) (42 + $frame * 12)
  }
  if ($frame -eq 3) {
    $crack = New-Pen "#111827" 4 190
    try {
      $graphics.DrawLine($crack, 214, 62, 226, 92)
      $graphics.DrawLine($crack, 226, 92, 212, 128)
    } finally {
      $crack.Dispose()
    }
  }
}

Save-Sheet "smoke-shell-spritesheet.png" {
  param($graphics, $frame)
  Draw-Shell $graphics (88 + $frame * 22) (88 - $frame * 4) 112 32 -8 "#334155" "#e2e8f0" "#94a3b8"
  Draw-SmokeCloud $graphics (68 + $frame * 32) (92 - $frame * 4) (0.45 + $frame * 0.16) (220 + $frame)
  if ($frame -ge 2) {
    $ring = New-Pen "#e2e8f0" 5 155
    try {
      $graphics.DrawEllipse($ring, 174 - $frame * 8, 44 - $frame * 4, 84 + $frame * 20, 84 + $frame * 20)
    } finally {
      $ring.Dispose()
    }
  }
}

Save-Sheet "repair-capsule-shell-spritesheet.png" {
  param($graphics, $frame)
  Draw-SoftEllipse $graphics (108 + $frame * 22) 92 (116 + $frame * 20) 64 "#22c55e" (82 + $frame * 18)
  Draw-Shell $graphics (94 + $frame * 24) (90 - $frame * 3) 108 34 -8 "#166534" "#bbf7d0" "#22c55e" "#14532d"
  if ($frame -ge 1) { Draw-Plus $graphics 214 88 (38 + $frame * 10) }
  if ($frame -ge 2) { Draw-Wrench $graphics 224 108 (0.72 + $frame * 0.08) }
  if ($frame -eq 3) {
    $pulse = New-Pen "#bbf7d0" 6 180
    try { $graphics.DrawEllipse($pulse, 162, 34, 112, 112) } finally { $pulse.Dispose() }
  }
}

Save-Sheet "flash-flare-shell-spritesheet.png" {
  param($graphics, $frame)
  Draw-SoftEllipse $graphics (118 + $frame * 18) 90 (118 + $frame * 26) 58 "#fef08a" (82 + $frame * 22)
  Draw-Shell $graphics (92 + $frame * 23) (88 - $frame * 3) 108 30 -8 "#854d0e" "#fef08a" "#f97316"
  if ($frame -ge 1) { Draw-Star $graphics 214 86 (30 + $frame * 12) (11 + $frame * 5) 8 "#fef08a" (130 + $frame * 22) -92 }
  if ($frame -eq 3) {
    $halo = New-Pen "#ffffff" 5 150
    try { $graphics.DrawEllipse($halo, 154, 26, 126, 126) } finally { $halo.Dispose() }
  }
}

Save-Sheet "long-barrel-shot-spritesheet.png" {
  param($graphics, $frame)
  Draw-SoftEllipse $graphics (82 + $frame * 34) 92 (150 + $frame * 26) 42 "#dbeafe" (58 + $frame * 14)
  $trailPen = New-Pen "#93c5fd" (9 + $frame * 2) (92 + $frame * 20)
  try {
    $graphics.DrawLine($trailPen, 28, 103, 108 + $frame * 28, 90 - $frame * 3)
  } finally {
    $trailPen.Dispose()
  }
  Draw-Shell $graphics (100 + $frame * 27) (88 - $frame * 3) 154 34 -7 "#1f2937" "#dbeafe" "#94a3b8" "#111827"
  if ($frame -ge 2) {
    Draw-Sparks $graphics 238 90 "#dbeafe" (16 + $frame * 4) (330 + $frame) (54 + $frame * 14)
    $shock = New-Pen "#bfdbfe" 6 155
    try { $graphics.DrawEllipse($shock, 178 - $frame * 8, 38 - $frame * 5, 86 + $frame * 22, 86 + $frame * 22) } finally { $shock.Dispose() }
  }
}

Write-Host "Ammo spritesheet output grid: ${Columns}x1, frame: ${FrameWidth}x${FrameHeight}"

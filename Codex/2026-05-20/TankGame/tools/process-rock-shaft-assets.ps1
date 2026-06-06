param(
  [string]$SourceDir = "assets/source/rock-shaft",
  [string]$OutputDir = "assets/sprites/rock-shaft"
)

Add-Type -AssemblyName System.Drawing

New-Item -ItemType Directory -Force $OutputDir | Out-Null

function Test-ChromaGreen([System.Drawing.Color]$Color) {
  return ($Color.G -gt 120 -and $Color.G -gt ($Color.R * 1.35) -and $Color.G -gt ($Color.B * 1.35))
}

function Get-ForegroundMask([System.Drawing.Bitmap]$Bitmap) {
  $width = $Bitmap.Width
  $height = $Bitmap.Height
  $mask = New-Object 'bool[,]' $width, $height
  for ($y = 0; $y -lt $height; $y += 1) {
    for ($x = 0; $x -lt $width; $x += 1) {
      $color = $Bitmap.GetPixel($x, $y)
      if ($color.A -gt 8 -and -not (Test-ChromaGreen $color)) {
        $mask[$x, $y] = $true
      }
    }
  }
  return $mask
}

function Find-LargestComponentBounds([System.Drawing.Bitmap]$Bitmap) {
  $width = $Bitmap.Width
  $height = $Bitmap.Height
  $mask = Get-ForegroundMask $Bitmap
  $visited = New-Object 'bool[,]' $width, $height
  $best = $null
  $queueX = New-Object int[] ($width * $height)
  $queueY = New-Object int[] ($width * $height)

  for ($startY = 0; $startY -lt $height; $startY += 1) {
    for ($startX = 0; $startX -lt $width; $startX += 1) {
      if (-not $mask[$startX, $startY] -or $visited[$startX, $startY]) { continue }
      $head = 0
      $tail = 0
      $queueX[$tail] = $startX
      $queueY[$tail] = $startY
      $tail += 1
      $visited[$startX, $startY] = $true
      $minX = $startX; $maxX = $startX; $minY = $startY; $maxY = $startY; $count = 0

      while ($head -lt $tail) {
        $x = $queueX[$head]
        $y = $queueY[$head]
        $head += 1
        $count += 1
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }

        foreach ($delta in @(@(-1,0), @(1,0), @(0,-1), @(0,1))) {
          $nx = $x + $delta[0]
          $ny = $y + $delta[1]
          if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $width -or $ny -ge $height) { continue }
          if ($visited[$nx, $ny] -or -not $mask[$nx, $ny]) { continue }
          $visited[$nx, $ny] = $true
          $queueX[$tail] = $nx
          $queueY[$tail] = $ny
          $tail += 1
        }
      }

      if ($null -eq $best -or $count -gt $best.Count) {
        $best = [pscustomobject]@{ Count = $count; MinX = $minX; MaxX = $maxX; MinY = $minY; MaxY = $maxY }
      }
    }
  }

  if ($null -eq $best) { throw "No foreground component found." }
  $padding = 8
  $left = [Math]::Max(0, $best.MinX - $padding)
  $top = [Math]::Max(0, $best.MinY - $padding)
  $right = [Math]::Min($width - 1, $best.MaxX + $padding)
  $bottom = [Math]::Min($height - 1, $best.MaxY + $padding)
  return [System.Drawing.Rectangle]::FromLTRB($left, $top, $right + 1, $bottom + 1)
}

function Export-ChromaLargest([string]$InputPath, [string]$OutputPath) {
  $source = [System.Drawing.Bitmap]::FromFile($InputPath)
  try {
    $bounds = Find-LargestComponentBounds $source
    $output = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      for ($y = 0; $y -lt $bounds.Height; $y += 1) {
        for ($x = 0; $x -lt $bounds.Width; $x += 1) {
          $color = $source.GetPixel($bounds.X + $x, $bounds.Y + $y)
          if (Test-ChromaGreen $color) {
            $output.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
          } else {
            $output.SetPixel($x, $y, $color)
          }
        }
      }
      $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $output.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

function Copy-Image([string]$InputPath, [string]$OutputPath) {
  Copy-Item $InputPath $OutputPath -Force
}

function Export-ChromaSheet([string]$InputPath, [string]$OutputPath) {
  $source = [System.Drawing.Bitmap]::FromFile($InputPath)
  try {
    $output = New-Object System.Drawing.Bitmap $source.Width, $source.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($output)
      try {
        $graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
      } finally {
        $graphics.Dispose()
      }

      $bounds = [System.Drawing.Rectangle]::new(0, 0, $output.Width, $output.Height)
      $data = $output.LockBits($bounds, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try {
        $stride = [Math]::Abs($data.Stride)
        $bytes = $stride * $output.Height
        $buffer = New-Object byte[] $bytes
        [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buffer, 0, $bytes)
        for ($y = 0; $y -lt $output.Height; $y += 1) {
          $row = $y * $stride
          for ($x = 0; $x -lt $output.Width; $x += 1) {
            $index = $row + ($x * 4)
            $blue = [int]$buffer[$index]
            $green = [int]$buffer[$index + 1]
            $red = [int]$buffer[$index + 2]
            if ($green -gt 120 -and $green -gt ($red * 1.35) -and $green -gt ($blue * 1.35)) {
              $buffer[$index] = 0
              $buffer[$index + 1] = 0
              $buffer[$index + 2] = 0
              $buffer[$index + 3] = 0
            }
          }
        }
        [System.Runtime.InteropServices.Marshal]::Copy($buffer, 0, $data.Scan0, $bytes)
      } finally {
        $output.UnlockBits($data)
      }

      $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $output.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

Export-ChromaLargest (Join-Path $SourceDir "rock-platform-green.png") (Join-Path $OutputDir "rock-platform.png")
Export-ChromaLargest (Join-Path $SourceDir "stalactite-spikes-green.png") (Join-Path $OutputDir "stalactite-spikes.png")
Export-ChromaLargest (Join-Path $SourceDir "adventurer-stand-green.png") (Join-Path $OutputDir "adventurer-stand.png")
Export-ChromaLargest (Join-Path $SourceDir "adventurer-fall-green.png") (Join-Path $OutputDir "adventurer-fall.png")
Export-ChromaSheet (Join-Path $SourceDir "adventurer-hammer-sheet-green.png") (Join-Path $OutputDir "adventurer-hammer-sheet.png")
Export-ChromaSheet (Join-Path $SourceDir "cave-decoration-sheet-green.png") (Join-Path $OutputDir "cave-decoration-sheet.png")
Export-ChromaSheet (Join-Path $SourceDir "rock-break-sheet-green.png") (Join-Path $OutputDir "rock-break-sheet.png")
Copy-Image (Join-Path $SourceDir "cave-background.png") (Join-Path $OutputDir "cave-background.png")

Get-ChildItem $OutputDir -Filter *.png | Select-Object Name, Length, LastWriteTime
param(
  [string]$Source = "$env:USERPROFILE\Downloads\Gemini_Generated_Image_yysowhyysowhyyso.png",
  [string]$Workspace = (Resolve-Path (Join-Path $PSScriptRoot ".."))
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$sourceOut = Join-Path $Workspace "assets\source\Gemini_Generated_Image_yysowhyysowhyyso.png"
$outDir = Join-Path $Workspace "assets\sprites\anti-air"
New-Item -ItemType Directory -Force -Path (Split-Path $sourceOut), $outDir | Out-Null
Copy-Item -Force $Source $sourceOut

function Export-CellAsset {
  param(
    [System.Drawing.Bitmap]$Sheet,
    [int]$Col,
    [int]$Row,
    [string]$OutPath,
    [string]$State
  )

  $x0 = [int][Math]::Round($Col * $Sheet.Width / 6.0) + 3
  $x1 = [int][Math]::Round(($Col + 1) * $Sheet.Width / 6.0) - 3
  $y0 = [int][Math]::Round($Row * $Sheet.Height / 5.0) + 3
  $y1 = [int][Math]::Round(($Row + 1) * $Sheet.Height / 5.0) - 3
  $width = $x1 - $x0
  $height = $y1 - $y0
  $temp = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $minX = $width
  $minY = $height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $height; $y += 1) {
    for ($x = 0; $x -lt $width; $x += 1) {
      $color = $Sheet.GetPixel($x0 + $x, $y0 + $y)
      $isGreenScreen = ($color.G -gt 170 -and $color.R -lt 110 -and $color.B -lt 110) -or ($color.G -gt 125 -and ($color.G - $color.R) -gt 50 -and ($color.G - $color.B) -gt 50)
      $isGridGuide = ($color.R -lt 35 -and $color.G -lt 45 -and $color.B -lt 35)
      if ($isGreenScreen -or $isGridGuide) {
        $temp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      } else {
        $temp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($color.A, $color.R, $color.G, $color.B))
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0) {
    $temp.Dispose()
    throw "No non-transparent pixels produced for $OutPath"
  }

  $padding = 8
  $cropX = [Math]::Max(0, $minX - $padding)
  $cropY = [Math]::Max(0, $minY - $padding)
  $cropRight = [Math]::Min($width - 1, $maxX + $padding)
  $cropBottom = [Math]::Min($height - 1, $maxY + $padding)
  $cropW = $cropRight - $cropX + 1
  $cropH = $cropBottom - $cropY + 1
  $trimmed = [System.Drawing.Bitmap]::new($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($trimmed)
  $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
  $dest = [System.Drawing.Rectangle]::new(0, 0, $cropW, $cropH)
  $src = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropW, $cropH)
  $graphics.DrawImage($temp, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()
  $trimmed.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $trimmed.Dispose()
  $temp.Dispose()

  [pscustomobject]@{ State = $State; Path = $OutPath; Width = $cropW; Height = $cropH; Cell = "$Row,$Col" }
}

$sheet = [System.Drawing.Bitmap]::FromFile($Source)
try {
  @(
    Export-CellAsset -Sheet $sheet -Col 0 -Row 0 -OutPath (Join-Path $outDir "tank-normal.png") -State "normal"
    Export-CellAsset -Sheet $sheet -Col 1 -Row 3 -OutPath (Join-Path $outDir "tank-weakened.png") -State "weakened"
    Export-CellAsset -Sheet $sheet -Col 1 -Row 4 -OutPath (Join-Path $outDir "tank-bombed.png") -State "bombed"
    Export-CellAsset -Sheet $sheet -Col 2 -Row 2 -OutPath (Join-Path $outDir "tank-firing.png") -State "firing"
    Export-CellAsset -Sheet $sheet -Col 5 -Row 4 -OutPath (Join-Path $outDir "tank-destroyed.png") -State "destroyed"
  ) | Format-Table -AutoSize
} finally {
  $sheet.Dispose()
}

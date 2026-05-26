param(
  [string]$DownloadsPath = (Join-Path $env:USERPROFILE 'Downloads')
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $projectRoot 'assets/sprites/environment'

Add-Type -AssemblyName System.Drawing

function Convert-GreenSheet($sourceName, $outputName, [int]$frameWidth, [int]$frameHeight, [int]$columns, [int]$rows) {
  $sourcePath = Join-Path $DownloadsPath $sourceName
  if (!(Test-Path $sourcePath)) { throw "Source image not found: $sourcePath" }
  $outputPath = Join-Path $outputDir $outputName
  $source = [System.Drawing.Bitmap]::new($sourcePath)
  $out = [System.Drawing.Bitmap]::new($frameWidth * $columns, $frameHeight * $rows, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($out)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $attributes = [System.Drawing.Imaging.ImageAttributes]::new()
  $attributes.SetColorKey([System.Drawing.Color]::FromArgb(0, 120, 0), [System.Drawing.Color]::FromArgb(130, 255, 130))
  for ($row = 0; $row -lt $rows; $row += 1) {
    for ($column = 0; $column -lt $columns; $column += 1) {
      $sourceX = [Math]::Min($column * $frameWidth, $source.Width - $frameWidth)
      $sourceY = [Math]::Min($row * $frameHeight, $source.Height - $frameHeight)
      $destRect = [System.Drawing.Rectangle]::new($column * $frameWidth, $row * $frameHeight, $frameWidth, $frameHeight)
      $graphics.DrawImage($source, $destRect, $sourceX, $sourceY, $frameWidth, $frameHeight, [System.Drawing.GraphicsUnit]::Pixel, $attributes)
    }
  }
  [System.IO.Directory]::CreateDirectory($outputDir) | Out-Null
  $out.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $attributes.Dispose(); $graphics.Dispose(); $out.Dispose(); $source.Dispose()
  Write-Host "Wrote $outputPath"
}

function Convert-WhiteSheet($sourceName, $outputName, [int]$frameWidth, [int]$frameHeight, [int]$columns, [int]$rows) {
  $sourcePath = Join-Path $DownloadsPath $sourceName
  if (!(Test-Path $sourcePath)) { throw "Source image not found: $sourcePath" }
  $outputPath = Join-Path $outputDir $outputName
  $source = [System.Drawing.Bitmap]::new($sourcePath)
  $out = [System.Drawing.Bitmap]::new($frameWidth * $columns, $frameHeight * $rows, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($out)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $attributes = [System.Drawing.Imaging.ImageAttributes]::new()
  $attributes.SetColorKey([System.Drawing.Color]::FromArgb(238, 238, 238), [System.Drawing.Color]::FromArgb(255, 255, 255))
  for ($row = 0; $row -lt $rows; $row += 1) {
    for ($column = 0; $column -lt $columns; $column += 1) {
      $sourceX = [Math]::Min($column * $frameWidth, $source.Width - $frameWidth)
      $sourceY = [Math]::Min($row * $frameHeight, $source.Height - $frameHeight)
      $destRect = [System.Drawing.Rectangle]::new($column * $frameWidth, $row * $frameHeight, $frameWidth, $frameHeight)
      $graphics.DrawImage($source, $destRect, $sourceX, $sourceY, $frameWidth, $frameHeight, [System.Drawing.GraphicsUnit]::Pixel, $attributes)
    }
  }
  [System.IO.Directory]::CreateDirectory($outputDir) | Out-Null
  $out.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $attributes.Dispose(); $graphics.Dispose(); $out.Dispose(); $source.Dispose()
  Write-Host "Wrote $outputPath"
}

Convert-GreenSheet 'Gemini_Generated_Image_7h7d9n7h7d9n7h7d.png' 'ruined-houses-spritesheet.png' 938 768 3 2
Convert-GreenSheet 'Gemini_Generated_Image_hwzxzhwzxzhwzxzh.png' 'trench-strips-spritesheet.png' 2816 512 1 3
Convert-GreenSheet 'Gemini_Generated_Image_o6kd99o6kd99o6kd.png' 'crater-tracks-spritesheet.png' 938 768 3 2
Convert-WhiteSheet 'Gemini_Generated_Image_ij3iccij3iccij3i.png' 'forest-clusters-spritesheet.png' 1408 768 2 2
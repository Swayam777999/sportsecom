Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\admin\OneDrive\Desktop\wmd pro 1\sports-shop\frontend\public\logo.png"
$bmp = New-Object System.Drawing.Bitmap($srcPath)

$w = $bmp.Width
$h = $bmp.Height
Write-Host "Original Dimensions: $w x $h"

# Find bounds of non-white pixels
# In this image, background is white/near-white (R>240, G>240, B>240)
$minX = $w
$maxX = 0
$minY = $h
$maxY = 0

# Also find separating Y coordinate between the top emblem and bottom text
# Let's inspect horizontal lines
$rowCounts = @()

for ($y = 0; $y -lt $h; $y++) {
    $nonWhiteCount = 0
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            $nonWhiteCount++
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
    $rowCounts += $nonWhiteCount
}

Write-Host "Content bounds: X($minX to $maxX), Y($minY to $maxY)"

# Find gap between emblem and text
# Starting from $minY, scan down to find where nonWhiteCount drops to 0 or near 0
$gapY = -1
for ($y = $minY + 50; $y -lt $maxY - 50; $y++) {
    if ($rowCounts[$y] -eq 0 -and $rowCounts[$y-1] -eq 0 -and $rowCounts[$y+1] -eq 0) {
        $gapY = $y
        break
    }
}

Write-Host "Emblem/Text separator gap at Y = $gapY"

# 1. Create transparent full logo
$fullCropW = ($maxX - $minX) + 20
$fullCropH = ($maxY - $minY) + 20
$fullBmp = New-Object System.Drawing.Bitmap($fullCropW, $fullCropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $fullCropH; $y++) {
    for ($x = 0; $x -lt $fullCropW; $x++) {
        $srcX = $minX - 10 + $x
        $srcY = $minY - 10 + $y
        if ($srcX -ge 0 -and $srcX -lt $w -and $srcY -ge 0 -and $srcY -lt $h) {
            $c = $bmp.GetPixel($srcX, $srcY)
            # Anti-aliased transparency calculation based on lightness
            $luminance = ($c.R + $c.G + $c.B) / 3.0
            if ($luminance -gt 245) {
                $fullBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($luminance -gt 220) {
                $alpha = [int]((255 - $luminance) / (255 - 220) * 255)
                if ($alpha -lt 0) { $alpha = 0 }
                if ($alpha -gt 255) { $alpha = 255 }
                $fullBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            } else {
                $fullBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            }
        }
    }
}
$fullBmp.Save("c:\Users\admin\OneDrive\Desktop\wmd pro 1\sports-shop\frontend\public\logo-transparent.png", [System.Drawing.Imaging.ImageFormat]::Png)
$fullBmp.Dispose()
Write-Host "Saved logo-transparent.png"

# 2. Create emblem icon (the mountain P)
if ($gapY -gt 0) {
    # Find emblem bounds
    $embMinX = $w
    $embMaxX = 0
    $embMinY = $minY
    $embMaxY = $gapY

    for ($y = $embMinY; $y -lt $embMaxY; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
                if ($x -lt $embMinX) { $embMinX = $x }
                if ($x -gt $embMaxX) { $embMaxX = $x }
            }
        }
    }

    $embW = ($embMaxX - $embMinX) + 16
    $embH = ($embMaxY - $embMinY) + 16
    $embBmp = New-Object System.Drawing.Bitmap($embW, $embH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $embH; $y++) {
        for ($x = 0; $x -lt $embW; $x++) {
            $srcX = $embMinX - 8 + $x
            $srcY = $embMinY - 8 + $y
            if ($srcX -ge 0 -and $srcX -lt $w -and $srcY -ge 0 -and $srcY -lt $h) {
                $c = $bmp.GetPixel($srcX, $srcY)
                $luminance = ($c.R + $c.G + $c.B) / 3.0
                if ($luminance -gt 245) {
                    $embBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                } elseif ($luminance -gt 220) {
                    $alpha = [int]((255 - $luminance) / (255 - 220) * 255)
                    if ($alpha -lt 0) { $alpha = 0 }
                    if ($alpha -gt 255) { $alpha = 255 }
                    $embBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
                } else {
                    $embBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
                }
            }
        }
    }
    $embBmp.Save("c:\Users\admin\OneDrive\Desktop\wmd pro 1\sports-shop\frontend\public\logo-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $embBmp.Dispose()
    Write-Host "Saved logo-icon.png (emblem)"
}

$bmp.Dispose()
Write-Host "Processing complete."

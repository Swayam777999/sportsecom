Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\admin\OneDrive\Desktop\wmd pro 1\sports-shop\frontend\public\logo-icon.png"
$bmp = New-Object System.Drawing.Bitmap($srcPath)
$w = $bmp.Width
$h = $bmp.Height

$darkBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -gt 15) {
            # Check if this pixel is the dark arch (dark navy / black) vs blue
            # Blue has high B and lower R: e.g. B > 120 and B > R * 1.5
            if ($c.B -gt 100 -and $c.B -gt ($c.R * 1.4)) {
                # Keep vibrant electric blue mountain peak
                $darkBmp.SetPixel($x, $y, $c)
            } else {
                # Convert the dark navy arch to bright white/silver for dark mode
                $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($c.A, 250, 252, 255))
            }
        } else {
            $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$darkBmp.Save("c:\Users\admin\OneDrive\Desktop\wmd pro 1\sports-shop\frontend\public\logo-icon-dark.png", [System.Drawing.Imaging.ImageFormat]::Png)
$darkBmp.Dispose()
$bmp.Dispose()
Write-Host "Created logo-icon-dark.png successfully."

Add-Type -AssemblyName System.Drawing

$root = Split-Path $PSScriptRoot
if (-not $root) { $root = "c:\Users\woori\saju-me-seojin" }
$public = Join-Path $root "public"
$mascotPath = Join-Path $public "mascot.png"

function U([int[]]$codes) {
  -join ($codes | ForEach-Object { [char]$_ })
}

$tBrand = (U 0xC0AC, 0xC8FC) + " " + (U 0xBBF8)
$tTitle = (U 0xB098, 0xB294) + " " + (U 0xC5B4, 0xB5A4) + " " + (U 0xD615, 0xC77C, 0xAE4C)
$tLine1 = (U 0xC0DD, 0xB144, 0xC6D4, 0xC77C, 0xB9CC) + " " + (U 0xB123, 0xC73C, 0xBA74)
$tLine2 = (U 0xBB3C, 0xAC1C, 0xAC00) + " " + (U 0xC720, 0xD615) + " " + (U 0xCE74, 0xB4DC, 0xB97C) + " " + (U 0xC77D, 0xC5B4) + " " + (U 0xC904, 0xAC8C, 0xC694)
$han = @(0x6728, 0x706B, 0x571F, 0x91D1, 0x6C34) | ForEach-Object { [char]$_ }

$mascot = [System.Drawing.Image]::FromFile($mascotPath)

$w = 1200
$h = 630
$og = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

$bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(246, 246, 246))
$g.FillRectangle($bg, 0, 0, $w, $h)

$skyGlow = New-Object System.Drawing.Drawing2D.GraphicsPath
$skyGlow.AddEllipse(-60, -100, 520, 420)
$pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush $skyGlow
$pgb.CenterColor = [System.Drawing.Color]::FromArgb(80, 168, 212, 245)
$pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 168, 212, 245))
$g.FillPath($pgb, $skyGlow)

$blushGlow = New-Object System.Drawing.Drawing2D.GraphicsPath
$blushGlow.AddEllipse(760, -30, 520, 380)
$pgb2 = New-Object System.Drawing.Drawing2D.PathGradientBrush $blushGlow
$pgb2.CenterColor = [System.Drawing.Color]::FromArgb(60, 255, 194, 209)
$pgb2.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 194, 209))
$g.FillPath($pgb2, $blushGlow)

$g.DrawImage($mascot, -10, 16, 590, 590)

$faint = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 91, 159, 212))
$hanFont = New-Object System.Drawing.Font "Malgun Gothic", 28, ([System.Drawing.FontStyle]::Bold)
$hanPos = @(
  @(1020, 80),
  @(1110, 190),
  @(1040, 310),
  @(1120, 430),
  @(1010, 520)
)
for ($i = 0; $i -lt 5; $i++) {
  $g.DrawString($han[$i], $hanFont, $faint, $hanPos[$i][0], $hanPos[$i][1])
}

$sky = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(63, 127, 176))
$ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(42, 51, 64))
$soft = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(107, 119, 135))
$brandFont = New-Object System.Drawing.Font "Malgun Gothic", 22, ([System.Drawing.FontStyle]::Bold)
$titleFont = New-Object System.Drawing.Font "Malgun Gothic", 36, ([System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font "Malgun Gothic", 16, ([System.Drawing.FontStyle]::Regular)

$x = 600
$g.DrawString($tBrand, $brandFont, $sky, $x, 178)
$g.DrawString($tTitle, $titleFont, $ink, $x, 228)
$g.DrawString($tLine1, $subFont, $soft, $x, 318)
$g.DrawString($tLine2, $subFont, $soft, $x, 352)

$og.Save((Join-Path $public "og.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$icon = New-Object System.Drawing.Bitmap 180, 180
$ig = [System.Drawing.Graphics]::FromImage($icon)
$ig.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$ig.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$ig.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$ig.DrawImage($mascot, 0, 0, 180, 180)
$icon.Save((Join-Path $public "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose(); $ig.Dispose(); $og.Dispose(); $icon.Dispose(); $mascot.Dispose()
Write-Output "ok"

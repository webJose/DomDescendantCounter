# Create assets directory if it doesn't exist
if (-not (Test-Path ./dist/assets)) {
    New-Item -ItemType Directory -Path ./dist/assets -Force -Recurse
}

# Read package.json version and sync with manifest.json
$packageJson = Get-Content ./package.json | ConvertFrom-Json
$manifestJson = Get-Content ./src/manifest.json | ConvertFrom-Json
$manifestJson.version = $packageJson.version

# Copy manifest.json with synced version to dist
$manifestJson | ConvertTo-Json -Depth 10 | Set-Content ./dist/manifest.json

# Make png logos
foreach ($svgFile in Get-ChildItem ./src/assets/*.svg) {
    $pngFile = [System.IO.Path]::ChangeExtension($svgFile.Name, ".png")
    # Convert SVG to PNG using ImageMagick
    magick $svgFile.FullName $([System.IO.Path]::Combine("./dist/assets", $pngFile))
}

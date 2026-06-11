# Run this from the ROOT of the izdrewz/esslay repo after extracting this zip.
$ErrorActionPreference = "Stop"

$source = Join-Path $PSScriptRoot "docs\assets\rooms\home-life-admin"
$target = "docs\assets\rooms\home-life-admin"

if (!(Test-Path $source)) {
  Write-Host "Could not find extracted room assets at: $source"
  Write-Host "Put this script beside the extracted docs folder, or copy the docs folder into the repo manually."
  exit 1
}

New-Item -ItemType Directory -Force -Path $target | Out-Null
Copy-Item -Path (Join-Path $source "*") -Destination $target -Force

git status --short
git add docs/assets/rooms/home-life-admin
git commit -m "Add Home Life Admin room placeholder backgrounds"
git push

Write-Host "Done. Open docs/house.html?fresh=1"

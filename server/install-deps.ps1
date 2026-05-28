Set-Location $PSScriptRoot
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
Write-Host "Installation complete!"

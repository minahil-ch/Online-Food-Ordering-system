# Starts local API + cloudflare tunnel, writes tunnel URL for Vercel proxy
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Seeding database (if needed)..."
npm run seed 2>&1 | Out-Null

Write-Host "Starting API on port 5000..."
Start-Process -WindowStyle Hidden -FilePath "npm" -ArgumentList "run","start","-w","@food-ordering/server" -WorkingDirectory $root

Start-Sleep -Seconds 4

Write-Host "Starting Cloudflare tunnel..."
$log = Join-Path $env:TEMP "food-dash-tunnel.log"
Remove-Item $log -ErrorAction SilentlyContinue
Start-Process -WindowStyle Hidden -FilePath "npx" -ArgumentList "--yes","cloudflared","tunnel","--url","http://localhost:5000" -RedirectStandardOutput $log -WorkingDirectory $root

$tunnelUrl = $null
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 2
  if (Test-Path $log) {
    $text = Get-Content $log -Raw -ErrorAction SilentlyContinue
    if ($text -match '(https://[a-z0-9-]+\.trycloudflare\.com)') {
      $tunnelUrl = $Matches[1]
      break
    }
  }
}

if (-not $tunnelUrl) {
  Write-Host "Tunnel URL not found. Check $log"
  exit 1
}

Write-Host "Public API: $tunnelUrl"
$env:BACKEND_URL = $tunnelUrl
node scripts/generate-vercel-config.cjs

Write-Host ""
Write-Host "Next: git add vercel.json client/vercel.json && git commit && git push"
Write-Host "Keep this PC online while the demo is live."

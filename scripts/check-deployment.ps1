# Quick check: Render API + Vercel proxy + restaurants endpoint
$backend = if ($env:BACKEND_URL) { $env:BACKEND_URL.TrimEnd('/') } else { 'https://online-food-ordering-api.onrender.com' }
$vercel = if ($env:VERCEL_URL) { "https://$($env:VERCEL_URL)" } else { 'https://online-food-ordering-system-client.vercel.app' }

Write-Host "Backend: $backend"
Write-Host ""

function Test-Url($label, $url, $method = 'GET') {
  try {
    if ($method -eq 'POST') {
      $r = Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Body '{"email":"admin@food.com","password":"Admin@1234"}' -UseBasicParsing -TimeoutSec 90
    } else {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 90
    }
    Write-Host "[OK] $label -> $($r.StatusCode)"
    if ($r.Content.Length -lt 200) { Write-Host "     $($r.Content)" }
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "[FAIL] $label -> HTTP $code"
    if ($code -eq 404 -and $url -like "*onrender*") {
      Write-Host "     Render reports no-server: deploy API from render.yaml + set MONGODB_URI"
    }
    if ($code -eq 405) {
      Write-Host "     Vercel is not proxying /api — redeploy with updated client/vercel.json or use direct API URL"
    }
  }
}

Test-Url 'Render health' "$backend/api/health"
Test-Url 'Render restaurants' "$backend/api/restaurants"
Test-Url 'Vercel proxy health' "$vercel/api/health"
Test-Url 'Vercel login POST' "$vercel/api/auth/login" 'POST'

while ($true) {
  try { Invoke-WebRequest -Uri "https://engzone-backend-production.up.railway.app/api/health" -UseBasicParsing -TimeoutSec 30 | Out-Null } catch {}
  Start-Sleep -Seconds 300
}

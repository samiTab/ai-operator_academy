# AI Operator Academy - local setup helper (Windows PowerShell)
Write-Host "Installing dependencies (npm install)..." -ForegroundColor Cyan
npm install
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env - open it and paste your Anthropic API key." -ForegroundColor Yellow
} else {
  Write-Host ".env already exists - leaving it as is." -ForegroundColor DarkGray
}
Write-Host ""
Write-Host "Done. Start the app with:  npm run dev" -ForegroundColor Green
Write-Host "Then open http://localhost:5173" -ForegroundColor Green

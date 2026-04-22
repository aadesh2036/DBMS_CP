$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$envFile = Join-Path $repoRoot "backend/.env"
if (-not (Test-Path $envFile)) {
  throw "Missing backend/.env"
}

$config = @{}
Get-Content $envFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
    return
  }
  $parts = $line.Split("=", 2)
  $config[$parts[0].Trim()] = $parts[1].Trim()
}

$dbHost = if ($config.ContainsKey("DB_HOST")) { $config["DB_HOST"] } else { "127.0.0.1" }
$dbPort = if ($config.ContainsKey("DB_PORT")) { $config["DB_PORT"] } else { "3306" }
$dbUser = if ($config.ContainsKey("DB_USER")) { $config["DB_USER"] } else { "root" }
$dbPassword = if ($config.ContainsKey("DB_PASSWORD")) { $config["DB_PASSWORD"] } else { "" }
$dbName = if ($config.ContainsKey("DB_NAME")) { $config["DB_NAME"] } else { "social_media_db" }

$mysql = "mysql"
if (-not (Get-Command $mysql -ErrorAction SilentlyContinue)) {
  $mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
}
if (-not (Test-Path $mysql) -and $mysql -ne "mysql") {
  throw "MySQL client not found. Install MySQL client or add mysql to PATH."
}

Write-Host "Resetting database '$dbName' and applying schema + seed on $dbHost`:$dbPort ..." -ForegroundColor Cyan
$env:MYSQL_PWD = $dbPassword
& $mysql --protocol=TCP --host=$dbHost --port=$dbPort -u $dbUser -e "DROP DATABASE IF EXISTS $dbName;"
Get-Content "database/schema.sql" -Raw | & $mysql --protocol=TCP --host=$dbHost --port=$dbPort -u $dbUser
Get-Content "database/seed.sql" -Raw | & $mysql --protocol=TCP --host=$dbHost --port=$dbPort -u $dbUser
Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue

Write-Host "Starting backend and frontend in separate windows..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$repoRoot'; npm --prefix backend run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$repoRoot'; npm --prefix frontend run dev"

Write-Host "Done. Backend: http://localhost:4000 | Frontend: http://localhost:5173" -ForegroundColor Yellow

# Test simple agent list

# 1. Login
$loginResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@ipclaw.com","password":"admin123456"}' -UseBasicParsing
$token = $loginResult.token
Write-Host "Token: $($token.Substring(0, 30))..."

# 2. Get agents
Write-Host "`n=== Get Agents ==="
$agents = Invoke-RestMethod -Uri 'http://43.163.125.222/api/agents' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
Write-Host "Agents count: $($agents.Count)"
if ($agents.Count -gt 0) {
    Write-Host "First agent: $($agents[0] | ConvertTo-Json -Depth 2)"
}

# 3. Get a specific agent by ID
$agentId = "cmqxilqp20007f4d9ry5mzf22"
Write-Host "`n=== Get Agent by ID ===" -ForegroundColor Yellow
$agent = Invoke-RestMethod -Uri "http://43.163.125.222/api/agents/$agentId" -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
Write-Host "Agent: $($agent | ConvertTo-Json -Depth 2)"

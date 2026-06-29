# Clean Credit Test

# 1. Login
$loginResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@ipclaw.com","password":"admin123456"}' -UseBasicParsing
$token = $loginResult.token
$userId = $loginResult.user.id
Write-Host "User: $userId"

# 2. Get current balance
$account = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/account' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
Write-Host "`n=== Current Account ===" -ForegroundColor Yellow
Write-Host "Total: $($account.totalCredits), Available: $($account.availableCredits), Spent: $($account.spentCredits)"

# 3. Recharge 1000 credits
Write-Host "`n=== Recharge 1000 ===" -ForegroundColor Green
$recharge = Invoke-RestMethod -Uri 'http://43.163.125.222/api/admin/credits/recharge' -Method POST -ContentType 'application/json' -Headers @{Authorization="Bearer $token"} -Body (@{userId=$userId; amount=1000; description="Clean test recharge"} | ConvertTo-Json) -UseBasicParsing
Write-Host "Recharged: $($recharge.creditsAdded), Total: $($recharge.totalCredits)"

# 4. Check new balance
$account = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/account' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
Write-Host "`n=== After Recharge ===" -ForegroundColor Yellow
Write-Host "Total: $($account.totalCredits), Available: $($account.availableCredits)"

# 5. Send chat
Write-Host "`n=== Sending Chat ===" -ForegroundColor Cyan
$agentId = "cmqxilqp20007f4d9ry5mzf22"
$chat = Invoke-RestMethod -Uri "http://43.163.125.222/api/agents/$agentId/chat" -Method POST -ContentType 'application/json' -Headers @{Authorization="Bearer $token"} -Body (@{messages=@(@{role="user"; content="Hello"})} | ConvertTo-Json) -UseBasicParsing
Write-Host "Chat response received"

# 6. Check final balance
Start-Sleep 1
$account = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/account' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
Write-Host "`n=== Final Account ===" -ForegroundColor Yellow
Write-Host "Total: $($account.totalCredits), Available: $($account.availableCredits), Spent: $($account.spentCredits)"
Write-Host "Change: $($account.spentCredits - 1000) credits spent on this chat" -ForegroundColor Magenta

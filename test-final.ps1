# Test Credit System Full Flow

# 1. Login
$loginResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@ipclaw.com","password":"admin123456"}' -UseBasicParsing
$token = $loginResult.token
$userId = $loginResult.user.id
Write-Host "=== Login Success ===" -ForegroundColor Green
Write-Host "User ID: $userId"

# 2. Check initial credits
Write-Host "`n=== Initial Credit Balance ===" -ForegroundColor Yellow
$accountResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/account' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
$initialCredits = $accountResult.availableCredits
Write-Host "Initial Credits: $initialCredits"

# 3. Recharge credits
Write-Host "`n=== Recharging Credits ===" -ForegroundColor Yellow
$rechargeResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/admin/credits/recharge' -Method POST -ContentType 'application/json' -Headers @{Authorization="Bearer $token"} -Body (@{userId=$userId; amount=5000; description="测试充值5000积分"} | ConvertTo-Json) -UseBasicParsing
Write-Host "Recharge Result: $($rechargeResult.success), Added: $($rechargeResult.creditsAdded)"

# 4. Check balance after recharge
Write-Host "`n=== After Recharge ===" -ForegroundColor Yellow
$accountResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/account' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
Write-Host "Credits: $($accountResult.availableCredits)"

# 5. Send chat message
Write-Host "`n=== Sending Chat Message ===" -ForegroundColor Yellow
$agentId = "cmqxilqp20007f4d9ry5mzf22"
$chatBody = @{
    messages = @(
        @{
            role = "user"
            content = "你好，请介绍一下你自己"
        }
    )
} | ConvertTo-Json -Depth 5

$chatResult = Invoke-RestMethod -Uri "http://43.163.125.222/api/agents/$agentId/chat" -Method POST -ContentType 'application/json' -Headers @{Authorization="Bearer $token"} -Body $chatBody -UseBasicParsing
$responseContent = if ($chatResult.content) { $chatResult.content } else { $chatResult.error }
Write-Host "Agent Response received" -ForegroundColor Green

# 6. Check balance after chat
Start-Sleep -Seconds 2
Write-Host "`n=== After Chat ===" -ForegroundColor Yellow
$accountResult2 = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/account' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
$finalCredits = $accountResult2.availableCredits
$spentCredits = $accountResult.availableCredits - $finalCredits
Write-Host "Before: $($accountResult.availableCredits)" -ForegroundColor Cyan
Write-Host "After: $finalCredits" -ForegroundColor Cyan
Write-Host "Spent: $spentCredits" -ForegroundColor Magenta

# 7. Check transactions
Write-Host "`n=== Recent Transactions ===" -ForegroundColor Yellow
$txResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/transactions?limit=5' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
$txResult.transactions | ForEach-Object {
    $color = if ($_.amount -lt 0) { "Red" } else { "Green" }
    Write-Host "[$($_.type)] $($_.category): $($_.amount) credits - $($_.description)" -ForegroundColor $color
}

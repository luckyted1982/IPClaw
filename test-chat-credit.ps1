# Test Credit Deduction via Agent Chat

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

# 3. Use specific agent
$agentId = "cmqxilqp20007f4d9ry5mzf22"
Write-Host "`n=== Using Agent ===" -ForegroundColor Yellow
Write-Host "Agent ID: $agentId"

# 4. Send a chat message
Write-Host "`n=== Sending Chat Message ===" -ForegroundColor Yellow
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
Write-Host "Agent Response: $($responseContent.Substring(0, [Math]::Min(150, $responseContent.Length)))..." -ForegroundColor Green

# 5. Check credits after chat
Write-Host "`n=== Credit Balance After Chat ===" -ForegroundColor Yellow
Start-Sleep -Seconds 1
$accountResult2 = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/account' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
$finalCredits = $accountResult2.availableCredits
$spentCredits = $initialCredits - $finalCredits
Write-Host "Initial: $initialCredits" -ForegroundColor Cyan
Write-Host "Final: $finalCredits" -ForegroundColor Cyan
Write-Host "Spent: $spentCredits" -ForegroundColor Magenta

# 6. Check transactions
Write-Host "`n=== Recent Transactions ===" -ForegroundColor Yellow
$txResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/transactions?limit=5' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
$txResult.transactions | ForEach-Object {
    $color = if ($_.amount -lt 0) { "Red" } else { "Green" }
    Write-Host "[$($_.type)] $($_.category): $($_.amount) credits" -ForegroundColor $color
}

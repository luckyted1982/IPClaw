# Test IPClaw Credit System

# 1. Login
$loginResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@ipclaw.com","password":"admin123456"}' -UseBasicParsing
$token = $loginResult.token
Write-Host "=== Login Success ===" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, [Math]::Min(20, $token.Length)))..."

# 2. Check credit account
Write-Host "`n=== Check Credit Account ===" -ForegroundColor Yellow
try {
    $accountResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/account' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
    $accountResult | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Account not found or error: $_" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# 3. If no account, create one and add credits via admin API
Write-Host "`n=== Admin: Add Credits to User ===" -ForegroundColor Yellow
$adminLogin = Invoke-RestMethod -Uri 'http://43.163.125.222/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@ipclaw.com","password":"admin123456"}' -UseBasicParsing
$adminToken = $adminLogin.token

$userId = $loginResult.user.id
if ($userId) {
    $rechargeResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/admin/credits/recharge' -Method POST -ContentType 'application/json' -Headers @{Authorization="Bearer $adminToken"} -Body (@{userId=$userId; amount=10000; description="测试充值10000积分"} | ConvertTo-Json) -UseBasicParsing
    Write-Host "Recharge Result:" -ForegroundColor Green
    $rechargeResult | ConvertTo-Json -Depth 3
} else {
    Write-Host "Could not get user ID" -ForegroundColor Red
}

# 4. Check account again
Write-Host "`n=== Check Account After Recharge ===" -ForegroundColor Yellow
$accountResult = Invoke-RestMethod -Uri 'http://43.163.125.222/api/credits/account' -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
$accountResult | ConvertTo-Json -Depth 3

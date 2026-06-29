param(
    [string]$Token,
    [string]$ApiBase = "http://43.163.125.222"
)

# Test Token Usage
Write-Host "Current Credits:" -ForegroundColor Yellow
$accountResult = Invoke-RestMethod -Uri "$ApiBase/api/credits/account" -Method GET -Headers @{Authorization="Bearer $Token"} -UseBasicParsing
Write-Host "Credits: $($accountResult.availableCredits)"

Write-Host "Recharging 5000 credits" -ForegroundColor Yellow
$rechargeResult = Invoke-RestMethod -Uri "$ApiBase/api/admin/credits/recharge" -Method POST -ContentType 'application/json' -Headers @{Authorization="Bearer $Token"} -Body (@{userId=$accountResult.userId; amount=5000; description="测试充值"} | ConvertTo-Json) -UseBasicParsing
Write-Host "Recharge result: $($rechargeResult.success)"

Write-Host "Consumption Rules" -ForegroundColor Yellow
$rules = Invoke-RestMethod -Uri "$ApiBase/api/credits/rules" -Method GET -Headers @{Authorization="Bearer $Token"} -UseBasicParsing
$rules | ForEach-Object {
    Write-Host "Service: $($_.serviceType), Base: $($_.baseCredits), PerToken: $($_.perTokenCredits)"
}

Write-Host "Calculate Sample Credits" -ForegroundColor Yellow
$calcBody = @{serviceType="agent_chat"; modelName="deepseek-chat"; inputTokens=100; outputTokens=200} | ConvertTo-Json
$calcResult = Invoke-RestMethod -Uri "$ApiBase/api/credits/calculate" -Method POST -ContentType 'application/json' -Headers @{Authorization="Bearer $Token"} -Body $calcBody -UseBasicParsing
Write-Host "Estimated credits for 100 input + 200 output tokens: $($calcResult.estimatedCredits)"

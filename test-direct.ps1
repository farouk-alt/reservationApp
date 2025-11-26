Write-Host "🎯 DIRECT SERVICENOW INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Start port-forward
Write-Host "`n🔗 Starting port-forward..." -ForegroundColor Yellow
$portForwardJob = Start-Job -ScriptBlock {
    kubectl port-forward -n servicenow-integration svc/servicenow-webhook 8080:80
}

Start-Sleep -Seconds 5

try {
    # Test health
    Write-Host "Testing health endpoint..." -ForegroundColor Gray
    $health = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 10
    Write-Host "✅ Health: $($health.status)" -ForegroundColor Green
    
    # Test with direct alert creation
    Write-Host "`nTesting direct alert creation..." -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "http://localhost:8080/test-alert" -Method Post -TimeoutSec 15
    Write-Host "✅ Test alert result: $($response.message)" -ForegroundColor Green
    
    Write-Host "`n🎯 CHECK SERVICENOW NOW!" -ForegroundColor Magenta
    Write-Host "Go to: https://dev190642.service-now.com" -ForegroundColor White
    Write-Host "Navigate to: Incident → All" -ForegroundColor White
    Write-Host "Look for: [PROMETHEUS] [CRITICAL] ManualTest - reservation-app" -ForegroundColor Yellow
    Write-Host "`nThe incident should be created immediately!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Checking logs..." -ForegroundColor Yellow
    kubectl logs -n servicenow-integration -l app=servicenow-webhook --tail=20
} finally {
    Stop-Job $portForwardJob -ErrorAction SilentlyContinue
    Remove-Job $portForwardJob -ErrorAction SilentlyContinue
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "🎯 TEST COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
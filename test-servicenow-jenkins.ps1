Write-Host "TESTING JENKINS + SERVICENOW INTEGRATION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Test the ServiceNow API call that will be in Jenkins
Write-Host "`nTesting ServiceNow API connection..." -ForegroundColor Yellow

$SERVICENOW_INSTANCE = "dev190642.service-now.com"
$SERVICENOW_USERNAME = "prometheus_integration"
$SERVICENOW_PASSWORD = "Farouk1122@"

$testIncident = @{
    short_description = "TEST - Jenkins ServiceNow Integration"
    description = "This is a test incident from Jenkins pipeline integration test"
    priority = "4"
    impact = "3"
    urgency = "3"
    category = "Test"
    contact_type = "Automated Test"
} | ConvertTo-Json

try {
    $base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${SERVICENOW_USERNAME}:${SERVICENOW_PASSWORD}"))
    
    $response = Invoke-RestMethod -Uri "https://$SERVICENOW_INSTANCE/api/now/table/incident" -Method Post -Body $testIncident -ContentType "application/json" -Headers @{ Authorization = "Basic $base64Auth" }
    
    Write-Host "ServiceNow API Test SUCCESSFUL!" -ForegroundColor Green
    Write-Host "   Incident created: $($response.result.number)" -ForegroundColor Gray
    Write-Host "   Sys ID: $($response.result.sys_id)" -ForegroundColor Gray
    
    Write-Host "`nJenkins pipeline will create:" -ForegroundColor Magenta
    Write-Host "   1. Change Request for each deployment" -ForegroundColor White
    Write-Host "   2. Incident for deployment tracking" -ForegroundColor White
    Write-Host "   3. Annotations in ArgoCD for traceability" -ForegroundColor White
    
} catch {
    Write-Host "ServiceNow API Test FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
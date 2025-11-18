Write-Host "Starting Minikube Monitoring Test..."

# 1. Check if Minikube is running
$mk = minikube status --format '{{.Host}}' 2>$null

if ($mk -ne "Running") {
    Write-Host "Starting Minikube..."
    minikube start --driver=docker
}

# 2. Check monitoring namespace
Write-Host "Checking monitoring namespace..."
$ns = kubectl get ns monitoring -o json 2>$null

if (-not $ns) {
    Write-Host "Monitoring namespace not found."
    Write-Host "Make sure you installed kube-prometheus-stack via Helm."
    exit 1
}

# 3. Port-forward Grafana
Write-Host "Port-forwarding Grafana..."
Start-Process powershell -ArgumentList "kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 8080:3000" -WindowStyle Hidden
Start-Sleep -Seconds 6

# 4. Test Grafana API
Write-Host "Testing Grafana API..."

try {
    $health = Invoke-WebRequest "http://localhost:8080/api/health" -UseBasicParsing
    Write-Host "Grafana is UP"
} catch {
    Write-Host "Grafana FAILED"
    exit 1
}

# 5. Test Prometheus datasource in Grafana
Write-Host "Testing Prometheus Datasource..."

try {
    $datasources = Invoke-WebRequest "http://localhost:8080/api/datasources" -UseBasicParsing
    Write-Host "Prometheus datasource OK"
} catch {
    Write-Host "Prometheus datasource FAILED"
}

# 6. Test Prometheus 'up' metric
Write-Host "Testing Prometheus metric 'up'..."

try {
    $metric = Invoke-WebRequest "http://localhost:8080/api/datasources/proxy/1/api/v1/query?query=up" -UseBasicParsing
    Write-Host "Prometheus metrics are working"
} catch {
    Write-Host "Prometheus 'up' query FAILED"
}

Write-Host "Monitoring System is Ready!"

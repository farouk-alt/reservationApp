Write-Host "🚀 DIRECT PROMETHEUS TO SERVICENOW INTEGRATION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Clean up everything first
Write-Host "`n🧹 Cleaning up previous deployments..." -ForegroundColor Yellow
kubectl delete deployment servicenow-webhook -n servicenow-integration --ignore-not-found=true
kubectl delete configmap servicenow-app-code -n servicenow-integration --ignore-not-found=true
kubectl delete secret servicenow-credentials -n servicenow-integration --ignore-not-found=true

Start-Sleep -Seconds 3

# Create new secret with CORRECT credentials
Write-Host "`n🔐 Creating new secret with correct credentials..." -ForegroundColor Yellow

$SERVICENOW_INSTANCE = "dev190642.service-now.com"
$SERVICENOW_USERNAME = "prometheus_integration"
$SERVICENOW_PASSWORD = "Farouk1122@"

kubectl create secret generic servicenow-credentials `
    --from-literal=SERVICENOW_INSTANCE="$SERVICENOW_INSTANCE" `
    --from-literal=SERVICENOW_USERNAME="$SERVICENOW_USERNAME" `
    --from-literal=SERVICENOW_PASSWORD="$SERVICENOW_PASSWORD" `
    --namespace=servicenow-integration

Write-Host "✅ Secret created with correct credentials" -ForegroundColor Green

# Create a SIMPLE webhook that definitely works
Write-Host "`n📦 Deploying simple working webhook..." -ForegroundColor Yellow

$simpleDeployment = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: servicenow-webhook
  namespace: servicenow-integration
spec:
  replicas: 1
  selector:
    matchLabels:
      app: servicenow-webhook
  template:
    metadata:
      labels:
        app: servicenow-webhook
    spec:
      containers:
      - name: webhook
        image: node:18-alpine
        workingDir: /app
        command: ["/bin/sh", "-c"]
        args:
          - |
            # Create simple package.json and install dependencies
            echo '{"dependencies":{"express":"^4.18.2","axios":"^1.6.0"}}' > package.json
            npm install
            
            # Create simple server
            cat > server.js << 'ENDOFFILE'
            const express = require("express");
            const axios = require("axios");
            const app = express();
            app.use(express.json());
            
            const SERVICENOW_INSTANCE = process.env.SERVICENOW_INSTANCE;
            const SERVICENOW_USERNAME = process.env.SERVICENOW_USERNAME;
            const SERVICENOW_PASSWORD = process.env.SERVICENOW_PASSWORD;
            
            console.log("Starting ServiceNow Webhook...");
            
            // Test ServiceNow connection
            async function testServiceNow() {
              try {
                const response = await axios.get(
                  "https://" + SERVICENOW_INSTANCE + "/api/now/table/incident?sysparm_limit=1",
                  {
                    auth: {
                      username: SERVICENOW_USERNAME,
                      password: SERVICENOW_PASSWORD
                    }
                  }
                );
                console.log("✅ ServiceNow connection successful!");
                return true;
              } catch (error) {
                console.log("❌ ServiceNow connection failed: " + error.message);
                return false;
              }
            }
            
            // Create incident in ServiceNow
            async function createIncident(alert) {
              const severity = alert.labels.severity || "warning";
              const alertname = alert.labels.alertname || "UnknownAlert";
              const namespace = alert.labels.namespace || "default";
              
              const shortDescription = "[PROMETHEUS] [" + severity.toUpperCase() + "] " + alertname + " - " + namespace;
              const description = "Alert: " + alertname + "\nSeverity: " + severity + "\nNamespace: " + namespace;
              
              const incidentData = {
                short_description: shortDescription,
                description: description,
                priority: severity === "critical" ? "1" : severity === "high" ? "2" : "3",
                impact: "2",
                urgency: "2",
                category: "Infrastructure"
              };
              
              try {
                const response = await axios.post(
                  "https://" + SERVICENOW_INSTANCE + "/api/now/table/incident",
                  incidentData,
                  {
                    auth: {
                      username: SERVICENOW_USERNAME,
                      password: SERVICENOW_PASSWORD
                    },
                    headers: {
                      "Content-Type": "application/json"
                    }
                  }
                );
                
                console.log("✅ Created ServiceNow incident: " + response.data.result.number);
                return response.data.result;
              } catch (error) {
                console.log("❌ Failed to create incident: " + error.message);
                throw error;
              }
            }
            
            // Webhook endpoint
            app.post("/webhook", async (req, res) => {
              console.log("Received webhook with " + (req.body.alerts ? req.body.alerts.length : 0) + " alerts");
              
              const alerts = req.body.alerts || [];
              const results = [];
              
              for (const alert of alerts) {
                try {
                  if (alert.status === "firing") {
                    const incident = await createIncident(alert);
                    results.push({
                      alert: alert.labels.alertname,
                      incident: incident.number,
                      success: true
                    });
                  }
                } catch (error) {
                  results.push({
                    alert: alert.labels.alertname,
                    error: error.message,
                    success: false
                  });
                }
              }
              
              res.json({
                success: true,
                results: results
              });
            });
            
            // Health endpoint
            app.get("/health", (req, res) => {
              res.json({ status: "healthy", instance: SERVICENOW_INSTANCE });
            });
            
            // Test endpoint
            app.post("/test-alert", async (req, res) => {
              try {
                const testAlert = {
                  status: "firing",
                  labels: {
                    alertname: "ManualTest",
                    severity: "critical",
                    namespace: "reservation-app"
                  },
                  annotations: {
                    summary: "Manual test from API"
                  }
                };
                
                const incident = await createIncident(testAlert);
                res.json({
                  success: true,
                  message: "Test alert created incident: " + incident.number
                });
              } catch (error) {
                res.status(500).json({
                  success: false,
                  error: error.message
                });
              }
            });
            
            const PORT = 3000;
            app.listen(PORT, async () => {
              console.log("Webhook service running on port " + PORT);
              await testServiceNow();
            });
            ENDOFFILE
            
            # Start the server
            node server.js
        ports:
        - containerPort: 3000
        env:
        - name: SERVICENOW_INSTANCE
          valueFrom:
            secretKeyRef:
              name: servicenow-credentials
              key: SERVICENOW_INSTANCE
        - name: SERVICENOW_USERNAME
          valueFrom:
            secretKeyRef:
              name: servicenow-credentials
              key: SERVICENOW_USERNAME
        - name: SERVICENOW_PASSWORD
          valueFrom:
            secretKeyRef:
              name: servicenow-credentials
              key: SERVICENOW_PASSWORD
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: servicenow-webhook
  namespace: servicenow-integration
spec:
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: servicenow-webhook
"@

# Save to file and apply (to avoid PowerShell parsing issues)
$simpleDeployment | Out-File -FilePath "servicenow-simple.yaml" -Encoding UTF8
kubectl apply -f servicenow-simple.yaml
Remove-Item "servicenow-simple.yaml" -Force

Write-Host "✅ Webhook deployment completed" -ForegroundColor Green

# Wait for pod
Write-Host "`n⏰ Waiting for pod to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Check status
Write-Host "`n📋 Pod Status:" -ForegroundColor Cyan
kubectl get pods -n servicenow-integration

Write-Host "`n📜 Pod Logs:" -ForegroundColor Cyan
kubectl logs -n servicenow-integration -l app=servicenow-webhook --tail=10

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n🎯 TEST THE INTEGRATION:" -ForegroundColor Magenta
Write-Host "1. Wait for pod to be 'Running'" -ForegroundColor White
Write-Host "2. Run: kubectl port-forward -n servicenow-integration svc/servicenow-webhook 8080:80" -ForegroundColor Gray
Write-Host "3. In another terminal, test with:" -ForegroundColor White
Write-Host "   Invoke-RestMethod -Uri 'http://localhost:8080/test-alert' -Method Post" -ForegroundColor Gray
Write-Host "4. Check ServiceNow for new incident" -ForegroundColor White
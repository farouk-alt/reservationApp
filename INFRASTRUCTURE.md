# Infrastructure Documentation

## Tools Used
- **Terraform**: Infrastructure management (MySQL, networking, quotas)
- **ArgoCD**: Application deployment (backend, frontend)
- **Jenkins**: CI/CD pipeline (build, test, deploy)

## Terraform Resources
Located in `/terraform/main.tf`
- Namespace
- MySQL (PVC, Deployment, Service, ConfigMap, Secret)
- Network Policies
- Resource Quotas

## ArgoCD Resources
Located in `/k8s/`
- Backend (Deployment, Service, ConfigMap, Secret)
- Frontend (Deployment, Service)

## Commands

### Terraform
```bash
cd terraform
terraform plan    # Preview changes
terraform apply   # Apply changes
terraform destroy # Destroy infrastructure
```

### ArgoCD
```bash
# Force sync
kubectl -n argocd patch app reservation-app -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'

# Check status
kubectl get application -n argocd reservation-app
```

### Kubernetes
```bash
# Check pods
kubectl get pods -n reservation-app

# Check logs
kubectl logs -n reservation-app deployment/backend
kubectl logs -n reservation-app deployment/mysql

# Restart deployment
kubectl rollout restart deployment/backend -n reservation-app
```
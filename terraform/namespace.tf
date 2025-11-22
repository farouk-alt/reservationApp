resource "kubernetes_namespace" "reservation_app" {
  metadata {
    name = "reservation-app"
    
    labels = {
      name       = "reservation-app"
      managed-by = "terraform"
    }
    
    annotations = {
      description = "Reservation Management Application"
    }
  }
  
  lifecycle {
    ignore_changes = [
      metadata[0].labels["app.kubernetes.io/name"],
      metadata[0].labels["managed-by"],
      metadata[0].annotations["argocd.argoproj.io/tracking-id"],
      metadata[0].annotations["description"]
    ]
  }
}
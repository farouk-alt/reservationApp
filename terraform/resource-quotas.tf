resource "kubernetes_resource_quota" "reservation_quota" {
  metadata {
    name      = "reservation-quota"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
  }

  spec {
    hard = {
      "pods"            = var.max_pods
      "requests.cpu"    = "4"
      "requests.memory" = "8Gi"
      "limits.cpu"      = var.max_cpu
      "limits.memory"   = var.max_memory
    }
  }
}

# Limit ranges for individual pods
resource "kubernetes_limit_range" "pod_limits" {
  metadata {
    name      = "pod-limits"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
  }

  spec {
    limit {
      type = "Pod"
      
      max = {
        cpu    = "2"
        memory = "4Gi"
      }
      
      min = {
        cpu    = "50m"
        memory = "64Mi"
      }
    }

    limit {
      type = "Container"
      
      default = {
        cpu    = "500m"
        memory = "512Mi"
      }
      
      default_request = {
        cpu    = "250m"
        memory = "256Mi"
      }
    }
  }
}

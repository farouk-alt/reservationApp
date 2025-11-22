resource "kubernetes_resource_quota" "reservation_quota" {
  metadata {
    name      = "reservation-quota"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
  }

  spec {
    hard = {
      "pods"             = "20"
      "requests.cpu"     = "4"
      "requests.memory"  = "8Gi"
      "limits.cpu"       = "8"
      "limits.memory"    = "16Gi"
    }
  }
}

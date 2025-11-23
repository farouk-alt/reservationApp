resource "kubernetes_ingress_v1" "reservation_app" {
  metadata {
    name      = "reservation-app-ingress"
    namespace = "reservation-app"

    labels = {
      app        = "reservation-app"
      managed-by = "terraform"
    }

    annotations = {
      "nginx.ingress.kubernetes.io/use-regex"      = "true"
      "nginx.ingress.kubernetes.io/ssl-redirect"   = "false"
      # NO rewrite-target here to avoid breaking Laravel!
    }
  }

  spec {
    ingress_class_name = "nginx"

    rule {
      host = "reservation.local"

      http {
        # API first
        path {
          path      = "/api(/|$)(.*)"
          path_type = "ImplementationSpecific"

          backend {
            service {
              name = "backend-nginx"
              port { number = 80 }
            }
          }
        }

        # Frontend after
        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = "frontend"
              port { number = 80 }
            }
          }
        }
      }
    }
  }
}

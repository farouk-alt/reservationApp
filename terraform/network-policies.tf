# Default deny all ingress
resource "kubernetes_network_policy" "default_deny_ingress" {
  metadata {
    name      = "default-deny-ingress"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
  }

  spec {
    pod_selector {}
    policy_types = ["Ingress"]
  }
}

# Allow frontend -> backend
resource "kubernetes_network_policy" "allow_frontend_to_backend" {
  metadata {
    name      = "allow-frontend-backend"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
  }

  spec {
    pod_selector {
      match_labels = {
        app = "backend"
      }
    }

    ingress {
      from {
        pod_selector {
          match_labels = {
            app = "frontend"
          }
        }
      }

      ports {
        port     = "9000"
        protocol = "TCP"
      }
    }

    policy_types = ["Ingress"]
  }
}

# Allow backend -> mysql
resource "kubernetes_network_policy" "allow_backend_to_mysql" {
  metadata {
    name      = "allow-backend-mysql"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
  }

  spec {
    pod_selector {
      match_labels = {
        app = "mysql"
      }
    }

    ingress {
      from {
        pod_selector {
          match_labels = {
            app = "backend"
          }
        }
      }

      ports {
        port     = "3306"
        protocol = "TCP"
      }
    }

    policy_types = ["Ingress"]
  }
}
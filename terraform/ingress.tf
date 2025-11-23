resource "kubernetes_ingress_v1" "reservation_app" {
  metadata {
    name      = "reservation-app-ingress"
    namespace = "reservation-app"
    
    labels = {
      app        = "reservation-app"
      managed-by = "terraform"
    }
    
    annotations = {
      "nginx.ingress.kubernetes.io/ssl-redirect" = "false"
    }
  }
  
  spec {
    ingress_class_name = "nginx"
    
    rule {
      host = "reservation.local"
      
      http {
        # Backend API - More specific path FIRST
        path {
          path      = "/api/"       # Add trailing slash
          path_type = "Prefix"
          
          backend {
            service {
              name = "backend-nginx"
              port { number = 80 }
            }
          }
        }
        
        # Also match /api without trailing slash
        path {
          path      = "/api"
          path_type = "Exact"       # Exact match
          
          backend {
            service {
              name = "backend-nginx"
              port { number = 80 }
            }
          }
        }
        
        # Frontend (catch-all) - LAST
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
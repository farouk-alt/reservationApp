resource "kubernetes_persistent_volume_claim" "mysql_pvc" {
  metadata {
    name      = "mysql-pvc"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
    
    labels = {
      app        = "mysql"
      managed-by = "terraform"
    }
    
    annotations = {
      description = "Persistent storage for MySQL data"
    }
  }

  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = "hostpath"
    
    resources {
      requests = {
        storage = "2Gi"
      }
    }
  }

  lifecycle {
    prevent_destroy = false  # Set true in production
  }
}

# ConfigMap for MySQL configuration
resource "kubernetes_config_map" "mysql_config" {
  metadata {
    name      = "mysql-config"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
    
    labels = {
      app        = "mysql"
      managed-by = "terraform"
    }
  }

  data = {
    DB_HOST     = "mysql"
    DB_PORT     = "3306"
    DB_DATABASE = "reservation_db"
    DB_USERNAME = "root"
    
    # Extra fields for compatibility
    MYSQL_DATABASE = "reservation_db"
    MYSQL_USER     = "root"
  }
}




# MySQL Deployment
resource "kubernetes_deployment" "mysql" {
  metadata {
    name      = "mysql"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
    
    labels = {
      app        = "mysql"
      managed-by = "terraform"
    }
    
    annotations = {
      description = "MySQL Database managed by Terraform"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app        = "mysql"
        managed-by = "terraform"
      }
    }

    template {
      metadata {
        labels = {
          app        = "mysql"
          managed-by = "terraform"
        }
      }

      spec {
        container {
          name  = "mysql"
          image = "mysql:8.0"
          
          port {
            container_port = 3306
            name           = "mysql"
          }

          env {
            name  = "MYSQL_DATABASE"
            value = "reservation_db"
          }

          env {
            name  = "MYSQL_ROOT_PASSWORD"
            value = "1010"
          }

          # Mount persistent volume
          volume_mount {
            name       = "mysql-storage"
            mount_path = "/var/lib/mysql"
          }

          resources {
            requests = {
              memory = "256Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }

          liveness_probe {
            exec {
              command = ["/bin/sh", "-c", "mysqladmin ping -h localhost -u root -p1010"]
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            exec {
              command = ["/bin/sh", "-c", "mysqladmin ping -h localhost -u root -p1010"]
            }
            initial_delay_seconds = 10
            period_seconds        = 5
          }
        }

        volume {
          name = "mysql-storage"
          
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mysql_pvc.metadata[0].name
          }
        }
      }
    }
  }

  wait_for_rollout = true
}

# MySQL Service
resource "kubernetes_service" "mysql" {
  metadata {
    name      = "mysql"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
    
    labels = {
      app        = "mysql"
      managed-by = "terraform"
    }
  }

  spec {
    selector = {
      app        = "mysql"
      managed-by = "terraform"
    }

    port {
      name        = "mysql"
      port        = 3306
      target_port = 3306
      protocol    = "TCP"
    }

    cluster_ip = "None"  # Headless service
    type       = "ClusterIP"
  }
}

output "namespace" {
  value       = kubernetes_namespace.reservation_app.metadata[0].name
  description = "Application namespace"
}

output "mysql_endpoint" {
  value       = "mysql.${var.namespace}.svc.cluster.local:3306"
  description = "MySQL connection endpoint"
}

output "app_url" {
  value       = var.enable_ingress ? "http://${var.app_domain}" : "Port-forward required"
  description = "Application URL"
}

output "backend_replicas" {
  value       = var.backend_replicas
  description = "Number of backend replicas"
}

output "frontend_replicas" {
  value       = var.frontend_replicas
  description = "Number of frontend replicas"
}

output "environment" {
  value       = var.environment
  description = "Current environment"
}

output "ingress_enabled" {
  value       = var.enable_ingress
  description = "Ingress status"
}

output "config_summary" {
  value = {
    namespace          = var.namespace
    environment        = var.environment
    mysql_storage      = var.mysql_storage_size
    backend_replicas   = var.backend_replicas
    frontend_replicas  = var.frontend_replicas
    ingress_enabled    = var.enable_ingress
    domain             = var.app_domain
  }
  description = "Configuration summary"
}
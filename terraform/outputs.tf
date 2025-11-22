output "namespace" {
  value       = kubernetes_namespace.reservation_app.metadata[0].name
  description = "Application namespace"
}

output "mysql_endpoint" {
  value       = "mysql.${kubernetes_namespace.reservation_app.metadata[0].name}.svc.cluster.local:3306"
  description = "MySQL connection endpoint"
}

# Application Configuration
variable "app_name" {
  description = "Application name"
  type        = string
  default     = "reservation-app"
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "reservation-app"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "dev"
}

# MySQL Configuration
variable "mysql_database" {
  description = "MySQL database name"
  type        = string
  default     = "reservation_db"
}

variable "mysql_user" {
  description = "MySQL username"
  type        = string
  default     = "root"
}

variable "mysql_password" {
  description = "MySQL root password"
  type        = string
  sensitive   = true
  default     = "1010"
}

variable "mysql_storage_size" {
  description = "MySQL PVC storage size"
  type        = string
  default     = "2Gi"
}

# Backend Configuration
variable "backend_replicas" {
  description = "Number of backend replicas"
  type        = number
  default     = 1
}

variable "backend_memory_request" {
  description = "Backend memory request"
  type        = string
  default     = "256Mi"
}

variable "backend_memory_limit" {
  description = "Backend memory limit"
  type        = string
  default     = "512Mi"
}

variable "backend_cpu_request" {
  description = "Backend CPU request"
  type        = string
  default     = "250m"
}

variable "backend_cpu_limit" {
  description = "Backend CPU limit"
  type        = string
  default     = "500m"
}

# Frontend Configuration
variable "frontend_replicas" {
  description = "Number of frontend replicas"
  type        = number
  default     = 1
}

variable "frontend_memory_request" {
  description = "Frontend memory request"
  type        = string
  default     = "128Mi"
}

variable "frontend_memory_limit" {
  description = "Frontend memory limit"
  type        = string
  default     = "256Mi"
}

# Network Configuration
variable "enable_ingress" {
  description = "Enable Ingress for external access"
  type        = bool
  default     = true
}

variable "app_domain" {
  description = "Application domain name"
  type        = string
  default     = "reservation.local"
}

# Resource Quotas
variable "max_pods" {
  description = "Maximum pods in namespace"
  type        = number
  default     = 20
}

variable "max_cpu" {
  description = "Maximum CPU for namespace"
  type        = string
  default     = "8"
}

variable "max_memory" {
  description = "Maximum memory for namespace"
  type        = string
  default     = "16Gi"
}
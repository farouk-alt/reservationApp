# Application-wide ConfigMap
resource "kubernetes_config_map" "app_config" {
  metadata {
    name      = "app-config"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
    
    labels = {
      app        = var.app_name
      managed-by = "terraform"
    }
  }

  data = {
    # Application Settings
    APP_NAME        = var.app_name
    APP_ENV         = var.environment
    APP_URL         = "http://${var.app_domain}"
    APP_DEBUG       = var.environment == "dev" ? "true" : "false"
    
    # Feature Flags
    ENABLE_LOGGING  = "true"
    ENABLE_METRICS  = "true"
    LOG_LEVEL       = var.environment == "prod" ? "error" : "debug"
    
    # Frontend Settings
    REACT_APP_API_URL = "http://${var.app_domain}/api"
    REACT_APP_ENV     = var.environment
    NODE_ENV          = var.environment == "prod" ? "production" : "development"
  }
}

# Backend-specific ConfigMap (extends mysql-config)
resource "kubernetes_config_map" "backend_config" {
  metadata {
    name      = "backend-config"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
    
    labels = {
      app        = "backend"
      managed-by = "terraform"
    }
  }

  data = {
    # Laravel specific
    APP_KEY         = "base64:your-app-key-here"  # Generate: php artisan key:generate
    APP_TIMEZONE    = "UTC"
    LOG_CHANNEL     = "stack"
    
    # Cache & Session
    CACHE_DRIVER    = "redis"
    SESSION_DRIVER  = "redis"
    QUEUE_DRIVER    = "redis"
    REDIS_HOST      = "redis"
    REDIS_PORT      = "6379"
    
    # Mail Configuration (optional)
    MAIL_MAILER     = "smtp"
    MAIL_HOST       = "mailhog"
    MAIL_PORT       = "1025"
  }
}

# ==============================================================================
# terraform/secrets.tf - Secrets Management
# ==============================================================================

# Application secrets
resource "kubernetes_secret" "app_secrets" {
  metadata {
    name      = "app-secrets"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
    
    labels = {
      app        = var.app_name
      managed-by = "terraform"
    }
  }

  data = {
    # JWT Secret
    JWT_SECRET = "your-jwt-secret-here-change-in-production"
    
    # API Keys (examples)
    STRIPE_KEY    = "sk_test_xxx"
    STRIPE_SECRET = "secret_xxx"
    
    # OAuth (if needed)
    GOOGLE_CLIENT_ID     = "xxx.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET = "secret"
  }

  type = "Opaque"
}

# Docker registry secret (for private images)
resource "kubernetes_secret" "docker_registry" {
  metadata {
    name      = "regcred"
    namespace = kubernetes_namespace.reservation_app.metadata[0].name
    
    labels = {
      managed-by = "terraform"
    }
  }

  type = "kubernetes.io/dockerconfigjson"

  data = {
    ".dockerconfigjson" = jsonencode({
      auths = {
        "https://index.docker.io/v1/" = {
          username = "faroukelrey19008"
          password = "your-docker-password"  # Use variable in production
          email    = "your-email@example.com"
          auth     = base64encode("faroukelrey19008:your-docker-password")
        }
      }
    })
  }
}
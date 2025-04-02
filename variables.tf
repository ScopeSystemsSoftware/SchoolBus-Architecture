###################################
# Variabile pentru configurația Multi-Tenant Multi-Cloud
# a aplicației SchoolBus
###################################

# Variabile Google Cloud Platform
variable "gcp_project_id" {
  description = "ID-ul proiectului Google Cloud"
  type        = string
}

variable "gcp_region" {
  description = "Regiunea Google Cloud"
  type        = string
  default     = "us-central1"
}

variable "gke_node_count" {
  description = "Numărul de noduri pentru clusterul GKE"
  type        = number
  default     = 3
}

variable "gke_machine_type" {
  description = "Tipul de mașină pentru nodurile GKE"
  type        = string
  default     = "e2-standard-2"
}

# Variabile DigitalOcean
variable "do_token" {
  description = "API Token pentru DigitalOcean"
  type        = string
  sensitive   = true
}

variable "do_region" {
  description = "Regiunea DigitalOcean"
  type        = string
  default     = "fra1"
}

variable "vps_node_count" {
  description = "Numărul de noduri pentru clusterul VPS"
  type        = number
  default     = 2
}

variable "vps_node_size" {
  description = "Dimensiunea nodurilor VPS"
  type        = string
  default     = "s-2vcpu-4gb"
}

# Variabile pentru Bare-Metal
variable "baremetal_server_ip" {
  description = "IP-ul serverului bare-metal"
  type        = string
}

variable "ssh_key_path" {
  description = "Calea către cheia SSH privată pentru conectare la serverul bare-metal"
  type        = string
  default     = "~/.ssh/id_rsa"
}

# Variabile pentru multi-tenancy
variable "enable_tenant_isolation" {
  description = "Activează izolarea completă între tenanți"
  type        = bool
  default     = true
}

variable "tenant_resources" {
  description = "Alocări de resurse pentru tenanți"
  type = map(object({
    cpu_request     = string
    memory_request  = string
    cpu_limit       = string
    memory_limit    = string
    pods_max        = number
    services_max    = number
    priority_class  = string
  }))
  default = {
    tenanta = {
      cpu_request    = "1"
      memory_request = "2Gi"
      cpu_limit      = "2"
      memory_limit   = "4Gi"
      pods_max       = 30
      services_max   = 15
      priority_class = "high"
    },
    tenantb = {
      cpu_request    = "1"
      memory_request = "2Gi"
      cpu_limit      = "2"
      memory_limit   = "4Gi"
      pods_max       = 25
      services_max   = 10
      priority_class = "medium"
    },
    tenantc = {
      cpu_request    = "0.5"
      memory_request = "1Gi"
      cpu_limit      = "1"
      memory_limit   = "2Gi"
      pods_max       = 20
      services_max   = 10
      priority_class = "low"
    }
  }
}

# Variabile pentru planul de scalare
variable "hpa_config" {
  description = "Configurații pentru Horizontal Pod Autoscaler"
  type = map(object({
    min_replicas    = number
    max_replicas    = number
    cpu_threshold   = number
    memory_threshold = number
  }))
  default = {
    api_gateway = {
      min_replicas    = 2
      max_replicas    = 10
      cpu_threshold   = 70
      memory_threshold = 80
    },
    auth_service = {
      min_replicas    = 2
      max_replicas    = 5
      cpu_threshold   = 75
      memory_threshold = 80
    },
    bus_service = {
      min_replicas    = 2
      max_replicas    = 8
      cpu_threshold   = 70
      memory_threshold = 80
    },
    route_service = {
      min_replicas    = 2
      max_replicas    = 8
      cpu_threshold   = 70
      memory_threshold = 80
    },
    tracking_service = {
      min_replicas    = 3
      max_replicas    = 12
      cpu_threshold   = 65
      memory_threshold = 75
    },
    notification_service = {
      min_replicas    = 2
      max_replicas    = 6
      cpu_threshold   = 70
      memory_threshold = 80
    }
  }
}

# Variabile pentru monitorizare
variable "enable_monitoring" {
  description = "Activează monitorizarea Prometheus și Grafana"
  type        = bool
  default     = true
}

variable "enable_tracing" {
  description = "Activează distributed tracing cu Jaeger"
  type        = bool
  default     = true
}

# Variabile pentru backup
variable "enable_backup" {
  description = "Activează backup-uri automate"
  type        = bool
  default     = true
}

variable "backup_schedule" {
  description = "Programul pentru backup-uri (în format cron)"
  type        = string
  default     = "0 2 * * *"  # În fiecare zi la ora 2:00
}

variable "backup_retention_days" {
  description = "Numărul de zile pentru păstrarea backup-urilor"
  type        = number
  default     = 30
} 
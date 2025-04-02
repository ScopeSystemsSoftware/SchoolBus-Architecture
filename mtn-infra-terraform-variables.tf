variable "project_id" {
  description = "Project ID unde va fi implementată infrastructura"
  type        = string
}

variable "region" {
  description = "Regiunea GCP pentru implementare"
  type        = string
  default     = "europe-west4"
}

variable "tenants" {
  description = "Lista de tenanți care vor fi configurați"
  type        = list(string)
  default     = ["tenanta", "tenantb", "tenantc"]
}

variable "service_account" {
  description = "Service account pentru nodurile GKE"
  type        = string
  default     = "schoolbus-mtn-gke@REPLACE_WITH_PROJECT_ID.iam.gserviceaccount.com"
}

variable "istio_operator_version" {
  description = "Versiunea Istio Operator care va fi instalată"
  type        = string
  default     = "1.16.0"
}

variable "mongodb_version" {
  description = "Versiunea MongoDB care va fi instalată"
  type        = string
  default     = "6.0.4"
}

variable "domain" {
  description = "Domeniul principal pentru aplicație"
  type        = string
  default     = "schoolbus-mtn.example.com"
}

variable "env" {
  description = "Mediul de implementare (de exemplu: dev, staging, prod)"
  type        = string
  default     = "poc"
}

variable "namespace_labels" {
  description = "Etichete suplimentare pentru namespace-uri"
  type        = map(string)
  default     = {}
}

variable "enable_monitoring" {
  description = "Activează monitoring-ul pentru infrastructură"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Activează logging-ul pentru infrastructură"
  type        = bool
  default     = true
}

variable "node_locations" {
  description = "Zone specifice pentru noduri în regiune"
  type        = list(string)
  default     = []
}

variable "min_master_version" {
  description = "Versiunea minimă Kubernetes pentru GKE"
  type        = string
  default     = "1.24"
}

variable "cluster_secondary_range_name" {
  description = "Numele range-ului secundar pentru pod-uri"
  type        = string
  default     = "pods-range"
}

variable "services_secondary_range_name" {
  description = "Numele range-ului secundar pentru servicii"
  type        = string
  default     = "services-range"
}

variable "tenant_namespaces_prefix" {
  description = "Prefix pentru namespace-urile tenanților"
  type        = string
  default     = "tenant-"
}

variable "tenant_resource_limits" {
  description = "Limite de resurse pentru fiecare tenant"
  type = map(object({
    cpu       = string
    memory    = string
    pods      = number
    services  = number
  }))
  default = {
    default = {
      cpu      = "4"
      memory   = "8Gi"
      pods     = 50
      services = 20
    }
  }
}

variable "demo_service_image" {
  description = "Imaginea pentru microserviciul demo"
  type        = string
  default     = "gcr.io/REPLACE_WITH_PROJECT_ID/schoolbus-mtn-svc-demo:latest"
}

variable "demo_service_port" {
  description = "Portul pentru microserviciul demo"
  type        = number
  default     = 8080
}

variable "frontend_app_image" {
  description = "Imaginea pentru aplicația frontend"
  type        = string
  default     = "gcr.io/REPLACE_WITH_PROJECT_ID/schoolbus-mtn-app-demo:latest"
}

variable "frontend_app_port" {
  description = "Portul pentru aplicația frontend"
  type        = number
  default     = 80
}

variable "db_username" {
  description = "Utilizator pentru baza de date"
  type        = string
  default     = "schoolbus"
}

variable "db_password" {
  description = "Parola pentru baza de date"
  type        = string
  sensitive   = true
}

variable "enable_network_policies" {
  description = "Activează Network Policies pentru izolarea tenanților"
  type        = bool
  default     = true
}

variable "enable_resource_quotas" {
  description = "Activează Resource Quotas pentru limitarea resurselor per tenant"
  type        = bool
  default     = true
}

variable "enable_hpa" {
  description = "Activează Horizontal Pod Autoscaler pentru serviciile de aplicație"
  type        = bool
  default     = true
}

variable "jaeger_sampling_rate" {
  description = "Rata de sampling pentru Jaeger"
  type        = number
  default     = 100
}

variable "prometheus_retention_time" {
  description = "Perioada de retenție pentru date Prometheus"
  type        = string
  default     = "15d"
}

variable "grafana_admin_password" {
  description = "Parola administrator pentru Grafana"
  type        = string
  sensitive   = true
  default     = null
}

variable "enable_tenant_context_propagation" {
  description = "Activează propagarea automată a contextului de tenant între servicii"
  type        = bool
  default     = true
}

variable "tenant_header_name" {
  description = "Numele header-ului pentru identificarea tenant-ului"
  type        = string
  default     = "x-tenant-id"
} 
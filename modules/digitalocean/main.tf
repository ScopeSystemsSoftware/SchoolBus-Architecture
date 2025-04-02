###################################
# Modulul DigitalOcean pentru Multi-Tenant SchoolBus
###################################

variable "do_token" {
  description = "Token-ul API pentru DigitalOcean"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "Regiunea DigitalOcean"
  type        = string
  default     = "fra1"
}

variable "cluster_name" {
  description = "Numele clusterului DigitalOcean Kubernetes"
  type        = string
  default     = "schoolbus-vps-cluster"
}

variable "node_count" {
  description = "Numărul de noduri în cluster"
  type        = number
  default     = 3
}

variable "node_size" {
  description = "Dimensiunea nodurilor"
  type        = string
  default     = "s-2vcpu-4gb"
}

variable "labels" {
  description = "Etichete pentru cluster"
  type        = map(string)
  default     = {}
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_kubernetes_cluster" "schoolbus" {
  name    = var.cluster_name
  region  = var.region
  version = "1.27.4-do.0"  # Versiunea de Kubernetes (se recomandă verificarea versiunilor disponibile)
  tags    = ["schoolbus", "multi-tenant"]
  
  # Configurare node pool
  node_pool {
    name       = "worker-pool"
    size       = var.node_size
    node_count = var.node_count
    
    labels = var.labels
    
    # Tag-uri pentru noduri
    tags = ["schoolbus", "worker"]
  }
  
  # Configurare Auto Scaling pentru node pool
  # Nodul că DigitalOcean nu suportă Auto Scaling pentru node pools direct în Terraform
  # Aceasta este o configurație exemplu pentru viitoare referință
  maintenance_policy {
    start_time = "04:00"
    day        = "sunday"
  }

  # Specificăm că vrem să activăm caracteristici HA
  ha = true
}

# Outputs pentru utilizare în modulul principal
output "endpoint" {
  value = digitalocean_kubernetes_cluster.schoolbus.endpoint
}

output "endpoint_ip" {
  value = digitalocean_kubernetes_cluster.schoolbus.ipv4_address
}

output "access_token" {
  value     = digitalocean_kubernetes_cluster.schoolbus.kube_config[0].token
  sensitive = true
}

output "cluster_ca_certificate" {
  value     = base64decode(digitalocean_kubernetes_cluster.schoolbus.kube_config[0].cluster_ca_certificate)
  sensitive = true
} 
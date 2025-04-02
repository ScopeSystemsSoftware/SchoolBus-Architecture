###################################
# Modulul GKE pentru Multi-Tenant SchoolBus
###################################

variable "project_id" {
  description = "ID-ul proiectului GCP"
  type        = string
}

variable "region" {
  description = "Regiunea GCP"
  type        = string
  default     = "us-central1"
}

variable "cluster_name" {
  description = "Numele clusterului GKE"
  type        = string
  default     = "schoolbus-gke-cluster"
}

variable "node_count" {
  description = "Numărul de noduri pentru fiecare zone"
  type        = number
  default     = 1
}

variable "machine_type" {
  description = "Tipul mașinii pentru noduri"
  type        = string
  default     = "e2-standard-2"
}

variable "labels" {
  description = "Etichete pentru cluster"
  type        = map(string)
  default     = {}
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region
  
  # Dezactivăm modul Autopilot pentru a avea control complet
  # asupra configurației clusterului
  enable_autopilot = false
  
  # Configurăm initial_node_count în loc să folosim node_pool
  # pentru simplitate. Într-un mediu real, am folosi node_pools separate.
  initial_node_count = var.node_count
  
  # Configurăm un network policy provider pentru securitate
  network_policy {
    enabled  = true
    provider = "CALICO"
  }
  
  # Activăm addon-ul config_connector pentru Kubernetes Config Connector
  addons_config {
    config_connector_config {
      enabled = true
    }
    
    istio_config {
      disabled = true  # Vom instala Istio cu Helm
    }
  }
  
  # Activăm GKE Workload Identity pentru autentificare la GCP APIs
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
  
  # Configurăm un node pool standard
  node_config {
    machine_type = var.machine_type
    
    # Configurare workload identity la nivel de nod
    workload_metadata_config {
      mode = "GKE_METADATA"
    }
    
    # Etichete pentru noduri
    labels = var.labels
    
    # Tags pentru firewall
    tags = ["gke-node", "schoolbus-node"]
    
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
  
  # Activăm scalare automată a clusterului
  vertical_pod_autoscaling {
    enabled = true
  }
  
  # Configurăm role-based access control
  private_cluster_config {
    enable_private_nodes    = false
    enable_private_endpoint = false
  }
  
  # Păstrăm clusterul actualizat automat
  release_channel {
    channel = "REGULAR"
  }
}

# Obținem token-ul de acces pentru Kubernetes provider
data "google_client_config" "provider" {}

# Output valori pentru utilizare în modulul principal
output "endpoint" {
  value = "https://${google_container_cluster.primary.endpoint}"
}

output "endpoint_ip" {
  value = google_container_cluster.primary.endpoint
}

output "access_token" {
  value     = data.google_client_config.provider.access_token
  sensitive = true
}

output "cluster_ca_certificate" {
  value     = base64decode(google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
  sensitive = true
} 
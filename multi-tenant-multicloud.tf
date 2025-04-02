###################################
# Multi-Tenant Multi-Cloud Architecture
# pentru aplicația SchoolBus
###################################

# Variabile pentru tenanți
variable "tenants" {
  description = "Lista tenanților care vor fi configurați"
  type = list(object({
    id    = string
    name  = string
    color = string
  }))
  default = [
    {
      id    = "tenanta"
      name  = "Școala Nr. 1"
      color = "#1976d2"
    },
    {
      id    = "tenantb" 
      name  = "Liceul Tehnologic"
      color = "#388e3c"
    },
    {
      id    = "tenantc"
      name  = "Colegiul Național"
      color = "#d32f2f"
    }
  ]
}

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "digitalocean" {
  token = var.do_token
}

# Provider pentru GKE
provider "kubernetes" {
  alias                  = "gke"
  host                   = module.gke_cluster.endpoint
  token                  = module.gke_cluster.access_token
  cluster_ca_certificate = module.gke_cluster.cluster_ca_certificate
}

# Provider pentru VPS
provider "kubernetes" {
  alias                  = "vps"
  host                   = module.vps_cluster.endpoint
  token                  = module.vps_cluster.access_token
  cluster_ca_certificate = module.vps_cluster.cluster_ca_certificate
}

# Provider pentru bare-metal
provider "kubernetes" {
  alias                  = "baremetal"
  host                   = module.baremetal_cluster.endpoint
  token                  = module.baremetal_cluster.access_token
  cluster_ca_certificate = module.baremetal_cluster.cluster_ca_certificate
}

# Provider Helm pentru GKE
provider "helm" {
  alias = "gke"
  kubernetes {
    host                   = module.gke_cluster.endpoint
    token                  = module.gke_cluster.access_token
    cluster_ca_certificate = module.gke_cluster.cluster_ca_certificate
  }
}

# Provider Helm pentru VPS
provider "helm" {
  alias = "vps"
  kubernetes {
    host                   = module.vps_cluster.endpoint
    token                  = module.vps_cluster.access_token
    cluster_ca_certificate = module.vps_cluster.cluster_ca_certificate
  }
}

# Provider Helm pentru bare-metal
provider "helm" {
  alias = "baremetal"
  kubernetes {
    host                   = module.baremetal_cluster.endpoint
    token                  = module.baremetal_cluster.access_token
    cluster_ca_certificate = module.baremetal_cluster.cluster_ca_certificate
  }
}

# Module pentru crearea clusterelor Kubernetes
module "gke_cluster" {
  source = "./modules/gke"
  
  project_id        = var.gcp_project_id
  region            = var.gcp_region
  cluster_name      = "schoolbus-gke-cluster"
  node_count        = var.gke_node_count
  machine_type      = var.gke_machine_type
  labels            = { environment = "production" }
}

module "vps_cluster" {
  source = "./modules/digitalocean"
  
  do_token          = var.do_token
  region            = var.do_region
  cluster_name      = "schoolbus-vps-cluster"
  node_count        = var.vps_node_count
  node_size         = var.vps_node_size
  labels            = { environment = "staging" }
}

module "baremetal_cluster" {
  source = "./modules/baremetal"
  
  server_ip         = var.baremetal_server_ip
  ssh_key_path      = var.ssh_key_path
  labels            = { environment = "development" }
}

# Instalează Istio pe fiecare cluster pentru Service Mesh și multi-tenancy
module "istio_gke" {
  source = "./modules/istio"
  
  providers = {
    kubernetes = kubernetes.gke
    helm       = helm.gke
  }
  
  depends_on = [module.gke_cluster]
}

module "istio_vps" {
  source = "./modules/istio"
  
  providers = {
    kubernetes = kubernetes.vps
    helm       = helm.vps
  }
  
  depends_on = [module.vps_cluster]
}

module "istio_baremetal" {
  source = "./modules/istio"
  
  providers = {
    kubernetes = kubernetes.baremetal
    helm       = helm.baremetal
  }
  
  depends_on = [module.baremetal_cluster]
}

# Configurare namespace-uri pentru tenanți pe fiecare cluster
resource "kubernetes_namespace" "tenant_namespaces_gke" {
  provider = kubernetes.gke
  
  for_each = { for tenant in var.tenants : tenant.id => tenant }
  
  metadata {
    name = "tenant-${each.value.id}"
    
    labels = {
      istio-injection = "enabled"
      tenant          = each.value.id
      tenant-name     = each.value.name
    }
    
    annotations = {
      "tenant.schoolbus.io/display-name" = each.value.name
      "tenant.schoolbus.io/color"        = each.value.color
    }
  }
  
  depends_on = [module.istio_gke]
}

resource "kubernetes_namespace" "tenant_namespaces_vps" {
  provider = kubernetes.vps
  
  for_each = { for tenant in var.tenants : tenant.id => tenant }
  
  metadata {
    name = "tenant-${each.value.id}"
    
    labels = {
      istio-injection = "enabled"
      tenant          = each.value.id
      tenant-name     = each.value.name
    }
    
    annotations = {
      "tenant.schoolbus.io/display-name" = each.value.name
      "tenant.schoolbus.io/color"        = each.value.color
    }
  }
  
  depends_on = [module.istio_vps]
}

resource "kubernetes_namespace" "tenant_namespaces_baremetal" {
  provider = kubernetes.baremetal
  
  for_each = { for tenant in var.tenants : tenant.id => tenant }
  
  metadata {
    name = "tenant-${each.value.id}"
    
    labels = {
      istio-injection = "enabled"
      tenant          = each.value.id
      tenant-name     = each.value.name
    }
    
    annotations = {
      "tenant.schoolbus.io/display-name" = each.value.name
      "tenant.schoolbus.io/color"        = each.value.color
    }
  }
  
  depends_on = [module.istio_baremetal]
}

# Configurare izolare rețea între tenanți (Network Policies)
resource "kubernetes_network_policy" "tenant_isolation_gke" {
  provider = kubernetes.gke
  
  for_each = { for tenant in var.tenants : tenant.id => tenant }
  
  metadata {
    name      = "tenant-isolation"
    namespace = kubernetes_namespace.tenant_namespaces_gke[each.value.id].metadata[0].name
  }
  
  spec {
    pod_selector {}
    
    ingress {
      from {
        namespace_selector {
          match_labels = {
            tenant = each.value.id
          }
        }
      }
    }
    
    policy_types = ["Ingress"]
  }
}

resource "kubernetes_network_policy" "tenant_isolation_vps" {
  provider = kubernetes.vps
  
  for_each = { for tenant in var.tenants : tenant.id => tenant }
  
  metadata {
    name      = "tenant-isolation"
    namespace = kubernetes_namespace.tenant_namespaces_vps[each.value.id].metadata[0].name
  }
  
  spec {
    pod_selector {}
    
    ingress {
      from {
        namespace_selector {
          match_labels = {
            tenant = each.value.id
          }
        }
      }
    }
    
    policy_types = ["Ingress"]
  }
}

resource "kubernetes_network_policy" "tenant_isolation_baremetal" {
  provider = kubernetes.baremetal
  
  for_each = { for tenant in var.tenants : tenant.id => tenant }
  
  metadata {
    name      = "tenant-isolation"
    namespace = kubernetes_namespace.tenant_namespaces_baremetal[each.value.id].metadata[0].name
  }
  
  spec {
    pod_selector {}
    
    ingress {
      from {
        namespace_selector {
          match_labels = {
            tenant = each.value.id
          }
        }
      }
    }
    
    policy_types = ["Ingress"]
  }
}

# Configurare Traffic Director pentru rutare Multi-Cloud
module "traffic_director" {
  source = "./modules/traffic_director"
  
  project_id     = var.gcp_project_id
  gke_endpoint   = module.gke_cluster.endpoint_ip
  vps_endpoint   = module.vps_cluster.endpoint_ip
  baremetal_endpoint = module.baremetal_cluster.endpoint_ip
  tenants        = var.tenants
}

# Outputs pentru fiecare cluster
output "gke_cluster_endpoint" {
  value = module.gke_cluster.endpoint
}

output "vps_cluster_endpoint" {
  value = module.vps_cluster.endpoint
}

output "baremetal_cluster_endpoint" {
  value = module.baremetal_cluster.endpoint
}

output "istio_gke_ingress_ip" {
  value = module.istio_gke.ingress_ip
}

output "istio_vps_ingress_ip" {
  value = module.istio_vps.ingress_ip
}

output "istio_baremetal_ingress_ip" {
  value = module.istio_baremetal.ingress_ip
}

output "traffic_director_external_ip" {
  value = module.traffic_director.external_ip
} 
terraform {
  required_version = ">= 1.0.0"
  
  backend "gcs" {
    bucket  = "schoolbus-mtn-terraform-state"
    prefix  = "state/poc"
  }
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.16"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.9"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "kubernetes" {
  host                   = "https://${module.gke.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.gke.ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = "https://${module.gke.endpoint}"
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(module.gke.ca_certificate)
  }
}

data "google_client_config" "default" {}

# Modul pentru crearea cluster-ului GKE
module "gke" {
  source = "./modules/gke"
  
  project_id            = var.project_id
  region                = var.region
  cluster_name          = "schoolbus-mtn-poc"
  network               = "default"
  subnetwork            = "default"
  ip_range_pods         = ""
  ip_range_services     = ""
  enable_private_nodes  = false
  master_ipv4_cidr_block = "172.16.0.0/28"
  
  node_pools = [
    {
      name               = "general-pool"
      machine_type       = "e2-standard-2"
      min_count          = 3
      max_count          = 5
      disk_size_gb       = 100
      disk_type          = "pd-standard"
      auto_repair        = true
      auto_upgrade       = true
      service_account    = var.service_account
      initial_node_count = 3
    }
  ]
}

# Instalare Istio cu suport pentru multi-tenant
module "istio" {
  source = "./modules/istio"
  
  depends_on = [module.gke]
  
  istio_version   = "1.16.0"
  enable_tracing  = true
  enable_kiali    = true
  enable_grafana  = true
  
  # Configurare multi-tenant pentru Istio
  enable_multi_tenant = true
}

# Creează namespace-uri izolate pentru tenanți
resource "kubernetes_namespace" "tenant_namespaces" {
  for_each = toset(var.tenants)
  
  depends_on = [module.istio]
  
  metadata {
    name = "tenant-${each.value}"
    
    labels = {
      istio-injection = "enabled"
      tenant          = each.value
    }
  }
}

# Network Policies pentru izolarea tenanților
resource "kubernetes_network_policy" "tenant_isolation" {
  for_each = toset(var.tenants)
  
  metadata {
    name      = "tenant-isolation"
    namespace = kubernetes_namespace.tenant_namespaces[each.value].metadata[0].name
  }
  
  spec {
    pod_selector {}
    
    policy_types = ["Ingress", "Egress"]
    
    ingress {
      from {
        namespace_selector {
          match_labels = {
            tenant = each.value
          }
        }
      }
      
      from {
        namespace_selector {
          match_labels = {
            role = "shared-services"
          }
        }
      }
    }
    
    egress {
      to {
        namespace_selector {
          match_labels = {
            tenant = each.value
          }
        }
      }
      
      to {
        namespace_selector {
          match_labels = {
            role = "shared-services"
          }
        }
      }
      
      to {
        namespace_selector {
          match_labels = {
            role = "external-services"
          }
        }
      }
    }
  }
}

# Resource Quotas pentru limitarea resurselor per tenant
resource "kubernetes_resource_quota" "tenant_quota" {
  for_each = toset(var.tenants)
  
  metadata {
    name      = "tenant-quota"
    namespace = kubernetes_namespace.tenant_namespaces[each.value].metadata[0].name
  }
  
  spec {
    hard = {
      pods                 = 50
      "requests.cpu"       = 4
      "requests.memory"    = "8Gi"
      "limits.cpu"         = 6
      "limits.memory"      = "12Gi"
      services             = 20
      "services.loadbalancers" = 1
    }
  }
}

# Instalează și configurează microserviciul demo
module "demo_service" {
  source = "./modules/kubernetes-resources"
  
  for_each = {
    for tenant in var.tenants : tenant => {
      namespace = kubernetes_namespace.tenant_namespaces[tenant].metadata[0].name
    }
  }
  
  depends_on = [
    kubernetes_namespace.tenant_namespaces,
    kubernetes_network_policy.tenant_isolation,
    kubernetes_resource_quota.tenant_quota
  ]
  
  name       = "demo-service"
  namespace  = each.value.namespace
  
  deployment = {
    image         = "gcr.io/${var.project_id}/schoolbus-mtn-svc-demo:latest"
    replicas      = 2
    cpu_request   = "200m"
    memory_request = "256Mi"
    cpu_limit     = "500m"
    memory_limit  = "512Mi"
    
    env = [
      {
        name  = "TENANT_ID"
        value = each.key
      },
      {
        name  = "DB_HOST"
        value = "cockroachdb.db.svc.cluster.local"
      }
    ]
    
    readiness_probe = {
      http_get = {
        path = "/health"
        port = 8080
      }
      initial_delay_seconds = 10
      period_seconds        = 10
    }
    
    liveness_probe = {
      http_get = {
        path = "/health"
        port = 8080
      }
      initial_delay_seconds = 20
      period_seconds        = 15
    }
  }
  
  service = {
    type  = "ClusterIP"
    ports = [
      {
        name = "http"
        port = 80
        target_port = 8080
      }
    ]
  }
  
  # Horizontal Pod Autoscaler
  hpa = {
    min_replicas = 2
    max_replicas = 5
    metrics = [
      {
        type     = "Resource"
        name     = "cpu"
        target_type = "Utilization"
        target_value = 70
      }
    ]
  }
}

# Configurare Istio Gateway și VirtualService pentru rutarea multi-tenant
resource "kubernetes_manifest" "istio_gateway" {
  depends_on = [module.istio]
  
  manifest = {
    apiVersion = "networking.istio.io/v1alpha3"
    kind       = "Gateway"
    metadata = {
      name      = "tenant-gateway"
      namespace = "istio-system"
    }
    spec = {
      selector = {
        istio = "ingressgateway"
      }
      servers = [
        {
          port = {
            number   = 80
            name     = "http"
            protocol = "HTTP"
          }
          hosts = ["*.schoolbus-mtn.example.com"]
        }
      ]
    }
  }
}

resource "kubernetes_manifest" "tenant_virtual_service" {
  for_each = toset(var.tenants)
  
  depends_on = [kubernetes_manifest.istio_gateway]
  
  manifest = {
    apiVersion = "networking.istio.io/v1alpha3"
    kind       = "VirtualService"
    metadata = {
      name      = "tenant-${each.value}-routing"
      namespace = kubernetes_namespace.tenant_namespaces[each.value].metadata[0].name
    }
    spec = {
      hosts = ["${each.value}.schoolbus-mtn.example.com"]
      gateways = ["istio-system/tenant-gateway"]
      http = [
        {
          match = [
            {
              uri = {
                prefix = "/api"
              }
            }
          ]
          route = [
            {
              destination = {
                host = "demo-service"
                port = {
                  number = 80
                }
              }
            }
          ]
          headers = {
            request = {
              set = {
                "x-tenant-id" = each.value
              }
            }
          }
        }
      ]
    }
  }
}

# Configurare Istio AuthorizationPolicy pentru izolarea tenanților
resource "kubernetes_manifest" "tenant_authorization_policy" {
  depends_on = [module.istio]
  
  manifest = {
    apiVersion = "security.istio.io/v1beta1"
    kind       = "AuthorizationPolicy"
    metadata = {
      name      = "tenant-isolation"
      namespace = "istio-system"
    }
    spec = {
      selector = {
        matchLabels = {
          istio = "ingressgateway"
        }
      }
      rules = [
        for tenant in var.tenants : {
          from = [
            {
              source = {
                principals = ["*"]
              }
            }
          ]
          to = [
            {
              operation = {
                hosts = ["${tenant}.schoolbus-mtn.example.com"]
              }
            }
          ]
          when = [
            {
              key = "request.headers[x-tenant-id]"
              values = [tenant]
            }
          ]
        }
      ]
    }
  }
} 
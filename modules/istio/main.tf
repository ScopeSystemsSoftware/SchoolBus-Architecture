###################################
# Modulul Istio pentru Multi-Tenant SchoolBus
###################################

# Creăm namespace-ul pentru Istio
resource "kubernetes_namespace" "istio_system" {
  metadata {
    name = "istio-system"
    
    labels = {
      istio-injection = "disabled"
    }
  }
}

# Instalăm operatorul Istio folosind Helm
resource "helm_release" "istio_base" {
  name       = "istio-base"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "base"
  version    = "1.16.1"
  namespace  = kubernetes_namespace.istio_system.metadata[0].name
  
  timeout    = 300
}

# Instalăm Istio control plane
resource "helm_release" "istiod" {
  name       = "istiod"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "istiod"
  version    = "1.16.1"
  namespace  = kubernetes_namespace.istio_system.metadata[0].name
  
  depends_on = [helm_release.istio_base]
  
  set {
    name  = "global.mtls.enabled"
    value = "true"
  }
  
  set {
    name  = "global.multiCluster.clusterName"
    value = "cluster1" # Setează un nume de cluster unic
  }
  
  # Configurați Istio pentru suport multi-tenant
  set {
    name  = "meshConfig.accessLogFile"
    value = "/dev/stdout"
  }
  
  set {
    name  = "meshConfig.enableTracing"
    value = "true"
  }
  
  timeout = 300
}

# Instalăm Istio Ingress Gateway
resource "helm_release" "istio_ingress" {
  name       = "istio-ingressgateway"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "gateway"
  version    = "1.16.1"
  namespace  = kubernetes_namespace.istio_system.metadata[0].name
  
  depends_on = [helm_release.istiod]
  
  timeout = 300
}

# Obținem IP-ul gateway-ului Istio
data "kubernetes_service" "istio_ingress" {
  metadata {
    name      = "istio-ingressgateway"
    namespace = kubernetes_namespace.istio_system.metadata[0].name
  }
  
  depends_on = [helm_release.istio_ingress]
}

# Creăm namespace-ul pentru monitorizare
resource "kubernetes_namespace" "istio_monitoring" {
  metadata {
    name = "istio-monitoring"
    
    labels = {
      istio-injection = "enabled"
    }
  }
  
  depends_on = [helm_release.istiod]
}

# Instalăm Kiali pentru vizualizarea mesh-ului
resource "helm_release" "kiali" {
  name       = "kiali"
  repository = "https://kiali.org/helm-charts"
  chart      = "kiali-server"
  version    = "1.63.1"
  namespace  = kubernetes_namespace.istio_monitoring.metadata[0].name
  
  depends_on = [kubernetes_namespace.istio_monitoring]
  
  set {
    name  = "auth.strategy"
    value = "anonymous"
  }
  
  timeout = 300
}

# Instalăm Jaeger pentru distributed tracing
resource "helm_release" "jaeger" {
  name       = "jaeger"
  repository = "https://jaegertracing.github.io/helm-charts"
  chart      = "jaeger"
  version    = "0.60.0"
  namespace  = kubernetes_namespace.istio_monitoring.metadata[0].name
  
  depends_on = [kubernetes_namespace.istio_monitoring]
  
  timeout = 300
}

# Instalăm Prometheus pentru monitoring
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "prometheus"
  version    = "15.10.3"
  namespace  = kubernetes_namespace.istio_monitoring.metadata[0].name
  
  depends_on = [kubernetes_namespace.istio_monitoring]
  
  timeout = 300
}

# Instalăm Grafana pentru vizualizare metrici
resource "helm_release" "grafana" {
  name       = "grafana"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "grafana"
  version    = "6.40.3"
  namespace  = kubernetes_namespace.istio_monitoring.metadata[0].name
  
  depends_on = [kubernetes_namespace.istio_monitoring]
  
  set {
    name  = "sidecar.dashboards.enabled"
    value = "true"
  }
  
  timeout = 300
}

# Creăm Resource Quotas pentru tenanți în Istio
resource "kubernetes_resource_quota" "tenant_resource_quota" {
  for_each = toset(["tenant-a", "tenant-b", "tenant-c"])
  
  metadata {
    name      = "${each.key}-resource-quota"
    namespace = each.key
  }
  
  spec {
    hard = {
      "requests.cpu"    = "2"
      "requests.memory" = "4Gi"
      "limits.cpu"      = "4"
      "limits.memory"   = "8Gi"
      "pods"            = "20"
      "services"        = "10"
    }
  }
  
  depends_on = [helm_release.istiod]
}

# Output pentru IP-ul ingressului Istio
output "ingress_ip" {
  value = data.kubernetes_service.istio_ingress.status.0.load_balancer.0.ingress.0.ip
} 
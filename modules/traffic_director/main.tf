###################################
# Modulul Traffic Director pentru Multi-Tenant SchoolBus
###################################

variable "project_id" {
  description = "ID-ul proiectului GCP"
  type        = string
}

variable "gke_endpoint" {
  description = "Endpoint-ul clusterului GKE"
  type        = string
}

variable "vps_endpoint" {
  description = "Endpoint-ul clusterului VPS"
  type        = string
}

variable "baremetal_endpoint" {
  description = "Endpoint-ul clusterului bare-metal"
  type        = string
}

variable "tenants" {
  description = "Lista tenanților care vor fi configurați"
  type = list(object({
    id    = string
    name  = string
    color = string
  }))
}

provider "google" {
  project = var.project_id
}

# 1. Creăm health check pentru fiecare backend
resource "google_compute_health_check" "gke_health_check" {
  name               = "gke-health-check"
  timeout_sec        = 5
  check_interval_sec = 10
  
  http_health_check {
    port         = 80
    request_path = "/health"
  }
}

resource "google_compute_health_check" "vps_health_check" {
  name               = "vps-health-check"
  timeout_sec        = 5
  check_interval_sec = 10
  
  http_health_check {
    port         = 80
    request_path = "/health"
  }
}

resource "google_compute_health_check" "baremetal_health_check" {
  name               = "baremetal-health-check"
  timeout_sec        = 5
  check_interval_sec = 10
  
  http_health_check {
    port         = 80
    request_path = "/health"
  }
}

# 2. Creăm backend services pentru fiecare cluster
resource "google_compute_backend_service" "gke_backend" {
  name                  = "gke-backend-service"
  health_checks         = [google_compute_health_check.gke_health_check.id]
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL"
  
  backend {
    group = google_compute_instance_group.gke_instance_group.id
  }
}

resource "google_compute_backend_service" "vps_backend" {
  name                  = "vps-backend-service"
  health_checks         = [google_compute_health_check.vps_health_check.id]
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL"
  
  backend {
    group = google_compute_instance_group.vps_instance_group.id
  }
}

resource "google_compute_backend_service" "baremetal_backend" {
  name                  = "baremetal-backend-service"
  health_checks         = [google_compute_health_check.baremetal_health_check.id]
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL"
  
  backend {
    group = google_compute_instance_group.baremetal_instance_group.id
  }
}

# 3. Instance groups pentru fiecare cluster (acest lucru ar fi gestionat prin GKE Ingress în realitate)
resource "google_compute_instance_group" "gke_instance_group" {
  name        = "gke-instance-group"
  description = "Instance group pentru GKE"
  zone        = "us-central1-a"
  
  # În mediul real, nodurile se adaugă automat prin NEG
  # Aici simulăm comportamentul pentru demo
}

resource "google_compute_instance_group" "vps_instance_group" {
  name        = "vps-instance-group"
  description = "Instance group pentru VPS"
  zone        = "us-central1-a"
}

resource "google_compute_instance_group" "baremetal_instance_group" {
  name        = "baremetal-instance-group"
  description = "Instance group pentru bare-metal"
  zone        = "us-central1-a"
}

# 4. URL Map pentru rutare pe baza domeniului (tenant)
resource "google_compute_url_map" "url_map" {
  name        = "multi-tenant-url-map"
  description = "URL Map pentru rutare multi-tenant"
  
  default_service = google_compute_backend_service.gke_backend.id
  
  # Host rules pentru tenanți
  dynamic "host_rule" {
    for_each = var.tenants
    content {
      hosts        = ["${host_rule.value.id}.schoolbus-mtn.example.com"]
      path_matcher = "tenant-${host_rule.value.id}"
    }
  }
  
  # Path matchers pentru tenanți
  dynamic "path_matcher" {
    for_each = var.tenants
    content {
      name            = "tenant-${path_matcher.value.id}"
      default_service = path_matcher.value.id == "tenanta" ? google_compute_backend_service.gke_backend.id : (
                        path_matcher.value.id == "tenantb" ? google_compute_backend_service.vps_backend.id : 
                        google_compute_backend_service.baremetal_backend.id
                      )
    }
  }
}

# 5. HTTP Proxy pentru URL Map
resource "google_compute_target_http_proxy" "http_proxy" {
  name    = "multi-tenant-http-proxy"
  url_map = google_compute_url_map.url_map.id
}

# 6. HTTPS Proxy cu SSL pentru securitate
resource "google_compute_ssl_certificate" "ssl_cert" {
  name        = "schoolbus-ssl-cert"
  description = "Certificate SSL pentru SchoolBus"
  
  # În mediul real, aici s-ar utiliza certificate reale
  # Pentru simplificare, folosim certificate self-signed
  private_key = file("${path.module}/certs/server.key")
  certificate = file("${path.module}/certs/server.crt")
}

resource "google_compute_target_https_proxy" "https_proxy" {
  name             = "multi-tenant-https-proxy"
  url_map          = google_compute_url_map.url_map.id
  ssl_certificates = [google_compute_ssl_certificate.ssl_cert.id]
}

# 7. Forwarding Rules pentru HTTP(S)
resource "google_compute_global_forwarding_rule" "http_forwarding_rule" {
  name                  = "http-lb-forwarding-rule"
  target                = google_compute_target_http_proxy.http_proxy.id
  ip_address            = google_compute_global_address.lb_ip.id
  port_range            = "80"
  load_balancing_scheme = "EXTERNAL"
}

resource "google_compute_global_forwarding_rule" "https_forwarding_rule" {
  name                  = "https-lb-forwarding-rule"
  target                = google_compute_target_https_proxy.https_proxy.id
  ip_address            = google_compute_global_address.lb_ip.id
  port_range            = "443"
  load_balancing_scheme = "EXTERNAL"
}

# 8. Global IP Address pentru Load Balancer
resource "google_compute_global_address" "lb_ip" {
  name        = "lb-ip-address"
  description = "Global IP pentru Load Balancer"
}

# 9. DNS Records pentru tenanți (în mediul real, acest lucru ar fi gestionat de Cloud DNS)
# Acest bloc este conceptual și nu funcțional în acest modul
resource "null_resource" "dns_records" {
  provisioner "local-exec" {
    command = <<-EOT
      echo "DNS Records pentru tenanți:"
      echo "tenanta.schoolbus-mtn.example.com -> ${google_compute_global_address.lb_ip.address}"
      echo "tenantb.schoolbus-mtn.example.com -> ${google_compute_global_address.lb_ip.address}"
      echo "tenantc.schoolbus-mtn.example.com -> ${google_compute_global_address.lb_ip.address}"
    EOT
  }
  
  depends_on = [google_compute_global_address.lb_ip]
}

# Output pentru IP-ul extern al Load Balancer-ului
output "external_ip" {
  value = google_compute_global_address.lb_ip.address
}

# Output pentru URL-urile tenanților
output "tenant_urls" {
  value = [for tenant in var.tenants : "https://${tenant.id}.schoolbus-mtn.example.com"]
} 
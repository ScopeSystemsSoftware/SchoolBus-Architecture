###################################
# Modulul Bare-Metal pentru Multi-Tenant SchoolBus
###################################

variable "server_ip" {
  description = "IP-ul serverului bare-metal"
  type        = string
}

variable "ssh_user" {
  description = "Utilizator SSH pentru conectare la server"
  type        = string
  default     = "root"
}

variable "ssh_key_path" {
  description = "Calea către cheia SSH privată"
  type        = string
}

variable "labels" {
  description = "Etichete pentru cluster"
  type        = map(string)
  default     = {}
}

# Folosim null_resource pentru a rula comenzi SSH pe serverul remote
resource "null_resource" "k3s_install" {
  connection {
    type        = "ssh"
    user        = var.ssh_user
    private_key = file(var.ssh_key_path)
    host        = var.server_ip
  }

  # Instalăm k3s pe serverul remote
  provisioner "remote-exec" {
    inline = [
      "curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC=\"--disable=traefik --write-kubeconfig-mode=644\" sh -",
      "sleep 10",  # Așteptăm să se inițializeze k3s
      "mkdir -p ~/.kube",
      "cp /etc/rancher/k3s/k3s.yaml ~/.kube/config",
      "chmod 600 ~/.kube/config",
      "export KUBECONFIG=~/.kube/config",
      "kubectl get nodes"
    ]
  }
}

# Instalăm Calico pentru Network Policies
resource "null_resource" "install_calico" {
  depends_on = [null_resource.k3s_install]
  
  connection {
    type        = "ssh"
    user        = var.ssh_user
    private_key = file(var.ssh_key_path)
    host        = var.server_ip
  }

  provisioner "remote-exec" {
    inline = [
      "kubectl create -f https://projectcalico.docs.tigera.io/manifests/tigera-operator.yaml",
      "curl -O https://projectcalico.docs.tigera.io/manifests/custom-resources.yaml",
      "kubectl create -f custom-resources.yaml",
      "sleep 30",  # Așteptăm să se inițializeze Calico
      "kubectl get pods -n calico-system"
    ]
  }
}

# Aplicăm etichetele pe nodul bare-metal
resource "null_resource" "apply_labels" {
  depends_on = [null_resource.install_calico]
  
  connection {
    type        = "ssh"
    user        = var.ssh_user
    private_key = file(var.ssh_key_path)
    host        = var.server_ip
  }

  provisioner "remote-exec" {
    inline = [
      "kubectl label nodes $(hostname) ${join(" ", [for key, value in var.labels : "${key}=${value}"])}"
    ]
  }
}

# Obținem informații despre cluster pentru outputs
data "external" "kubeconfig" {
  depends_on = [null_resource.apply_labels]
  
  program = ["bash", "-c", <<EOT
    ssh -i ${var.ssh_key_path} ${var.ssh_user}@${var.server_ip} 'cat /etc/rancher/k3s/k3s.yaml' | \
    python3 -c "
import sys, yaml, json
config = yaml.safe_load(sys.stdin)
json.dump({
  'endpoint': config['clusters'][0]['cluster']['server'],
  'client_certificate': config['users'][0]['user']['client-certificate-data'],
  'client_key': config['users'][0]['user']['client-key-data'],
  'cluster_ca_certificate': config['clusters'][0]['cluster']['certificate-authority-data']
}, sys.stdout)
"
  EOT
  ]
}

# Outputs pentru utilizare în modulul principal
output "endpoint" {
  value = data.external.kubeconfig.result.endpoint
}

output "endpoint_ip" {
  value = var.server_ip
}

output "access_token" {
  value     = "k3s_token"  # k3s folosește certificate-based authentication, nu token
  sensitive = true
}

output "cluster_ca_certificate" {
  value     = base64decode(data.external.kubeconfig.result.cluster_ca_certificate)
  sensitive = true
} 
#!/usr/bin/env bash
# Step 4: Worker Node Join Template & Token Discovery
set -euo pipefail

# To generate a fresh token on the control plane:
# kubeadm token create --print-join-command

# Example join command executed on worker EC2 instances:
# sudo kubeadm join k8s-api.railcloud.internal:6443 \
#   --token <token> \
#   --discovery-token-ca-cert-hash sha256:<hash>

echo "==> Run this script on worker nodes with the active join command:"
echo "sudo kubeadm join \$1 --token \$2 --discovery-token-ca-cert-hash \$3"

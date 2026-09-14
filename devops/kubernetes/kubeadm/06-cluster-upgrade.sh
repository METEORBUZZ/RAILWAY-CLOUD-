#!/usr/bin/env bash
# Step 6: Zero-Downtime Cluster Upgrade Strategy (e.g., v1.29 to v1.30)
set -euo pipefail

TARGET_VERSION="1.30.2-1.1"

echo "==> Upgrading Control Plane node..."
sudo apt-get update && sudo apt-get install -y --allow-change-held-packages kubeadm=${TARGET_VERSION}
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.30.2 -y

# Drain node gracefully respecting PodDisruptionBudgets
NODE_NAME=$(hostname)
kubectl drain "${NODE_NAME}" --ignore-daemonsets --delete-emptydir-data

sudo apt-get update && sudo apt-get install -y --allow-change-held-packages kubelet=${TARGET_VERSION} kubectl=${TARGET_VERSION}
sudo systemctl daemon-reload
sudo systemctl restart kubelet

kubectl uncordon "${NODE_NAME}"
echo "==> Node ${NODE_NAME} upgraded and uncordoned successfully!"

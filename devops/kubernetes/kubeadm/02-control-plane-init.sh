#!/usr/bin/env bash
# Step 2: Initialize HA Kubeadm Control Plane with API Server Endpoint
set -euo pipefail

CONTROL_PLANE_ENDPOINT="k8s-api.railcloud.internal:6443"
POD_NETWORK_CIDR="192.168.0.0/16"
KUBERNETES_VERSION="v1.30.0"

echo "==> Initializing primary control plane via kubeadm..."
sudo kubeadm init \
  --control-plane-endpoint "${CONTROL_PLANE_ENDPOINT}" \
  --pod-network-cidr="${POD_NETWORK_CIDR}" \
  --kubernetes-version="${KUBERNETES_VERSION}" \
  --upload-certs \
  --v=5

echo "==> Configuring kubectl for administrator..."
mkdir -p "$HOME/.kube"
sudo cp -i /etc/kubernetes/admin.conf "$HOME/.kube/config"
sudo chown "$(id -u):$(id -g)" "$HOME/.kube/config"

echo "==> Verifying Cluster Component Statuses..."
kubectl cluster-info
kubectl get componentstatuses || true

echo "==> Control Plane initialized! Save the join tokens generated above."

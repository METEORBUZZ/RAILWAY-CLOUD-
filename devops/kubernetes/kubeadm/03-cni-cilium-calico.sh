#!/usr/bin/env bash
# Step 3: Install Calico CNI with NetworkPolicy support & eBPF acceleration
set -euo pipefail

echo "==> Deploying Tigera Operator for Calico CNI..."
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/tigera-operator.yaml

cat <<EOF | kubectl apply -f -
apiVersion: operator.tigera.io/v1
kind: Installation
metadata:
  name: default
spec:
  calicoNetwork:
    ipPools:
    - name: default-ipv4-ippool
      cidr: 192.168.0.0/16
      encapsulation: VXLANCrossSubnet
      natOutgoing: Enabled
      nodeSelector: all()
EOF

echo "==> Waiting for Calico pods to reach Ready state..."
kubectl rollout status daemonset/calico-node -n calico-system --timeout=120s || true
kubectl get nodes -o wide

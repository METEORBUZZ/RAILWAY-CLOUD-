# Self-Managed Kubernetes Cluster using Kubeadm (EC2)

This directory documents the end-to-end setup, operations, maintenance, and disaster recovery procedures for a self-managed multi-master High Availability (HA) Kubernetes v1.30 cluster deployed on AWS EC2 without AWS EKS.

## Architecture
- **Control Plane**: 3x `t3.xlarge` EC2 instances across 3 Availability Zones (`us-east-1a`, `us-east-1b`, `us-east-1c`) with stacked etcd quorum.
- **Worker Pool**: 5x `t3.2xlarge` EC2 instances in private subnets with autoscaling capability.
- **API Server Endpoint**: Network Load Balancer (NLB) on port 6443 forwarding to control plane nodes.
- **Container Runtime**: containerd with `systemd` cgroup driver.
- **CNI**: Project Calico v3.28 with VXLAN CrossSubnet encapsulation and eBPF NetworkPolicies.
- **Storage CSI**: AWS EBS CSI Driver (v1.32) for dynamic persistent volume provisioning.

## Execution Sequence
1. `./01-prerequisites.sh` - Disables swap, sets kernel sysctl netfilter flags, installs containerd and kubeadm/kubelet.
2. `./02-control-plane-init.sh` - Bootstraps primary master with `--control-plane-endpoint` and `--upload-certs`.
3. `./03-cni-cilium-calico.sh` - Installs Calico operator and CNI daemonsets.
4. `./04-worker-join.sh` - Joins worker nodes using discovery tokens.
5. `./05-etcd-backup-restore.sh` - Automated hourly etcd snapshot creation and S3 KMS upload.
6. `./06-cluster-upgrade.sh` - Rolling version upgrades respecting `PodDisruptionBudget`.

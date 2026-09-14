# EC2 Instances for Self-Managed Kubeadm Kubernetes Cluster (No EKS)

resource "aws_instance" "control_plane" {
  count                  = var.control_plane_count
  ami                    = var.ubuntu_ami_id
  instance_type          = var.control_plane_instance_type
  subnet_id              = var.private_subnet_ids[count.index % length(var.private_subnet_ids)]
  vpc_security_group_ids = [var.k8s_control_plane_sg_id]
  iam_instance_profile   = var.k8s_node_instance_profile

  root_block_device {
    volume_size           = 100
    volume_type           = "gp3"
    iops                  = 3000
    throughput            = 125
    encrypted             = true
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e
              # Disable swap (Kubernetes requirement)
              swapoff -a
              sed -i '/swap/d' /etc/fstab

              # Kernel modules for Kubernetes networking
              cat <<KUBE_EOF | tee /etc/modules-load.d/k8s.conf
              overlay
              br_netfilter
              KUBE_EOF

              modprobe overlay
              modprobe br_netfilter

              # Sysctl params
              cat <<KUBE_SYSCTL | tee /etc/sysctl.d/k8s.conf
              net.bridge.bridge-nf-call-iptables  = 1
              net.bridge.bridge-nf-call-ip6tables = 1
              net.ipv4.ip_forward                 = 1
              KUBE_SYSCTL

              sysctl --system

              # Install Containerd runtime
              apt-get update
              apt-get install -y apt-transport-https ca-certificates curl gnupg containerd
              mkdir -p /etc/containerd
              containerd config default | tee /etc/containerd/config.toml
              sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
              systemctl restart containerd
              systemctl enable containerd

              # Install kubeadm, kubelet, kubectl (v1.30)
              curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
              echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | tee /etc/apt/sources.list.d/kubernetes.list
              apt-get update
              apt-get install -y kubelet kubeadm kubectl
              apt-mark hold kubelet kubeadm kubectl
              EOF

  tags = {
    Name = "railcloud-${var.environment}-k8s-control-plane-${count.index + 1}"
    Role = "control-plane"
  }
}

resource "aws_instance" "workers" {
  count                  = var.worker_count
  ami                    = var.ubuntu_ami_id
  instance_type          = var.worker_instance_type
  subnet_id              = var.private_subnet_ids[count.index % length(var.private_subnet_ids)]
  vpc_security_group_ids = [var.k8s_worker_sg_id]
  iam_instance_profile   = var.k8s_node_instance_profile

  root_block_device {
    volume_size           = 150
    volume_type           = "gp3"
    iops                  = 3000
    throughput            = 125
    encrypted             = true
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e
              swapoff -a
              sed -i '/swap/d' /etc/fstab

              cat <<KUBE_EOF | tee /etc/modules-load.d/k8s.conf
              overlay
              br_netfilter
              KUBE_EOF

              modprobe overlay
              modprobe br_netfilter

              cat <<KUBE_SYSCTL | tee /etc/sysctl.d/k8s.conf
              net.bridge.bridge-nf-call-iptables  = 1
              net.bridge.bridge-nf-call-ip6tables = 1
              net.ipv4.ip_forward                 = 1
              KUBE_SYSCTL

              sysctl --system

              apt-get update
              apt-get install -y apt-transport-https ca-certificates curl gnupg containerd
              mkdir -p /etc/containerd
              containerd config default | tee /etc/containerd/config.toml
              sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
              systemctl restart containerd
              systemctl enable containerd

              curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
              echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | tee /etc/apt/sources.list.d/kubernetes.list
              apt-get update
              apt-get install -y kubelet kubeadm kubectl
              apt-mark hold kubelet kubeadm kubectl
              EOF

  tags = {
    Name = "railcloud-${var.environment}-k8s-worker-${count.index + 1}"
    Role = "worker-node"
  }
}

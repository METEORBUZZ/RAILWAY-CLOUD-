# Security Groups for RailCloud Infrastructure

resource "aws_security_group" "k8s_control_plane" {
  name        = "railcloud-${var.environment}-k8s-cp-sg"
  description = "Allow Kubernetes API server, etcd and control plane traffic"
  vpc_id      = var.vpc_id

  ingress {
    description = "Kubernetes API Server"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  ingress {
    description = "etcd server client API"
    from_port   = 2379
    to_port     = 2380
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description = "Kubelet API"
    from_port   = 10250
    to_port     = 10250
    protocol    = "tcp"
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "k8s_worker" {
  name        = "railcloud-${var.environment}-k8s-worker-sg"
  description = "Worker node security group"
  vpc_id      = var.vpc_id

  ingress {
    description     = "NodePort Services from Load Balancer"
    from_port       = 30000
    to_port         = 32767
    protocol        = "tcp"
    cidr_blocks     = [var.vpc_cidr]
  }

  ingress {
    description = "Inter-pod Flannel/Calico overlay"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "database" {
  name        = "railcloud-${var.environment}-rds-sg"
  description = "Allow PostgreSQL inbound from Kubernetes Worker Nodes only"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.k8s_worker.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "redis" {
  name        = "railcloud-${var.environment}-redis-sg"
  description = "Allow Redis inbound from Kubernetes Worker Nodes only"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.k8s_worker.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

variable "aws_region" {
  description = "AWS region for infrastructure deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment tier (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Target availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "control_plane_instance_type" {
  description = "EC2 instance type for Kubeadm control plane"
  type        = string
  default     = "t3.xlarge"
}

variable "worker_node_instance_type" {
  description = "EC2 instance type for Kubeadm worker nodes"
  type        = string
  default     = "t3.2xlarge"
}

variable "worker_node_count" {
  description = "Number of worker nodes in cluster"
  type        = number
  default     = 3
}

variable "db_instance_class" {
  description = "RDS PostgreSQL instance type"
  type        = string
  default     = "db.r6g.xlarge"
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.r6g.large"
}

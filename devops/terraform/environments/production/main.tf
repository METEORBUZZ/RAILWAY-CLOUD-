# Production Environment Terraform Orchestrator

module "vpc" {
  source                = "../../modules/vpc"
  environment           = "production"
  cidr_block            = "10.0.0.0/16"
  public_subnet_cidrs   = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnet_cidrs  = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
  availability_zones    = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

module "security_groups" {
  source      = "../../modules/security-groups"
  environment = "production"
  vpc_id      = module.vpc.vpc_id
  vpc_cidr    = "10.0.0.0/16"
}

module "iam" {
  source      = "../../modules/iam"
  environment = "production"
}

module "ec2_kubeadm" {
  source                      = "../../modules/ec2"
  environment                 = "production"
  ubuntu_ami_id               = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS
  control_plane_count         = 3                       # HA Multi-master etcd quorum
  worker_count                = 5                       # Production microservices worker pool
  control_plane_instance_type = "t3.xlarge"
  worker_instance_type        = "t3.2xlarge"
  private_subnet_ids          = module.vpc.private_subnet_ids
  k8s_control_plane_sg_id     = module.security_groups.k8s_control_plane_sg_id
  k8s_worker_sg_id            = module.security_groups.k8s_worker_sg_id
  k8s_node_instance_profile   = module.iam.k8s_node_profile_name
}

module "rds" {
  source                = "../../modules/rds"
  environment           = "production"
  database_subnet_ids   = module.vpc.private_subnet_ids
  db_security_group_id  = module.security_groups.database_sg_id
  db_instance_class     = "db.r6g.xlarge"
}

module "redis" {
  source                 = "../../modules/redis"
  environment            = "production"
  cache_subnet_ids       = module.vpc.private_subnet_ids
  redis_security_group_id = module.security_groups.redis_sg_id
  redis_node_type        = "cache.r6g.large"
}

module "cdn" {
  source      = "../../modules/cloudfront"
  environment = "production"
}

module "monitoring" {
  source      = "../../modules/monitoring"
  environment = "production"
}

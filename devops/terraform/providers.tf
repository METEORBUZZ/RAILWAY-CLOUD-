provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "RailCloud"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "DevOps-Architecture-Team"
    }
  }
}

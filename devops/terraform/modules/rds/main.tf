# RDS PostgreSQL Multi-AZ Deployment with Automated Backups

resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "railcloud-${var.environment}-db-subnets"
  subnet_ids = var.database_subnet_ids

  tags = {
    Name = "railcloud-${var.environment}-db-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier                  = "railcloud-${var.environment}-postgres"
  engine                      = "postgres"
  engine_version              = "16.3"
  instance_class              = var.db_instance_class
  allocated_storage           = 100
  max_allocated_storage       = 500
  storage_type                = "gp3"
  multi_az                    = var.environment == "production" ? true : false
  db_name                     = "railcloud_db"
  username                    = "railcloud_admin"
  manage_master_user_password = true # AWS Secrets Manager integration

  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [var.db_security_group_id]

  backup_retention_period   = 30 # RPO/Disaster Recovery requirement
  backup_window             = "03:00-04:00"
  maintenance_window        = "Mon:04:00-Mon:05:00"
  auto_minor_version_upgrade = true
  deletion_protection       = var.environment == "production" ? true : false
  skip_final_snapshot       = var.environment == "production" ? false : true
  final_snapshot_identifier = "railcloud-${var.environment}-postgres-final-snapshot"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = true

  tags = {
    Name = "railcloud-${var.environment}-rds-postgres"
  }
}

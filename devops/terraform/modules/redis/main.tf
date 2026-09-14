# AWS ElastiCache Redis Cluster for Seat Locking & Search Caching

resource "aws_elasticache_subnet_group" "redis" {
  name       = "railcloud-${var.environment}-redis-subnets"
  subnet_ids = var.cache_subnet_ids
}

resource "aws_elasticache_parameter_group" "redis" {
  name   = "railcloud-${var.environment}-redis7"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "railcloud-${var.environment}-redis"
  description                = "Redis Cluster for Distributed Seat Locking and Caching"
  node_type                  = var.redis_node_type
  num_cache_clusters         = var.environment == "production" ? 3 : 1
  parameter_group_name       = aws_elasticache_parameter_group.redis.name
  subnet_group_name          = aws_elasticache_subnet_group.redis.name
  security_group_ids         = [var.redis_security_group_id]
  port                       = 6379
  automatic_failover_enabled = var.environment == "production" ? true : false
  multi_az_enabled           = var.environment == "production" ? true : false
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  tags = {
    Name = "railcloud-${var.environment}-redis-cluster"
  }
}

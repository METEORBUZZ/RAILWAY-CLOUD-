# CloudWatch Log Groups & Metric Alarms for RailCloud Microservices

resource "aws_cloudwatch_log_group" "k8s_pods" {
  name              = "/aws/k8s/railcloud-${var.environment}/pods"
  retention_in_days = 30
}

resource "aws_cloudwatch_metric_alarm" "high_seat_lock_conflict" {
  alarm_name          = "railcloud-${var.environment}-seat-lock-conflicts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "SeatLockConflicts"
  namespace           = "RailCloud/BookingService"
  period              = 60
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "Seat lock contention spikes indicate heavy concurrent booking collision"
}

resource "aws_cloudwatch_metric_alarm" "rds_high_cpu" {
  alarm_name          = "railcloud-${var.environment}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS PostgreSQL CPU exceeded 80%"
}

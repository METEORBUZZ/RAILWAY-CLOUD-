# Disaster Recovery Plan: RTO / RPO & Failover Runbook

## 1. Objectives & SLA Metrics
- **RTO (Recovery Time Objective)**: **< 15 minutes** (Maximum tolerable duration between disaster declaration and full ticket booking service restoration).
- **RPO (Recovery Point Objective)**: **< 5 minutes** (Maximum data loss window; protected via continuous RDS PostgreSQL WAL streaming replication + Redis AOF).

## 2. Backup Frequency & Retention
- **PostgreSQL Database**:
  - Automated continuous WAL archiving (Point-In-Time-Recovery window: 30 days).
  - Nightly snapshot at 03:00 UTC retained for 90 days.
  - Multi-AZ automatic synchronous standby replication.
- **Kubernetes State (etcd)**:
  - Hourly snapshots exported to S3 (`s3://railcloud-production-etcd-backups`) with KMS SSE encryption.
  - Retention: 14 days.

## 3. Disaster Scenarios & Recovery Runbooks

### Scenario A: Primary RDS PostgreSQL Crash or AZ Outage
1. Multi-AZ triggers automatic DNS failover to Standby instance in AZ `us-east-1b` (< 60s).
2. If total cluster corruption occurs:
   ```bash
   aws rds restore-db-instance-to-point-in-time \
     --source-db-instance-identifier railcloud-production-postgres \
     --target-db-instance railcloud-production-postgres-restored \
     --restore-time "2026-09-14T08:00:00.000Z"
   ```
3. Update `DATABASE_URL` secret in Kubernetes or switch AWS Route 53 CNAME.

### Scenario B: Complete EC2 Kubernetes Worker Pool Failure
1. Kubeadm control plane detects `NotReady` nodes after 40 seconds.
2. Terraform AWS Auto Scaling Group provisions replacement EC2 worker instances.
3. Kubelet starts and joins cluster via automated Cloud-Init bootstrap.
4. Argo CD reconciles desired pod count (`replicas: 5`) across healthy nodes.

### Scenario C: Redis Cluster Node Eviction / Split-Brain
1. ElastiCache promotes replica cluster to primary automatically (< 30s).
2. Active locks stored with TTL 10 minutes; expired keys auto-reclaimed.
3. PostgreSQL remains permanent authoritative source of truth.

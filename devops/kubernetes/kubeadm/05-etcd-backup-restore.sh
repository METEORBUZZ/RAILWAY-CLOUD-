#!/usr/bin/env bash
# Step 5: Automated etcd Snapshot Backup & Disaster Recovery Restore
set -euo pipefail

BACKUP_DIR="/var/backups/k8s-etcd"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SNAPSHOT_FILE="${BACKUP_DIR}/etcd-snapshot-${TIMESTAMP}.db"
S3_BUCKET="s3://railcloud-production-etcd-backups"

sudo mkdir -p "${BACKUP_DIR}"

echo "==> Creating etcd snapshot..."
sudo ETCDCTL_API=3 etcdctl snapshot save "${SNAPSHOT_FILE}" \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key

echo "==> Verifying snapshot integrity..."
sudo ETCDCTL_API=3 etcdctl --write-out=table snapshot status "${SNAPSHOT_FILE}"

echo "==> Syncing snapshot to encrypted AWS S3 Disaster Recovery bucket..."
aws s3 cp "${SNAPSHOT_FILE}" "${S3_BUCKET}/" --sse aws:kms

echo "==> Backup complete: ${SNAPSHOT_FILE}"

# --- RESTORE PROCEDURE (Run during disaster recovery only) ---
# To restore an etcd cluster:
# 1. Stop kube-apiserver: mv /etc/kubernetes/manifests/kube-apiserver.yaml /tmp/
# 2. Stop etcd: mv /etc/kubernetes/manifests/etcd.yaml /tmp/
# 3. Restore:
#    sudo ETCDCTL_API=3 etcdctl snapshot restore <snapshot.db> \
#      --data-dir=/var/lib/etcd-restored
# 4. Update etcd.yaml hostPath volume to point to /var/lib/etcd-restored
# 5. Move back manifests: mv /tmp/*.yaml /etc/kubernetes/manifests/

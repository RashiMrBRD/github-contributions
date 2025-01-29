# Security Best Practices Guide

This guide covers essential security practices for your infrastructure.

## System Hardening

### 1. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow essential services
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 32400  # Plex
sudo ufw allow 51820/udp  # WireGuard

# Check status
sudo ufw status
```

### 2. SSH Hardening

Edit `/etc/ssh/sshd_config`:
```bash
# Disable root login
PermitRootLogin no

# Disable password authentication
PasswordAuthentication no

# Use SSH key authentication only
PubkeyAuthentication yes

# Restrict SSH access
AllowUsers yourusername

# Change default port (optional)
Port 2222
```

### 3. Docker Security

```bash
# Create custom Docker network
docker network create --subnet=172.18.0.0/16 secure_network

# Run containers with limited capabilities
docker run --cap-drop=ALL --cap-add=specific_capability

# Use secrets management
docker secret create my_secret my_secret.txt
```

## Access Control

### 1. User Management

```bash
# Create service account
sudo useradd -r -s /bin/false serviceuser

# Set proper permissions
sudo chown -R serviceuser:serviceuser /path/to/data
```

### 2. File Permissions

```bash
# Secure sensitive files
chmod 600 /path/to/secrets
chmod 644 /path/to/configs
```

## Monitoring & Auditing

### 1. Log Monitoring

```bash
# Enable audit logging
sudo auditctl -w /etc/passwd -p wa -k identity
sudo auditctl -w /etc/sudoers -p wa -k sudo_changes

# View audit logs
sudo ausearch -k identity
```

### 2. Intrusion Detection

```bash
# Install AIDE
sudo apt install aide

# Initialize AIDE database
sudo aideinit

# Check for changes
sudo aide --check
```

## Backup Strategy

### 1. Data Backup

```bash
# Create encrypted backup
tar czf - /path/to/data | gpg -c > backup.tar.gz.gpg

# Restore from backup
gpg -d backup.tar.gz.gpg | tar xzf -
```

### 2. Configuration Backup

```bash
# Backup Docker volumes
docker run --rm -v volume_name:/data -v /backup:/backup alpine tar czf /backup/volume_backup.tar.gz /data
```

## Regular Maintenance

### 1. Update Schedule

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

### 2. Security Scans

```bash
# Run security audit
sudo lynis audit system

# Scan Docker images
docker scan your-image:tag
```

## Emergency Response

### 1. Incident Response Plan

1. Isolate affected systems
2. Collect evidence
3. Analyze breach
4. Implement fixes
5. Document incident

### 2. Recovery Steps

```bash
# Stop compromised services
docker-compose down

# Restore from backup
./scripts/restore-backup.sh

# Update all credentials
./scripts/rotate-credentials.sh
```

Remember to regularly review and update these security measures as new vulnerabilities are discovered and best practices evolve.

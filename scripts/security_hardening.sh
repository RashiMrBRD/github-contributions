#!/bin/bash

# Security Hardening Script for Linux Servers
# This script implements various security best practices

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root"
    exit 1
fi

# Update system packages
echo "Updating system packages..."
apt update && apt upgrade -y

# Install essential security packages
echo "Installing security packages..."
apt install -y \
    fail2ban \
    ufw \
    unattended-upgrades \
    auditd \
    rkhunter \
    lynis

# Configure UFW (Uncomplicated Firewall)
echo "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Configure fail2ban
echo "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl restart fail2ban

# Secure SSH configuration
echo "Hardening SSH configuration..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/X11Forwarding yes/X11Forwarding no/' /etc/ssh/sshd_config
systemctl restart sshd

# Configure automatic security updates
echo "Setting up unattended-upgrades..."
cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};
Unattended-Upgrade::Package-Blacklist {
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::InstallOnShutdown "false";
Unattended-Upgrade::Mail "root";
Unattended-Upgrade::MailReport "on-change";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

# Secure shared memory
echo "Securing shared memory..."
echo "tmpfs     /run/shm     tmpfs     defaults,noexec,nosuid     0     0" >> /etc/fstab

# Set up system auditing
echo "Configuring system auditing..."
auditctl -e 1
cat > /etc/audit/rules.d/audit.rules << EOF
# Delete all existing rules
-D

# Buffer Size
-b 8192

# Failure Mode
-f 1

# Monitor file system mounts
-a always,exit -F arch=b64 -S mount -F auid>=1000 -F auid!=4294967295 -k mounts

# Monitor system calls
-a exit,always -F arch=b64 -S execve -k exec

# Monitor changes to user/group info
-w /etc/group -p wa -k identity
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity

# Monitor changes to network configuration
-w /etc/hosts -p wa -k system-locale
-w /etc/network/ -p wa -k system-locale

# Monitor changes to system configuration
-w /etc/security/ -p wa -k security
-w /etc/sudoers -p wa -k sudo_log
EOF

service auditd restart

echo "Security hardening complete. Please review the changes and test thoroughly."

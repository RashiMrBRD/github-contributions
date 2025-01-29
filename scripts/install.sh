#!/bin/bash

# Installation script for setting up the complete environment
# This script will install all necessary dependencies and configure the system

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

echo -e "${GREEN}Starting installation...${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Update system packages
echo -e "${YELLOW}Updating system packages...${NC}"
apt update && apt upgrade -y

# Install basic dependencies
echo -e "${YELLOW}Installing basic dependencies...${NC}"
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    nodejs \
    npm

# Install Docker if not present
if ! command_exists docker; then
    echo -e "${YELLOW}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $SUDO_USER
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose if not present
if ! command_exists docker-compose; then
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Python packages
echo -e "${YELLOW}Installing Python packages...${NC}"
pip3 install -r requirements.txt

# Install Node.js packages
echo -e "${YELLOW}Installing Node.js packages...${NC}"
npm install

# Create necessary directories
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p \
    ./data/media \
    ./data/prometheus \
    ./data/grafana \
    ./config/wireguard \
    ./logs

# Set correct permissions
echo -e "${YELLOW}Setting permissions...${NC}"
chown -R $SUDO_USER:$SUDO_USER ./data
chown -R $SUDO_USER:$SUDO_USER ./config
chmod -R 755 ./scripts

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker-compose -f docker/media-stack.yml up -d
docker-compose -f docker/network-stack.yml up -d

echo -e "${GREEN}Installation complete!${NC}"
echo -e "Please check the documentation in docs/tutorials for next steps."

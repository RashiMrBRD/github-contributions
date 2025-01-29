# Getting Started Guide

This guide will walk you through setting up and using this repository's features.

## Prerequisites

- Linux-based system (Ubuntu 20.04 or later recommended)
- Root access or sudo privileges
- Basic knowledge of terminal commands
- Git installed

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. Run the installation script:
   ```bash
   sudo ./scripts/install.sh
   ```

3. Verify the installation:
   ```bash
   docker ps  # Should show running containers
   ```

## Component Overview

### 1. Media Server Stack
- **Plex**: Media streaming server
- **Sonarr**: TV series management
- **Radarr**: Movie management
- **Jackett**: Torrent proxy

Access the Plex interface at: `http://localhost:32400/web`

### 2. Network Stack
- **Pi-hole**: Network-wide ad blocking
- **WireGuard**: VPN server
- **Traefik**: Reverse proxy with SSL

Access Pi-hole admin at: `http://localhost/admin`

### 3. Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards
- **Node Exporter**: System metrics

Access Grafana at: `http://localhost:3000`

## Basic Usage

### Managing Docker Containers

```bash
# View running containers
docker ps

# Check container logs
docker logs container_name

# Restart a container
docker restart container_name
```

### Updating Services

```bash
# Pull latest images
docker-compose -f docker/media-stack.yml pull
docker-compose -f docker/network-stack.yml pull

# Restart services with new images
docker-compose -f docker/media-stack.yml up -d
docker-compose -f docker/network-stack.yml up -d
```

## Troubleshooting

### Common Issues

1. **Services not starting**
   - Check logs: `docker logs container_name`
   - Verify ports are not in use
   - Ensure sufficient permissions

2. **Network connectivity issues**
   - Check firewall settings
   - Verify Docker network settings
   - Ensure ports are properly mapped

3. **Performance issues**
   - Monitor system resources
   - Check container resource limits
   - Review logs for bottlenecks

## Next Steps

- Configure SSL certificates with Traefik
- Set up remote access via WireGuard
- Configure backup solutions
- Explore advanced monitoring with Grafana

For more detailed information, check the other tutorials in this directory.

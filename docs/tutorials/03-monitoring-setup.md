# Advanced Monitoring Guide

This guide explains how to set up and use the monitoring stack effectively.

## Prometheus Setup

### Basic Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'docker'
    static_configs:
      - targets: ['docker-exporter:9323']

  - job_name: 'media-services'
    static_configs:
      - targets: 
        - 'plex:32400'
        - 'sonarr:8989'
        - 'radarr:7878'
```

## Grafana Dashboards

### 1. System Overview Dashboard

```json
{
  "dashboard": {
    "panels": [
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 * (1 - ((node_memory_MemFree_bytes + node_memory_Cached_bytes + node_memory_Buffers_bytes) / node_memory_MemTotal_bytes))"
          }
        ]
      }
    ]
  }
}
```

### 2. Network Traffic Dashboard

```json
{
  "dashboard": {
    "panels": [
      {
        "title": "Network I/O",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_network_receive_bytes_total[5m])",
            "legend": "Received"
          },
          {
            "expr": "rate(node_network_transmit_bytes_total[5m])",
            "legend": "Transmitted"
          }
        ]
      }
    ]
  }
}
```

## Alert Configuration

### 1. Basic Alerts

```yaml
groups:
  - name: basic_alerts
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High CPU usage detected
          description: CPU usage is above 90% for 5 minutes

      - alert: LowDiskSpace
        expr: node_filesystem_free_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100 < 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: Low disk space
          description: Less than 10% disk space remaining
```

## Metrics Collection

### 1. Custom Metrics

```python
from prometheus_client import Counter, Gauge, Histogram

# Request counter
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

# Response time histogram
request_duration_seconds = Histogram(
    'request_duration_seconds',
    'Request duration in seconds',
    ['endpoint']
)

# Active users gauge
active_users = Gauge(
    'active_users',
    'Number of active users'
)
```

### 2. Service Checks

```python
def check_service_health():
    try:
        response = requests.get('http://service:port/health')
        if response.status_code == 200:
            service_health.set(1)
        else:
            service_health.set(0)
    except:
        service_health.set(0)
```

## Visualization Tips

### 1. Dashboard Organization

- Group related panels
- Use consistent naming
- Add documentation
- Use templates for variables

### 2. Effective Graphs

- Choose appropriate visualization types
- Set meaningful thresholds
- Use clear labels and units
- Configure proper time ranges

## Maintenance

### 1. Data Retention

```yaml
storage:
  tsdb:
    retention.time: 15d
    retention.size: 50GB
```

### 2. Backup Configuration

```bash
# Backup Prometheus data
tar czf prometheus_data_backup.tar.gz /path/to/prometheus/data

# Backup Grafana
docker run --volumes-from grafana -v $(pwd):/backup ubuntu tar czf /backup/grafana_backup.tar.gz /var/lib/grafana
```

## Troubleshooting

### Common Issues

1. **No data in Grafana**
   - Check Prometheus targets
   - Verify network connectivity
   - Check authentication

2. **High cardinality**
   - Review label usage
   - Adjust retention settings
   - Consider aggregation

3. **Performance issues**
   - Optimize queries
   - Adjust scrape intervals
   - Check resource allocation

Remember to regularly review and update your monitoring configuration as your infrastructure grows and changes.

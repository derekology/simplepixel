# Production Deployment Guide

## Overview

This guide covers deploying Simple Pixel to a production environment using Docker.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Domain name (for SSL)
- Reverse proxy (nginx/traefik recommended)

## Production Environment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd simple-pixel

# Create production environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Environment Configuration

Edit `.env` for production:

```bash
# Production settings
NODE_ENV=production
PORT=3000
HOST_NAME=yourdomain.com

# Database (use absolute path or Docker volume)
DB_PATH=/app/data/simple-pixel.db

# Adjust these based on your needs
CLEANUP_INTERVAL_MINUTES=60
PIXEL_EXPIRY_DAYS=7
```

### 4. Start Application

```bash
docker-compose up -d
```

## Reverse Proxy Setup

### Option 1: Nginx

Create `/etc/nginx/sites-available/simple-pixel`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/simple-pixel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Traefik

Add labels to `docker-compose.yml`:

```yaml
services:
  simple-pixel:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.simple-pixel.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.simple-pixel.entrypoints=websecure"
      - "traefik.http.routers.simple-pixel.tls.certresolver=letsencrypt"
      - "traefik.http.services.simple-pixel.loadbalancer.server.port=3000"
```

## SSL/TLS Setup

### Using Certbot (with Nginx)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

### Using Let's Encrypt (with Traefik)

Traefik handles this automatically with the labels above.

## Database Backups

### Manual Backup

```bash
# Create backups directory
mkdir -p /opt/backups/simple-pixel

# Backup database
docker cp simple-pixel:/app/data/simple-pixel.db /opt/backups/simple-pixel/backup-$(date +%Y%m%d-%H%M%S).db
```

### Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * docker cp simple-pixel:/app/data/simple-pixel.db /opt/backups/simple-pixel/backup-$(date +\%Y\%m\%d-\%H\%M\%S).db && find /opt/backups/simple-pixel -type f -mtime +30 -delete
```

## Monitoring

### Basic Health Check

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats simple-pixel
```

### Advanced Monitoring

Consider integrating:
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **Loki** for log aggregation
- **Uptime Kuma** or **UptimeRobot** for uptime monitoring

## Security Best Practices

1. **Firewall Configuration**
```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

2. **Keep System Updated**
```bash
# Auto-updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

3. **Docker Security**
- Use non-root user (already configured)
- Keep Docker updated
- Regularly scan images: `docker scan simple-pixel`

4. **Rate Limiting**
Add to nginx configuration:
```nginx
limit_req_zone $binary_remote_addr zone=pixellimit:10m rate=10r/s;

location /p/ {
    limit_req zone=pixellimit burst=20;
    # ... rest of config
}
```

## Scaling

### Vertical Scaling

Adjust resources in `docker-compose.yml`:

```yaml
services:
  simple-pixel:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Horizontal Scaling

For high traffic, consider:
1. Multiple instances behind load balancer
2. Shared SQLite database (volume mount)
3. Or migrate to PostgreSQL/MySQL

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose up -d
```

### View Logs

```bash
# All logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Restart Service

```bash
docker-compose restart
```

### Clean Up

```bash
# Remove old images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Check if port is in use
sudo netstat -tlnp | grep 3000

# Verify Docker is running
docker info
```

### Database Issues

```bash
# Access container shell
docker-compose exec simple-pixel sh

# Check database location
ls -la /app/data/

# Check permissions
```

### High Memory Usage

```bash
# Check stats
docker stats simple-pixel

# Restart container
docker-compose restart
```

## Performance Tuning

1. **SQLite Optimization**
- Already configured with proper pragmas
- WAL mode enabled for better concurrency

2. **Node.js Tuning**
Add to `docker-compose.yml`:
```yaml
environment:
  - NODE_OPTIONS=--max-old-space-size=2048
```

3. **Nginx Caching**
Add static file caching in nginx config for `/frontend` path

## Compliance

Ensure you comply with:
- **GDPR** (EU)
- **CCPA** (California)
- **Other regional privacy laws**

Requirements:
- Privacy policy
- Cookie consent (if using cookies beyond tracking pixel)
- Data retention policy
- User data deletion mechanism

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review documentation: `README.md`, `DOCKER_SETUP.md`
- Check GitHub issues

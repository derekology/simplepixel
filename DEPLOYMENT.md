# Production Deployment Guide

## Overview

This guide covers deploying Simple Pixel to a production environment using Docker.

## Quick Start (Recommended)

The easiest way to deploy Simple Pixel is using the pre-built Docker image:

### 1. Download docker-compose file

```bash
# Create directory
mkdir simplepixel && cd simplepixel

# Download docker-compose file
curl -O https://raw.githubusercontent.com/derekology/simplepixel/main/docker-compose.hub.yml

# Rename to docker-compose.yml
mv docker-compose.hub.yml docker-compose.yml
```

### 2. Create environment file (optional)

```bash
cat > .env << EOF
NODE_ENV=production
PORT=3000
CLEANUP_INTERVAL_MINUTES=60
PIXEL_EXPIRY_DAYS=7
EOF
```

### 3. Start the application

```bash
docker compose up -d
```

That's it! Simple Pixel is now running on port 3000.

### 4. Verify it's working

```bash
curl http://localhost:3000/health
```

---

## Alternative: Build from Source

If you prefer to build from source instead of using the Docker Hub image:

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Domain name (for SSL)
- Reverse proxy (nginx recommended)

### 1. Server Preparation

```bash
sudo apt update && sudo apt upgrade -y

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

sudo usermod -aG docker $USER
```

### 2. Application Deployment

```bash
sudo apt update && sudo apt upgrade -y

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

sudo usermod -aG docker $USER
```

### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/derekology/simplepixel.git
cd simplepixel

# Create production environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Environment Configuration

Edit `.env` for production:

```bash
NODE_ENV=production
PORT=3000

DB_PATH=/app/data/simplepixel.db

CLEANUP_INTERVAL_MINUTES=60
PIXEL_EXPIRY_DAYS=7
```

### 4. Start Application

```bash
docker compose up -d
```

## Reverse Proxy Setup

### Nginx

Create `/etc/nginx/sites-available/simplepixel`:

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
sudo ln -s /etc/nginx/sites-available/simplepixel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
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

## Database Backups

### Manual Backup

```bash
# Create backups directory
mkdir -p /opt/backups/simplepixel

# Backup database
docker cp simplepixel:/app/data/simplepixel.db /opt/backups/simplepixel/backup-$(date +%Y%m%d-%H%M%S).db
```

### Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * docker cp simplepixel:/app/data/simplepixel.db /opt/backups/simplepixel/backup-$(date +\%Y\%m\%d-\%H\%M\%S).db && find /opt/backups/simplepixel -type f -mtime +30 -delete
```

## Monitoring

### Basic Health Check

```bash
docker compose ps

docker compose logs -f

docker stats simplepixel
```

## Maintenance

### Update Application

**Using Docker Hub image:**

```bash
docker compose pull
docker compose up -d
```

**From source:**

```bash
git pull

docker compose build --no-cache

docker compose up -d
```

### View Logs

```bash
docker compose logs

docker compose logs -f

docker compose logs --tail=100
```

### Restart Service

```bash
docker compose restart
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
docker-compose exec simplepixel sh

# Check database location
ls -la /app/data/

# Check permissions
```

### High Memory Usage

```bash
# Check stats
docker stats simplepixel

# Restart container
docker-compose restart
```

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

- Check logs: `docker compose logs`
- Review documentation: `README.md`, `DOCKER_SETUP.md`
- Check GitHub issues

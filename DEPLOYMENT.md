# Production Deployment Guide

## 🚀 Overview

This guide covers deploying AI Support Hub to production with security, monitoring, and scalability best practices.

## 📋 Pre-Deployment Checklist

### Security

- [ ] **Review** `SECURITY.md` - Read all security considerations
- [ ] **Revoke** any exposed API keys (check Git history!)
- [ ] **Generate** strong passwords for all services
- [ ] **Configure** HTTPS/TLS with valid certificates
- [ ] **Set** `DEBUG=false` in backend
- [ ] **Limit** CORS to specific production domains
- [ ] **Enable** rate limiting
- [ ] **Review** environment variables - no secrets in code

### Infrastructure

- [ ] **Database backups** - Automated daily backups
- [ ] **Monitoring** - Set up health checks
- [ ] **Logging** - Centralized log aggregation
- [ ] **Scaling** - Plan for horizontal scaling
- [ ] **CDN** - Configure for static assets (optional)
- [ ] **Domain** - DNS configured correctly
- [ ] **SSL/TLS** - Valid certificates installed

### Application

- [ ] **Tests pass** - All unit and integration tests
- [ ] **Dependencies updated** - Latest security patches
- [ ] **Database migrations** - Tested and ready
- [ ] **Environment variables** - Production values set
- [ ] **Build tested** - Docker images build successfully

---

## 🔐 Step 1: Secure Environment Variables

### Generate Secure Secrets

```bash
# Generate strong PostgreSQL password (32 chars)
openssl rand -base64 32

# Generate SECRET_KEY for backend (64 hex chars)
openssl rand -hex 32

# Example output:
# PostgreSQL: n8K3mP2xR9vL5qW7tY1uI4oP6aS8dF0g
# SECRET_KEY: 4f7d9e2a1b3c5d8e9f0a2b4c6d8e0f2a4g6h8i0j2k4l6m8n0o2p4q6r8s0t2u4v6w8x0y2z
```

### Create Production `.env`

```bash
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

**Key values to change:**

```bash
# CRITICAL: Change these!
POSTGRES_PASSWORD=<generated-strong-password>
SECRET_KEY=<generated-secret-key>

# Production URLs
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Disable debug mode
DEBUG=false

# Increase worker concurrency
CELERY_WORKER_CONCURRENCY=8

# Enable rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
```

---

## 🐳 Step 2: Docker Production Setup

### Create Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
# AI Support Hub - Production Configuration

services:
  # PostgreSQL Database
  db:
    image: postgres:16-alpine
    container_name: ai-support-db-prod
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    networks:
      - backend-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ai-support-backend-prod
    restart: always
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DEBUG=false
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
      - LOG_LEVEL=INFO
      - RATE_LIMIT_ENABLED=true
    depends_on:
      db:
        condition: service_healthy
    networks:
      - backend-network
      - frontend-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    container_name: ai-support-frontend-prod
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - backend
    networks:
      - frontend-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: ai-support-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
      - frontend
    networks:
      - frontend-network

volumes:
  postgres_data_prod:

networks:
  backend-network:
    driver: bridge
  frontend-network:
    driver: bridge
```

### Create Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS - Frontend
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # HTTPS - Backend API
    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API Documentation (optional - disable for production)
        # location /docs {
        #     deny all;
        # }
    }
}
```

---

## 📦 Step 3: Build and Deploy

### Get SSL Certificates (Let's Encrypt)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Get certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Certificates will be in /etc/letsencrypt/live/yourdomain.com/
```

### Deploy Application

```bash
# Pull latest code
git pull origin main

# Build and start production stack
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Verify all services are healthy
docker-compose -f docker-compose.prod.yml ps
```

---

## 🔍 Step 4: Monitoring & Health Checks

### Set Up Health Check Monitoring

```bash
# Install monitoring tool (example: Uptime Kuma)
docker run -d \
  --name uptime-kuma \
  -p 3001:3001 \
  -v uptime-kuma:/app/data \
  louislam/uptime-kuma:1

# Configure monitors for:
# - https://yourdomain.com (Frontend)
# - https://api.yourdomain.com/health (Backend)
# - Database connection (via backend health)
```

### Application Monitoring Endpoints

```bash
# Backend health
curl https://api.yourdomain.com/health

# Database stats (admin)
curl https://api.yourdomain.com/api/db/stats

# Check logs
docker-compose -f docker-compose.prod.yml logs backend --tail=100
```

---

## 💾 Step 5: Database Backups

### Automated Backups

Create `scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tickets_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

docker-compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U postgres tickets > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Schedule with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-db.sh
```

---

## 📊 Step 6: Logging & Error Tracking

### Optional: Sentry Integration

1. Sign up at https://sentry.io
2. Create new project
3. Add to `.env.production`:
   ```bash
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
   ```

4. Update `backend/app/main.py`:
   ```python
   import sentry_sdk
   from sentry_sdk.integrations.fastapi import FastApiIntegration
   
   if settings.sentry_dsn:
       sentry_sdk.init(
           dsn=settings.sentry_dsn,
           integrations=[FastApiIntegration()],
           environment="production"
       )
   ```

---

## 🚀 Step 7: Scaling (Optional)

### Horizontal Scaling with Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml ai-support

# Scale backend
docker service scale ai-support_backend=3

# Scale workers
docker service scale ai-support_worker=5
```

### Kubernetes Deployment (Advanced)

See `k8s/` directory for Kubernetes manifests (if implemented).

---

## ✅ Post-Deployment Verification

### Test Each Component

```bash
# 1. Frontend accessible
curl -I https://yourdomain.com
# Expected: 200 OK

# 2. Backend health
curl https://api.yourdomain.com/health
# Expected: {"status":"healthy"}

# 3. Submit test ticket
curl -X POST https://api.yourdomain.com/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"request_content":"Test production deployment"}'

# 4. Verify in dashboard
# Open browser: https://yourdomain.com/dashboard

# 5. Test API key management
# Navigate to Settings, add Gemini key, test validation
```

### Performance Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Load test API
ab -n 1000 -c 10 https://api.yourdomain.com/health

# Expected: No failures, reasonable response times
```

---

## 🔧 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check environment variables
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Database Connection Issues

```bash
# Check database is running
docker-compose -f docker-compose.prod.yml ps db

# Test connection
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d tickets -c "SELECT 1;"
```

### SSL Certificate Issues

```bash
# Renew certificates (auto-renew should be set up)
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Reload nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 🔄 Updating Production

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart (zero-downtime)
docker-compose -f docker-compose.prod.yml up -d --build --no-deps backend
docker-compose -f docker-compose.prod.yml up -d --build --no-deps frontend

# Run database migrations (if needed)
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## 📧 Support

For production issues:
- Check `TROUBLESHOOTING.md`
- Review logs: `docker-compose -f docker-compose.prod.yml logs`
- Contact: support@yourdomain.com

---

**Production deployment complete! 🎉**

Remember to:
- Monitor logs regularly
- Keep dependencies updated
- Review security advisories
- Test backups periodically

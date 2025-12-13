# FlowPoint Deployment Guide

This repository contains standardized Docker Compose configurations for deploying FlowPoint in different environments.

## Table of Contents

- [Overview](#overview)
- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Configuration Management](#configuration-management)
- [Secrets Management](#secrets-management)

---

## Overview

We maintain two standardized deployment configurations:

| Environment | File | Configuration Method | Use Case |
|-------------|------|---------------------|----------|
| **Development** | `docker-compose.dev.yml` | `.env` file | Local development, testing |
| **Production** | `docker-compose.yml` | Docker Secrets | Production deployments |

---

## Development Environment

### Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your configuration:**
   ```bash
   nano .env  # or your preferred editor
   ```

3. **Start the services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **View logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

5. **Stop the services:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

### Development Features

- ✅ All configuration in `.env` file (easy to edit)
- ✅ Database and Redis ports exposed for debugging
- ✅ Simple setup without Docker Swarm
- ✅ Minimal services (nginx, flowpoint, redis, postgres)
- ✅ Local SSL certificates supported

### Environment Variables

See `.env.example` for all available configuration options. Key variables:

```bash
# Database
POSTGRES_DB=flowpoint
POSTGRES_USER=flowpoint
POSTGRES_PASSWORD=your_password

# Ports (exposed for dev tools)
POSTGRES_EXTERNAL_PORT=5432
REDIS_EXTERNAL_PORT=6379
```

---

## Production Environment

### Prerequisites

Production deployment uses **Docker Swarm** mode for secrets management.

1. **Initialize Docker Swarm** (if not already done):
   ```bash
   docker swarm init
   ```

### Setup Docker Secrets

Create the required secrets before deployment:

```bash
# Create secrets from files (recommended)
echo "flowpoint" | docker secret create postgres_db -
echo "flowpoint_prod" | docker secret create postgres_user -
echo "$(openssl rand -base64 32)" | docker secret create postgres_password -

# Or from existing files
docker secret create postgres_db ./secrets/postgres_db.txt
docker secret create postgres_user ./secrets/postgres_user.txt
docker secret create postgres_password ./secrets/postgres_password.txt
```

### Deploy to Production

1. **Deploy the stack:**
   ```bash
   docker stack deploy -c docker-compose.yml flowpoint
   ```

2. **Check stack status:**
   ```bash
   docker stack ps flowpoint
   docker service ls
   ```

3. **View service logs:**
   ```bash
   docker service logs flowpoint_flowpoint
   docker service logs flowpoint_postgres
   ```

4. **Update a service:**
   ```bash
   docker service update --image registry.gitlab.com/pointsolutions/flowpoint:0.7.0 flowpoint_flowpoint
   ```

5. **Remove the stack:**
   ```bash
   docker stack rm flowpoint
   ```

### Production Features

- 🔒 Secrets stored in Docker Swarm (not in environment variables)
- 🔒 No ports exposed externally (except nginx 80/443)
- 🔒 All services communicate via internal Docker network
- 📦 Includes all production services (warpgate, nocodb, squid)
- 🔄 Automatic restarts with `restart: unless-stopped`

### Managing Secrets

**List secrets:**
```bash
docker secret ls
```

**Inspect secret (shows metadata, not values):**
```bash
docker secret inspect postgres_password
```

**Update a secret:**
```bash
# Remove the old secret (requires service downtime)
docker service update --secret-rm postgres_password flowpoint_postgres

# Create new secret
echo "new_password" | docker secret create postgres_password_v2 -

# Add new secret to service
docker service update --secret-add postgres_password_v2 flowpoint_postgres
```

**Rotate secrets (zero-downtime):**
```bash
# Create new version
echo "new_password" | docker secret create postgres_password_v2 -

# Update service to use both secrets
docker service update \
  --secret-add source=postgres_password_v2,target=postgres_password \
  --secret-rm postgres_password \
  flowpoint_postgres
```

---

## Configuration Management

### File Structure

```
.
├── docker-compose.yml          # Production (Docker Secrets)
├── docker-compose.dev.yml      # Development (.env file)
├── .env.example                # Template for .env
├── .env                        # Your local config (gitignored)
├── nginx.conf                  # Nginx configuration
├── squid.conf                  # Squid proxy config (production)
├── ssl/                        # SSL certificates (production)
└── data/
    └── warpgate/               # Warpgate data (production)
```

### Gitignore

Ensure these are in `.gitignore`:
```
.env
.env.local
.env.*.local
secrets/
ssl/*.key
ssl/*.pem
data/
```

---

## Secrets Management

### Docker Secrets vs Environment Variables

| Aspect | Docker Secrets (Production) | .env (Development) |
|--------|----------------------------|-------------------|
| **Security** | ✅ Encrypted at rest | ❌ Plain text |
| **Visibility** | ✅ Not in process env | ❌ Visible in `docker inspect` |
| **Setup** | ⚠️ Requires Swarm | ✅ Simple file |
| **Rotation** | ✅ Supported | ❌ Manual restart |
| **Best for** | Production | Development |

### Secret Files in Containers

Applications read secrets from files:
```
/run/secrets/postgres_db
/run/secrets/postgres_user
/run/secrets/postgres_password
```

### Application Support

PostgreSQL natively supports `_FILE` suffix variables:
```yaml
environment:
  - POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password
```

For applications without native support, use a wrapper script:
```bash
#!/bin/sh
export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password)
exec "$@"
```

---

## Services Overview

### Production Services

| Service | Image | Purpose | Ports |
|---------|-------|---------|-------|
| **nginx** | nginx:alpine | Reverse proxy, SSL termination | 80, 443 |
| **warpgate** | ghcr.io/warp-tech/warpgate | Secure access gateway | Internal only |
| **flowpoint** | registry.gitlab.com/pointsolutions/flowpoint | Main application | Internal only |
| **nocodb** | nocodb/nocodb:latest | Database UI | Internal only |
| **postgres** | postgres:16-alpine | Database | Internal only |
| **redis** | redis:7-alpine | Cache/queue | Internal only |
| **squid** | ubuntu/squid:latest | Proxy | Internal only |

### Development Services

Simplified stack for local development:
- nginx (with local SSL)
- flowpoint
- postgres (exposed on :5432 for dev tools)
- redis (exposed on :6379 for dev tools)

---

## Troubleshooting

### Development Issues

**Services won't start:**
```bash
docker-compose -f docker-compose.dev.yml logs
```

**Database connection issues:**
```bash
# Check if postgres is ready
docker-compose -f docker-compose.dev.yml exec postgres pg_isready
```

**Reset everything:**
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Production Issues

**Check secret availability:**
```bash
docker service ps flowpoint_postgres --no-trunc
docker secret ls
```

**Service not starting:**
```bash
docker service logs flowpoint_flowpoint --tail 100
```

**Network issues:**
```bash
docker network inspect flowpoint_flowpoint-network
```

---

## Security Best Practices

### Development
- ✅ Never commit `.env` to git
- ✅ Use weak passwords (for convenience)
- ✅ Expose ports for debugging tools

### Production
- 🔒 Always use Docker Secrets
- 🔒 Generate strong passwords: `openssl rand -base64 32`
- 🔒 Never expose database/redis ports externally
- 🔒 Use SSL certificates from a trusted CA
- 🔒 Regularly rotate secrets
- 🔒 Keep images updated
- 🔒 Review nginx.conf for security headers

---

## Additional Resources

- [Docker Secrets Documentation](https://docs.docker.com/engine/swarm/secrets/)
- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Swarm Tutorial](https://docs.docker.com/engine/swarm/swarm-tutorial/)

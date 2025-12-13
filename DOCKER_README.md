# FlowPoint Docker Deployment

Quick start guide for deploying FlowPoint with Docker Compose.

## 📚 Documentation

For complete deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## 🚀 Quick Start

### Development Environment

Simple setup for local development with all configuration in `.env` file:

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your settings
nano .env

# 3. Start services
docker-compose -f docker-compose.dev.yml up -d

# 4. Check logs
docker-compose -f docker-compose.dev.yml logs -f
```

Access:
- FlowPoint: http://localhost
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Production Environment

Secure deployment using Docker Swarm and Docker secrets:

```bash
# 1. Initialize Docker Swarm
docker swarm init

# 2. Create secrets (interactive script)
./scripts/create-secrets.sh

# 3. Configure non-secret variables (optional)
cp .env.production.example .env.production
nano .env.production
set -a; source .env.production; set +a

# 4. Deploy stack
docker stack deploy -c docker-compose.yml flowpoint

# 5. Check status
docker stack ps flowpoint
docker service logs flowpoint_flowpoint
```

## 📁 File Overview

```
├── docker-compose.yml           # Production (with Docker secrets)
├── docker-compose.dev.yml       # Development (with .env file)
├── .env.example                 # Development env template
├── .env.production.example      # Production env template (non-secrets)
├── scripts/
│   └── create-secrets.sh        # Helper to create Docker secrets
└── DEPLOYMENT.md                # Complete deployment guide
```

## 🔑 Configuration Comparison

| Aspect | Development | Production |
|--------|------------|------------|
| **File** | `docker-compose.dev.yml` | `docker-compose.yml` |
| **Config** | `.env` file | Docker Swarm secrets |
| **Setup** | Copy `.env.example` | Run `create-secrets.sh` |
| **Security** | ❌ Plain text | ✅ Encrypted secrets |
| **Services** | 4 (minimal) | 7 (full stack) |
| **Ports** | Exposed for debugging | Internal only |
| **Best for** | Local dev, testing | Production deployments |

## 🔐 Security Notes

### Development
- ✅ Use simple passwords for convenience
- ✅ Ports exposed for database tools
- ❌ Never commit `.env` to git

### Production
- 🔒 Use `./scripts/create-secrets.sh` to generate strong keys
- 🔒 All secrets managed via Docker Swarm
- 🔒 No database ports exposed externally
- 🔒 SSL/TLS termination at nginx

## 🛠️ Common Commands

### Development

```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f flowpoint

# Restart a service
docker-compose -f docker-compose.dev.yml restart flowpoint

# Reset everything (WARNING: deletes data)
docker-compose -f docker-compose.dev.yml down -v
```

### Production

```bash
# Deploy stack
docker stack deploy -c docker-compose.yml flowpoint

# List services
docker service ls

# View service logs
docker service logs flowpoint_flowpoint -f

# Scale a service
docker service scale flowpoint_flowpoint=3

# Update service image
docker service update --image registry.gitlab.com/pointsolutions/flowpoint:0.7.0 flowpoint_flowpoint

# Remove stack
docker stack rm flowpoint
```

## 📊 Environment Variables

### FlowPoint Application (`AP_*`)

All FlowPoint settings use `AP_` prefix:

- `AP_FRONTEND_URL` - Public URL of your FlowPoint instance
- `AP_POSTGRES_*` - Database configuration
- `AP_REDIS_*` - Redis configuration
- `AP_ENCRYPTION_KEY` - Encryption key (secret)
- `AP_JWT_SECRET` - JWT signing key (secret)
- `AP_SIGN_UP_ENABLED` - Enable/disable user registration

See `.env.example` for complete list.

### Container Configuration

Standard Docker/database settings:

- `POSTGRES_DB` - PostgreSQL database name
- `POSTGRES_USER` - PostgreSQL username
- `POSTGRES_PASSWORD` - PostgreSQL password (secret in prod)
- `POSTGRES_VERSION` - PostgreSQL image version
- `REDIS_VERSION` - Redis image version

## 🩺 Troubleshooting

### Development Issues

**Services won't start:**
```bash
docker-compose -f docker-compose.dev.yml logs
```

**Database connection refused:**
```bash
# Check if postgres is ready
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres
```

**Permission issues:**
```bash
# Reset ownership (Linux)
sudo chown -R $USER:$USER .
```

### Production Issues

**Secrets not found:**
```bash
# List existing secrets
docker secret ls

# Recreate secrets
./scripts/create-secrets.sh
```

**Service won't start:**
```bash
# Check detailed service info
docker service ps flowpoint_flowpoint --no-trunc

# View last 100 log lines
docker service logs flowpoint_flowpoint --tail 100
```

**Network connectivity:**
```bash
# Inspect network
docker network inspect flowpoint_flowpoint-network

# Check DNS resolution
docker run --rm --network flowpoint_flowpoint-network alpine nslookup postgres
```

## 🔄 Migration Guide

### From .env to Docker Secrets

1. **Export current values:**
   ```bash
   source .env
   echo $AP_ENCRYPTION_KEY > /tmp/ap_encryption_key.txt
   ```

2. **Create secrets:**
   ```bash
   docker secret create ap_encryption_key /tmp/ap_encryption_key.txt
   rm /tmp/ap_encryption_key.txt  # Clean up
   ```

3. **Deploy production stack:**
   ```bash
   docker stack deploy -c docker-compose.yml flowpoint
   ```

## 📖 Additional Resources

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment documentation
- **[Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)** - Official Docker secrets guide
- **[Docker Compose](https://docs.docker.com/compose/)** - Docker Compose documentation
- **[Docker Swarm](https://docs.docker.com/engine/swarm/)** - Docker Swarm mode documentation

## 🆘 Getting Help

1. Check logs: `docker-compose logs` or `docker service logs`
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting
3. Verify `.env` configuration matches `.env.example`
4. For production, ensure all secrets are created

## 📝 License

See main repository README for license information.

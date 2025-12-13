#!/bin/bash
# Create Docker Secrets for Production Deployment
# This script creates the required secrets for the FlowPoint stack
# Usage: ./scripts/create-secrets.sh

set -e

echo "🔐 FlowPoint Docker Secrets Setup"
echo "=================================="
echo ""

# Check if Docker Swarm is initialized
if ! docker info 2>/dev/null | grep -q "Swarm: active"; then
    echo "❌ Docker Swarm is not initialized."
    echo "   Run: docker swarm init"
    exit 1
fi

echo "✅ Docker Swarm is active"
echo ""

# Function to create or update a secret
create_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3

    echo "📝 Creating secret: $secret_name ($description)"

    # Check if secret already exists
    if docker secret ls --format '{{.Name}}' | grep -q "^${secret_name}$"; then
        echo "   ⚠️  Secret '$secret_name' already exists. Skipping."
        echo "   To update, remove it first: docker secret rm $secret_name"
    else
        echo "$secret_value" | docker secret create "$secret_name" -
        echo "   ✅ Created successfully"
    fi
    echo ""
}

# Prompt for values or use defaults
echo "Enter values for secrets (press Enter for defaults/auto-generate):"
echo ""

# PostgreSQL Database Name
read -p "PostgreSQL Database Name [flowpoint]: " POSTGRES_DB
POSTGRES_DB=${POSTGRES_DB:-flowpoint}

# PostgreSQL User
read -p "PostgreSQL User [postgres]: " POSTGRES_USER
POSTGRES_USER=${POSTGRES_USER:-postgres}

# PostgreSQL Password
echo "PostgreSQL Password (leave empty to auto-generate):"
read -s -p "> " POSTGRES_PASSWORD
echo ""
if [ -z "$POSTGRES_PASSWORD" ]; then
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
    echo "   🔑 Generated random password"
fi

echo ""
echo "Generating FlowPoint security keys..."
echo ""

# Generate security keys
AP_ENCRYPTION_KEY=$(openssl rand -hex 32)
AP_JWT_SECRET=$(openssl rand -hex 32)
AP_CODE_SECRETS_KEY=$(openssl rand -hex 32)

echo "Creating secrets..."
echo ""

# Create PostgreSQL secrets
create_secret "postgres_db" "$POSTGRES_DB" "PostgreSQL database name"
create_secret "postgres_user" "$POSTGRES_USER" "PostgreSQL username"
create_secret "postgres_password" "$POSTGRES_PASSWORD" "PostgreSQL password"

# Create FlowPoint application secrets
create_secret "ap_encryption_key" "$AP_ENCRYPTION_KEY" "FlowPoint encryption key"
create_secret "ap_jwt_secret" "$AP_JWT_SECRET" "FlowPoint JWT secret"
create_secret "ap_code_secrets_key" "$AP_CODE_SECRETS_KEY" "FlowPoint code secrets key"

echo "=================================="
echo "✅ Secrets setup complete!"
echo ""
echo "📋 Summary:"
echo "   Database:"
echo "     - postgres_db: $POSTGRES_DB"
echo "     - postgres_user: $POSTGRES_USER"
echo "     - postgres_password: ********"
echo ""
echo "   FlowPoint Security:"
echo "     - ap_encryption_key: ********"
echo "     - ap_jwt_secret: ********"
echo "     - ap_code_secrets_key: ********"
echo ""
echo "💾 Save these values securely (e.g., password manager)"
echo ""
echo "🚀 Next steps:"
echo "   1. Review docker-compose.yml"
echo "   2. Deploy: docker stack deploy -c docker-compose.yml flowpoint"
echo "   3. Check status: docker stack ps flowpoint"
echo ""

# Optional: Save to a secure file
read -p "Save configuration to secrets/config.txt? (yes/no) [no]: " SAVE_CONFIG
if [ "$SAVE_CONFIG" = "yes" ]; then
    mkdir -p secrets
    cat > secrets/config.txt <<EOF
# FlowPoint Production Configuration
# Created: $(date)
# ⚠️  KEEP THIS FILE SECURE - Contains sensitive passwords and keys

# Database Configuration
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# FlowPoint Security Keys
AP_ENCRYPTION_KEY=$AP_ENCRYPTION_KEY
AP_JWT_SECRET=$AP_JWT_SECRET
AP_CODE_SECRETS_KEY=$AP_CODE_SECRETS_KEY

# Docker Secrets Created:
# - postgres_db
# - postgres_user
# - postgres_password
# - ap_encryption_key
# - ap_jwt_secret
# - ap_code_secrets_key

# Deployment command:
# docker stack deploy -c docker-compose.yml flowpoint
EOF
    chmod 600 secrets/config.txt
    echo "✅ Configuration saved to secrets/config.txt (chmod 600)"
    echo "   ⚠️  Ensure secrets/ is in .gitignore"
fi

echo ""
echo "Done! 🎉"

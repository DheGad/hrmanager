#!/bin/bash
# HRManager4U.ai Vultr Deployment Script (Ubuntu 22.04 LTS)
# Run as root

set -e

echo "🚀 Starting HRManager4U.ai Deployment..."

# 1. Update and install dependencies
echo "Updating system..."
apt-get update && apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg git ufw nginx certbot python3-certbot-nginx

# 2. Install Docker & Docker Compose
echo "Installing Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Setup UFW Firewall
echo "Configuring Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 4. Clone Repository
echo "Setting up repository..."
mkdir -p /opt/hrmanager4u
# In a real environment, you would git clone here. Assuming files are copied to /opt/hrmanager4u
cd /opt/hrmanager4u

# 5. Environment Variables
echo "Setting up environment variables..."
if [ ! -f .env.production ]; then
  cat <<EOF > .env.production
DATABASE_URL=postgresql://hrmanager:secure_password_here@postgres:5432/hrmanager_prod?schema=public
REDIS_URL=redis://redis:6379
JWT_SECRET=$(openssl rand -base64 32)
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=$(openssl rand -base64 16)
EOF
fi

# 6. Start Containers
echo "Starting Docker Compose..."
docker compose -f docker-compose.production.yml up -d

echo "✅ Vultr Deployment Script Completed!"
echo "Run 'docker compose -f docker-compose.production.yml ps' to verify."

#!/bin/bash
# HRManager4U.ai SSL Provisioning Script
# Run as root after DNS A records have propagated to the VPS IP.

set -e

DOMAIN_WEB="staging.hrmanager4u.ai"
DOMAIN_API="api.hrmanager4u.ai"
EMAIL="admin@hrmanager4u.ai"

echo "🔐 Provisioning Let's Encrypt SSL Certificates..."

# Stop the Nginx container temporarily so standalone certbot can bind to port 80
docker compose -f /opt/hrmanager4u/docker-compose.production.yml stop nginx

# Request certs
certbot certonly --standalone --preferred-challenges http -d $DOMAIN_WEB -m $EMAIL --agree-tos -n
certbot certonly --standalone --preferred-challenges http -d $DOMAIN_API -m $EMAIL --agree-tos -n

# Copy to docker certbot directory
mkdir -p /opt/hrmanager4u/certbot/conf/live/$DOMAIN_WEB
mkdir -p /opt/hrmanager4u/certbot/conf/live/$DOMAIN_API

cp -RL /etc/letsencrypt/live/$DOMAIN_WEB/* /opt/hrmanager4u/certbot/conf/live/$DOMAIN_WEB/
cp -RL /etc/letsencrypt/live/$DOMAIN_API/* /opt/hrmanager4u/certbot/conf/live/$DOMAIN_API/

# Restart Nginx
docker compose -f /opt/hrmanager4u/docker-compose.production.yml start nginx

echo "✅ SSL Provisioning Completed!"
echo "Certbot container will handle future auto-renewals."

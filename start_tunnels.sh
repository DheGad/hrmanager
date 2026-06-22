#!/bin/bash
pkill -f localtunnel
echo "Starting backend tunnel..."
while true; do
  npx localtunnel --port 4000 --subdomain hrmanager4u-api >> api_tunnel.log 2>&1
  echo "Backend tunnel crashed, waiting 15s before reconnect..."
  sleep 15
done &

echo "Starting frontend tunnel..."
while true; do
  npx localtunnel --port 3000 --subdomain hrmanager4u-web >> web_tunnel.log 2>&1
  echo "Frontend tunnel crashed, waiting 15s before reconnect..."
  sleep 15
done &

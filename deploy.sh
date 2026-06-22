#!/bin/bash
set -e

echo "🚀 HRManager4U Production Deployment Script"
echo "========================================="
echo "Note: Using npx to bypass global permission errors..."

echo ""
echo "🔐 Step 1: Vercel Authentication (Frontend)"
echo "You will be prompted to log in to Vercel in your browser."
npx vercel login

echo ""
echo "🔐 Step 2: Railway Authentication (Backend & Database)"
echo "You will be prompted to log in to Railway in your browser."
npx @railway/cli login

echo ""
echo "🏗️ Step 3: Deploy Backend to Railway"
echo "Creating new Railway project..."
npx @railway/cli init
echo "Provisioning PostgreSQL and Redis..."
npx @railway/cli add -p postgresql
npx @railway/cli add -p redis
echo "Deploying NestJS API..."
npx @railway/cli up -d
API_URL=$(npx @railway/cli domain)

echo ""
echo "🏗️ Step 4: Deploy Frontend to Vercel"
cd apps/web
echo "Linking Vercel project..."
npx vercel link --yes
echo "Setting API URL..."
echo -n "https://$API_URL/api/v1" | npx vercel env add NEXT_PUBLIC_API_URL production
echo "Deploying Next.js app to production..."
npx vercel deploy --prod --yes

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "Your platform is now live on Vercel and Railway."

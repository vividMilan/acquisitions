#!/bin/bash

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    exit 1
fi

mkdir -p .neon_local
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
fi

echo "📦 Building and starting development containers..."
# 1. Start containers in the background first
docker compose -f docker-compose.dev.yml up -d --build

echo "⏳ Waiting for Neon Local database proxy to become healthy..."
# 2. Block until the database container's healthcheck passes
until [ "$(docker inspect --format='{{.State.Health.Status}}' acquisition-neon-local)" == "healthy" ]; do
    echo "Database is booting up... checking again in 2 seconds"
    sleep 2
done

# 3. Apply your Drizzle migrations locally
echo "📜 Database is ready! Applying latest schema with Drizzle..."
npm run db:migrate

echo "🎉 Development environment fully synchronized!"
echo "   Application: http://localhost:3000"
echo "   Database Port: 5432"
echo "================================================"

# 4. Stream the application logs to your terminal window
docker compose -f docker-compose.dev.yml logs -f app
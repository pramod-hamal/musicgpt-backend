#!/bin/sh

set -e

echo "Starting application setup..."

# Run migrations
echo "Running database migrations..."
pnpx prisma migrate deploy

exec pnpm run start:prod


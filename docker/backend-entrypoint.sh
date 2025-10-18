#!/bin/bash
set -e

# Function to wait for a service
wait_for_service() {
    local host="$1"
    local port="$2"
    local service="$3"
    
    echo "Waiting for $service to be ready..."
    while ! nc -z "$host" "$port"; do
        sleep 1
    done
    echo "$service is ready!"
}

# Wait for PostgreSQL
wait_for_service postgres 5432 "PostgreSQL"

# Wait for Redis
wait_for_service redis 6379 "Redis"

# Create required directories
mkdir -p /app/storage/warranty-docs

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting FastAPI application..."
exec "$@"
#!/bin/bash
set -e

# Function to wait for a service using timeout and /dev/tcp
wait_for_service() {
    local host="$1"
    local port="$2"
    local service="$3"
    
    echo "Waiting for $service to be ready..."
    local timeout=60
    local count=0
    
    while [ $count -lt $timeout ]; do
        if timeout 1 bash -c "cat < /dev/null > /dev/tcp/$host/$port" 2>/dev/null; then
            echo "$service is ready!"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    
    echo "Warning: $service not ready after $timeout seconds, proceeding anyway..."
}

# Install any new dependencies
echo "Checking for new dependencies..."
npm install --legacy-peer-deps --no-audit --no-fund

# Wait for backend to be ready
wait_for_service backend 8000 "Backend API"

# Start the development server
echo "Starting Next.js development server..."
exec "$@"
FROM node:18-bullseye-slim

WORKDIR /app

# avoid interactive apt prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies required to build native modules (libpq, node-gyp)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-dev \
    python-is-python3 \
    build-essential \
    libpq-dev \
    pkg-config \
    ca-certificates \
    git \
  && rm -rf /var/lib/apt/lists/*

# Ensure a `python` binary exists and node-gyp knows where to find it
RUN ln -sf /usr/bin/python3 /usr/bin/python || true
ENV PYTHON=/usr/bin/python3
ENV NPM_CONFIG_PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3

# Copy package files and install JS deps
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy application source
COPY . .

# Build Next.js application
RUN npm run build

# Expose port and run
EXPOSE 3000
CMD ["npm", "start"]

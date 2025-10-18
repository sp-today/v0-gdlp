FROM node:18-bullseye-slim AS builder

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

# Copy package files and install JS deps in builder
ARG DATABASE_URL="postgresql://gdlp:gdlp_pass@postgres:5432/gdlp_dev"
ARG NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="anon-key-placeholder"
ARG NEXT_PUBLIC_MINIO_ENDPOINT="http://minio:9000"

ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_MINIO_ENDPOINT=${NEXT_PUBLIC_MINIO_ENDPOINT}

COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy application source (excluding node_modules via .dockerignore)
COPY . .

# Build Next.js application
RUN npm run build

FROM node:18-bullseye-slim AS runner
WORKDIR /app

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy built app and node_modules from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/app ./app
COPY --from=builder /app/next.config.mjs ./next.config.mjs

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]

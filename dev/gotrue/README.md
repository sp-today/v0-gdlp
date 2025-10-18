Building gotrue locally (optional)
---------------------------------

If you prefer to build and run a gotrue container inside `docker-compose` instead of using the Supabase CLI, follow these steps.

Prerequisites
- Go toolchain (1.20+ recommended)
- Docker

Steps
1. Clone the gotrue repository (or add it as a submodule):

```bash
git clone https://github.com/supabase/gotrue.git dev/gotrue/src
```

2. Build the gotrue binary and image

```bash
cd dev/gotrue/src
make build
# build a local docker image named v0-gdlp-gotrue:local
docker build -t v0-gdlp-gotrue:local .
```

3. Update `docker-compose.dev.yml` to reference `v0-gdlp-gotrue:local` as the gotrue image and set envs (GOTRUE_DB_DATABASE_URL, GOTRUE_SITE_URL, GOTRUE_JWT_SECRET).

4. Start compose: `docker compose -f docker-compose.dev.yml up -d`.

Notes
- Building gotrue locally requires the Go toolchain and can be slow. Use the Supabase CLI if you want a faster, supported local stack.

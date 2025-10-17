# Local Development: Postgres + MinIO stack

This document describes how to run the local Postgres + MinIO stack for development, and how to verify connectivity with direct SQL queries.

Files added:
- `docker-compose.local.yml` — Postgres, pgAdmin, MinIO services
- `.env.local.example` — example environment variables for local development
- `scripts/verify_local_stack.sh` — small helper to run SQL verification against the Postgres container
- `docker-compose.override.yml` — optional wiring for the Next app to talk to local services

Quick start
1. Copy env example:

```bash
cp .env.local.example .env.local
# edit .env.local if you want to change credentials
```

2. Start the stack:

```bash
docker compose -f docker-compose.local.yml up -d
```

3. Verify Postgres is accepting connections (pgAdmin: http://localhost:8080)

4. Run the verification script (uses docker exec psql):

```bash
./scripts/verify_local_stack.sh
```

5. Wire your Next app by copying values from `.env.local` to `.env.local` in the project root (or set `DATABASE_URL` to `postgresql://gdlp:gdlp_pass@localhost:5432/gdlp_dev`).

Checklist performed by this setup (cross-verify):
- [ ] Docker containers start successfully
- [ ] Postgres accepts connections on localhost:5432
- [ ] A test schema/table exists and can be queried via psql
- [ ] MinIO console reachable at http://localhost:9001 and S3 API at http://localhost:9000
- [ ] pgAdmin reachable at http://localhost:8080

Backups
- To backup DB: `docker exec -t gdlp-local-db pg_dumpall -c -U $POSTGRES_USER > backup.sql`
- To restore: `psql -U $POSTGRES_USER -d $POSTGRES_DB -f backup.sql` inside container or from host

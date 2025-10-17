# Secrets, environment variables, and safe local development

This document explains the recommended workflow for handling secrets and environment variables for the GDLP project.

DO NOT commit real secrets to this repository. The repository already ignores `.env*` files.

1) Template

- `.env.example` contains placeholder keys and is safe to commit. Use it as the basis for local configuration.

2) Create a local env file

Run this on your machine (not in this chat environment):

```bash
cp .env.example .env.local
# Edit .env.local and insert real values (never commit .env.local)
```

Alternatively, use the included helper script which will not overwrite an existing `.env.local`:

```bash
./scripts/create_env_local.sh
```

3) Keep secrets out of source control

- Ensure `.env.local` is listed in `.gitignore`. This repo already contains `.env*` in `.gitignore`.
- Before committing, run `git status` and verify you don't have secrets staged.

4) Using secrets in CI / deployment

- Add secrets to your deployment platform (Vercel, Netlify, GitHub Actions, etc.) using their secure secret storage.
- Example: add a secret via the GitHub CLI locally:

```bash
# set a repository secret (you will be prompted for the value)
gh secret set SUPABASE_SERVICE_ROLE_KEY
```

- Example: add an environment variable to Vercel locally:

```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

5) Rotating and revoking keys

- Rotate keys if you believe they were compromised.
- Revoke old keys in the provider console (Supabase, Neon, etc.).

6) If you want me to generate platform-specific commands

- Tell me the provider (Vercel, GitHub Actions, Docker Compose, etc.) and I will generate the exact CLI commands or CI snippet. I will not accept or store real secrets here.

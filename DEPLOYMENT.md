# GDLP Deployment Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for production deployment)

## Local Development

### 1. Setup Environment Variables
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Run Database Migrations
\`\`\`bash
npm run db:migrate
\`\`\`

### 4. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000

## Docker Deployment

### Build Docker Image
\`\`\`bash
docker build -t gdlp:latest .
\`\`\`

### Run Docker Container
\`\`\`bash
docker run -p 3000:3000 \
  -e SUPABASE_NEXT_PUBLIC_SUPABASE_URL=your_urSUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY=your_key \
  gdlp:latest
\`\`\`

## Vercel Deployment

### 1. Connect Repository
- Push code to GitHub
- Connect repository to Vercel

### 2. Configure Environment Variables
In Vercel dashboard, add:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY
- ENCRYPTION_KEY
- External service API keys

### 3. Deploy
\`\`\`bash
vercel deploy --prod
\`\`\`

## Database Setup

### Run Migration Scripts
\`\`\`bash
# Create tables
psql -h your_host -U postgres -d gdlp -f scripts/001_create_tables.sql

# Create triggers
psql -h your_host -U postgres -d gdlp -f scripts/002_create_profile_trigger.sql

# Create audit logs
psql -h your_host -U postgres -d gdlp -f scripts/006_create_audit_logs.sql

# Create analytics functions
psql -h your_host -U postgres -d gdlp -f scripts/007_create_analytics_functions.sql
\`\`\`

## Health Checks

### API Health
\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`

### Database Connection
\`\`\`bash
curl http://localhost:3000/api/db-health
\`\`\`

## Monitoring

### Application Logs
- Vercel: Dashboard > Deployments > Logs
- Docker: `docker logs container_id`

### Error Tracking
- Sentry integration recommended
- Configure in environment variables

## Rollback Procedure

### Vercel Rollback
1. Go to Vercel Dashboard
2. Select deployment
3. Click "Rollback"

### Database Rollback
\`\`\`bash
# Backup current database
pg_dump gdlp > backup_$(date +%s).sql

# Restore from backup
psql gdlp < backup_timestamp.sql
\`\`\`

## Performance Optimization

### Caching
- Enable Vercel Edge Caching
- Configure cache headers in next.config.js

### Database Optimization
- Run ANALYZE on tables
- Monitor slow queries
- Create indexes as needed

## Security Checklist

- [ ] All environment variables configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Audit logging enabled
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented

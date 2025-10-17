# Guardian Device Lifecycle Platform (GDLP)

A comprehensive platform addressing gaps in India's device warranty, repair, and consumer protection ecosystem.

## Overview

GDLP is an end-to-end solution that helps consumers manage device warranties, access repair guidance, verify spare parts authenticity, book repair services, and file grievances with government portals.

## Key Features

### 1. Warranty Guardian
- Digital warranty vault with OCR document processing
- Automatic warranty document verification
- Warranty claim filing and tracking
- Compliance tracking and alerts

### 2. Vernacular Fix Hub
- Multi-language repair guides (10+ Indian languages)
- Voice-first interactions with text-to-speech
- Step-by-step repair instructions
- Video tutorials and success metrics

### 3. Part Authenticity Network
- GS1 code verification for spare parts
- Real-time counterfeit detection
- Barcode scanning support
- Verification history tracking

### 4. Predictive Service-Connect
- ML-powered repair center discovery
- Timeline and cost prediction
- Automated repair booking
- Real-time service tracking

### 5. Grievance Automation Hub
- AI-powered complaint generation
- Government portal integration
- Automated grievance submission
- Status tracking and follow-up

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **State Management**: Zustand, SWR
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel, Docker

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/gdlp.git
cd gdlp
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Setup environment variables
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
\`\`\`

4. Run database migrations
\`\`\`bash
npm run db:migrate
\`\`\`

5. Start development server
\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000

## Project Structure

\`\`\`
gdlp/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── admin/            # Admin components
│   ├── warranty/         # Warranty module
│   ├── repair-hub/       # Repair guides
│   ├── parts/            # Parts verification
│   ├── service-connect/  # Service booking
│   └── grievance/        # Grievance filing
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── security/         # Security utilities
│   ├── compliance/       # Compliance features
│   ├── services/         # External services
│   └── types/            # TypeScript types
├── scripts/
│   ├── 001_create_tables.sql
│   ├── 002_create_profile_trigger.sql
│   ├── 003_seed_repair_guides.sql
│   ├── 004_seed_spare_parts.sql
│   ├── 005_seed_repair_centers.sql
│   ├── 006_create_audit_logs.sql
│   └── 007_create_analytics_functions.sql
├── __tests__/            # Test files
├── .env.example          # Environment variables template
├── docker-compose.yml    # Docker configuration
├── Dockerfile            # Docker image
├── jest.config.js        # Jest configuration
└── package.json          # Dependencies
\`\`\`

## Database Schema

### Core Tables
- **profiles** - User profiles with roles
- **devices** - Device inventory
- **warranty_documents** - OCR-processed documents
- **warranty_claims** - Warranty claims
- **repair_guides** - Multi-language guides
- **spare_parts** - Part inventory
- **part_authenticity_checks** - Verification tracking
- **repair_centers** - Service providers
- **repair_bookings** - Service bookings
- **grievances** - Complaints
- **audit_logs** - Security audit trail

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/callback` - OAuth callback

### Warranty Module
- `GET /api/warranty-documents` - List documents
- `POST /api/warranty-documents/upload` - Upload document
- `GET /api/warranty-documents/[id]` - Get document
- `DELETE /api/warranty-documents/[id]` - Delete document

### Repair Hub
- `GET /api/repair-guides/search` - Search guides
- `GET /api/repair-guides/[id]` - Get guide details

### Parts Verification
- `GET /api/spare-parts/search` - Search parts
- `POST /api/spare-parts/verify-gs1` - Verify GS1 code
- `GET /api/spare-parts/verification-history` - Get history

### Service Booking
- `GET /api/repair-centers/search` - Find centers
- `POST /api/repair-bookings/predict-timeline` - Predict timeline
- `POST /api/repair-bookings/create` - Create booking

### Grievances
- `POST /api/grievances/generate-complaint` - Generate complaint
- `POST /api/grievances` - Submit grievance
- `GET /api/grievances` - List grievances

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/grievances` - Grievance analytics

## Testing

Run tests:
\`\`\`bash
npm run test
\`\`\`

Run tests in watch mode:
\`\`\`bash
npm run test:watch
\`\`\`

Generate coverage report:
\`\`\`bash
npm run test:coverage
\`\`\`

## Deployment

### Vercel Deployment
\`\`\`bash
vercel deploy --prod
\`\`\`

### Docker Deployment
\`\`\`bash
docker build -t gdlp:latest .
docker run -p 3000:3000 gdlp:latest
\`\`\`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Launch Checklist

See [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) for pre-launch and post-launch procedures.

## Security

- Row Level Security (RLS) on all tables
- Encryption for sensitive data
- Audit logging for all actions
- GDPR-compliant data handling
- Regular security audits

## Performance

- Optimized database queries with indexes
- Caching with SWR
- Image optimization
- Code splitting
- CDN integration

## Monitoring

- Health check endpoint: `/api/health`
- Error tracking with Sentry (optional)
- Performance monitoring with Vercel Analytics
- Database monitoring with Supabase

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test`
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub or contact support@gdlp.com

## Roadmap

- Mobile app (React Native)
- Advanced ML models for timeline prediction
- Integration with more government portals
- Multi-language support expansion
- Blockchain for parts verification
- IoT device integration

# GDLP Architecture

## System Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web App     │  │  Mobile App  │  │  Admin Panel │      │
│  │  (Next.js)   │  │  (React Native)  │  (Next.js)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js API Routes                                  │   │
│  │  - Authentication                                    │   │
│  │  - Warranty Management                               │   │
│  │  - Repair Guides                                     │   │
│  │  - Parts Verification                                │   │
│  │  - Service Booking                                   │   │
│  │  - Grievance Management                              │   │
│  │  - Analytics                                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Services    │  │  Utilities   │  │  Validators  │      │
│  │  - OCR       │  │  - Encryption│  │  - Auth      │      │
│  │  - ML Models │  │  - Logging   │  │  - RBAC      │      │
│  │  - External  │  │  - Caching   │  │  - Data      │      │
│  │    APIs      │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase Client (PostgreSQL)                        │   │
│  │  - Connection pooling                                │   │
│  │  - Query optimization                                │   │
│  │  - RLS policies                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │  Supabase    │  │  External    │      │
│  │  (Primary)   │  │  Storage     │  │  Services    │      │
│  │              │  │  (Documents) │  │  (APIs)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Module Architecture

### Warranty Guardian Module
\`\`\`
User Upload → OCR Processing → Document Storage → Claim Filing → Status Tracking
\`\`\`

### Vernacular Fix Hub Module
\`\`\`
Search Query → Language Detection → Guide Retrieval → Voice Processing → Display
\`\`\`

### Part Authenticity Module
\`\`\`
GS1 Code Input → Verification Service → Database Lookup → Result Display → History
\`\`\`

### Service-Connect Module
\`\`\`
Location Input → Center Search → ML Prediction → Booking → Tracking
\`\`\`

### Grievance Hub Module
\`\`\`
Issue Description → AI Generation → Template Creation → Portal Submission → Tracking
\`\`\`

## Data Flow

### Authentication Flow
1. User enters credentials
2. Supabase Auth validates
3. JWT token issued
4. Token stored in secure cookie
5. Middleware refreshes token
6. User authenticated for requests

### Warranty Claim Flow
1. User uploads document
2. OCR processes document
3. Data extracted and stored
4. Claim created in database
5. Notification sent
6. Admin reviews claim
7. Status updated
8. User notified

### Repair Booking Flow
1. User selects device and issue
2. ML model predicts timeline
3. Repair centers searched
4. User selects center
5. Booking created
6. Confirmation sent
7. Real-time tracking enabled

## Security Architecture

### Authentication
- Supabase Auth with JWT
- Secure cookie storage
- Token refresh mechanism
- Session management

### Authorization
- Role-Based Access Control (RBAC)
- Row Level Security (RLS)
- Permission-based access
- Audit logging

### Data Protection
- AES-256 encryption for sensitive data
- HTTPS/TLS for transport
- SQL injection prevention
- XSS protection

## Scalability Considerations

### Database
- Connection pooling
- Query optimization
- Indexing strategy
- Caching layer (Redis optional)

### API
- Rate limiting
- Load balancing
- Horizontal scaling
- CDN integration

### Storage
- Supabase Storage for documents
- Compression for images
- Cleanup policies
- Backup strategy

## Deployment Architecture

### Development
- Local Next.js server
- Local PostgreSQL (Docker)
- Environment variables

### Staging
- Vercel preview deployment
- Staging database
- Testing environment

### Production
- Vercel production deployment
- Production database
- CDN integration
- Monitoring and alerting

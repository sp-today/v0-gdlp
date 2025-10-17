# GDLP Platform Architecture

## System Overview

The Guardian Device Lifecycle Platform is built using a microservices architecture with the following components:

### Frontend Layer
- **React Native Mobile App** (iOS/Android)
- **React Web Dashboard** (Admin & Analytics)
- **Progressive Web App** (PWA) for offline support

### API Gateway
- Kong/AWS API Gateway
- Rate limiting, authentication, request routing
- API versioning and caching

### Backend Services
- **Django/Python Services**: Core business logic, warranty processing, document analysis
- **Node.js Services**: Real-time features, notifications, live tracking
- **ML Services**: OCR, NLP, predictive models

### Data Layer
- **PostgreSQL**: Structured data (users, devices, warranties, bookings)
- **MongoDB**: Unstructured data (guides, logs, content)
- **Redis**: Caching and session management

### External Integrations
- OCR Services (Affinda, Google Vision)
- Language Services (Bhashini, Azure Cognitive)
- Storage (AWS S3, Azure Blob)
- Government Portals (INGRAM, NCH)

## Database Schema

### Core Tables
1. **users** - User profiles and authentication
2. **devices** - Device inventory
3. **warranties** - Warranty information
4. **repair_services** - Repair history
5. **part_authentications** - Part verification records
6. **grievances** - Consumer complaints
7. **service_providers** - Repair center directory
8. **repair_bookings** - Service bookings
9. **document_vault** - Document storage
10. **notifications** - User notifications
11. **analytics_events** - Event tracking

## Deployment Architecture

### Development
- Docker Compose for local development
- PostgreSQL + MongoDB containers
- Mock external services

### Staging
- AWS ECS for containerized services
- RDS for PostgreSQL
- DocumentDB for MongoDB
- CloudFront for CDN

### Production
- Multi-region deployment
- Auto-scaling groups
- Load balancing
- Disaster recovery setup

## Security Architecture

- End-to-end encryption for sensitive data
- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting
- Regular security audits

## Monitoring & Observability

- Application Performance Monitoring (New Relic)
- Error tracking (Sentry)
- Log aggregation (ELK Stack)
- Infrastructure monitoring (CloudWatch)
- User analytics (Mixpanel)

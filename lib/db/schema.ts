// PostgreSQL Schema for GDLP Platform
// This file defines all database tables and relationships

export const userSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    profile_picture_url TEXT,
    date_of_birth DATE,
    address JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
  );

  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_phone ON users(phone_number);
`

export const deviceSchema = `
  CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- smartphone, laptop, tablet, appliance
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(255) UNIQUE,
    imei_number VARCHAR(20),
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(10, 2),
    device_status VARCHAR(50) DEFAULT 'active', -- active, inactive, disposed
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_devices_user_id ON devices(user_id);
  CREATE INDEX idx_devices_serial ON devices(serial_number);
`

export const warrantySchema = `
  CREATE TABLE IF NOT EXISTS warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    warranty_type VARCHAR(50) NOT NULL, -- manufacturer, extended, accidental
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coverage_details JSONB NOT NULL,
    terms_and_conditions TEXT,
    document_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    compliance_status VARCHAR(50) DEFAULT 'compliant', -- compliant, at_risk, violated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_warranties_device_id ON warranties(device_id);
  CREATE INDEX idx_warranties_end_date ON warranties(end_date);
`

export const repairServiceSchema = `
  CREATE TABLE IF NOT EXISTS repair_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    issue_description TEXT NOT NULL,
    issue_category VARCHAR(100) NOT NULL,
    repair_status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    estimated_completion_date TIMESTAMP,
    actual_completion_date TIMESTAMP,
    repair_cost DECIMAL(10, 2),
    parts_used JSONB,
    service_provider_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_repair_services_device_id ON repair_services(device_id);
  CREATE INDEX idx_repair_services_status ON repair_services(repair_status);
`

export const partAuthenticationSchema = `
  CREATE TABLE IF NOT EXISTS part_authentications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_name VARCHAR(255) NOT NULL,
    part_sku VARCHAR(100) UNIQUE NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    qr_code_data TEXT,
    barcode_data TEXT,
    hologram_id VARCHAR(255),
    serial_number VARCHAR(255),
    authentication_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, counterfeit, unverified
    verification_timestamp TIMESTAMP,
    verification_method VARCHAR(100),
    confidence_score DECIMAL(3, 2),
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    repair_service_id UUID REFERENCES repair_services(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_part_auth_sku ON part_authentications(part_sku);
  CREATE INDEX idx_part_auth_status ON part_authentications(authentication_status);
`

export const grievanceSchema = `
  CREATE TABLE IF NOT EXISTS grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    grievance_type VARCHAR(100) NOT NULL, -- warranty_denial, counterfeit_parts, service_quality, etc
    description TEXT NOT NULL,
    supporting_documents JSONB,
    grievance_status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, acknowledged, resolved, rejected
    government_portal_id VARCHAR(255),
    government_portal_type VARCHAR(50), -- INGRAM, NCH, etc
    submission_date TIMESTAMP,
    resolution_date TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_grievances_user_id ON grievances(user_id);
  CREATE INDEX idx_grievances_status ON grievances(grievance_status);
`

export const serviceProviderSchema = `
  CREATE TABLE IF NOT EXISTS service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- authorized, certified, independent
    email VARCHAR(255),
    phone_number VARCHAR(20),
    address JSONB NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    certification_details JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(3, 2),
    total_reviews INTEGER DEFAULT 0,
    average_repair_time_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_service_providers_location ON service_providers(latitude, longitude);
  CREATE INDEX idx_service_providers_verified ON service_providers(is_verified);
`

export const repairBookingSchema = `
  CREATE TABLE IF NOT EXISTS repair_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    service_provider_id UUID NOT NULL REFERENCES service_providers(id),
    booking_date TIMESTAMP NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    estimated_completion_date TIMESTAMP,
    actual_completion_date TIMESTAMP,
    booking_status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, in_progress, completed, cancelled
    pickup_required BOOLEAN DEFAULT FALSE,
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_repair_bookings_user_id ON repair_bookings(user_id);
  CREATE INDEX idx_repair_bookings_status ON repair_bookings(booking_status);
`

export const documentVaultSchema = `
  CREATE TABLE IF NOT EXISTS document_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    document_type VARCHAR(100) NOT NULL, -- invoice, warranty, receipt, service_record
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(50),
    extracted_data JSONB,
    ocr_confidence DECIMAL(3, 2),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_document_vault_user_id ON document_vault(user_id);
  CREATE INDEX idx_document_vault_type ON document_vault(document_type);
`

export const notificationSchema = `
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL, -- warranty_expiry, repair_update, grievance_status
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_id UUID,
    related_entity_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_notifications_user_id ON notifications(user_id);
  CREATE INDEX idx_notifications_is_read ON notifications(is_read);
`

export const analyticsSchema = `
  CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    session_id VARCHAR(255),
    device_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
  CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
  CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
`

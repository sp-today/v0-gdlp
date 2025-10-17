-- GDLP Database Schema
-- Guardian Device Lifecycle Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  user_type TEXT CHECK (user_type IN ('consumer', 'repair_center', 'oem', 'admin')),
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. DEVICES & WARRANTY MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT UNIQUE,
  imei_number TEXT,
  purchase_date DATE NOT NULL,
  purchase_price DECIMAL(10, 2),
  warranty_start_date DATE,
  warranty_end_date DATE,
  warranty_type TEXT CHECK (warranty_type IN ('manufacturer', 'extended', 'third_party')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devices_select_own" ON public.devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "devices_insert_own" ON public.devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "devices_update_own" ON public.devices FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 3. WARRANTY DOCUMENTS (Warranty Guardian)
-- ============================================

CREATE TABLE IF NOT EXISTS public.warranty_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'warranty_card', 'receipt', 'certificate')),
  document_url TEXT NOT NULL,
  ocr_extracted_text TEXT,
  document_status TEXT DEFAULT 'verified' CHECK (document_status IN ('pending', 'verified', 'rejected')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.warranty_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "warranty_documents_select" ON public.warranty_documents FOR SELECT 
  USING (device_id IN (SELECT id FROM public.devices WHERE user_id = auth.uid()));

-- ============================================
-- 4. WARRANTY CLAIMS
-- ============================================

CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('repair', 'replacement', 'refund')),
  issue_description TEXT NOT NULL,
  claim_status TEXT DEFAULT 'submitted' CHECK (claim_status IN ('submitted', 'under_review', 'approved', 'rejected', 'completed')),
  claim_amount DECIMAL(10, 2),
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolution_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "warranty_claims_select_own" ON public.warranty_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "warranty_claims_insert_own" ON public.warranty_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. REPAIR GUIDES (Vernacular Fix Hub)
-- ============================================

CREATE TABLE IF NOT EXISTS public.repair_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  issue_category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps JSONB NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  estimated_time_minutes INTEGER,
  tools_required TEXT[],
  language TEXT DEFAULT 'en',
  video_url TEXT,
  success_rate DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.repair_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "repair_guides_select_all" ON public.repair_guides FOR SELECT USING (TRUE);

-- ============================================
-- 6. PARTS & AUTHENTICITY (Part Authenticity Network)
-- ============================================

CREATE TABLE IF NOT EXISTS public.spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name TEXT NOT NULL,
  part_number TEXT UNIQUE NOT NULL,
  device_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  gs1_code TEXT UNIQUE,
  manufacturer TEXT NOT NULL,
  price DECIMAL(10, 2),
  is_genuine BOOLEAN DEFAULT TRUE,
  authenticity_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spare_parts_select_all" ON public.spare_parts FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS public.part_authenticity_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES public.spare_parts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gs1_scan_result JSONB,
  verification_status TEXT CHECK (verification_status IN ('authentic', 'counterfeit', 'unknown')),
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.part_authenticity_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "part_checks_select_own" ON public.part_authenticity_checks FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 7. REPAIR SERVICES & BOOKING (Predictive Service-Connect)
-- ============================================

CREATE TABLE IF NOT EXISTS public.repair_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  center_name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  rating DECIMAL(3, 2),
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  specializations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.repair_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "repair_centers_select_all" ON public.repair_centers FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS public.repair_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  repair_center_id UUID NOT NULL REFERENCES public.repair_centers(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  issue_description TEXT NOT NULL,
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  booking_status TEXT DEFAULT 'scheduled' CHECK (booking_status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  predicted_completion_date DATE,
  actual_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.repair_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "repair_bookings_select_own" ON public.repair_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "repair_bookings_insert_own" ON public.repair_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. GRIEVANCES (Grievance Automation Hub)
-- ============================================

CREATE TABLE IF NOT EXISTS public.grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  grievance_type TEXT NOT NULL CHECK (grievance_type IN ('warranty_denial', 'poor_service', 'counterfeit_parts', 'billing_issue', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  grievance_status TEXT DEFAULT 'submitted' CHECK (grievance_status IN ('submitted', 'acknowledged', 'under_investigation', 'resolved', 'rejected')),
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  ai_generated_complaint TEXT,
  government_portal_reference TEXT,
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolution_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grievances_select_own" ON public.grievances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "grievances_insert_own" ON public.grievances FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 9. NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 10. ANALYTICS & METRICS
-- ============================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_events_insert_own" ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_devices_user_id ON public.devices(user_id);
CREATE INDEX idx_warranty_claims_user_id ON public.warranty_claims(user_id);
CREATE INDEX idx_warranty_claims_device_id ON public.warranty_claims(device_id);
CREATE INDEX idx_repair_bookings_user_id ON public.repair_bookings(user_id);
CREATE INDEX idx_repair_bookings_device_id ON public.repair_bookings(device_id);
CREATE INDEX idx_grievances_user_id ON public.grievances(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_repair_guides_device_type ON public.repair_guides(device_type, brand, model);
CREATE INDEX idx_spare_parts_gs1 ON public.spare_parts(gs1_code);

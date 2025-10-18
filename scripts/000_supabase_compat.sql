-- Lightweight Supabase compatibility shim for local development
-- Creates minimal auth schema and users table and a stub auth.uid() function

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  encrypted_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stub function auth.uid() used by policies. Returns NULL by default.
-- In production Supabase this returns the current user's UUID.
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT NULL::uuid;
$$;

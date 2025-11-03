-- Add comprehensive registration fields to registrations table
-- This migration adds all the fields needed for comprehensive student registration

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS name_with_initials text,
  ADD COLUMN IF NOT EXISTS nic text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS permanent_address text,
  ADD COLUMN IF NOT EXISTS mobile_number text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship text,
  ADD COLUMN IF NOT EXISTS emergency_contact_mobile text,
  ADD COLUMN IF NOT EXISTS ol_qualifications text,
  ADD COLUMN IF NOT EXISTS al_qualifications text,
  ADD COLUMN IF NOT EXISTS other_qualifications text,
  ADD COLUMN IF NOT EXISTS nic_document_url text,
  ADD COLUMN IF NOT EXISTS birth_certificate_url text,
  ADD COLUMN IF NOT EXISTS qualification_certificate_url text;

-- Rename email field mapping (full_name already exists)
-- Update phone to mobile_number reference (phone field will still work for compatibility)
-- Update address to permanent_address reference (address field will still work for compatibility)

-- Create index for NIC lookups
CREATE INDEX IF NOT EXISTS idx_registrations_nic ON registrations(nic);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- Add comment to table
COMMENT ON TABLE registrations IS 'Comprehensive student registration data including personal info, contact details, qualifications, and document uploads';

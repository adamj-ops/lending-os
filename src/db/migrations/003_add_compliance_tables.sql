-- Migration 003: Add Compliance Domain Tables
-- Phase 3: Compliance Foundation
--
-- Creates tables for:
-- - Document Signatures (e-signature tracking)
-- - Document Templates
-- - KYC Verifications
-- - KYC Documents
-- - Compliance Filings
-- - Licenses
-- - Audit Logs
-- - Compliance Rules

-- Create enums
DO $$ BEGIN
  CREATE TYPE compliance_document_type_enum AS ENUM ('loan_agreement', 'ppm', 'subscription_agreement', 'compliance_disclosure', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE signature_status_enum AS ENUM ('draft', 'sent', 'viewed', 'signed', 'completed', 'declined', 'voided');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE signature_provider_enum AS ENUM ('docusign', 'dropbox_sign', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE kyc_status_enum AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'requires_review');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE kyc_provider_enum AS ENUM ('persona', 'onfido', 'sumsub', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE filing_status_enum AS ENUM ('pending', 'submitted', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE license_status_enum AS ENUM ('active', 'expired', 'pending', 'revoked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Document Signatures Table
CREATE TABLE IF NOT EXISTS document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  document_type compliance_document_type_enum NOT NULL,
  document_id UUID,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
  
  provider signature_provider_enum NOT NULL DEFAULT 'docusign',
  envelope_id TEXT NOT NULL,
  status signature_status_enum NOT NULL DEFAULT 'draft',
  
  signers JSONB NOT NULL,
  
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  document_url TEXT,
  signed_document_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS document_signatures_document_id_idx ON document_signatures(document_id);
CREATE INDEX IF NOT EXISTS document_signatures_envelope_id_idx ON document_signatures(envelope_id);
CREATE INDEX IF NOT EXISTS document_signatures_status_idx ON document_signatures(status);
CREATE INDEX IF NOT EXISTS document_signatures_loan_id_idx ON document_signatures(loan_id);
CREATE INDEX IF NOT EXISTS document_signatures_fund_id_idx ON document_signatures(fund_id);

-- Document Templates Table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  type compliance_document_type_enum NOT NULL,
  description TEXT,
  
  provider_template_id TEXT,
  content JSONB,
  variables JSONB,
  
  is_active TEXT NOT NULL DEFAULT 'true',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS document_templates_organization_id_idx ON document_templates(organization_id);
CREATE INDEX IF NOT EXISTS document_templates_type_idx ON document_templates(type);

-- KYC Verifications Table
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  borrower_id UUID REFERENCES borrowers(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  
  provider kyc_provider_enum NOT NULL DEFAULT 'persona',
  verification_id TEXT NOT NULL,
  status kyc_status_enum NOT NULL DEFAULT 'pending',
  
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  result JSONB,
  
  review_notes TEXT,
  reviewed_by TEXT REFERENCES app_users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS kyc_verifications_borrower_id_idx ON kyc_verifications(borrower_id);
CREATE INDEX IF NOT EXISTS kyc_verifications_verification_id_idx ON kyc_verifications(verification_id);
CREATE INDEX IF NOT EXISTS kyc_verifications_status_idx ON kyc_verifications(status);

-- KYC Documents Table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES kyc_verifications(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  file_url TEXT NOT NULL,
  
  provider_document_id TEXT,
  
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS kyc_documents_verification_id_idx ON kyc_documents(verification_id);

-- Compliance Filings Table
CREATE TABLE IF NOT EXISTS compliance_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  filing_type TEXT NOT NULL,
  filing_name TEXT NOT NULL,
  description TEXT,
  
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  submitted_date TIMESTAMP WITH TIME ZONE,
  status filing_status_enum NOT NULL DEFAULT 'pending',
  
  document_id UUID,
  filing_number TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS compliance_filings_organization_id_idx ON compliance_filings(organization_id);
CREATE INDEX IF NOT EXISTS compliance_filings_due_date_idx ON compliance_filings(due_date);
CREATE INDEX IF NOT EXISTS compliance_filings_status_idx ON compliance_filings(status);

-- Licenses Table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  license_type TEXT NOT NULL,
  license_number TEXT NOT NULL,
  issuer TEXT NOT NULL,
  
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status license_status_enum NOT NULL DEFAULT 'active',
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS licenses_organization_id_idx ON licenses(organization_id);
CREATE INDEX IF NOT EXISTS licenses_expiration_date_idx ON licenses(expiration_date);
CREATE INDEX IF NOT EXISTS licenses_status_idx ON licenses(status);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  user_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  
  changes JSONB,
  
  ip_address TEXT,
  user_agent TEXT,
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_organization_id_idx ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);

-- Compliance Rules Table
CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  rule_type TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  description TEXT,
  
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  
  enabled TEXT NOT NULL DEFAULT 'true',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS compliance_rules_organization_id_idx ON compliance_rules(organization_id);
CREATE INDEX IF NOT EXISTS compliance_rules_rule_type_idx ON compliance_rules(rule_type);

-- Add comments
COMMENT ON TABLE document_signatures IS 'Tracks e-signature envelopes and their status';
COMMENT ON TABLE document_templates IS 'Reusable document templates for compliance workflows';
COMMENT ON TABLE kyc_verifications IS 'KYC/AML verification requests and results';
COMMENT ON TABLE kyc_documents IS 'Documents uploaded for KYC verification';
COMMENT ON TABLE compliance_filings IS 'Regulatory filing records and deadlines';
COMMENT ON TABLE licenses IS 'Lender licenses and permits tracking';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for compliance';
COMMENT ON TABLE compliance_rules IS 'Configurable compliance automation rules';

-- Migration complete
SELECT 'Migration 003 complete - Compliance domain tables created' AS status;



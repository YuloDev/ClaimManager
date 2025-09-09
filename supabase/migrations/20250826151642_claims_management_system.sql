-- Location: supabase/migrations/20250826151642_claims_management_system.sql
-- Schema Analysis: Existing financial system with user_profiles, extending with claims management
-- Integration Type: NEW_MODULE - Claims Management System
-- Dependencies: user_profiles (existing table)

-- 1. Types and Enums for Claims Management
CREATE TYPE public.claim_status AS ENUM (
    'draft', 
    'submitted', 
    'under_review', 
    'pending_documents', 
    'pre_approved', 
    'approved', 
    'rejected', 
    'paid', 
    'closed'
);

CREATE TYPE public.document_type AS ENUM (
    'medical_report', 
    'invoice', 
    'prescription', 
    'id_document', 
    'proof_of_payment', 
    'discharge_summary', 
    'lab_results', 
    'other'
);

CREATE TYPE public.provider_type AS ENUM (
    'hospital', 
    'clinic', 
    'pharmacy', 
    'laboratory', 
    'specialist', 
    'general_practitioner'
);

CREATE TYPE public.plan_type AS ENUM (
    'basic', 
    'standard', 
    'premium', 
    'family', 
    'individual'
);

-- 2. Core Tables for Claims Management

-- Insurance Plans Table
CREATE TABLE public.insurance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type public.plan_type NOT NULL,
    coverage_limit DECIMAL(12,2),
    deductible DECIMAL(10,2) DEFAULT 0,
    copay_percentage DECIMAL(5,2) DEFAULT 0,
    waiting_periods JSONB DEFAULT '{}',
    coverage_rules JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Healthcare Providers Table
CREATE TABLE public.healthcare_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type public.provider_type NOT NULL,
    license_number TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    specialties TEXT[],
    is_network_provider BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Patient Profiles Table (extends user system for claim management)
CREATE TABLE public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    member_id TEXT UNIQUE NOT NULL,
    plan_id UUID REFERENCES public.insurance_plans(id) ON DELETE SET NULL,
    date_of_birth DATE,
    gender TEXT,
    phone TEXT,
    address TEXT,
    emergency_contact JSONB,
    medical_conditions TEXT[],
    allergies TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Claims Table (Main entity)
CREATE TABLE public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.healthcare_providers(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.insurance_plans(id) ON DELETE SET NULL,
    status public.claim_status DEFAULT 'draft',
    service_date DATE NOT NULL,
    submission_date TIMESTAMPTZ,
    diagnosis_codes TEXT[],
    procedure_codes TEXT[],
    claimed_amount DECIMAL(12,2) NOT NULL,
    approved_amount DECIMAL(12,2) DEFAULT 0,
    copay_amount DECIMAL(10,2) DEFAULT 0,
    deductible_amount DECIMAL(10,2) DEFAULT 0,
    net_payable DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    rejection_reason TEXT,
    processed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Claim Documents Table
CREATE TABLE public.claim_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
    document_type public.document_type NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_validated BOOLEAN DEFAULT false,
    validation_notes TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Claim History/Audit Trail Table
CREATE TABLE public.claim_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
    status_from public.claim_status,
    status_to public.claim_status NOT NULL,
    changed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    notes TEXT,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Provider Networks Table (for network management)
CREATE TABLE public.provider_networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.healthcare_providers(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.insurance_plans(id) ON DELETE CASCADE,
    contract_start_date DATE,
    contract_end_date DATE,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes for Performance
CREATE INDEX idx_claims_patient_id ON public.claims(patient_id);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_service_date ON public.claims(service_date);
CREATE INDEX idx_claims_claim_number ON public.claims(claim_number);
CREATE INDEX idx_patient_profiles_user_id ON public.patient_profiles(user_id);
CREATE INDEX idx_patient_profiles_member_id ON public.patient_profiles(member_id);
CREATE INDEX idx_claim_documents_claim_id ON public.claim_documents(claim_id);
CREATE INDEX idx_claim_history_claim_id ON public.claim_history(claim_id);
CREATE INDEX idx_provider_networks_provider_plan ON public.provider_networks(provider_id, plan_id);

-- 4. Storage Bucket for Claim Documents (Private Storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'claim-documents',
    'claim-documents',
    false,
    10485760, -- 10MB limit per document
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- 5. Functions (Create before RLS policies)
CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get current count and increment
    SELECT COALESCE(MAX(SUBSTRING(claim_number FROM 4)::INTEGER), 0) + 1
    INTO counter
    FROM public.claims
    WHERE claim_number LIKE 'CLM%';
    
    -- Format: CLM + 6-digit padded number
    new_number := 'CLM' || LPAD(counter::TEXT, 6, '0');
    
    RETURN new_number;
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback to timestamp-based number
        RETURN 'CLM' || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
END;
$$;

-- Function to calculate claim amounts
CREATE OR REPLACE FUNCTION public.calculate_claim_amounts(
    claim_uuid UUID,
    claimed_amt DECIMAL(12,2),
    plan_uuid UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    plan_info RECORD;
    copay_amt DECIMAL(10,2) := 0;
    deductible_amt DECIMAL(10,2) := 0;
    approved_amt DECIMAL(12,2) := 0;
    net_amt DECIMAL(12,2) := 0;
BEGIN
    -- Get plan details
    SELECT coverage_limit, deductible, copay_percentage
    INTO plan_info
    FROM public.insurance_plans
    WHERE id = plan_uuid;
    
    -- Calculate amounts based on plan rules
    IF plan_info IS NOT NULL THEN
        -- Apply coverage limit
        approved_amt := LEAST(claimed_amt, plan_info.coverage_limit);
        
        -- Calculate deductible (simplified - could be more complex)
        deductible_amt := LEAST(approved_amt, plan_info.deductible);
        
        -- Calculate copay
        copay_amt := (approved_amt * plan_info.copay_percentage / 100);
        
        -- Calculate net payable
        net_amt := approved_amt - deductible_amt - copay_amt;
        net_amt := GREATEST(net_amt, 0); -- Ensure non-negative
    END IF;
    
    result := jsonb_build_object(
        'approved_amount', approved_amt,
        'copay_amount', copay_amt,
        'deductible_amount', deductible_amt,
        'net_payable', net_amt
    );
    
    RETURN result;
END;
$$;

-- Trigger function for claim number generation
CREATE OR REPLACE FUNCTION public.set_claim_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
        NEW.claim_number := public.generate_claim_number();
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger function for claim history tracking
CREATE OR REPLACE FUNCTION public.track_claim_status_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only track status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.claim_history (
            claim_id,
            status_from,
            status_to,
            changed_by,
            notes
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NEW.processed_by,
            CASE 
                WHEN NEW.status = 'rejected' THEN NEW.rejection_reason
                ELSE 'Status updated'
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- 6. Enable RLS on all tables
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_networks ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies Using Correct Patterns

-- Pattern 6B: Role-based access for insurance plans (admin/manager only)
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = required_role
)
$$;

-- Insurance Plans - Only admin/manager can manage
CREATE POLICY "admin_manager_full_access_insurance_plans"
ON public.insurance_plans
FOR ALL
TO authenticated
USING (public.has_role('admin') OR public.has_role('manager'))
WITH CHECK (public.has_role('admin') OR public.has_role('manager'));

-- Healthcare Providers - Admin/manager manage, all authenticated can view
CREATE POLICY "admin_manager_manage_providers"
ON public.healthcare_providers
FOR ALL
TO authenticated
USING (public.has_role('admin') OR public.has_role('manager'))
WITH CHECK (public.has_role('admin') OR public.has_role('manager'));

CREATE POLICY "authenticated_view_providers"
ON public.healthcare_providers
FOR SELECT
TO authenticated
USING (true);

-- Patient Profiles - Users manage their own, admin/manager see all
CREATE POLICY "users_manage_own_patient_profiles"
ON public.patient_profiles
FOR ALL
TO authenticated
USING (
    user_id = auth.uid() OR 
    public.has_role('admin') OR 
    public.has_role('manager')
)
WITH CHECK (
    user_id = auth.uid() OR 
    public.has_role('admin') OR 
    public.has_role('manager')
);

-- Claims - Complex access pattern
CREATE OR REPLACE FUNCTION public.can_access_claim(claim_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.claims c
    JOIN public.patient_profiles pp ON c.patient_id = pp.id
    WHERE c.id = claim_uuid 
    AND (
        pp.user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role IN ('admin', 'manager', 'analyst')
        )
    )
)
$$;

CREATE POLICY "claim_access_control"
ON public.claims
FOR ALL
TO authenticated
USING (public.can_access_claim(id))
WITH CHECK (public.can_access_claim(id));

-- Claim Documents - Same as claims access
CREATE OR REPLACE FUNCTION public.can_access_claim_documents(doc_claim_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT public.can_access_claim(doc_claim_id)
$$;

CREATE POLICY "claim_documents_access_control"
ON public.claim_documents
FOR ALL
TO authenticated
USING (public.can_access_claim_documents(claim_id))
WITH CHECK (public.can_access_claim_documents(claim_id));

-- Claim History - Same as claims access
CREATE POLICY "claim_history_access_control"
ON public.claim_history
FOR ALL
TO authenticated
USING (public.can_access_claim(claim_id))
WITH CHECK (public.can_access_claim(claim_id));

-- Provider Networks - Admin/manager only
CREATE POLICY "admin_manager_provider_networks"
ON public.provider_networks
FOR ALL
TO authenticated
USING (public.has_role('admin') OR public.has_role('manager'))
WITH CHECK (public.has_role('admin') OR public.has_role('manager'));

-- 8. Storage RLS Policies for Claim Documents
-- Pattern 1: Private user storage with role-based access
CREATE POLICY "users_and_staff_view_claim_documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'claim-documents' 
    AND (
        owner = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role IN ('admin', 'manager', 'analyst')
        )
    )
);

CREATE POLICY "users_upload_claim_documents" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'claim-documents' 
    AND owner = auth.uid()
);

CREATE POLICY "users_and_staff_manage_claim_documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'claim-documents' 
    AND (
        owner = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role IN ('admin', 'manager')
        )
    )
)
WITH CHECK (
    bucket_id = 'claim-documents' 
    AND (
        owner = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role IN ('admin', 'manager')
        )
    )
);

CREATE POLICY "users_and_staff_delete_claim_documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'claim-documents' 
    AND (
        owner = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role IN ('admin', 'manager')
        )
    )
);

-- 9. Triggers
CREATE TRIGGER set_claim_number_trigger
    BEFORE INSERT ON public.claims
    FOR EACH ROW EXECUTE FUNCTION public.set_claim_number();

CREATE TRIGGER track_claim_status_trigger
    AFTER UPDATE ON public.claims
    FOR EACH ROW EXECUTE FUNCTION public.track_claim_status_changes();

-- 10. Mock Data for Claims Management
DO $$
DECLARE
    admin_user_id UUID;
    member_user_id UUID;
    plan1_id UUID := gen_random_uuid();
    plan2_id UUID := gen_random_uuid();
    provider1_id UUID := gen_random_uuid();
    provider2_id UUID := gen_random_uuid();
    patient1_id UUID := gen_random_uuid();
    patient2_id UUID := gen_random_uuid();
    claim1_id UUID := gen_random_uuid();
    claim2_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user IDs
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO member_user_id FROM public.user_profiles WHERE role = 'member' LIMIT 1;
    
    -- If no users exist, create placeholder notice
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No admin user found. Please create user profiles first.';
        RETURN;
    END IF;
    
    -- Create Insurance Plans
    INSERT INTO public.insurance_plans (id, name, type, coverage_limit, deductible, copay_percentage, created_by) VALUES
        (plan1_id, 'Basic Health Plan', 'basic', 50000.00, 1000.00, 20.0, admin_user_id),
        (plan2_id, 'Premium Family Plan', 'premium', 200000.00, 500.00, 10.0, admin_user_id);
    
    -- Create Healthcare Providers
    INSERT INTO public.healthcare_providers (id, name, type, license_number, address, phone, specialties, is_network_provider) VALUES
        (provider1_id, 'City General Hospital', 'hospital', 'HOS-2024-001', '123 Healthcare Ave, Medical District', '+1-555-0123', ARRAY['Emergency Care', 'Surgery', 'Internal Medicine'], true),
        (provider2_id, 'MedCare Clinic', 'clinic', 'CLI-2024-045', '456 Wellness St, Downtown', '+1-555-0456', ARRAY['General Practice', 'Pediatrics'], true);
    
    -- Create Patient Profiles (if we have member users)
    IF member_user_id IS NOT NULL THEN
        INSERT INTO public.patient_profiles (id, user_id, member_id, plan_id, date_of_birth, gender, phone, address) VALUES
            (patient1_id, member_user_id, 'MEM-2024-001', plan1_id, '1985-03-15', 'M', '+1-555-0789', '789 Patient Lane, Suburb'),
            (patient2_id, admin_user_id, 'MEM-2024-002', plan2_id, '1990-07-22', 'F', '+1-555-0987', '321 Admin Street, Downtown');
        
        -- Create Sample Claims
        INSERT INTO public.claims (id, patient_id, provider_id, plan_id, service_date, diagnosis_codes, procedure_codes, claimed_amount, status) VALUES
            (claim1_id, patient1_id, provider1_id, plan1_id, CURRENT_DATE - INTERVAL '7 days', ARRAY['Z00.00'], ARRAY['99213'], 150.00, 'submitted'),
            (claim2_id, patient2_id, provider2_id, plan2_id, CURRENT_DATE - INTERVAL '3 days', ARRAY['M79.3'], ARRAY['99214', '73060'], 350.00, 'under_review');
        
        -- Create Provider Networks
        INSERT INTO public.provider_networks (provider_id, plan_id, contract_start_date, contract_end_date, discount_percentage) VALUES
            (provider1_id, plan1_id, CURRENT_DATE - INTERVAL '1 year', CURRENT_DATE + INTERVAL '2 years', 15.0),
            (provider2_id, plan2_id, CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '1.5 years', 12.0);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END $$;

-- 11. Cleanup Function
CREATE OR REPLACE FUNCTION public.cleanup_claims_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete in dependency order
    DELETE FROM public.claim_history WHERE claim_id IN (
        SELECT id FROM public.claims WHERE claim_number LIKE 'CLM%'
    );
    DELETE FROM public.claim_documents WHERE claim_id IN (
        SELECT id FROM public.claims WHERE claim_number LIKE 'CLM%'
    );
    DELETE FROM public.provider_networks WHERE created_at > CURRENT_DATE - INTERVAL '1 day';
    DELETE FROM public.claims WHERE claim_number LIKE 'CLM%';
    DELETE FROM public.patient_profiles WHERE member_id LIKE 'MEM-2024-%';
    DELETE FROM public.healthcare_providers WHERE name LIKE '%General Hospital%' OR name LIKE '%MedCare%';
    DELETE FROM public.insurance_plans WHERE name LIKE '%Health Plan%' OR name LIKE '%Family Plan%';
    
    RAISE NOTICE 'Claims test data cleanup completed';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;
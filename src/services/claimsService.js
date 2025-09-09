import { supabase } from '../lib/supabase';

export const claimsService = {
  // Fetch all claims with related data
  async getClaims(filters = {}) {
    try {
      let query = supabase?.from('claims')?.select(`
          *,
          patient:patient_profiles(
            id,
            member_id,
            user_id,
            user:user_profiles(full_name, email),
            plan:insurance_plans(name, type)
          ),
          provider:healthcare_providers(name, type),
          plan:insurance_plans(name, type)
        `)?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }
      
      if (filters?.patientId) {
        query = query?.eq('patient_id', filters?.patientId);
      }
      
      if (filters?.providerId) {
        query = query?.eq('provider_id', filters?.providerId);
      }
      
      if (filters?.dateFrom) {
        query = query?.gte('service_date', filters?.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query?.lte('service_date', filters?.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Get a single claim with full details
  async getClaimById(claimId) {
    try {
      const { data, error } = await supabase?.from('claims')?.select(`
          *,
          patient:patient_profiles(
            *,
            user:user_profiles(full_name, email),
            plan:insurance_plans(*)
          ),
          provider:healthcare_providers(*),
          plan:insurance_plans(*),
          documents:claim_documents(*),
          history:claim_history(
            *,
            changed_by_user:user_profiles(full_name)
          )
        `)?.eq('id', claimId)?.single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Create a new claim
  async createClaim(claimData) {
    try {
      const { data, error } = await supabase?.from('claims')?.insert([{
          patient_id: claimData?.patient_id,
          provider_id: claimData?.provider_id,
          plan_id: claimData?.plan_id,
          service_date: claimData?.service_date,
          diagnosis_codes: claimData?.diagnosis_codes || [],
          procedure_codes: claimData?.procedure_codes || [],
          claimed_amount: claimData?.claimed_amount,
          notes: claimData?.notes || '',
          status: 'draft'
        }])?.select()?.single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Update claim status and details
  async updateClaim(claimId, updates) {
    try {
      const { data, error } = await supabase?.from('claims')?.update({
          ...updates,
          updated_at: new Date()?.toISOString(),
          ...(updates?.status && { processed_at: new Date()?.toISOString() })
        })?.eq('id', claimId)?.select()?.single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Submit claim for processing
  async submitClaim(claimId) {
    try {
      const { data, error } = await supabase?.from('claims')?.update({
          status: 'submitted',
          submission_date: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        })?.eq('id', claimId)?.select()?.single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Process claim (approve/reject)
  async processClaim(claimId, processData) {
    try {
      const updates = {
        status: processData?.status,
        processed_by: processData?.processed_by,
        processed_at: new Date()?.toISOString(),
        updated_at: new Date()?.toISOString()
      };

      if (processData?.status === 'approved') {
        updates.approved_amount = processData?.approved_amount;
        updates.copay_amount = processData?.copay_amount;
        updates.deductible_amount = processData?.deductible_amount;
        updates.net_payable = processData?.net_payable;
      } else if (processData?.status === 'rejected') {
        updates.rejection_reason = processData?.rejection_reason;
      }

      const { data, error } = await supabase?.from('claims')?.update(updates)?.eq('id', claimId)?.select()?.single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Get claim analytics
  async getClaimsAnalytics(filters = {}) {
    try {
      let query = supabase?.from('claims')?.select('*');
      
      if (filters?.dateFrom) {
        query = query?.gte('service_date', filters?.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query?.lte('service_date', filters?.dateTo);
      }

      const { data: claims, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Calculate analytics
      const analytics = {
        total_claims: claims?.length || 0,
        total_claimed_amount: claims?.reduce((sum, claim) => sum + (parseFloat(claim?.claimed_amount) || 0), 0) || 0,
        total_approved_amount: claims?.reduce((sum, claim) => sum + (parseFloat(claim?.approved_amount) || 0), 0) || 0,
        by_status: {},
        by_month: {},
        avg_processing_time: 0
      };

      // Group by status
      claims?.forEach(claim => {
        analytics.by_status[claim.status] = (analytics?.by_status?.[claim?.status] || 0) + 1;
      });

      // Group by month
      claims?.forEach(claim => {
        const month = new Date(claim.service_date)?.toISOString()?.slice(0, 7);
        analytics.by_month[month] = (analytics?.by_month?.[month] || 0) + 1;
      });

      return analytics;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  }
};

export default claimsService;
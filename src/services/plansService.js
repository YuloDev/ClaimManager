import { supabase } from '../lib/supabase';

export const plansService = {
  // Get all insurance plans
  async getPlans() {
    try {
      const { data, error } = await supabase?.from('insurance_plans')?.select(`
          *,
          created_by_user:user_profiles(full_name)
        `)?.eq('is_active', true)?.order('name', { ascending: true });

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

  // Get plan by ID with network providers
  async getPlanById(planId) {
    try {
      const { data, error } = await supabase?.from('insurance_plans')?.select(`
          *,
          created_by_user:user_profiles(full_name),
          networks:provider_networks(
            *,
            provider:healthcare_providers(name, type, specialties)
          ),
          patients:patient_profiles(
            id,
            member_id,
            user:user_profiles(full_name)
          )
        `)?.eq('id', planId)?.single();

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

  // Create insurance plan
  async createPlan(planData) {
    try {
      const { data, error } = await supabase?.from('insurance_plans')?.insert([{
          name: planData?.name,
          type: planData?.type,
          coverage_limit: planData?.coverage_limit,
          deductible: planData?.deductible || 0,
          copay_percentage: planData?.copay_percentage || 0,
          waiting_periods: planData?.waiting_periods || {},
          coverage_rules: planData?.coverage_rules || {},
          created_by: planData?.created_by
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

  // Update insurance plan
  async updatePlan(planId, updates) {
    try {
      const { data, error } = await supabase?.from('insurance_plans')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', planId)?.select()?.single();

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

  // Deactivate plan
  async deactivatePlan(planId) {
    try {
      const { data, error } = await supabase?.from('insurance_plans')?.update({ 
          is_active: false,
          updated_at: new Date()?.toISOString()
        })?.eq('id', planId)?.select()?.single();

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

  // Get plan types for dropdown
  getPlanTypes() {
    return [
      { value: 'basic', label: 'Basic Plan' },
      { value: 'standard', label: 'Standard Plan' },
      { value: 'premium', label: 'Premium Plan' },
      { value: 'family', label: 'Family Plan' },
      { value: 'individual', label: 'Individual Plan' }
    ];
  },

  // Calculate coverage for a given amount
  async calculateCoverage(planId, claimedAmount) {
    try {
      // Get plan details
      const { data: plan, error } = await supabase?.from('insurance_plans')?.select('coverage_limit, deductible, copay_percentage')?.eq('id', planId)?.single();

      if (error) {
        throw new Error(error.message);
      }

      if (!plan) {
        throw new Error('Plan not found');
      }

      // Calculate coverage amounts
      const coverageLimit = parseFloat(plan?.coverage_limit) || 0;
      const deductible = parseFloat(plan?.deductible) || 0;
      const copayPercentage = parseFloat(plan?.copay_percentage) || 0;
      
      const claimedAmt = parseFloat(claimedAmount) || 0;
      
      // Apply coverage limit
      const approvedAmount = Math.min(claimedAmt, coverageLimit);
      
      // Calculate deductible (simplified)
      const deductibleAmount = Math.min(approvedAmount, deductible);
      
      // Calculate copay
      const copayAmount = (approvedAmount * copayPercentage) / 100;
      
      // Calculate net payable
      const netPayable = Math.max(approvedAmount - deductibleAmount - copayAmount, 0);

      return {
        claimed_amount: claimedAmt,
        approved_amount: approvedAmount,
        deductible_amount: deductibleAmount,
        copay_amount: copayAmount,
        net_payable: netPayable,
        coverage_percentage: claimedAmt > 0 ? (netPayable / claimedAmt) * 100 : 0
      };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Get plan statistics
  async getPlanStats() {
    try {
      const { data: plans, error: plansError } = await supabase?.from('insurance_plans')?.select('type, coverage_limit, created_at');

      if (plansError) {
        throw new Error(plansError.message);
      }

      // Get patient counts per plan
      const { data: patients, error: patientsError } = await supabase?.from('patient_profiles')?.select('plan_id')?.eq('is_active', true);

      if (patientsError) {
        throw new Error(patientsError.message);
      }

      const stats = {
        total_plans: plans?.length || 0,
        by_type: {},
        patient_counts: {},
        avg_coverage: 0
      };

      // Group plans by type
      plans?.forEach(plan => {
        stats.by_type[plan.type] = (stats?.by_type?.[plan?.type] || 0) + 1;
      });

      // Count patients per plan
      patients?.forEach(patient => {
        if (patient?.plan_id) {
          stats.patient_counts[patient.plan_id] = (stats?.patient_counts?.[patient?.plan_id] || 0) + 1;
        }
      });

      // Calculate average coverage
      const totalCoverage = plans?.reduce((sum, plan) => 
        sum + (parseFloat(plan?.coverage_limit) || 0), 0) || 0;
      stats.avg_coverage = plans?.length > 0 ? totalCoverage / plans?.length : 0;

      return stats;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Search plans by name or type
  async searchPlans(searchTerm) {
    try {
      const { data, error } = await supabase?.from('insurance_plans')?.select('*')?.or(`name.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`)?.eq('is_active', true)?.limit(20);

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

  // Get plan utilization data
  async getPlanUtilization(planId, filters = {}) {
    try {
      let query = supabase?.from('claims')?.select('claimed_amount, approved_amount, service_date, status')?.eq('plan_id', planId);

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

      const utilization = {
        total_claims: claims?.length || 0,
        total_claimed: claims?.reduce((sum, claim) => sum + (parseFloat(claim?.claimed_amount) || 0), 0) || 0,
        total_approved: claims?.reduce((sum, claim) => sum + (parseFloat(claim?.approved_amount) || 0), 0) || 0,
        by_status: {},
        monthly_trend: {}
      };

      // Group by status
      claims?.forEach(claim => {
        utilization.by_status[claim.status] = (utilization?.by_status?.[claim?.status] || 0) + 1;
      });

      // Monthly trend
      claims?.forEach(claim => {
        const month = new Date(claim.service_date)?.toISOString()?.slice(0, 7);
        if (!utilization?.monthly_trend?.[month]) {
          utilization.monthly_trend[month] = { count: 0, amount: 0 };
        }
        utilization.monthly_trend[month].count += 1;
        utilization.monthly_trend[month].amount += parseFloat(claim?.claimed_amount) || 0;
      });

      return utilization;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  }
};

export default plansService;
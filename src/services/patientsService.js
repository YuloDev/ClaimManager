import { supabase } from '../lib/supabase';

export const patientsService = {
  // Get all patient profiles with user and plan info
  async getPatients() {
    try {
      const { data, error } = await supabase?.from('patient_profiles')?.select(`
          *,
          user:user_profiles(full_name, email, role),
          plan:insurance_plans(name, type, coverage_limit)
        `)?.eq('is_active', true)?.order('created_at', { ascending: false });

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

  // Get patient by ID with full details
  async getPatientById(patientId) {
    try {
      const { data, error } = await supabase?.from('patient_profiles')?.select(`
          *,
          user:user_profiles(*),
          plan:insurance_plans(*),
          claims:claims(
            id,
            claim_number,
            status,
            service_date,
            claimed_amount,
            approved_amount
          )
        `)?.eq('id', patientId)?.single();

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

  // Get patient by user ID
  async getPatientByUserId(userId) {
    try {
      const { data, error } = await supabase?.from('patient_profiles')?.select(`
          *,
          user:user_profiles(*),
          plan:insurance_plans(*)
        `)?.eq('user_id', userId)?.eq('is_active', true)?.single();

      if (error) {
        if (error?.code === 'PGRST116') {
          return null; // No patient profile found
        }
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

  // Create patient profile
  async createPatient(patientData) {
    try {
      const { data, error } = await supabase?.from('patient_profiles')?.insert([{
          user_id: patientData?.user_id,
          member_id: patientData?.member_id,
          plan_id: patientData?.plan_id,
          date_of_birth: patientData?.date_of_birth,
          gender: patientData?.gender,
          phone: patientData?.phone,
          address: patientData?.address,
          emergency_contact: patientData?.emergency_contact || {},
          medical_conditions: patientData?.medical_conditions || [],
          allergies: patientData?.allergies || []
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

  // Update patient profile
  async updatePatient(patientId, updates) {
    try {
      const { data, error } = await supabase?.from('patient_profiles')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', patientId)?.select()?.single();

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

  // Deactivate patient (soft delete)
  async deactivatePatient(patientId) {
    try {
      const { data, error } = await supabase?.from('patient_profiles')?.update({ 
          is_active: false,
          updated_at: new Date()?.toISOString()
        })?.eq('id', patientId)?.select()?.single();

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

  // Search patients by name, member ID, or email
  async searchPatients(searchTerm) {
    try {
      const { data, error } = await supabase?.from('patient_profiles')?.select(`
          *,
          user:user_profiles(full_name, email),
          plan:insurance_plans(name, type)
        `)?.or(`member_id.ilike.%${searchTerm}%,user.full_name.ilike.%${searchTerm}%,user.email.ilike.%${searchTerm}%`)?.eq('is_active', true)?.limit(20);

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

  // Generate unique member ID
  async generateMemberId() {
    try {
      // Get current count and increment
      const { data: existingPatients, error } = await supabase?.from('patient_profiles')?.select('member_id')?.order('created_at', { ascending: false })?.limit(1);

      if (error) {
        throw new Error(error.message);
      }

      let nextNumber = 1;
      if (existingPatients?.length > 0) {
        const lastMemberId = existingPatients?.[0]?.member_id;
        if (lastMemberId?.includes('MEM-')) {
          const lastNumber = parseInt(lastMemberId?.split('-')?.[2]) || 0;
          nextNumber = lastNumber + 1;
        }
      }

      const currentYear = new Date()?.getFullYear();
      return `MEM-${currentYear}-${String(nextNumber)?.padStart(3, '0')}`;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      // Fallback to timestamp-based ID
      return `MEM-${new Date()?.getFullYear()}-${Date.now()?.toString()?.slice(-6)}`;
    }
  }
};

export default patientsService;
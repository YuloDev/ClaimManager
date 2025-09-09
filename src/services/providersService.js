import { supabase } from '../lib/supabase';

export const providersService = {
  // Get all healthcare providers
  async getProviders(filters = {}) {
    try {
      let query = supabase?.from('healthcare_providers')?.select('*')?.eq('is_active', true)?.order('name', { ascending: true });

      // Apply filters
      if (filters?.type) {
        query = query?.eq('type', filters?.type);
      }
      
      if (filters?.networkProvider !== undefined) {
        query = query?.eq('is_network_provider', filters?.networkProvider);
      }
      
      if (filters?.specialty) {
        query = query?.contains('specialties', [filters?.specialty]);
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

  // Get provider by ID with network information
  async getProviderById(providerId) {
    try {
      const { data, error } = await supabase?.from('healthcare_providers')?.select(`
          *,
          networks:provider_networks(
            *,
            plan:insurance_plans(name, type)
          )
        `)?.eq('id', providerId)?.single();

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

  // Create healthcare provider
  async createProvider(providerData) {
    try {
      const { data, error } = await supabase?.from('healthcare_providers')?.insert([{
          name: providerData?.name,
          type: providerData?.type,
          license_number: providerData?.license_number,
          address: providerData?.address,
          phone: providerData?.phone,
          email: providerData?.email,
          specialties: providerData?.specialties || [],
          is_network_provider: providerData?.is_network_provider || false
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

  // Update healthcare provider
  async updateProvider(providerId, updates) {
    try {
      const { data, error } = await supabase?.from('healthcare_providers')?.update(updates)?.eq('id', providerId)?.select()?.single();

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

  // Deactivate provider
  async deactivateProvider(providerId) {
    try {
      const { data, error } = await supabase?.from('healthcare_providers')?.update({ is_active: false })?.eq('id', providerId)?.select()?.single();

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

  // Search providers by name, type, or specialty
  async searchProviders(searchTerm) {
    try {
      const { data, error } = await supabase?.from('healthcare_providers')?.select('*')?.or(`name.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%,specialties.cs.{${searchTerm}}`)?.eq('is_active', true)?.limit(20);

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

  // Get provider network relationships
  async getProviderNetworks(providerId) {
    try {
      const { data, error } = await supabase?.from('provider_networks')?.select(`
          *,
          provider:healthcare_providers(name, type),
          plan:insurance_plans(name, type, coverage_limit)
        `)?.eq('provider_id', providerId)?.eq('is_active', true);

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

  // Add provider to network
  async addProviderToNetwork(networkData) {
    try {
      const { data, error } = await supabase?.from('provider_networks')?.insert([{
          provider_id: networkData?.provider_id,
          plan_id: networkData?.plan_id,
          contract_start_date: networkData?.contract_start_date,
          contract_end_date: networkData?.contract_end_date,
          discount_percentage: networkData?.discount_percentage || 0
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

  // Remove provider from network
  async removeProviderFromNetwork(networkId) {
    try {
      const { data, error } = await supabase?.from('provider_networks')?.update({ is_active: false })?.eq('id', networkId)?.select()?.single();

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

  // Get provider types for dropdown
  getProviderTypes() {
    return [
      { value: 'hospital', label: 'Hospital' },
      { value: 'clinic', label: 'Clinic' },
      { value: 'pharmacy', label: 'Pharmacy' },
      { value: 'laboratory', label: 'Laboratory' },
      { value: 'specialist', label: 'Specialist' },
      { value: 'general_practitioner', label: 'General Practitioner' }
    ];
  },

  // Get common specialties
  getCommonSpecialties() {
    return [
      'Cardiology',
      'Dermatology', 
      'Emergency Medicine',
      'Family Medicine',
      'Gastroenterology',
      'General Surgery',
      'Internal Medicine',
      'Neurology',
      'Obstetrics and Gynecology',
      'Oncology',
      'Ophthalmology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Radiology',
      'Urology'
    ];
  },

  // Get provider statistics
  async getProviderStats() {
    try {
      const { data: providers, error } = await supabase?.from('healthcare_providers')?.select('type, is_network_provider, specialties');

      if (error) {
        throw new Error(error.message);
      }

      const stats = {
        total_providers: providers?.length || 0,
        network_providers: providers?.filter(p => p?.is_network_provider)?.length || 0,
        by_type: {},
        specialties_count: {}
      };

      // Group by provider type
      providers?.forEach(provider => {
        stats.by_type[provider.type] = (stats?.by_type?.[provider?.type] || 0) + 1;
        
        // Count specialties
        provider?.specialties?.forEach(specialty => {
          stats.specialties_count[specialty] = (stats?.specialties_count?.[specialty] || 0) + 1;
        });
      });

      return stats;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  }
};

export default providersService;
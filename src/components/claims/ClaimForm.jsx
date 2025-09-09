import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, FileText, Calculator } from 'lucide-react';
import claimsService from '../../services/claimsService';
import patientsService from '../../services/patientsService';
import providersService from '../../services/providersService';
import plansService from '../../services/plansService';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import Button from '../ui/Button';

const ClaimForm = ({ claim = null, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [plans, setPlans] = useState([]);
  const [coverageCalculation, setCoverageCalculation] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      patient_id: claim?.patient_id || '',
      provider_id: claim?.provider_id || '',
      plan_id: claim?.plan_id || '',
      service_date: claim?.service_date || '',
      diagnosis_codes: claim?.diagnosis_codes?.join(', ') || '',
      procedure_codes: claim?.procedure_codes?.join(', ') || '',
      claimed_amount: claim?.claimed_amount || '',
      notes: claim?.notes || ''
    }
  });

  const watchedValues = watch(['plan_id', 'claimed_amount']);

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (claim) {
      reset({
        patient_id: claim?.patient_id,
        provider_id: claim?.provider_id,
        plan_id: claim?.plan_id,
        service_date: claim?.service_date,
        diagnosis_codes: claim?.diagnosis_codes?.join(', ') || '',
        procedure_codes: claim?.procedure_codes?.join(', ') || '',
        claimed_amount: claim?.claimed_amount,
        notes: claim?.notes || ''
      });
    }
  }, [claim, reset]);

  useEffect(() => {
    const [planId, claimedAmount] = watchedValues;
    if (planId && claimedAmount && parseFloat(claimedAmount) > 0) {
      calculateCoverage(planId, claimedAmount);
    } else {
      setCoverageCalculation(null);
    }
  }, [watchedValues]);

  const loadFormData = async () => {
    try {
      const [patientsData, providersData, plansData] = await Promise.all([
        patientsService?.getPatients(),
        providersService?.getProviders(),
        plansService?.getPlans()
      ]);
      
      setPatients(patientsData);
      setProviders(providersData);
      setPlans(plansData);
    } catch (error) {
      setError('Failed to load form data: ' + error?.message);
    }
  };

  const calculateCoverage = async (planId, claimedAmount) => {
    try {
      const calculation = await plansService?.calculateCoverage(planId, claimedAmount);
      setCoverageCalculation(calculation);
    } catch (error) {
      console.log('Coverage calculation error:', error?.message);
      setCoverageCalculation(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const formData = {
        ...data,
        diagnosis_codes: data?.diagnosis_codes?.split(',')?.map(code => code?.trim())?.filter(Boolean),
        procedure_codes: data?.procedure_codes?.split(',')?.map(code => code?.trim())?.filter(Boolean),
        claimed_amount: parseFloat(data?.claimed_amount)
      };

      let result;
      if (claim?.id) {
        result = await claimsService?.updateClaim(claim?.id, formData);
        setSuccess('Claim updated successfully');
      } else {
        result = await claimsService?.createClaim(formData);
        setSuccess('Claim created successfully');
      }

      onSuccess?.(result);
    } catch (error) {
      setError(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount || 0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {claim?.id ? 'Edit Claim' : 'Create New Claim'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <Alert
              type="error"
              title="Error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {success && (
            <Alert
              type="success"
              title="Success"
              message={success}
              onClose={() => setSuccess(null)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient *
              </label>
              <select
                {...register('patient_id', { required: 'Please select a patient' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Patient</option>
                {patients?.map((patient) => (
                  <option key={patient?.id} value={patient?.id}>
                    {patient?.user?.full_name} ({patient?.member_id})
                  </option>
                ))}
              </select>
              {errors?.patient_id && (
                <p className="mt-1 text-sm text-red-600">{errors?.patient_id?.message}</p>
              )}
            </div>

            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Healthcare Provider *
              </label>
              <select
                {...register('provider_id', { required: 'Please select a provider' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Provider</option>
                {providers?.map((provider) => (
                  <option key={provider?.id} value={provider?.id}>
                    {provider?.name} ({provider?.type})
                  </option>
                ))}
              </select>
              {errors?.provider_id && (
                <p className="mt-1 text-sm text-red-600">{errors?.provider_id?.message}</p>
              )}
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Plan *
              </label>
              <select
                {...register('plan_id', { required: 'Please select a plan' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Plan</option>
                {plans?.map((plan) => (
                  <option key={plan?.id} value={plan?.id}>
                    {plan?.name} ({plan?.type})
                  </option>
                ))}
              </select>
              {errors?.plan_id && (
                <p className="mt-1 text-sm text-red-600">{errors?.plan_id?.message}</p>
              )}
            </div>

            {/* Service Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Date *
              </label>
              <input
                type="date"
                {...register('service_date', { required: 'Service date is required' })}
                max={new Date()?.toISOString()?.split('T')?.[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors?.service_date && (
                <p className="mt-1 text-sm text-red-600">{errors?.service_date?.message}</p>
              )}
            </div>

            {/* Claimed Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claimed Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('claimed_amount', { 
                  required: 'Claimed amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors?.claimed_amount && (
                <p className="mt-1 text-sm text-red-600">{errors?.claimed_amount?.message}</p>
              )}
            </div>

            {/* Diagnosis Codes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis Codes
              </label>
              <input
                type="text"
                {...register('diagnosis_codes')}
                placeholder="Enter codes separated by commas (e.g., Z00.00, M79.3)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple codes with commas</p>
            </div>

            {/* Procedure Codes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procedure Codes
              </label>
              <input
                type="text"
                {...register('procedure_codes')}
                placeholder="Enter codes separated by commas (e.g., 99213, 73060)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple codes with commas</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes or comments about this claim..."
            />
          </div>

          {/* Coverage Calculation Display */}
          {coverageCalculation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 flex items-center mb-3">
                <Calculator className="h-4 w-4 mr-2" />
                Coverage Calculation Preview
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Claimed Amount:</span>
                  <div className="font-medium text-blue-900">
                    {formatCurrency(coverageCalculation?.claimed_amount)}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Approved Amount:</span>
                  <div className="font-medium text-blue-900">
                    {formatCurrency(coverageCalculation?.approved_amount)}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Deductible:</span>
                  <div className="font-medium text-blue-900">
                    {formatCurrency(coverageCalculation?.deductible_amount)}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Copay:</span>
                  <div className="font-medium text-blue-900">
                    {formatCurrency(coverageCalculation?.copay_amount)}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <span className="text-blue-700">Net Payable:</span>
                  <div className="font-bold text-lg text-green-600">
                    {formatCurrency(coverageCalculation?.net_payable)}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <span className="text-blue-700">Coverage:</span>
                  <div className="font-medium text-blue-900">
                    {coverageCalculation?.coverage_percentage?.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {claim?.id ? 'Update Claim' : 'Create Claim'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimForm;
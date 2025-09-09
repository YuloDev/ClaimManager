import React, { useState, useEffect } from 'react';
import { FileText, Eye, Edit, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import claimsService from '../../services/claimsService';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import { useAuth } from '../../contexts/AuthContext';

const ClaimsList = ({ filters = {}, onClaimSelect }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    loadClaims();
  }, [filters]);

  const loadClaims = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await claimsService?.getClaims(filters);
      setClaims(data);
    } catch (error) {
      setError(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <Edit className="h-4 w-4" />,
      submitted: <FileText className="h-4 w-4" />,
      under_review: <Clock className="h-4 w-4" />,
      pending_documents: <FileText className="h-4 w-4" />,
      pre_approved: <CheckCircle className="h-4 w-4" />,
      approved: <CheckCircle className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />,
      paid: <DollarSign className="h-4 w-4" />,
      closed: <CheckCircle className="h-4 w-4" />
    };
    return icons?.[status] || <FileText className="h-4 w-4" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      pending_documents: 'bg-orange-100 text-orange-800',
      pre_approved: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-purple-100 text-purple-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading claims..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error Loading Claims"
        message={error}
        onClose={() => setError(null)}
      />
    );
  }

  if (!claims?.length) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {Object.keys(filters)?.length > 0 
            ? 'Try adjusting your filters to see more results.' :'Get started by creating your first claim.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {claims?.map((claim) => (
          <li key={claim?.id}>
            <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getStatusColor(claim?.status)}`}>
                    {getStatusIcon(claim?.status)}
                  </div>
                </div>
                
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {claim?.claim_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        Patient: {claim?.patient?.user?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Provider: {claim?.provider?.name || 'Not specified'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(claim?.claimed_amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Service: {formatDate(claim?.service_date)}
                      </p>
                      {claim?.submission_date && (
                        <p className="text-xs text-gray-500">
                          Submitted: {formatDate(claim?.submission_date)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim?.status)}`}>
                        {claim?.status?.replace('_', ' ')?.toUpperCase()}
                      </span>
                      {claim?.plan?.name && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {claim?.plan?.name}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {claim?.approved_amount > 0 && (
                        <span className="text-xs text-green-600">
                          Approved: {formatCurrency(claim?.approved_amount)}
                        </span>
                      )}
                      {onClaimSelect && (
                        <button
                          onClick={() => onClaimSelect?.(claim)}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClaimsList;
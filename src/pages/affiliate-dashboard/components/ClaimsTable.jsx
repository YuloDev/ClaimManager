import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import StatusBadge from './StatusBadge';

const ClaimsTable = ({ claims = [], className = '' }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'submitted', label: 'Enviado' },
    { value: 'validation', label: 'En Validación' },
    { value: 'observed', label: 'Observado' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'rejected', label: 'Rechazado' },
    { value: 'paid', label: 'Pagado' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Fecha de Envío' },
    { value: 'amount', label: 'Monto Solicitado' },
    { value: 'status', label: 'Estado' },
    { value: 'claimId', label: 'ID de Reclamo' }
  ];

  const filteredAndSortedClaims = claims?.filter(claim => {
      const matchesSearch = claim?.claimId?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           claim?.provider?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesStatus = statusFilter === 'all' || claim?.status === statusFilter;
      return matchesSearch && matchesStatus;
    })?.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.submissionDate);
          bValue = new Date(b.submissionDate);
          break;
        case 'amount':
          aValue = a?.requestedAmount;
          bValue = b?.requestedAmount;
          break;
        case 'status':
          aValue = a?.status;
          bValue = b?.status;
          break;
        case 'claimId':
          aValue = a?.claimId;
          bValue = b?.claimId;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewDetails = (claimId) => {
    navigate(`/claim-details?id=${claimId}`);
  };

  const handleUploadDocuments = (claimId) => {
    navigate(`/claim-submission?edit=${claimId}`);
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      {/* Header with Filters */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <h2 className="text-lg font-semibold text-foreground">Mis Reclamos</h2>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Input
              type="search"
              placeholder="Buscar por ID o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full sm:w-64"
            />
            
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filtrar por estado"
              className="w-full sm:w-48"
            />
            
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Ordenar por"
              className="w-full sm:w-48"
            />
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('claimId')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>ID Reclamo</span>
                  <Icon name={sortBy === 'claimId' && sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>Fecha Envío</span>
                  <Icon name={sortBy === 'date' && sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>Estado</span>
                  <Icon name={sortBy === 'status' && sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>Monto Solicitado</span>
                  <Icon name={sortBy === 'amount' && sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredAndSortedClaims?.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <Icon name="FileText" size={48} className="text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground">No se encontraron reclamos</h3>
                    <p className="text-text-secondary">
                      {searchTerm || statusFilter !== 'all' ?'Intenta ajustar los filtros de búsqueda' :'Aún no has enviado ningún reclamo'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedClaims?.map((claim) => (
                <tr key={claim?.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{claim?.claimId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{formatDate(claim?.submissionDate)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">{claim?.provider}</div>
                    <div className="text-xs text-text-secondary">{claim?.serviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={claim?.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{formatCurrency(claim?.requestedAmount)}</div>
                    {claim?.approvedAmount && (
                      <div className="text-xs text-success">
                        Aprobado: {formatCurrency(claim?.approvedAmount)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(claim?.claimId)}
                        iconName="Eye"
                        iconSize={16}
                      >
                        Ver
                      </Button>
                      {(claim?.status === 'draft' || claim?.status === 'observed') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUploadDocuments(claim?.claimId)}
                          iconName="Upload"
                          iconSize={16}
                        >
                          Subir
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {filteredAndSortedClaims?.length > 0 && (
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Mostrando {filteredAndSortedClaims?.length} de {claims?.length} reclamos
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <Icon name="ChevronLeft" size={16} />
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsTable;
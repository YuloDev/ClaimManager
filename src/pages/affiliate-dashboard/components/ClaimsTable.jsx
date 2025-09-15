import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import StatusBadge from './StatusBadge';

const ClaimsTable = ({ claims = [], metadata = {}, loading = false, className = '' }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mapear datos del endpoint al formato interno
  const normalizedClaims = claims.map(claim => ({
    id: claim.id_reclamo,
    claimId: claim.id_reclamo,
    submissionDate: claim.fecha_envio,
    provider: claim.proveedor?.nombre,
    serviceType: claim.proveedor?.tipo_servicio,
    status: claim.estado?.toLowerCase()?.replace('ó', 'o')?.replace(' ', '_'), // "Aprobado" -> "aprobado", "En Revisión" -> "en_revision"
    statusOriginal: claim.estado, // Mantener el estado original para mostrar
    requestedAmount: claim.monto_solicitado,
    approvedAmount: claim.monto_aprobado,
    currency: claim.moneda,
    actions: claim.acciones
  }));

  // Generar opciones de estado dinámicamente desde metadata
  const getStatusOptions = () => {
    const baseOptions = [{ value: 'all', label: 'Todos los Estados' }];
    
    if (metadata?.estados_disponibles && metadata.estados_disponibles.length > 0) {
      const dynamicOptions = metadata.estados_disponibles.map(estado => ({
        value: estado?.toLowerCase()?.replace('ó', 'o')?.replace(' ', '_'),
        label: estado
      }));
      return [...baseOptions, ...dynamicOptions];
    }
    
    // Fallback a estados predeterminados si no hay metadata
    return [
      ...baseOptions,
      { value: 'draft', label: 'Borrador' },
      { value: 'submitted', label: 'Enviado' },
      { value: 'validation', label: 'En Validación' },
      { value: 'observed', label: 'Observado' },
      { value: 'approved', label: 'Aprobado' },
      { value: 'rejected', label: 'Rechazado' },
      { value: 'paid', label: 'Pagado' }
    ];
  };

  const statusOptions = getStatusOptions();

  const sortOptions = [
    { value: 'date', label: 'Fecha de Envío' },
    { value: 'amount', label: 'Monto Solicitado' },
    { value: 'status', label: 'Estado' },
    { value: 'claimId', label: 'ID de Reclamo' }
  ];

  const filteredAndSortedClaims = normalizedClaims?.filter(claim => {
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

  // Calcular paginación
  const totalItems = filteredAndSortedClaims?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClaims = filteredAndSortedClaims?.slice(startIndex, endIndex) || [];


  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset a la primera página cuando se ordena
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Reset página cuando cambian filtros
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount, currency = '$') => {
    if (currency === '$') {
      return `$${amount?.toFixed(2)}`;
    }
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === '€' ? 'EUR' : 'USD'
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    // Si ya viene en formato DD/MM/YYYY, devolverlo tal como está
    if (dateString && dateString.includes('/')) {
      return dateString;
    }
    // Si viene en otro formato, convertirlo
    return new Date(dateString)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
              placeholder="Buscar por ID o afiliado..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e?.target?.value)}
              className="w-full sm:w-64"
            />
            
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={handleStatusFilterChange}
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
      
      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-text-secondary">Cargando reclamos...</span>
        </div>
      ) : (
        <>
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
                Afiliado
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
                Monto Aprobado
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {totalItems === 0 ? (
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
              paginatedClaims?.map((claim) => (
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
                    <StatusBadge status={claim?.status} originalStatus={claim?.statusOriginal} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {claim?.currency || '$'}{claim?.requestedAmount?.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {claim?.approvedAmount ? (
                        <span className="text-success">
                          {claim?.currency || '$'}{claim?.approvedAmount?.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-text-secondary">—</span>
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
      {totalItems > 0 && (
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} reclamos
              {totalPages > 1 && (
                <span className="ml-2">
                  (Página {currentPage} de {totalPages})
                </span>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <Icon name="ChevronLeft" size={16} />
                  Anterior
                </Button>
                <span className="text-sm text-text-secondary px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <Icon name="ChevronRight" size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ClaimsTable;
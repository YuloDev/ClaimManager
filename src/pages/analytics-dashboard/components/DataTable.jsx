import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DataTable = ({ className = '' }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const data = [
    {
      id: 'CLM-2024-001',
      provider: 'Hospital Universitario',
      type: 'Consulta Médica',
      amount: 250.00,
      status: 'approved',
      date: '2024-08-25',
      processingTime: 2.5
    },
    {
      id: 'CLM-2024-002',
      provider: 'Clínica San Rafael',
      type: 'Farmacia',
      amount: 85.50,
      status: 'in-review',
      date: '2024-08-24',
      processingTime: 1.2
    },
    {
      id: 'CLM-2024-003',
      provider: 'Centro Médico Norte',
      type: 'Dental',
      amount: 420.00,
      status: 'rejected',
      date: '2024-08-23',
      processingTime: 3.1
    },
    {
      id: 'CLM-2024-004',
      provider: 'Hospital General',
      type: 'Emergencia',
      amount: 1250.00,
      status: 'approved',
      date: '2024-08-22',
      processingTime: 0.8
    },
    {
      id: 'CLM-2024-005',
      provider: 'Clínica del Sur',
      type: 'Óptica',
      amount: 180.00,
      status: 'submitted',
      date: '2024-08-21',
      processingTime: 2.0
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-success text-success-foreground', label: 'Aprobado' },
      rejected: { color: 'bg-error text-error-foreground', label: 'Rechazado' },
      'in-review': { color: 'bg-warning text-warning-foreground', label: 'En Revisión' },
      submitted: { color: 'bg-accent text-accent-foreground', label: 'Enviado' },
      draft: { color: 'bg-muted text-muted-foreground', label: 'Borrador' }
    };

    const config = statusConfig?.[status] || statusConfig?.draft;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) {
      return <Icon name="ArrowUpDown" size={14} className="text-text-secondary" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig?.key) return data;
    
    return [...data]?.sort((a, b) => {
      if (a?.[sortConfig?.key] < b?.[sortConfig?.key]) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (a?.[sortConfig?.key] > b?.[sortConfig?.key]) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const paginatedData = sortedData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData?.length / itemsPerPage);

  const handleExport = (format) => {
    console.log(`Exporting data in ${format} format`);
    // Export logic would be implemented here
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Detalle de Reclamaciones
            </h3>
            <p className="text-sm text-text-secondary">
              Análisis detallado de todas las reclamaciones procesadas
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('excel')}
              iconName="FileSpreadsheet"
              iconPosition="left"
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              iconName="FileText"
              iconPosition="left"
            >
              PDF
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('id')}
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                  >
                    <span>ID Reclamación</span>
                    {getSortIcon('id')}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('provider')}
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                  >
                    <span>Proveedor</span>
                    {getSortIcon('provider')}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                  >
                    <span>Tipo</span>
                    {getSortIcon('type')}
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary ml-auto"
                  >
                    <span>Monto</span>
                    {getSortIcon('amount')}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                  >
                    <span>Estado</span>
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                  >
                    <span>Fecha</span>
                    {getSortIcon('date')}
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('processingTime')}
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary ml-auto"
                  >
                    <span>Tiempo Proc.</span>
                    {getSortIcon('processingTime')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData?.map((row) => (
                <tr key={row?.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-primary">{row?.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground">{row?.provider}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground">{row?.type}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-medium text-foreground">
                      €{row?.amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(row?.status)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-text-secondary">
                      {new Date(row.date)?.toLocaleDateString('es-ES')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-text-secondary">
                      {row?.processingTime} días
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div className="text-sm text-text-secondary">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, sortedData?.length)} de {sortedData?.length} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              iconName="ChevronLeft"
            />
            <span className="text-sm text-foreground px-3 py-1">
              {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              iconName="ChevronRight"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
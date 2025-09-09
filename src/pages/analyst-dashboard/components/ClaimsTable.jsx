import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClaimsTable = ({ claims, onClaimSelect, onBulkAction }) => {
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'priority', direction: 'desc' });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedClaims(claims?.map(claim => claim?.id));
    } else {
      setSelectedClaims([]);
    }
  };

  const handleSelectClaim = (claimId, checked) => {
    if (checked) {
      setSelectedClaims([...selectedClaims, claimId]);
    } else {
      setSelectedClaims(selectedClaims?.filter(id => id !== claimId));
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
        return 'bg-error text-error-foreground';
      case 'media':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'en_revision':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'observado':
        return 'bg-error/10 text-error border-error/20';
      case 'aprobado':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getValidationScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  const sortedClaims = [...claims]?.sort((a, b) => {
    if (sortConfig?.direction === 'asc') {
      return a?.[sortConfig?.key] > b?.[sortConfig?.key] ? 1 : -1;
    }
    return a?.[sortConfig?.key] < b?.[sortConfig?.key] ? 1 : -1;
  });

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table Header with Bulk Actions */}
      {selectedClaims?.length > 0 && (
        <div className="bg-accent/5 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {selectedClaims?.length} reclamos seleccionados
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('assign', selectedClaims)}
                iconName="UserPlus"
                iconPosition="left"
              >
                Asignar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('approve', selectedClaims)}
                iconName="Check"
                iconPosition="left"
              >
                Aprobar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('observe', selectedClaims)}
                iconName="Eye"
                iconPosition="left"
              >
                Observar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={selectedClaims?.length === claims?.length}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Prioridad</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('claimNumber')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Número</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Paciente</th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Monto</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Estado</th>
              <th className="text-left p-4 font-medium text-foreground">IA Score</th>
              <th className="text-left p-4 font-medium text-foreground">Documentos</th>
              <th className="text-left p-4 font-medium text-foreground">Asignado</th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('submittedAt')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Fecha</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="w-24 p-4 font-medium text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedClaims?.map((claim) => (
              <tr key={claim?.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedClaims?.includes(claim?.id)}
                    onChange={(e) => handleSelectClaim(claim?.id, e?.target?.checked)}
                    className="rounded border-border"
                  />
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(claim?.priority)}`}>
                    {claim?.priority?.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onClaimSelect(claim)}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    {claim?.claimNumber}
                  </button>
                </td>
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">{claim?.patientName}</p>
                    <p className="text-sm text-text-secondary">{claim?.patientId}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-medium text-foreground">
                    €{claim?.amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(claim?.status)}`}>
                    {claim?.statusLabel}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${getValidationScoreColor(claim?.aiValidationScore)}`}>
                      {claim?.aiValidationScore}%
                    </span>
                    {claim?.aiValidationScore < 70 && (
                      <Icon name="AlertTriangle" size={16} className="text-warning" />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-foreground">
                      {claim?.documentsComplete}/{claim?.documentsTotal}
                    </span>
                    {claim?.documentsComplete === claim?.documentsTotal ? (
                      <Icon name="CheckCircle" size={16} className="text-success" />
                    ) : (
                      <Icon name="AlertCircle" size={16} className="text-warning" />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  {claim?.assignedTo ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                        {claim?.assignedTo?.charAt(0)}
                      </div>
                      <span className="text-sm text-foreground">{claim?.assignedTo}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-text-secondary">Sin asignar</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="text-sm text-text-secondary">
                    {new Date(claim.submittedAt)?.toLocaleDateString('es-ES')}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onClaimSelect(claim)}
                      className="h-8 w-8"
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => console.log('Edit claim:', claim?.id)}
                      className="h-8 w-8"
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClaimsTable;
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const DocumentsTab = ({ documents, onUpload, onPreview, onDelete, userRole, claimStatus }) => {
  const [dragOver, setDragOver] = useState(false);

  const getDocumentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return 'FileText';
      case 'image':
        return 'Image';
      case 'prescription':
        return 'Pill';
      case 'invoice':
        return 'Receipt';
      case 'medical_report':
        return 'FileHeart';
      case 'identification':
        return 'CreditCard';
      default:
        return 'File';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'validated':
        return 'text-success bg-success/10';
      case 'processing':
        return 'text-warning bg-warning/10';
      case 'error':
        return 'text-error bg-error/10';
      case 'pending':
        return 'text-accent bg-accent/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'validated':
        return 'Validado';
      case 'processing':
        return 'Procesando';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(new Date(date));
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setDragOver(false);
    const files = Array.from(e?.dataTransfer?.files);
    onUpload(files);
  };

  const canUpload = userRole === 'affiliate' && ['draft', 'pending', 'under_review']?.includes(claimStatus);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {canUpload && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Upload" size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Subir Documentos
              </h3>
              <p className="text-text-secondary mb-4">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                <Icon name="Plus" size={16} className="mr-2" />
                Seleccionar Archivos
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={(e) => onUpload(Array.from(e?.target?.files))}
              />
            </div>
            <p className="text-xs text-text-secondary">
              Formatos soportados: PDF, JPG, PNG, DOC, DOCX (máx. 10MB por archivo)
            </p>
          </div>
        </div>
      )}
      {/* Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Documentos ({documents?.length})
          </h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Icon name="Filter" size={16} className="mr-2" />
              Filtrar
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Descargar Todo
            </Button>
          </div>
        </div>

        {documents?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="FileText" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay documentos
            </h3>
            <p className="text-text-secondary">
              {canUpload ? 'Sube documentos para comenzar' : 'No se han subido documentos aún'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents?.map((doc) => (
              <div key={doc?.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start space-x-4">
                  {/* Document Icon/Thumbnail */}
                  <div className="flex-shrink-0">
                    {doc?.type === 'image' && doc?.thumbnail ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                        <Image
                          src={doc?.thumbnail}
                          alt={doc?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Icon name={getDocumentIcon(doc?.type)} size={24} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {doc?.name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-text-secondary">
                            {formatFileSize(doc?.size)}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {formatDate(doc?.uploadDate)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc?.status)}`}>
                            {getStatusText(doc?.status)}
                          </span>
                        </div>
                        {doc?.category && (
                          <p className="text-xs text-text-secondary mt-1">
                            Categoría: {doc?.category}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreview(doc)}
                        >
                          <Icon name="Eye" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc?.url, '_blank')}
                        >
                          <Icon name="Download" size={16} />
                        </Button>
                        {canUpload && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(doc?.id)}
                            className="text-error hover:text-error"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* AI Validation Results */}
                    {doc?.aiValidation && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <h5 className="text-xs font-medium text-foreground mb-2">
                          Resultados de Validación IA
                        </h5>
                        <div className="space-y-1">
                          {doc?.aiValidation?.extractedData && (
                            <div className="text-xs">
                              <span className="text-text-secondary">Datos extraídos: </span>
                              <span className="text-foreground">
                                {Object.keys(doc?.aiValidation?.extractedData)?.join(', ')}
                              </span>
                            </div>
                          )}
                          {doc?.aiValidation?.confidence && (
                            <div className="text-xs">
                              <span className="text-text-secondary">Confianza: </span>
                              <span className="text-foreground">
                                {(doc?.aiValidation?.confidence * 100)?.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {doc?.aiValidation?.issues && doc?.aiValidation?.issues?.length > 0 && (
                            <div className="text-xs">
                              <span className="text-error">Problemas detectados: </span>
                              <span className="text-foreground">
                                {doc?.aiValidation?.issues?.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsTab;
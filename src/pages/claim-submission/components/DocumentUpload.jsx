import React, { useState, useCallback, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentUpload = ({ onFilesChange, uploadedFiles = [] }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') setDragActive(true);
    else if (e?.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(e?.dataTransfer?.files);
    }
  }, []);

  const handleFiles = (files) => {
    const fileArray = Array.from(files || []);
    const processedFiles = fileArray.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file?.name,
      size: file?.size,
      type: file?.type,
      documentType: 'factura', // valor por defecto
      status: 'uploading',
      extractedData: null,
      preview: null
    }));

    onFilesChange((prev) => {
      const next = [...prev, ...processedFiles];
      processedFiles.forEach((pf) => simulateUpload(pf.id));
      return next;
    });

    if (inputRef.current) inputRef.current.value = '';
  };

  // Simulación visual de subida
  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onFilesChange((prev) =>
          prev.map((file) =>
            file?.id === fileId
              ? {
                  ...file,
                  status: 'completed',
                  extractedData: {
                    patientName: 'Juan Pérez García',
                    date: '2024-08-26',
                    amount: '125,50',
                    provider: 'Clínica San Rafael'
                  }
                }
              : file
          )
        );
      }
      setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
    }, 200);
  };

  const removeFile = (fileId) => {
    onFilesChange((prev) => prev.filter((file) => file?.id !== fileId));
  };

  const changeDocumentType = (fileId, newType) => {
    onFilesChange((prev) =>
      prev.map((file) => (file?.id === fileId ? { ...file, documentType: newType } : file))
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
            <Icon name="Upload" size={18} className="text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Documentos de Soporte</h3>
            <p className="text-sm text-text-secondary">
              Suba los documentos necesarios para su reclamación
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Dropzone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => handleFiles(e?.target?.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Icon name="CloudUpload" size={32} className="text-text-secondary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-text-secondary mt-2">
                Formatos soportados: PDF, JPG, PNG, DOC, DOCX (máx. 10MB por archivo)
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => inputRef.current?.click()}
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Seleccionar Archivos
            </Button>
          </div>
        </div>

        {/* Lista de archivos */}
        {uploadedFiles?.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="font-medium text-foreground">
              Archivos Subidos ({uploadedFiles.length})
            </h4>

            {uploadedFiles.map((file) => (
              <div key={file?.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="FileText" size={20} className="text-text-secondary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{file?.name}</p>
                      <p className="text-sm text-text-secondary">{formatFileSize(file?.size)}</p>

                      <div className="mt-2">
                        <label className="text-sm mr-2">Tipo de documento:</label>
                        <select
                          value={file?.documentType || 'factura'}
                          onChange={(e) => changeDocumentType(file?.id, e?.target?.value)}
                          className="text-sm border border-border rounded px-2 py-1 bg-background"
                        >
                          <option value="factura">Factura</option>
                          <option value="receta">Receta</option>
                          <option value="diagnostico">Diagnostico</option>
                        </select>
                      </div>

                      {file?.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">Subiendo...</span>
                            <span className="text-text-secondary">
                              {Math.round(uploadProgress?.[file?.id] || 0)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mt-1">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress?.[file?.id] || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file?.id)}
                    className="text-error hover:text-error"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;

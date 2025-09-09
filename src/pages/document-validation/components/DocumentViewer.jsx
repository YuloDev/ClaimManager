import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const DocumentViewer = ({ 
  documents = [], 
  selectedDocument = null, 
  onDocumentSelect,
  className = '' 
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [annotations, setAnnotations] = useState([]);

  const mockDocuments = [
    {
      id: 1,
      name: "Prescription_001.pdf",
      type: "prescription",
      url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200&h=150&fit=crop",
      pages: 1,
      uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "processed"
    },
    {
      id: 2,
      name: "Invoice_Medical_Center.pdf",
      type: "invoice",
      url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=150&fit=crop",
      pages: 2,
      uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      status: "processed"
    },
    {
      id: 3,
      name: "Lab_Results_2024.pdf",
      type: "medical_record",
      url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop",
      pages: 3,
      uploadedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "processed"
    }
  ];

  const allDocuments = documents?.length > 0 ? documents : mockDocuments;
  const currentDoc = selectedDocument || allDocuments?.[0];

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleResetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'prescription':
        return 'Pill';
      case 'invoice':
        return 'Receipt';
      case 'medical_record':
        return 'FileText';
      default:
        return 'File';
    }
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'prescription':
        return 'text-blue-600 bg-blue-50';
      case 'invoice':
        return 'text-green-600 bg-green-50';
      case 'medical_record':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Document Tabs */}
      <div className="border-b border-border bg-muted/30">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {allDocuments?.map((doc) => (
            <button
              key={doc?.id}
              onClick={() => onDocumentSelect?.(doc)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                currentDoc?.id === doc?.id
                  ? 'border-primary text-primary bg-background' :'border-transparent text-text-secondary hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${getDocumentTypeColor(doc?.type)}`}>
                <Icon name={getDocumentTypeIcon(doc?.type)} size={14} />
              </div>
              <span className="text-sm font-medium">{doc?.name}</span>
              {doc?.pages > 1 && (
                <span className="text-xs text-text-secondary">({doc?.pages} páginas)</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <Icon name="ZoomOut" size={16} />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[60px] text-center">
            {zoom}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <Icon name="ZoomIn" size={16} />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
          >
            <Icon name="RotateCw" size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
          >
            <Icon name="RotateCcw" size={16} />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
          >
            <Icon name="Download" size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Icon name="Printer" size={16} />
          </Button>
        </div>
      </div>
      {/* Document Display */}
      <div className="relative bg-gray-100 min-h-[600px] overflow-auto">
        {currentDoc ? (
          <div className="flex items-center justify-center p-8">
            <div 
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            >
              <Image
                src={currentDoc?.url}
                alt={currentDoc?.name}
                className="max-w-full h-auto"
                style={{ maxHeight: '800px' }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Icon name="FileX" size={64} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay documento seleccionado
            </h3>
            <p className="text-text-secondary">
              Selecciona un documento de las pestañas superiores para comenzar la validación
            </p>
          </div>
        )}
      </div>
      {/* Document Info Footer */}
      {currentDoc && (
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={16} className="text-text-secondary" />
                <span className="text-sm text-text-secondary">
                  Subido: {currentDoc?.uploadedAt?.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="FileType" size={16} className="text-text-secondary" />
                <span className="text-sm text-text-secondary capitalize">
                  {currentDoc?.type?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-success font-medium">Procesado</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
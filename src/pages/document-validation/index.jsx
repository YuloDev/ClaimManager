import React, { useState, useEffect } from 'react';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import ValidationHeader from './components/ValidationHeader';
import DocumentViewer from './components/DocumentViewer';
import ValidationPanel from './components/ValidationPanel';
import MobileValidationTabs from './components/MobileValidationTabs';

const DocumentValidation = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
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

  const mockClaimData = {
    id: "CLM-2024-0156",
    patientName: "María González Rodríguez",
    submissionDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    amount: "85.00",
    currency: "EUR",
    status: "pending_validation",
    priority: "normal",
    assignedAnalyst: "Ana Martín López"
  };

  const mockExtractedData = {
    patientInfo: {
      name: "María González Rodríguez",
      id: "12345678A",
      birthDate: "15/03/1985",
      phone: "+34 666 123 456",
      confidence: 0.95
    },
    providerInfo: {
      name: "Centro Médico San Rafael",
      nif: "B12345678",
      address: "Calle Mayor 123, 28001 Madrid",
      phone: "+34 91 123 4567",
      confidence: 0.92
    },
    serviceDetails: {
      date: "20/08/2024",
      code: "99213",
      description: "Consulta médica especializada",
      amount: "85.00",
      currency: "EUR",
      confidence: 0.88
    },
    diagnosis: {
      code: "M79.3",
      description: "Panniculitis, no especificada",
      confidence: 0.91
    },
    coverage: {
      planType: "Premium",
      copayment: "15.00",
      coverage: "70%",
      maxAmount: "500.00",
      confidence: 0.94
    }
  };

  useEffect(() => {
    // Simulate loading extracted data
    const timer = setTimeout(() => {
      setValidationData(mockExtractedData);
      setSelectedDocument(mockDocuments?.[0]);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };

  const handleValidationComplete = (action) => {
    console.log(`Validation completed with action: ${action}`);
    // Here you would typically update the claim status and navigate back
    alert(`Reclamación ${action === 'approved' ? 'aprobada' : action === 'rejected' ? 'rechazada' : 'marcada para observación'}`);
  };

  const handleBackToQueue = () => {
    console.log('Navigating back to validation queue');
    // Navigation logic would be handled by React Router
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        userRole="analyst"
        userName="Ana Martín López"
        notificationCount={5}
      />

      {/* Sidebar */}
      <RoleBasedSidebar
        isCollapsed={sidebarCollapsed}
        userRole="analyst"
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pt-16`}>
        
        {/* Validation Header */}
        <ValidationHeader
          claimData={mockClaimData}
          onBackToQueue={handleBackToQueue}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Procesando Documentos con IA
              </h3>
              <p className="text-text-secondary">
                Extrayendo información y validando datos...
              </p>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        {!isLoading && (
          <>
            <div className="hidden lg:block">
              <div className="grid grid-cols-12 gap-6 p-6">
                {/* Document Viewer - Left Panel */}
                <div className="col-span-6">
                  <DocumentViewer
                    documents={mockDocuments}
                    selectedDocument={selectedDocument}
                    onDocumentSelect={handleDocumentSelect}
                  />
                </div>

                {/* Validation Panel - Right Panel */}
                <div className="col-span-6">
                  <ValidationPanel
                    extractedData={validationData}
                    onValidationComplete={handleValidationComplete}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <MobileValidationTabs
              documents={mockDocuments}
              extractedData={validationData}
              onValidationComplete={handleValidationComplete}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentValidation;
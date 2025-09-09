import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import DocumentViewer from './DocumentViewer';
import ValidationPanel from './ValidationPanel';

const MobileValidationTabs = ({ 
  documents = [],
  extractedData = null,
  onValidationComplete,
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const tabs = [
    {
      id: 'documents',
      label: 'Documentos',
      icon: 'FileText',
      count: documents?.length || 3
    },
    {
      id: 'validation',
      label: 'Validación',
      icon: 'CheckSquare',
      count: null
    }
  ];

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };

  return (
    <div className={`lg:hidden ${className}`}>
      {/* Tab Navigation */}
      <div className="bg-card border-b border-border">
        <div className="flex">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-4 border-b-2 transition-colors ${
                activeTab === tab?.id
                  ? 'border-primary text-primary bg-primary/5' :'border-transparent text-text-secondary hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon name={tab?.icon} size={20} />
              <span className="font-medium">{tab?.label}</span>
              {tab?.count && (
                <span className="bg-muted text-text-secondary text-xs px-2 py-1 rounded-full">
                  {tab?.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Tab Content */}
      <div className="min-h-screen bg-background">
        {activeTab === 'documents' && (
          <div className="p-4">
            <DocumentViewer
              documents={documents}
              selectedDocument={selectedDocument}
              onDocumentSelect={handleDocumentSelect}
              className="h-[calc(100vh-200px)]"
            />
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="p-4">
            <ValidationPanel
              extractedData={extractedData}
              onValidationComplete={onValidationComplete}
            />
          </div>
        )}
      </div>
      {/* Floating Action Button for Quick Actions */}
      {activeTab === 'validation' && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex flex-col space-y-2">
            <Button
              variant="success"
              size="icon"
              className="w-14 h-14 rounded-full shadow-lg"
              onClick={() => onValidationComplete?.('approved')}
            >
              <Icon name="Check" size={24} />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="w-14 h-14 rounded-full shadow-lg"
              onClick={() => onValidationComplete?.('rejected')}
            >
              <Icon name="X" size={24} />
            </Button>
          </div>
        </div>
      )}
      {/* Quick Switch Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full shadow-lg bg-card"
          onClick={() => setActiveTab(activeTab === 'documents' ? 'validation' : 'documents')}
        >
          <Icon name={activeTab === 'documents' ? 'CheckSquare' : 'FileText'} size={20} />
        </Button>
      </div>
    </div>
  );
};

export default MobileValidationTabs;
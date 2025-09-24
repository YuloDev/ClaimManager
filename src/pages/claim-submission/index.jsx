// src/pages/claim-submission/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import PatientInfoForm from './components/PatientInfoForm';
import ProviderDetailsForm from './components/ProviderDetailsForm';
import DiagnosisForm from './components/DiagnosisForm';
import DocumentUpload from './components/DocumentUpload';
import SubmissionProgress from './components/SubmissionProgress';
import FormActions from './components/FormActions';
import EmbeddedFooter from './components/EmbebedFooter';
import Icon from '../../components/AppIcon';

const initialForm = {
  patientInfo: {
    fullName: "David Ruben Balseca Kekal",
    identification: "0910854439",
    birthDate: "2002-07-14",
    gender: "male",
    phone: "0992880198",
    email: "",
    relationship: "self",
    policyNumber: "POL-2024-002",
    address: "",
    careType: "hospitalario"
  },
  diagnosis: { totalAmount: '1500' }
};


const N8N_WEBHOOK_URL =
  'https://n8n.nextisolutions.com/webhook-test/82233671-8aeb-4940-9f9a-2f5ff872844f';

  

const REQUIRED_FIELDS = [
  'patientInfo.fullName',
  'patientInfo.identification',
  'patientInfo.birthDate',
  'patientInfo.gender',
  'patientInfo.relationship',
  'patientInfo.policyNumber',
  'patientInfo.careType'
];

const get = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

const validate = (form) => {
  const errors = {};
  REQUIRED_FIELDS.forEach((p) => {
    const v = get(form, p);
    const isEmpty =
      v === null ||
      v === undefined ||
      (typeof v === 'string' && v.trim() === '');
    if (isEmpty) {
      const fieldKey = p.split('.').pop();
      errors[fieldKey] = 'Campo obligatorio';
    }
  });

  const amount = Number(form?.diagnosis?.totalAmount);
  if (Number.isNaN(amount)) {
    errors.totalAmount = 'El monto solicitado debe ser numérico';
  }
  return errors;
};

// File -> base64 (sin el prefijo data:...;base64,)
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
    
      const result = reader.result || '';
      const commaIdx = result.indexOf(',');
      const base64 = commaIdx >= 0 ? result.slice(commaIdx + 1) : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Función para detectar si un archivo es una imagen
const isImageFile = (mimeType) => {
  const imageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
  ];
  return imageTypes.includes(mimeType?.toLowerCase());
};

// Función para mapear el tipo de documento según las reglas del webhook
const mapDocumentTypeForWebhook = (documentType, mimeType) => {
  if (documentType === 'factura') {
    return 'factura';
  }
  
  if (isImageFile(mimeType)) {
    return 'imagenes';
  }
  
  // Para recetas, diagnósticos y otros documentos
  if (documentType === 'receta' || documentType === 'diagnostico' || documentType === 'documento') {
    return 'documentos';
  }
  
  return 'documentos'; // valor por defecto
};

// Construye el payload específico para el webhook de n8n
const buildWebhookPayload = async (formDataState, uploadedFiles) => {
  const documents = await Promise.all(
    (uploadedFiles || []).map(async (item) => {
      const f = item?.file;
      if (!(f instanceof File)) return null;
      const filename = f.name;
      console.log('filename', filename);
      const base64 = await fileToBase64(f);
      const webhookType = mapDocumentTypeForWebhook(
        item?.documentType || 'documento', 
        f.type
      );
      
      return {
        pdfBase64: base64,
        type: webhookType,
        filename: filename
      };
    })
  );

  return {
    documents: documents.filter(Boolean),
    patientInfo: {
      fullName: formDataState.patientInfo?.fullName || '',
      identification: formDataState.patientInfo?.identification || '',
      birthDate: formDataState.patientInfo?.birthDate || '',
      gender: formDataState.patientInfo?.gender || '',
      phone: formDataState.patientInfo?.phone || '',
      email: formDataState.patientInfo?.email || '',
      relationship: formDataState.patientInfo?.relationship || '',
      policyNumber: formDataState.patientInfo?.policyNumber || '',
      address: formDataState.patientInfo?.address || '',
      careType: formDataState.patientInfo?.careType || ''
    }
  };
};

// Construye el JSON con payload + archivos (incluye base64)
const buildJsonPayload = async (formDataState, uploadedFiles /* [{file, documentType, ...}] */) => {
  const files = await Promise.all(
    (uploadedFiles || []).map(async (item, idx) => {
      const f = item?.file;
      if (!(f instanceof File)) return null;
      const base64 = await fileToBase64(f);
      return {
        index: idx,
        mimeType: f.type || 'application/octet-stream',
        size: f.size || 0,
        documentType: (item?.documentType || 'factura').toLowerCase(), // 'factura' | 'receta' | ...
        base64
      };
    })
  );
  return {
    payload: {
      patientInfo: formDataState.patientInfo,
      providerDetails: formDataState.providerDetails,
      diagnosis: formDataState.diagnosis
    },
    files: files.filter(Boolean)
  };
};

// Llama al validador con el base64 del PDF
async function validateFactura(pdfBase64) {
  const res = await fetch(VALIDATOR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
    body: JSON.stringify({ pdfbase64: pdfBase64 })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || data?.message || 'Error al validar factura');
  }
  return data; // ← estructura tal cual te devuelve el API
}

const ClaimSubmission = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{id, file, documentType, ...}]
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [footerH, setFooterH] = useState(72);

  const handleFormChange = useCallback((section, data) => {
    setFormData((prev) => ({ ...prev, [section]: data }));
    setHasUnsavedChanges(true);
  }, []);

  const handleFilesChange = useCallback((filesOrUpdater) => {
    setUploadedFiles((prev) => {
      const next = typeof filesOrUpdater === 'function' ? filesOrUpdater(prev) : filesOrUpdater;
      setHasUnsavedChanges(true);
      return next || [];
    });
  }, []);

  const handleSaveDraft = useCallback(async (silent = false) => {
    if (!silent) setIsDraftSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      if (!silent) console.log('Borrador guardado exitosamente');
    } catch (e) {
      console.error('Error saving draft:', e);
    } finally {
      if (!silent) setIsDraftSaving(false);
    }
  }, []);

  const canSubmit = useMemo(() => {
    const errs = validate(formData);
    const filesOk =
      uploadedFiles.length > 0 &&
      uploadedFiles.every(
        (f) => f?.file instanceof File && (f?.documentType === 'factura' || f?.documentType === 'receta')
      );
    return Object.keys(errs).length === 0 && filesOk;
  }, [formData, uploadedFiles]);



// Función auxiliar para hacer peticiones con retry en caso de errores de CORS
async function fetchWithRetry(url, options, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Si es un error de CORS o de red, esperamos antes del retry
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.warn(`❯ Intento ${attempt} falló, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      } else {
        throw error;
      }
    }
  }
}

async function validateDocumento(pdfBase64, documentType, mimeType) {
  // Determinar el endpoint según el tipo de documento y si es imagen
  let url;
  let requestBody;
  
  if (documentType === 'factura' && isImageFile(mimeType)) {
    url = VALIDATOR_IMAGE_URL;
    requestBody = { imagen_base64: pdfBase64 }; // Usar el parámetro correcto para imágenes
  } else if (documentType === 'factura') {
    url = VALIDATOR_FACTURA_URL;
    requestBody = { pdfbase64: pdfBase64 }; // Mantener el parámetro original para PDFs
  } else {
    url = VALIDATOR_DOC_URL;
    requestBody = { pdfbase64: pdfBase64 }; // Mantener el parámetro original para otros documentos
  }

  try {
    // ▶️ Hacer las peticiones de forma secuencial para evitar sobrecarga del servidor
    console.log(`🔍 Validando documento tipo: ${documentType}${isImageFile(mimeType) ? ' (imagen)' : ''}`);
    
    // Primera petición: validación principal
    const mainRes = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'accept': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(requestBody),
    });

    const mainData = await mainRes.json().catch(() => ({}));

    if (!mainRes.ok) {
      // Mejorar el manejo de errores para diferentes tipos de respuestas
      let errorMessage = 'Error al validar documento';
      
      if (mainData?.detail) {
        errorMessage = typeof mainData.detail === 'string' ? mainData.detail : JSON.stringify(mainData.detail);
      } else if (mainData?.message) {
        errorMessage = typeof mainData.message === 'string' ? mainData.message : JSON.stringify(mainData.message);
      } else if (mainData?.error) {
        errorMessage = typeof mainData.error === 'string' ? mainData.error : JSON.stringify(mainData.error);
      } else if (Object.keys(mainData).length > 0) {
        errorMessage = `Error del servidor: ${JSON.stringify(mainData)}`;
      } else {
        errorMessage = `Error HTTP ${mainRes.status}: ${mainRes.statusText}`;
      }
      
      throw new Error(errorMessage);
    }


    return mainData;
  } catch (err) {
    console.error('❌ Error en validación de documento:', err);
    
    // Asegurar que el error tenga un mensaje legible
    if (err instanceof Error) {
      throw err;
    } else {
      // Si no es un Error, crear uno con el mensaje apropiado
      const errorMessage = typeof err === 'string' ? err : JSON.stringify(err);
      throw new Error(errorMessage);
    }
  }
}

// Función para enviar datos al webhook de n8n
async function sendToN8nWebhook(webhookPayload) {
  try {
    console.log('📤 Enviando datos al webhook de n8n...');
    console.log('🔗 URL del webhook:', N8N_WEBHOOK_URL);
    console.log('📦 Payload a enviar:', JSON.stringify(webhookPayload, null, 2));
    
    const response = await fetch("https://n8n.nextisolutions.com/webhook-test/82233671-8aeb-4940-9f9a-2f5ff872844f", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });

    console.log('📊 Status de respuesta:', response.status);
    console.log('📋 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error en respuesta del webhook:', errorData);
      throw new Error(`Error HTTP ${response.status}: ${errorData?.message || response.statusText}`);
    }

    const responseData = await response.json().catch(() => ({}));
    console.log('✅ Datos enviados exitosamente al webhook');
    console.log('📥 Respuesta del webhook:', JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error) {
    console.error('❌ Error enviando datos al webhook:', error);
    console.error('📄 Detalles del error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}



  const handleSubmit = useCallback(async () => {
    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length > 0) {
      console.log('Formulario contiene errores, por favor corregir antes de enviar');
      return;
    }

    if (uploadedFiles.length === 0) {
      console.log('Debe subir al menos un documento');
      return;
    }

    setIsLoading(true);
    try {
      // 1) Construir payload específico para el webhook de n8n
      const webhookPayload = await buildWebhookPayload(formData, uploadedFiles);
      
      console.log('📋 Payload para webhook:', webhookPayload);

      // 2) Enviar al webhook de n8n
      const webhookResponse = await sendToN8nWebhook(webhookPayload);
      
      // 3) Verificar si el usuario tiene póliza válida
      console.log('🎯 Respuesta completa del webhook n8n:', webhookResponse);
      console.log('🔍 Tipo de respuesta:', typeof webhookResponse);
      console.log('🔍 Es array?:', Array.isArray(webhookResponse));
      console.log('🔍 Longitud si es array:', Array.isArray(webhookResponse) ? webhookResponse.length : 'No es array');
      console.log('🔍 Keys del objeto:', typeof webhookResponse === 'object' ? Object.keys(webhookResponse) : 'No es objeto');
      
      // Verificar si la respuesta es un array vacío específicamente
      const isEmptyArray = Array.isArray(webhookResponse) && webhookResponse.length === 0;
      
      if (isEmptyArray) {
        // Usuario no tiene póliza válida - mostrar error y mantener en la misma pantalla
        console.log('❌ El usuario no tiene póliza válida - Array vacío recibido');
        alert('Lo sentimos, no se encontró una póliza válida para este usuario. Por favor, verifique los datos ingresados.');
        return; // No navegar, mantener al usuario en la misma pantalla
      }
      
      // 4) Si tiene póliza válida, continuar con el proceso
      console.log('✅ Reclamación enviada exitosamente - Usuario tiene póliza válida');
      
      // 5) Navegar a la página de detalles con todos los datos necesarios
      navigate('/claim-details', { 
        state: { 
          webhookResponse,           // Respuesta del webhook n8n con datos de póliza
          submittedData: webhookPayload,  // Datos enviados originalmente
          formData: formData,        // Datos del formulario para el resumen
          isWebhookSubmission: true
        } 
      });
      
    } catch (error) {
      console.error('❌ Error al enviar reclamación:', error);
      
      // Mostrar error al usuario (podrías usar un toast o modal aquí)
      alert(`Error al enviar la reclamación: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, uploadedFiles, navigate]);




  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const t = setTimeout(() => { handleSaveDraft(true); }, 30000);
    return () => clearTimeout(t);
  }, [formData, uploadedFiles, hasUnsavedChanges, handleSaveDraft]);

  const customBreadcrumbs = useMemo(
    () => [
      { label: 'Dashboard', path: '/affiliate-dashboard', isActive: false },
      { label: 'Nueva Reclamación', path: '/claim-submission', isActive: true }
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((s) => !s)}
        userRole="affiliate"
        userName="María González"
        notificationCount={2}
      />

      <RoleBasedSidebar isCollapsed={sidebarCollapsed} userRole="affiliate" />

      <main
        className={`transition-all duration-300 ease-in-out pt-16 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}
        style={{ paddingBottom: `${footerH}px` }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <BreadcrumbNavigation customBreadcrumbs={customBreadcrumbs} />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Nueva Reclamación</h1>
                <p className="text-text-secondary mt-2">
                  Complete todos los campos requeridos y suba los documentos de soporte
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                  <Icon name="Clock" size={16} />
                  <span>Tiempo estimado: 10-15 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left */}
            <div className="xl:col-span-8 space-y-8">
              <PatientInfoForm
                formData={formData.patientInfo}
                diagnosisData={formData.diagnosis}
                onChange={handleFormChange}
                errors={errors}
              />
              {/* Agrega ProviderDetailsForm / DiagnosisForm si corresponde */}
            </div>

            {/* Right */}
            <div className="xl:col-span-4 space-y-8">
              <DocumentUpload onFilesChange={handleFilesChange} uploadedFiles={uploadedFiles} />

              <FormActions
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isDraftSaving={isDraftSaving}
                hasUnsavedChanges={hasUnsavedChanges}
                lastSaved={lastSaved}
                canSubmit={canSubmit}
              />
            </div>
          </div>

          {/* Help */}
          <div className="mt-12 bg-muted/50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="HelpCircle" size={20} className="text-accent" />
              </div>
              <div className="text-sm text-text-secondary">
                Si el API no permite CORS, monta un proxy en tu backend o usa n8n como puente.
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};

export default ClaimSubmission;

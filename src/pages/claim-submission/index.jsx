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
    fullName: 'JIMENEZ BENAVIDES ONAUR JUMANDY ',
    identification: '1701020304',
    birthDate: '2002-07-14',
    gender: 'male',
    phone: '0992880198',
    email: '',
    relationship: 'self',
    policyNumber: 'POL-2024-002',
    address: '',
    careType: 'hospitalario',
  },
  diagnosis: { totalAmount: '1500' }
};

const VALIDATOR_FACTURA_URL =
  import.meta.env.VITE_VALIDATOR_FACTURA_URL ||
  'https://api-forense.nextisolutions.com/validar-factura-nuevo';

const VALIDATOR_DOC_URL =
  import.meta.env.VITE_VALIDATOR_DOC_URL ||
  'https://api-forense.nextisolutions.com/validar-documento';

const VALIDATOR_IMAGE_URL =
  import.meta.env.VITE_VALIDATOR_IMAGE_URL ||
  'https://api-forense.nextisolutions.com/validar-imagen';

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

// Construye el JSON con payload + archivos (incluye base64)
const buildJsonPayload = async (formDataState, uploadedFiles /* [{file, documentType, ...}] */) => {
  const files = await Promise.all(
    (uploadedFiles || []).map(async (item, idx) => {
      const f = item?.file;
      if (!(f instanceof File)) return null;
      const base64 = await fileToBase64(f);
      return {
        index: idx,
        filename: f.name || `file${idx}`,
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



  const handleSubmit = useCallback(async () => {
    const v = validate(formData);
    setErrors(v);

    if (uploadedFiles.length === 0) {
      console.log('Debe subir al menos un documento');
      return;
    }

    setIsLoading(true);
    try {
      // 1) Construir payload con base64
      const jsonBody = await buildJsonPayload(formData, uploadedFiles);

      // 2) Validar en el API cada documento según su tipo (secuencialmente para evitar CORS)
      const results = [];
      for (let i = 0; i < jsonBody.files.length; i++) {
        const f = jsonBody.files[i];
        const meta = {
          index: f.index,
          filename: f.filename,
          mimeType: f.mimeType,
          size: f.size,
          documentType: f.documentType,
        };

        try {
          console.log(`📄 Procesando documento ${i + 1}/${jsonBody.files.length}: ${f.filename}`);
          // ✅ Aquí elegimos el endpoint según el tipo de documento y si es imagen
          const validation = await validateDocumento(f.base64, f.documentType, f.mimeType);
          results.push({ ...meta, validation, skipped: false });
          
          // Pequeño delay entre documentos para no sobrecargar el servidor
          if (i < jsonBody.files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err) {
          console.error(`❌ Error validando ${f.filename}:`, err);
          
          // Asegurar que el mensaje de error sea legible
          let errorMessage = 'Error desconocido';
          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (typeof err === 'string') {
            errorMessage = err;
          } else if (err && typeof err === 'object') {
            errorMessage = JSON.stringify(err);
          }
          
          results.push({ ...meta, validationError: errorMessage, skipped: false });
        }
      }

      // 3) Adjuntar también los archivos como attachments (truncados si no son facturas)
      const TRUNCATE_BASE64 = true;
      const MAX_BASE64_CHARS = 2_000_000; // ~1.5MB aprox
      const attachments = jsonBody.files.map((f) => {
        const raw = String(f.base64 || '');
        const truncated = TRUNCATE_BASE64 && raw.length > MAX_BASE64_CHARS;
        const base64 = truncated ? raw.slice(0, MAX_BASE64_CHARS) : raw;
        return {
          index: f.index,
          filename: f.filename,
          mimeType: f.mimeType,
          size: f.size,
          documentType: f.documentType,
          base64,
          truncated,
        };
      });

      // 4) Armar objeto para la siguiente vista (sin webhook)
      const apiPayload = {
        patientInfo: jsonBody.payload.patientInfo,
        diagnosis: jsonBody.payload.diagnosis,
        results,        // respuestas del validador por cada documento
        attachments,    // todos los documentos con base64 (facturas + otros)
      };

      // 5) Navegar y mostrar en ClaimDetails
      navigate('/claim-details', { state: { apiResponse: apiPayload } });
    } catch (error) {
      console.error('Error en validación:', error);
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

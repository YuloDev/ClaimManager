import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GlobalHeader from "../../components/ui/GlobalHeader";
import RoleBasedSidebar from "../../components/ui/RoleBasedSidebar";
import BreadcrumbNavigation from "../../components/ui/BreadcrumbNavigation";
import Icon from "components/AppIcon";
import html2pdf from "html2pdf.js";
import ResponseModal from "../../components/ui/ResponseModal";

const ClaimReimbursement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reimbursement = location?.state?.reimbursement ?? null;
  const requestedAmount = location?.state?.requested ?? 0;

  // Estados para el modal de respuesta del N8N
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [n8nResponse, setN8nResponse] = useState(null);

  const formatMoney = (v) =>
    new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(Number(v || 0));


  console.log('Reimbursement:', reimbursement);
  console.log('Requested Amount:', requestedAmount);
  // Función para procesar la respuesta del N8N y mostrar el modal automáticamente
  const processN8nResponse = (n8nResponse) => {
    console.log('Procesando respuesta del N8N:', n8nResponse);
    
    if (!n8nResponse) {
      console.log('No hay respuesta del N8N disponible');
      return;
    }
    
    // La respuesta del N8N viene con la estructura:
    // { RuleId: "...", IsSuccess: true, Output: "...", NextStageId: null, ResponseType: "Text", output: { ... } }
    console.log('Datos de la respuesta:', n8nResponse);
    
    // Mapear la respuesta al formato esperado por el componente
    const mappedResponse = {
      IsSuccess: n8nResponse.IsSuccess,
      Output: n8nResponse.Output,
      response: {
        patient: {
          name: n8nResponse.output?.patient?.name || "—",
          policyNumber: n8nResponse.output?.patient?.policyNumber || "—"
        },
        diagnosis: {
          code: n8nResponse.output?.diagnosis?.code || "",
          description: n8nResponse.output?.diagnosis?.description || "No especificado"
        },
        approvedItems: n8nResponse.output?.approvedItems || [],
        totalReimbursement: n8nResponse.output?.totalReimbursement || 0,
        justification: n8nResponse.output?.justification || "No disponible",
        scoreTotal: n8nResponse.output?.scoreTotal || 0
      }
    };
    
    console.log('Respuesta mapeada:', mappedResponse);
    
    // Guardar la respuesta mapeada
    setN8nResponse([mappedResponse]); // Convertir a array para mantener compatibilidad
    // Procesar y mostrar el modal automáticamente
    setResponseData(mappedResponse);
    setResponseModalOpen(true);
    console.log('Modal abierto automáticamente con respuesta del N8N');
  };

  const handleCloseResponseModal = () => {
    setResponseModalOpen(false);
    setResponseData(null);
  };

  // Procesar la respuesta del N8N que viene en el state de navegación
  useEffect(() => {
    if (reimbursement) {
      // La respuesta del N8N viene en el state de navegación
      processN8nResponse(reimbursement);
    }
  }, [reimbursement]); // Se ejecuta cuando cambia la respuesta del N8N

  const handleDownloadPDF = () => {
    if (!reimbursement) return;

    // 👉 Plantilla HTML para el PDF
    const template = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Reembolso</title>
        <style>
          :root {
            --color-primary: #282d51;
            --color-accent: #1e9cd5;
            --color-light: #cfcfcf;
            --color-dark-grey: #686868;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            color: var(--color-dark-grey);
            line-height: 1.6;
            background: #fff;
            padding: 20px;
          }
          h1, h2 {
            color: var(--color-primary);
          }
          .section {
            margin-bottom: 20px;
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo img {
            height: 80px;
            display: inline-block;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .table th, .table td {
            border: 1px solid var(--color-light);
            padding: 6px;
            text-align: left;
          }
          .table th {
            background: var(--color-accent);
            color: #fff;
          }
        </style>
      </head>
      <body>
      
        <div class="logo">
          <img src="${window.location.origin}/assets/images/logo.jpg" alt="Logo" />
        </div>

        <h1>Resumen de Reembolso</h1>
        <div class="section">
          <p><strong>Paciente:</strong> ${n8nResponse && n8nResponse[0]?.response?.patient?.name || "—"}</p>
          <p><strong>Póliza:</strong> ${n8nResponse && n8nResponse[0]?.response?.patient?.policyNumber || "—"}</p>
          <p><strong>Score Total:</strong> ${n8nResponse && n8nResponse[0]?.response?.scoreTotal || 0}</p>
          <p><strong>Reembolso solicitado:</strong> ${formatMoney(requestedAmount)}</p>
          <p><strong>Reembolso aprobado:</strong> ${formatMoney(
            n8nResponse && n8nResponse[0]?.response?.totalReimbursement !== undefined ? n8nResponse[0].response.totalReimbursement : 0
          )}</p>
        </div>

        <h2>Diagnóstico</h2>
        <p>${n8nResponse && n8nResponse[0]?.response?.diagnosis?.code || "—"} - ${
      n8nResponse && n8nResponse[0]?.response?.diagnosis?.description || "No especificado"
    }</p>

        <h2>Ítems Aprobados</h2>
        ${
          n8nResponse && n8nResponse[0]?.response?.approvedItems?.length > 0
            ? `
          <table class="table">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(n8nResponse[0].response.approvedItems || [])
                .map(
                  (item) => `
                <tr>
                  <td>${item.item}</td>
                  <td>${item.quantity}</td>
                  <td>${formatMoney(item.total)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `
            : "<p>No hay ítems aprobados.</p>"
        }

        <h2>Justificación</h2>
        <p>${n8nResponse && n8nResponse[0]?.response?.justification || "No disponible"}</p></br>
      </body>
      </html>
    `;

    const opt = {
      margin: 0.5,
      filename: "reembolso.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(template).save();
  };

  if (!reimbursement) {
    return <div className="p-6">No hay información de reembolso disponible.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader userRole="affiliate" userName="María García López" />
      <RoleBasedSidebar userRole="affiliate" />

      <main className="transition-all duration-300 ease-in-out lg:ml-64 pt-16">
        <div className="p-6">
          <div className="mb-6">
            <BreadcrumbNavigation />
          </div>

          {/* Botones */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:opacity-90"
            >
              Generar PDF
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm border rounded-md hover:bg-muted/50"
            >
              ← Regresar
            </button>
          </div>

          {/* Vista normal en pantalla */}
          <div className="bg-card border border-border rounded-lg mb-6">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="DollarSign" size={18} className="text-primary" />
                <h3 className="text-base font-semibold">Resumen de Reembolso</h3>
              </div>
              {n8nResponse && n8nResponse[0]?.response && (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    n8nResponse[0].response.totalReimbursement > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    n8nResponse[0].response.totalReimbursement > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {n8nResponse[0].response.totalReimbursement > 0 ? 'Aprobado' : 'Rechazado'}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-text-secondary">Paciente</div>
                <div className="font-medium">
                  {n8nResponse && n8nResponse[0]?.response?.patient?.name || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Póliza</div>
                <div className="font-medium">
                  {n8nResponse && n8nResponse[0]?.response?.patient?.policyNumber || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Score Total</div>
                <div className="font-medium">
                  {n8nResponse && n8nResponse[0]?.response?.scoreTotal || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-secondary">
                  Reembolso Solicitado
                </div>
                <div className="font-medium">{formatMoney(requestedAmount)}</div>
              </div>
              <div>
                <div className="text-xs text-text-secondary">
                  Reembolso Aprobado
                </div>
                <div className="font-medium text-emerald-700">
                  {formatMoney(n8nResponse && n8nResponse[0]?.response?.totalReimbursement !== undefined ? n8nResponse[0].response.totalReimbursement : 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="bg-card border border-border rounded-lg mb-6">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Icon name="Activity" size={18} className="text-accent" />
              <h3 className="text-base font-semibold">Diagnóstico</h3>
            </div>
            <div className="p-4">
              <div className="text-sm">
                <span className="font-medium">
                  {n8nResponse && n8nResponse[0]?.response?.diagnosis?.code || "—"}
                </span>{" "}
                - {n8nResponse && n8nResponse[0]?.response?.diagnosis?.description || "No especificado"}
              </div>
            </div>
          </div>

          {/* Ítems aprobados */}
          <div className="bg-card border border-border rounded-lg mb-6">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Icon name="CheckCircle" size={18} className="text-green-600" />
              <h3 className="text-base font-semibold">Ítems Aprobados</h3>
            </div>
            <div className="p-4">
              {n8nResponse && n8nResponse[0]?.response?.approvedItems?.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {(n8nResponse[0].response.approvedItems || []).map((item, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between border-b border-border pb-2"
                    >
                      <span>
                        {item.item} (x{item.quantity})
                      </span>
                      <span>{formatMoney(item.total)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-text-secondary italic">
                  No hay ítems aprobados.
                </div>
              )}
            </div>
          </div>

          {/* Justificación */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Icon name="Info" size={18} className="text-blue-600" />
              <h3 className="text-base font-semibold">Justificación</h3>
            </div>
            <div className="p-4 text-sm text-text-secondary">
              {n8nResponse && n8nResponse[0]?.response?.justification || "No disponible"}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de respuesta del N8N */}
      <ResponseModal
        isOpen={responseModalOpen}
        onClose={handleCloseResponseModal}
        responseData={responseData}
        fullResponseData={n8nResponse}
      />
    </div>
  );
};

export default ClaimReimbursement;

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GlobalHeader from "../../components/ui/GlobalHeader";
import RoleBasedSidebar from "../../components/ui/RoleBasedSidebar";
import BreadcrumbNavigation from "../../components/ui/BreadcrumbNavigation";
import Icon from "components/AppIcon";
import html2pdf from "html2pdf.js";

const ClaimReimbursement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reimbursement = location?.state?.reimbursement ?? null;
  const requestedAmount = location?.state?.requested ?? 0;

  const formatMoney = (v) =>
    new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(Number(v || 0));

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
          <p><strong>Paciente:</strong> ${reimbursement.patient?.name || "—"}</p>
          <p><strong>Póliza:</strong> ${reimbursement.patient?.policyNumber || "—"}</p>
          <p><strong>Reembolso solicitado:</strong> ${formatMoney(requestedAmount)}</p>
          <p><strong>Reembolso aprobado:</strong> ${formatMoney(
            reimbursement.totalReimbursement
          )}</p>
        </div>

        <h2>Diagnóstico</h2>
        <p>${reimbursement.diagnosis?.code || "—"} - ${
      reimbursement.diagnosis?.description || "No especificado"
    }</p>

        <h2>Ítems Aprobados</h2>
        ${
          reimbursement.approvedItems?.length > 0
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
              ${reimbursement.approvedItems
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
        <p>${reimbursement.justification || "No disponible"}</p></br>
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
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Icon name="DollarSign" size={18} className="text-primary" />
              <h3 className="text-base font-semibold">Resumen de Reembolso</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-text-secondary">Paciente</div>
                <div className="font-medium">
                  {reimbursement.patient?.name || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Póliza</div>
                <div className="font-medium">
                  {reimbursement.patient?.policyNumber || "—"}
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
                  {formatMoney(reimbursement.totalReimbursement)}
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
                  {reimbursement.diagnosis?.code || "—"}
                </span>{" "}
                - {reimbursement.diagnosis?.description || "No especificado"}
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
              {reimbursement.approvedItems?.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {reimbursement.approvedItems.map((item, idx) => (
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
              {reimbursement.justification || "No disponible"}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClaimReimbursement;

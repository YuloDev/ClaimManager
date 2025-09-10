import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf"; // 👈 importamos jsPDF
import GlobalHeader from "../../components/ui/GlobalHeader";
import RoleBasedSidebar from "../../components/ui/RoleBasedSidebar";
import BreadcrumbNavigation from "../../components/ui/BreadcrumbNavigation";
import Icon from "../../components/AppIcon";

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

  // 👇 Función para generar PDF
  const handleGeneratePDF = () => {
    if (!reimbursement) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(14);
    doc.text("Resumen de Reembolso", 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Paciente: ${reimbursement.patient?.name || "—"}`, 14, y);
    y += 7;
    doc.text(`Póliza: ${reimbursement.patient?.policyNumber || "—"}`, 14, y);
    y += 7;
    doc.text(
      `Reembolso Solicitado: ${formatMoney(requestedAmount)}`,
      14,
      y
    );
    y += 7;
    doc.text(
      `Reembolso Aprobado: ${formatMoney(
        reimbursement.totalReimbursement
      )}`,
      14,
      y
    );
    y += 12;

    doc.setFontSize(12);
    doc.text("Diagnóstico", 14, y);
    y += 7;
    doc.setFontSize(11);
    doc.text(
      `${reimbursement.diagnosis?.code || "—"} - ${
        reimbursement.diagnosis?.description || "No especificado"
      }`,
      14,
      y
    );
    y += 12;

    doc.setFontSize(12);
    doc.text("Ítems Aprobados", 14, y);
    y += 7;
    doc.setFontSize(11);
    if (reimbursement.approvedItems?.length > 0) {
      reimbursement.approvedItems.forEach((item) => {
        doc.text(
          `${item.item} (x${item.quantity}) - ${formatMoney(item.total)}`,
          14,
          y
        );
        y += 7;
      });
    } else {
      doc.text("No hay ítems aprobados.", 14, y);
      y += 7;
    }
    y += 10;

    doc.setFontSize(12);
    doc.text("Justificación", 14, y);
    y += 7;
    doc.setFontSize(11);
    doc.text(
      doc.splitTextToSize(
        reimbursement.justification || "No disponible",
        180
      ),
      14,
      y
    );

    doc.save("reembolso.pdf");
  };

  if (!reimbursement) {
    return (
      <div className="p-6">
        <p className="text-sm text-text-secondary">
          No hay información de reembolso disponible.
        </p>
      </div>
    );
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

          {/* 🔹 Botones de acciones */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={handleGeneratePDF}
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

          {/* Resumen general */}
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
                <div className="font-medium">
                  {formatMoney(requestedAmount)}
                </div>
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

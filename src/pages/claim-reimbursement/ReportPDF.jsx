import React, { useRef } from "react";
import html2pdf from "html2pdf.js";

const ReportPDF = ({ reimbursement, requestedAmount, formatMoney }) => {
  const reportRef = useRef();

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;

    const opt = {
      margin: 0.5,
      filename: "reembolso.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(reportRef.current).save();
  };

  if (!reimbursement) return null;

  // Fecha actual
  const fechaActual = new Date().toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* 👇 Este botón sí aparece en la pantalla */}
      <button
        onClick={handleDownloadPDF}
        className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:opacity-90"
      >
        Generar PDF
      </button>

      {/* 👇 Bloque oculto, pero renderizable por html2pdf */}
      <div
        ref={reportRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0,
          background: "#fff",
          padding: "20px",
          width: "800px",
          zIndex: -1,             // 👈 lo manda al fondo
          pointerEvents: "none",  // 👈 no bloquea clics
        }}
      >
        {/* Cabecera con logo + título + fecha */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/assets/images/logo.jpg"
              alt="Logo"
              style={{ height: "60px", marginRight: "15px" }}
            />
            <h1 style={{ color: "#282d51", margin: 0 }}>
              Resumen de Reembolso
            </h1>
          </div>
          <div style={{ fontSize: "12px", color: "#555" }}>{fechaActual}</div>
        </div>

        {/* Datos generales */}
        <p>
          <strong>Paciente:</strong> {reimbursement.patient?.name || "—"}
        </p>
        <p>
          <strong>Póliza:</strong> {reimbursement.patient?.policyNumber || "—"}
        </p>
        <p>
          <strong>Reembolso solicitado:</strong> {formatMoney(requestedAmount)}
        </p>
        <p>
          <strong>Reembolso aprobado:</strong>{" "}
          {formatMoney(reimbursement.totalReimbursement)}
        </p>

        {/* Diagnóstico */}
        <h2>Diagnóstico</h2>
        <p>
          {reimbursement.diagnosis?.code || "—"} -{" "}
          {reimbursement.diagnosis?.description || "No especificado"}
        </p>

        {/* Ítems aprobados */}
        <h2>Ítems Aprobados</h2>
        {reimbursement.approvedItems?.length > 0 ? (
          <ul>
            {reimbursement.approvedItems.map((item, idx) => (
              <li key={idx}>
                {item.item} (x{item.quantity}) - {formatMoney(item.total)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay ítems aprobados.</p>
        )}

        {/* Justificación */}
        <h2>Justificación</h2>
        <p>{reimbursement.justification || "No disponible"}</p>
      </div>
    </>
  );
};

export default ReportPDF;

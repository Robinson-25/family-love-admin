"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function PanelError({ reset }: { reset: () => void }) {
  return (
    <div className="panel-card empty-state">
      <span className="empty-state-icon">
        <AlertCircle size={28} />
      </span>
      <h1 className="section-title">No pudimos abrir esta sección</h1>
      <p className="page-description">
        Intenta cargarla de nuevo para continuar.
      </p>
      <button onClick={reset} className="button-primary mt-5">
        <RefreshCw size={15} />
        Volver a intentar
      </button>
    </div>
  );
}

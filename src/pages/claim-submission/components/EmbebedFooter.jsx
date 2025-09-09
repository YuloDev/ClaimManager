// src/components/ui/EmbeddedFooter.jsx
import React, { useEffect, useMemo, useState, useLayoutEffect, useRef } from 'react';
import Icon from 'components/AppIcon';
/**
 * Footer fijo con iframe embebido
 */
const EmbeddedFooter = ({
  src,
  title = 'Panel embebido',
  collapsedHeight = 72,   // px
  expandedHeight = 380,   // px
  defaultExpanded = false,
  onHeightChange,         // (h:number) => void
  allow = 'clipboard-write; clipboard-read; geolocation; microphone; camera',
  sandbox = 'allow-scripts allow-forms allow-same-origin allow-popups allow-downloads',
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const containerRef = useRef(null);

  const height = expanded ? expandedHeight : collapsedHeight;

  useLayoutEffect(() => {
    // Notifica la altura al padre para que agregue padding-bottom dinámico
    onHeightChange?.(height);
  }, [height, onHeightChange]);

  const hostname = useMemo(() => {
    try { return new URL(src).hostname; } catch { return src; }
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-2xl"
      style={{ height }}
    >
      {/* Barra superior del footer */}
      <div className="h-12 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon name="Globe" size={16} className="text-primary" />
          </div>
          <div className="truncate">
            <div className="text-sm font-medium text-foreground truncate">{title}</div>
            <div className="text-xs text-text-secondary truncate">{hostname}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted/60 transition"
            title="Abrir en nueva pestaña"
          >
            <span className="inline-flex items-center gap-1">
              <Icon name="ExternalLink" size={14} />
              Abrir
            </span>
          </a>

          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted/60 transition"
            aria-expanded={expanded}
            title={expanded ? 'Colapsar' : 'Expandir'}
          >
            <span className="inline-flex items-center gap-1">
              <Icon name={expanded ? 'ChevronDown' : 'ChevronUp'} size={14} />
              {expanded ? 'Colapsar' : 'Expandir'}
            </span>
          </button>
        </div>
      </div>

      {/* Contenido embebido */}
      <div className="relative" style={{ height: height - 48 /* 48px = h-12 */ }}>
        {expanded ? (
          <iframe
            title={title}
            src={src}
            className="absolute inset-0 w-full h-full"
            // Seguridad/permiso según necesites:
            allow={allow}
            sandbox={sandbox}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            Panel embebido minimizado
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbeddedFooter;

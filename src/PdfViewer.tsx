import { useState } from 'react';
import { AlertTriangle, ExternalLink, Download } from 'lucide-react';

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [iframeError, setIframeError] = useState(false);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  if (iframeError && !useGoogleViewer) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="text-gray-700 mb-4">No se pudo cargar el visor de PDF directamente.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setUseGoogleViewer(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-900 text-white rounded-md hover:bg-red-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Ver con Google Docs
          </button>
          <a
            href={url}
            download
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Download className="w-4 h-4" /> Descargar PDF
          </a>
        </div>
      </div>
    );
  }

  const viewerSrc = useGoogleViewer ? googleViewerUrl : url;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <iframe
        src={viewerSrc}
        title="Documento PDF"
        className="w-full"
        style={{ height: '80vh', minHeight: '600px' }}
        onError={() => { if (!useGoogleViewer) setIframeError(true); }}
        onLoad={(e) => {
          try {
            const iframe = e.target as HTMLIFrameElement;
            // If the iframe loaded but has no content accessible (blocked), catch silently
            if (iframe.contentDocument?.title === '') {
              setIframeError(true);
            }
          } catch {
            // Cross-origin - means content loaded from external source, which is fine
          }
        }}
      />
    </div>
  );
}

import { useState } from 'react';
import { Download, ExternalLink, RefreshCw } from 'lucide-react';

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  if (loadError) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-8 text-center">
        <p className="text-gray-700 mb-4">El visor no pudo cargar el documento. Puedes verlo directamente o descargarlo:</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-900 text-white rounded-md hover:bg-red-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Abrir PDF
          </a>
          <a
            href={url}
            download
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Download className="w-4 h-4" /> Descargar
          </a>
          <button
            onClick={() => { setLoadError(false); setIsLoading(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-red-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Cargando documento PDF...</p>
          </div>
        </div>
      )}
      <iframe
        src={googleViewerUrl}
        title="Documento PDF"
        className="w-full"
        style={{ height: '80vh', minHeight: '600px' }}
        onLoad={() => setIsLoading(false)}
        onError={() => setLoadError(true)}
      />
    </div>
  );
}

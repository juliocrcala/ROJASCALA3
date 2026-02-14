import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: true,
      analytics: true,
      date: new Date().toISOString()
    }));
    setShowBanner(false);
    window.dispatchEvent(new Event('cookieConsentAccepted'));
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: false,
      analytics: false,
      date: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full mb-4 animate-slide-up">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Aviso de Cookies y Términos de Uso</h3>
            <button
              onClick={handleReject}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 text-gray-700">
            <p className="text-base leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia de navegación y analizar el tráfico del sitio web.
            </p>

            {!showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
              >
                Ver más detalles
              </button>
            )}

            {showDetails && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm border border-gray-200">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Uso de Cookies</h4>
                  <p className="text-gray-600">
                    Recopilamos datos anónimos sobre las páginas visitadas, el tiempo de navegación y el
                    comportamiento general en el sitio. Esta información nos ayuda a mejorar nuestros contenidos
                    y servicios.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Propiedad Intelectual y Derechos de Autor</h4>
                  <p className="text-gray-600 mb-2">
                    Al acceder y utilizar este sitio web, reconoces y aceptas que:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                    <li>Todo el contenido publicado (artículos, imágenes, diseños) es propiedad de sus respectivos autores</li>
                    <li>Los artículos están protegidos por derechos de autor y su reproducción no autorizada está prohibida</li>
                    <li>Cada artículo incluye la autoría correspondiente que debe ser respetada y citada en caso de referencia</li>
                    <li>El uso comercial del contenido sin autorización expresa está estrictamente prohibido</li>
                    <li>Puedes compartir enlaces a los artículos, pero no copiar o redistribuir el contenido sin permiso</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Privacidad</h4>
                  <p className="text-gray-600">
                    No recopilamos datos personales identificables. Los datos analíticos son agregados y anónimos.
                    No vendemos ni compartimos tu información con terceros.
                  </p>
                </div>

                <button
                  onClick={() => setShowDetails(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Ocultar detalles
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Al hacer clic en "Aceptar", aceptas el uso de cookies y reconoces los términos de uso y
                derechos de autor mencionados anteriormente.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAccept}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Aceptar Todo
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

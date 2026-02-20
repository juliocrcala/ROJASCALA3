import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from './supabase';

export const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [cookieTitle, setCookieTitle] = useState('Cookies y Términos');
  const [cookieMessage, setCookieMessage] = useState('Utilizamos cookies para mejorar tu experiencia y analizar el tráfico del sitio.');
  const [cookieAcceptText, setCookieAcceptText] = useState('Aceptar Todo');
  const [cookieRejectText, setCookieRejectText] = useState('Rechazar');

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
    fetchCookieSettings();
  }, []);

  const fetchCookieSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('cookie_title, cookie_message, cookie_accept_text, cookie_reject_text')
        .single();

      if (!error && data) {
        if (data.cookie_title) setCookieTitle(data.cookie_title);
        if (data.cookie_message) setCookieMessage(data.cookie_message);
        if (data.cookie_accept_text) setCookieAcceptText(data.cookie_accept_text);
        if (data.cookie_reject_text) setCookieRejectText(data.cookie_reject_text);
      }
    } catch (error) {
      console.error('Error fetching cookie settings:', error);
    }
  };

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
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-200">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-gray-900">{cookieTitle}</h3>
            <button
              onClick={handleReject}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {cookieMessage}
            </p>

            {!showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                className="text-red-900 hover:text-red-800 font-medium text-sm underline"
              >
                Ver más detalles
              </button>
            )}

            {showDetails && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-xs border border-gray-200 max-h-96 overflow-y-auto">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Uso de Cookies</h4>
                  <p className="text-gray-600">
                    Recopilamos datos anónimos sobre las páginas visitadas para mejorar nuestros contenidos.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Propiedad Intelectual</h4>
                  <p className="text-gray-600 mb-1">
                    Al usar este sitio, aceptas que:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-600 ml-1">
                    <li>El contenido es propiedad de sus autores</li>
                    <li>Los artículos están protegidos por derechos de autor</li>
                    <li>Debe respetarse y citarse la autoría</li>
                    <li>El uso comercial sin autorización está prohibido</li>
                    <li>Puedes compartir enlaces, no copiar contenido</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Privacidad</h4>
                  <p className="text-gray-600">
                    No recopilamos datos personales identificables. Todo es anónimo.
                  </p>
                </div>

                <button
                  onClick={() => setShowDetails(false)}
                  className="text-red-900 hover:text-red-800 font-medium underline"
                >
                  Ocultar detalles
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-3">
                Al aceptar, reconoces los términos de uso y derechos de autor.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAccept}
                  className="w-full bg-red-900 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-800 transition-colors shadow-md text-sm"
                >
                  {cookieAcceptText}
                </button>
                <button
                  onClick={handleReject}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                >
                  {cookieRejectText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

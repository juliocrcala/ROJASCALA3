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
  const [detailsButtonText, setDetailsButtonText] = useState('Ver más detalles');
  const [hideDetailsButtonText, setHideDetailsButtonText] = useState('Ocultar detalles');
  const [usageTitle, setUsageTitle] = useState('Uso de Cookies');
  const [usageText, setUsageText] = useState('Recopilamos datos anónimos sobre las páginas visitadas para mejorar nuestros contenidos.');
  const [ipTitle, setIpTitle] = useState('Propiedad Intelectual');
  const [ipIntro, setIpIntro] = useState('Al usar este sitio, aceptas que:');
  const [ipPoint1, setIpPoint1] = useState('El contenido es propiedad de sus autores');
  const [ipPoint2, setIpPoint2] = useState('Los artículos están protegidos por derechos de autor');
  const [ipPoint3, setIpPoint3] = useState('Debe respetarse y citarse la autoría');
  const [ipPoint4, setIpPoint4] = useState('El uso comercial sin autorización está prohibido');
  const [ipPoint5, setIpPoint5] = useState('Puedes compartir enlaces, no copiar contenido');
  const [privacyTitle, setPrivacyTitle] = useState('Privacidad');
  const [privacyText, setPrivacyText] = useState('No recopilamos datos personales identificables. Todo es anónimo.');
  const [footerText, setFooterText] = useState('Al aceptar, reconoces los términos de uso y derechos de autor.');

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
        .select(`
          cookie_title,
          cookie_message,
          cookie_accept_text,
          cookie_reject_text,
          cookie_details_button_text,
          cookie_hide_details_button_text,
          cookie_usage_title,
          cookie_usage_text,
          cookie_ip_title,
          cookie_ip_intro,
          cookie_ip_point_1,
          cookie_ip_point_2,
          cookie_ip_point_3,
          cookie_ip_point_4,
          cookie_ip_point_5,
          cookie_privacy_title,
          cookie_privacy_text,
          cookie_footer_text
        `)
        .maybeSingle();

      if (!error && data) {
        if (data.cookie_title) setCookieTitle(data.cookie_title);
        if (data.cookie_message) setCookieMessage(data.cookie_message);
        if (data.cookie_accept_text) setCookieAcceptText(data.cookie_accept_text);
        if (data.cookie_reject_text) setCookieRejectText(data.cookie_reject_text);
        if (data.cookie_details_button_text) setDetailsButtonText(data.cookie_details_button_text);
        if (data.cookie_hide_details_button_text) setHideDetailsButtonText(data.cookie_hide_details_button_text);
        if (data.cookie_usage_title) setUsageTitle(data.cookie_usage_title);
        if (data.cookie_usage_text) setUsageText(data.cookie_usage_text);
        if (data.cookie_ip_title) setIpTitle(data.cookie_ip_title);
        if (data.cookie_ip_intro) setIpIntro(data.cookie_ip_intro);
        if (data.cookie_ip_point_1) setIpPoint1(data.cookie_ip_point_1);
        if (data.cookie_ip_point_2) setIpPoint2(data.cookie_ip_point_2);
        if (data.cookie_ip_point_3) setIpPoint3(data.cookie_ip_point_3);
        if (data.cookie_ip_point_4) setIpPoint4(data.cookie_ip_point_4);
        if (data.cookie_ip_point_5) setIpPoint5(data.cookie_ip_point_5);
        if (data.cookie_privacy_title) setPrivacyTitle(data.cookie_privacy_title);
        if (data.cookie_privacy_text) setPrivacyText(data.cookie_privacy_text);
        if (data.cookie_footer_text) setFooterText(data.cookie_footer_text);
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
                {detailsButtonText}
              </button>
            )}

            {showDetails && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-xs border border-gray-200 max-h-96 overflow-y-auto">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{usageTitle}</h4>
                  <p className="text-gray-600">
                    {usageText}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{ipTitle}</h4>
                  <p className="text-gray-600 mb-1">
                    {ipIntro}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-600 ml-1">
                    <li>{ipPoint1}</li>
                    <li>{ipPoint2}</li>
                    <li>{ipPoint3}</li>
                    <li>{ipPoint4}</li>
                    <li>{ipPoint5}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{privacyTitle}</h4>
                  <p className="text-gray-600">
                    {privacyText}
                  </p>
                </div>

                <button
                  onClick={() => setShowDetails(false)}
                  className="text-red-900 hover:text-red-800 font-medium underline"
                >
                  {hideDetailsButtonText}
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-3">
                {footerText}
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

import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from './supabase';

export function NewsletterSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setMessage({ type: 'error', text: 'Por favor ingresa un email válido' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            ip_address: null,
            user_agent: navigator.userAgent
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setMessage({ type: 'error', text: 'Este email ya está suscrito a nuestro newsletter' });
          return;
        }
        throw new Error(errorData.error || 'Error al suscribirse');
      }

      setMessage({ type: 'success', text: '¡Gracias por suscribirte! Pronto recibirás nuestras actualizaciones.' });
      setName('');
      setEmail('');
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      setMessage({ type: 'error', text: 'Ocurrió un error. Por favor intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-red-900 to-red-800 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-2">
            <Mail className="w-6 h-6 text-red-900" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Únete a Nuestro Newsletter
          </h2>
          <p className="text-red-100 text-sm max-w-xl mx-auto">
            Recibe las últimas actualizaciones sobre normas legales y regulaciones
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-5">
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="newsletter-name" className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  id="newsletter-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label htmlFor="newsletter-email" className="block text-xs font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-900 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Suscribiendo...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Suscribirme</span>
                </>
              )}
            </button>

            {message && (
              <div className={`mt-3 p-3 rounded-lg flex items-start space-x-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-xs">{message.text}</p>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center mt-3">
              Al suscribirte, aceptas recibir correos con actualizaciones.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

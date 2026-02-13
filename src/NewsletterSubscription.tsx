import React, { useState } from 'react';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from './supabase';

export const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (!email || !name) {
      setStatus('error');
      setMessage('Por favor completa todos los campos');
      return;
    }

    if (!acceptTerms) {
      setStatus('error');
      setMessage('Debes aceptar recibir comunicaciones por correo');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Por favor ingresa un correo válido');
      return;
    }

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: email.toLowerCase().trim(),
            name: name.trim(),
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          setStatus('error');
          setMessage('Este correo ya está suscrito');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setMessage('¡Te has suscrito exitosamente!');
        setEmail('');
        setName('');
        setAcceptTerms(false);

        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error al suscribirse:', error);
      setStatus('error');
      setMessage('Hubo un error al procesar tu suscripción');
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Mail className="w-12 h-12" />
          </div>
          <h3 className="text-3xl font-bold mb-2">Únete a Nuestro Newsletter</h3>
          <p className="text-red-100 mb-6">
            Recibe las últimas actualizaciones legales directamente en tu correo
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status === 'loading'}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === 'loading' ? 'Suscribiendo...' : 'Suscribirse'}
              </button>
            </div>

            <div className="flex items-start gap-2 text-left max-w-xl mx-auto">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={status === 'loading'}
                className="mt-1 w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="acceptTerms" className="text-sm text-red-50 cursor-pointer">
                Acepto recibir comunicaciones por correo electrónico
              </label>
            </div>

            {message && (
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                status === 'success'
                  ? 'bg-green-500 bg-opacity-20 border border-green-300'
                  : 'bg-red-900 bg-opacity-40 border border-red-300'
              }`}>
                {status === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}
          </form>

          <p className="text-red-100 text-sm mt-4">
            No compartimos tu información con terceros
          </p>
        </div>
      </div>
    </div>
  );
};

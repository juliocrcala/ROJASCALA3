import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { supabase } from './supabase';

export const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: email.trim().toLowerCase(),
            name: name.trim(),
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          setMessage('Este correo ya está suscrito a nuestro newsletter.');
          setStatus('error');
        } else {
          throw error;
        }
      } else {
        setMessage('¡Gracias por suscribirte! Pronto recibirás nuestras actualizaciones.');
        setStatus('success');
        setEmail('');
        setName('');

        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage('Hubo un error al procesar tu suscripción. Por favor, intenta nuevamente.');
      setStatus('error');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-white/10 p-3 rounded-full">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Únete a nuestro Newsletter</h3>
          <p className="text-blue-100 text-sm">Recibe las últimas actualizaciones legales en tu correo</p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="bg-green-500/20 border border-green-400 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
          <p className="text-green-100 text-sm">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
            />
          </div>

          {status === 'error' && (
            <div className="bg-red-500/20 border border-red-400 rounded-lg p-3">
              <p className="text-red-100 text-sm">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {status === 'loading' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900"></div>
                <span>Suscribiendo...</span>
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                <span>Suscribirme</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

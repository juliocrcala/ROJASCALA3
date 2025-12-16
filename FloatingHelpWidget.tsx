import React, { useState } from 'react';
import { MessageCircle, X, Send, User, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export function FloatingHelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validar campos
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        throw new Error('Todos los campos son obligatorios');
      }

      // Validar email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Por favor ingresa un email válido');
      }

      // Guardar consulta en Supabase
      const { data, error: supabaseError } = await supabase
        .from('consultations')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            message: formData.message.trim(),
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (supabaseError) {
        console.error('Error saving consultation:', supabaseError);
        throw new Error('Error al enviar la consulta. Por favor intenta nuevamente.');
      }

      console.log('Consultation saved successfully:', data);
      setIsSubmitted(true);
      
      // Reset después de 3 segundos
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        setFormData({ name: '', email: '', message: '' });
      }, 3000);

    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Error al enviar el mensaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative group
            w-16 h-16 rounded-full shadow-2xl
            bg-gradient-to-r from-red-600 to-red-700
            hover:from-red-700 hover:to-red-800
            text-white
            transition-all duration-300 ease-in-out
            transform hover:scale-110
            ${isOpen ? 'rotate-180' : 'hover:rotate-12'}
          `}
        >
          {isOpen ? (
            <X className="w-8 h-8 mx-auto transition-transform duration-300" />
          ) : (
            <MessageCircle className="w-8 h-8 mx-auto transition-transform duration-300" />
          )}
          
          {/* Efecto de pulso */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20"></div>
          )}
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              ¿Tienes alguna duda?
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          </div>
        </button>
      </div>

      {/* Modal del formulario */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-6">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Formulario */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">¿Necesitas ayuda?</h3>
                  <p className="text-red-100 text-sm mt-1">Estamos aquí para ayudarte</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-red-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">¡Consulta enviada!</h4>
                  <p className="text-gray-600">
                    Gracias por contactarnos. Revisaremos tu consulta y te responderemos pronto.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  )}

                  {/* Campo Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  {/* Campo Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="tu@email.com"
                    />
                  </div>

                  {/* Campo Mensaje */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Tu duda o sugerencia
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Describe tu duda o sugerencia..."
                    />
                  </div>

                  {/* Botón de envío */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Enviar consulta</span>
                      </>
                    )}
                  </button>

                  {/* Nota de privacidad */}
                  <p className="text-xs text-gray-500 text-center">
                    Tu información será tratada de forma confidencial y solo será usada para responder tu consulta.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Mail, AlertCircle, Download, CheckCircle, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Subscriber {
  id: string;
  name: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
}

export function NewsletterManager() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('is_active');

      if (error) throw error;

      const total = data?.length || 0;
      const active = data?.filter(sub => sub.is_active).length || 0;
      const inactive = total - active;

      setStats({ total, active, inactive });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }

    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
  };

  const exportToCSV = async () => {
    try {
      setIsExporting(true);
      setError(null);

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        showMessage('No hay suscriptores para exportar', 'error');
        return;
      }

      const csv = [
        ['Nombre', 'Email', 'Fecha de Suscripción', 'Estado'],
        ...data.map((sub: Subscriber) => [
          sub.name,
          sub.email,
          format(new Date(sub.subscribed_at), 'dd/MM/yyyy HH:mm', { locale: es }),
          sub.is_active ? 'Activo' : 'Inactivo'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showMessage(`Archivo CSV exportado exitosamente con ${data.length} suscriptores`, 'success');
    } catch (error: any) {
      console.error('Error exporting CSV:', error);
      showMessage('Error al exportar el archivo CSV', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl flex items-center space-x-2">
          <Download className="w-6 h-6 animate-pulse" />
          <span>Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Suscriptores del Newsletter</h2>
        <p className="text-gray-600">
          Exporta la lista completa de suscriptores en formato CSV para gestionar tu base de datos de correos.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Inactivos</p>
              <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <FileDown className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Exportar Lista de Suscriptores
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Descarga un archivo CSV con todos los suscriptores del newsletter incluyendo nombre, email, fecha de suscripción y estado.
            </p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={isExporting || stats.total === 0}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg font-medium flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <>
                <Download className="w-5 h-5 animate-bounce" />
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Descargar CSV</span>
              </>
            )}
          </button>
          {stats.total === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No hay suscriptores para exportar
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Información sobre el archivo CSV</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>El archivo incluye todos los suscriptores registrados</li>
              <li>Compatible con Excel, Google Sheets y otros programas</li>
              <li>Los datos se exportan en tiempo real desde la base de datos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

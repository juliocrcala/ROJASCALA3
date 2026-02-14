import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Mail, Trash2, RefreshCw, AlertCircle, Download, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Subscriber {
  id: string;
  name: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      console.error('Error fetching subscribers:', error);
      setError('Error al cargar los suscriptores');
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

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${email}?`)) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showMessage('Suscriptor eliminado exitosamente', 'success');
      setSubscribers(prev => prev.filter(sub => sub.id !== id));
    } catch (error: any) {
      console.error('Error deleting subscriber:', error);
      showMessage('Error al eliminar el suscriptor', 'error');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      showMessage(`Suscriptor ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');

      setSubscribers(prev => prev.map(sub =>
        sub.id === id ? { ...sub, is_active: !currentStatus } : sub
      ));
    } catch (error: any) {
      console.error('Error updating subscriber status:', error);
      showMessage('Error al actualizar el estado', 'error');
    }
  };

  const exportToCSV = () => {
    const filteredSubs = getFilteredSubscribers();

    const csv = [
      ['Nombre', 'Email', 'Fecha de Suscripción', 'Estado'],
      ...filteredSubs.map(sub => [
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
  };

  const getFilteredSubscribers = () => {
    if (filter === 'active') {
      return subscribers.filter(sub => sub.is_active);
    } else if (filter === 'inactive') {
      return subscribers.filter(sub => !sub.is_active);
    }
    return subscribers;
  };

  const filteredSubscribers = getFilteredSubscribers();
  const activeCount = subscribers.filter(sub => sub.is_active).length;
  const inactiveCount = subscribers.filter(sub => !sub.is_active).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Cargando suscriptores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Suscriptores del Newsletter</h2>
          <p className="text-gray-600 mt-1">Total: {subscribers.length} | Activos: {activeCount} | Inactivos: {inactiveCount}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchSubscribers}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm flex items-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refrescar</span>
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredSubscribers.length === 0}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
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

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-red-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({subscribers.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-red-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Activos ({activeCount})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'inactive'
                  ? 'bg-red-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactivos ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de suscriptores */}
      {filteredSubscribers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {filter === 'all'
              ? 'No hay suscriptores registrados aún'
              : `No hay suscriptores ${filter === 'active' ? 'activos' : 'inactivos'}`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Suscripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{subscriber.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{subscriber.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(new Date(subscriber.subscribed_at), "dd 'de' MMMM, yyyy", { locale: es })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(subscriber.subscribed_at), 'HH:mm', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subscriber.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscriber.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleActive(subscriber.id, subscriber.is_active)}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                          subscriber.is_active
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {subscriber.is_active ? (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activar
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(subscriber.id, subscriber.email)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

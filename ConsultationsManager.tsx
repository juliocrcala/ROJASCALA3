import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Trash2, Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle, Clock, Reply, Search, Filter, Calendar, User, Mail, X } from 'lucide-react';

interface Consultation {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'read' | 'replied';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="w-4 h-4" />
  },
  read: {
    label: 'Leída',
    color: 'bg-blue-100 text-blue-800',
    icon: <Eye className="w-4 h-4" />
  },
  replied: {
    label: 'Respondida',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="w-4 h-4" />
  }
};

export function ConsultationsManager() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error: any) {
      console.error('Error fetching consultations:', error);
      setError('Error al cargar las consultas. Verifica tu conexión a internet.');
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

  const updateConsultationStatus = async (id: string, newStatus: 'pending' | 'read' | 'replied') => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('consultations')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setConsultations(prev => prev.map(consultation => 
        consultation.id === id ? data : consultation
      ));

      showMessage(`Consulta marcada como ${statusConfig[newStatus].label.toLowerCase()}`, 'success');
    } catch (error: any) {
      console.error('Error updating consultation status:', error);
      showMessage('Error al actualizar el estado de la consulta', 'error');
    }
  };

  const deleteConsultation = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta consulta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setError(null);
      
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConsultations(prev => prev.filter(consultation => consultation.id !== id));
      showMessage('Consulta eliminada exitosamente', 'success');
      
      if (selectedConsultation?.id === id) {
        setSelectedConsultation(null);
        setShowModal(false);
      }
    } catch (error: any) {
      console.error('Error deleting consultation:', error);
      showMessage('Error al eliminar la consulta', 'error');
    }
  };

  const openConsultationModal = async (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowModal(true);
    
    // Marcar como leída si está pendiente
    if (consultation.status === 'pending') {
      await updateConsultationStatus(consultation.id, 'read');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openEmailClient = (consultation: Consultation) => {
    const subject = encodeURIComponent(`Re: Tu consulta - ${consultation.message.substring(0, 50)}...`);
    const body = encodeURIComponent(`Hola ${consultation.name},

Gracias por contactarnos. En respuesta a tu consulta:

"${consultation.message}"

[Escribe tu respuesta aquí]

Saludos cordiales,
Julio Cesar Rojas Cala
Especialista Legal

---
Rojas Cala - Análisis de Normas Legales
Email: julio.cesar@rojascala.org`);
    
    const mailtoLink = `mailto:${consultation.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    // Marcar como respondida
    updateConsultationStatus(consultation.id, 'replied');
  };

  // Filtrar y ordenar consultas
  const getFilteredConsultations = () => {
    let filtered = [...consultations];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(consultation => 
        consultation.name.toLowerCase().includes(searchLower) ||
        consultation.email.toLowerCase().includes(searchLower) ||
        consultation.message.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(consultation => consultation.status === statusFilter);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getStatusStats = () => {
    const pending = consultations.filter(c => c.status === 'pending').length;
    const read = consultations.filter(c => c.status === 'read').length;
    const replied = consultations.filter(c => c.status === 'replied').length;
    return { pending, read, replied, total: consultations.length };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Cargando consultas...</span>
        </div>
      </div>
    );
  }

  const filteredConsultations = getFilteredConsultations();
  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Consultas</h2>
        <button
          onClick={fetchConsultations}
          className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm flex items-center space-x-1"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Leídas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.read}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Respondidas</p>
              <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes de estado */}
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

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o mensaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="read">Leídas</option>
              <option value="replied">Respondidas</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'date' | 'name' | 'status');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="date-desc">Más recientes</option>
              <option value="date-asc">Más antiguos</option>
              <option value="name-asc">Nombre A-Z</option>
              <option value="name-desc">Nombre Z-A</option>
              <option value="status-asc">Estado A-Z</option>
              <option value="status-desc">Estado Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de consultas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredConsultations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredConsultations.map((consultation) => (
              <div key={consultation.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{consultation.name}</h3>
                      <select
                        value={consultation.status}
                        onChange={(e) => updateConsultationStatus(consultation.id, e.target.value as 'pending' | 'read' | 'replied')}
                        className={`text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-red-500 ${statusConfig[consultation.status].color}`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="read">Leída</option>
                        <option value="replied">Respondida</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{consultation.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(consultation.created_at)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 line-clamp-2 mb-3">{consultation.message}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openConsultationModal(consultation)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => openEmailClient(consultation)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Responder por email"
                    >
                      <Reply className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => deleteConsultation(consultation.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Eliminar consulta"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {consultations.length === 0 ? 'No hay consultas' : 'No se encontraron consultas'}
            </h3>
            <p className="text-gray-600">
              {consultations.length === 0 
                ? 'Aún no has recibido ninguna consulta.' 
                : 'No hay consultas que coincidan con los filtros aplicados.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalles de la Consulta</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del consultante */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Información del consultante</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <p className="text-gray-900">{selectedConsultation.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedConsultation.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha</label>
                      <p className="text-gray-900">{formatDate(selectedConsultation.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <select
                        value={selectedConsultation.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as 'pending' | 'read' | 'replied';
                          updateConsultationStatus(selectedConsultation.id, newStatus);
                          setSelectedConsultation({...selectedConsultation, status: newStatus});
                        }}
                        className={`text-xs font-medium rounded-lg border border-gray-300 px-3 py-1 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${statusConfig[selectedConsultation.status].color}`}
                      >
                        <option value="pending">🕐 Pendiente</option>
                        <option value="read">👁️ Leída</option>
                        <option value="replied">✅ Respondida</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mensaje */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Mensaje</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedConsultation.message}</p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openEmailClient(selectedConsultation)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Responder por email</span>
                  </button>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>💡 Tip: Cambia el estado usando el dropdown de arriba</span>
                  </div>
                  
                  <button
                    onClick={() => deleteConsultation(selectedConsultation.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar consulta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
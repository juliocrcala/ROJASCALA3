import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Plus, Edit, Trash2, Save, X, AlertCircle, User, Mail, Linkedin, Instagram, ExternalLink, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  bio?: string;
  services_link?: string;
  job_title?: string;
  services_description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function ContactsManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photo_url: '',
    linkedin_url: '',
    instagram_url: '',
    bio: '',
    services_link: '',
    job_title: 'Especialista Legal',
    services_description: '',
    is_active: true,
    display_order: 999
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      setError('Error al cargar los contactos. Verifica tu conexión a internet.');
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

  const getNextOrderNumber = (position: 'first' | 'last' | number) => {
    if (contacts.length === 0) return 1;
    
    if (position === 'first') {
      const minOrder = Math.min(...contacts.map(c => c.display_order));
      return Math.max(1, minOrder - 1);
    } else if (position === 'last') {
      const maxOrder = Math.max(...contacts.map(c => c.display_order));
      return maxOrder + 1;
    } else if (typeof position === 'number') {
      // Insertar en posición específica
      const sortedContacts = [...contacts].sort((a, b) => a.display_order - b.display_order);
      if (position <= 1) return getNextOrderNumber('first');
      if (position > sortedContacts.length) return getNextOrderNumber('last');
      
      const prevOrder = sortedContacts[position - 2].display_order;
      const nextOrder = sortedContacts[position - 1].display_order;
      
      // Si hay espacio entre los números, usar el punto medio
      if (nextOrder - prevOrder > 1) {
        return Math.floor((prevOrder + nextOrder) / 2);
      } else {
        // Si no hay espacio, reorganizar todos los números
        return position;
      }
    }
    
    return 999;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validar campos requeridos
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!formData.email.trim()) {
        throw new Error('El email es requerido');
      }

      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        photo_url: formData.photo_url.trim() || null,
        linkedin_url: formData.linkedin_url.trim() || null,
        instagram_url: formData.instagram_url.trim() || null,
        bio: formData.bio.trim() || null,
        services_link: formData.services_link.trim() || null,
        job_title: formData.job_title.trim() || 'Especialista Legal',
        services_description: formData.services_description.trim() || null,
        is_active: formData.is_active,
        display_order: formData.display_order
      };

      if (editingId) {
        const { data: updatedContact, error: updateError } = await supabase
          .from('contacts')
          .update({ ...contactData, updated_at: new Date().toISOString() })
          .eq('id', editingId)
          .select()
          .maybeSingle();

        if (updateError) throw updateError;
        if (!updatedContact) throw new Error('No se pudo actualizar el contacto');

        showMessage('Contacto actualizado exitosamente', 'success');
        
        setContacts(prev => prev.map(contact => 
          contact.id === editingId ? updatedContact : contact
        ).sort((a, b) => a.display_order - b.display_order));
      } else {
        const { data: newContact, error: createError } = await supabase
          .from('contacts')
          .insert([contactData])
          .select()
          .single();

        if (createError) throw createError;

        showMessage('Contacto creado exitosamente', 'success');
        
        setContacts(prev => [...prev, newContact].sort((a, b) => a.display_order - b.display_order));
      }

      resetForm();
    } catch (error: any) {
      console.error('Error saving contact:', error);
      if (error.code === '23505') {
        showMessage('Ya existe un contacto con ese email', 'error');
      } else {
        showMessage(error.message || 'Error al guardar. Intenta nuevamente.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      photo_url: '',
      linkedin_url: '',
      instagram_url: '',
      bio: '',
      services_link: '',
      job_title: 'Especialista Legal',
      services_description: '',
      is_active: true,
      display_order: getNextOrderNumber('last')
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (contact: Contact) => {
    const safeContact = {
      name: contact.name || '',
      email: contact.email || '',
      photo_url: contact.photo_url || '',
      linkedin_url: contact.linkedin_url || '',
      instagram_url: contact.instagram_url || '',
      bio: contact.bio || '',
      services_link: contact.services_link || '',
      job_title: contact.job_title || 'Especialista Legal',
      services_description: contact.services_description || '',
      is_active: contact.is_active !== false,
      display_order: contact.display_order || 999
    };
    
    setFormData(safeContact);
    setEditingId(contact.id);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contacto?')) return;

    try {
      setError(null);
      
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showMessage('Contacto eliminado exitosamente', 'success');
      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      showMessage('Error al eliminar el contacto', 'error');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setError(null);
      
      const { data: updatedContact, error: updateError } = await supabase
        .from('contacts')
        .update({ 
          is_active: !currentStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      if (!updatedContact) throw new Error('Contacto no encontrado');

      showMessage(`Contacto ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
      
      setContacts(prev => prev.map(contact => 
        contact.id === id ? updatedContact : contact
      ));
    } catch (error: any) {
      console.error('Error updating contact status:', error);
      showMessage('Error al actualizar el estado del contacto', 'error');
    }
  };

  const moveContact = async (id: string, direction: 'up' | 'down') => {
    try {
      setError(null);
      const sortedContacts = [...contacts].sort((a, b) => a.display_order - b.display_order);
      const currentIndex = sortedContacts.findIndex(c => c.id === id);
      
      if (currentIndex === -1) return;
      
      let newOrder: number;
      
      if (direction === 'up' && currentIndex > 0) {
        // Mover hacia arriba (menor número de orden)
        const prevContact = sortedContacts[currentIndex - 1];
        newOrder = prevContact.display_order - 1;
      } else if (direction === 'down' && currentIndex < sortedContacts.length - 1) {
        // Mover hacia abajo (mayor número de orden)
        const nextContact = sortedContacts[currentIndex + 1];
        newOrder = nextContact.display_order + 1;
      } else {
        return; // No se puede mover más
      }

      const { data: updatedContact, error: updateError } = await supabase
        .from('contacts')
        .update({ 
          display_order: newOrder,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      showMessage(`Contacto movido ${direction === 'up' ? 'hacia arriba' : 'hacia abajo'}`, 'success');
      
      setContacts(prev => prev.map(contact => 
        contact.id === id ? updatedContact : contact
      ).sort((a, b) => a.display_order - b.display_order));
    } catch (error: any) {
      console.error('Error moving contact:', error);
      showMessage('Error al cambiar el orden del contacto', 'error');
    }
  };

  const forceRefresh = async () => {
    setIsLoading(true);
    await fetchContacts();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Cargando contactos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Contactos</h2>
        <div className="flex space-x-2">
          <button
            onClick={forceRefresh}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm flex items-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refrescar</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-800"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Contacto</span>
          </button>
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
          <div className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          {success}
        </div>
      )}

      {/* Formulario Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {editingId ? 'Editar Contacto' : 'Nuevo Contacto'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ej: Juan Pérez García"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título Profesional
                </label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Especialista Legal, Abogado Senior, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Foto de Perfil
                </label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://images.pexels.com/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Puedes usar fotos de Pexels como: https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografía / Acerca de
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Breve descripción profesional..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de Servicios
                </label>
                <textarea
                  value={formData.services_description}
                  onChange={(e) => setFormData({ ...formData, services_description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Describe los servicios que ofreces..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enlace a Servicios (PDF en Drive, etc.)
                </label>
                <input
                  type="url"
                  value={formData.services_link}
                  onChange={(e) => setFormData({ ...formData, services_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://drive.google.com/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enlace a un PDF o documento con los servicios que ofrece el contacto
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Contacto activo (visible públicamente)
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-red-900 text-white rounded-md hover:bg-red-800 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editingId ? 'Actualizar' : 'Guardar'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de contactos en formato horizontal con controles de orden */}
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={contact.id} className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${!contact.is_active ? 'opacity-60' : ''}`}>
            <div className="p-6">
              <div className="flex items-start space-x-6">
                {/* Controles de orden */}
                <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full text-sm font-bold text-red-900">
                    {index + 1}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveContact(contact.id, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
                      title="Mover hacia arriba"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveContact(contact.id, 'down')}
                      disabled={index === contacts.length - 1}
                      className={`p-1 rounded ${index === contacts.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
                      title="Mover hacia abajo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Foto de perfil */}
                <div className="flex-shrink-0">
                  {contact.photo_url ? (
                    <img 
                      src={contact.photo_url} 
                      alt={contact.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Información del contacto */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{contact.name}</h3>
                      <p className="text-red-600 text-sm font-semibold">{contact.job_title || 'Especialista Legal'}</p>
                      <p className="text-gray-600 text-sm flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-2" />
                        {contact.email}
                      </p>
                    </div>
                    
                    {/* Estado y acciones */}
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${contact.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {contact.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleActive(contact.id, contact.is_active)}
                          className={`px-3 py-1 text-xs rounded-md font-medium ${contact.is_active ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                        >
                          {contact.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleEdit(contact)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Biografía */}
                  {contact.bio && (
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm leading-relaxed">{contact.bio}</p>
                    </div>
                  )}

                  {/* Servicios */}
                  {contact.services_description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Servicios:</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{contact.services_description}</p>
                    </div>
                  )}

                  {/* Enlaces y redes sociales */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {contact.linkedin_url && (
                        <a
                          href={contact.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-white" />
                        </a>
                      )}
                      {contact.instagram_url && (
                        <a
                          href={contact.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors"
                        >
                          <Instagram className="w-4 h-4 text-white" />
                        </a>
                      )}
                    </div>

                    {/* Enlace a servicios */}
                    {contact.services_link && (
                      <a
                        href={contact.services_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-red-900 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ver servicios completos
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay contactos registrados aún.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-800"
          >
            Crear primer contacto
          </button>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, Save, X, AlertCircle, Tag, FileText, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: 'category' | 'document_type';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [documentTypes, setDocumentTypes] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'document_types'>('categories');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'category' as 'category' | 'document_type',
    display_order: 999,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('categories_config')
        .select('*')
        .order('type', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const allData = data || [];
      setCategories(allData.filter(item => item.type === 'category'));
      setDocumentTypes(allData.filter(item => item.type === 'document_type'));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos. Verifica tu conexión a internet.');
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

  const getNextOrderNumber = () => {
    const currentList = activeTab === 'categories' ? categories : documentTypes;
    if (currentList.length === 0) return 1;
    const maxOrder = Math.max(...currentList.map(item => item.display_order));
    return maxOrder + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido');
      }

      const itemData = {
        name: formData.name.trim(),
        type: activeTab === 'categories' ? 'category' : 'document_type',
        display_order: formData.display_order,
        is_active: formData.is_active
      };

      if (editingId) {
        const { data, error } = await supabase
          .from('categories_config')
          .update({ ...itemData, updated_at: new Date().toISOString() })
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        showMessage(`${activeTab === 'categories' ? 'Categoría' : 'Tipo de norma'} actualizado exitosamente`, 'success');
      } else {
        const { data, error } = await supabase
          .from('categories_config')
          .insert([itemData])
          .select()
          .single();

        if (error) throw error;
        showMessage(`${activeTab === 'categories' ? 'Categoría' : 'Tipo de norma'} creado exitosamente`, 'success');
      }

      await fetchData();
      resetForm();
    } catch (error: any) {
      console.error('Error saving:', error);
      if (error.code === '23505') {
        showMessage('Ya existe un elemento con ese nombre', 'error');
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
      type: activeTab === 'categories' ? 'category' : 'document_type',
      display_order: getNextOrderNumber(),
      is_active: true
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (item: Category) => {
    setFormData({
      name: item.name,
      type: item.type,
      display_order: item.display_order,
      is_active: item.is_active
    });
    setEditingId(item.id);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${name}"? Esta acción no se puede deshacer.`)) return;

    try {
      setError(null);
      
      const { error } = await supabase
        .from('categories_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showMessage('Elemento eliminado exitosamente', 'success');
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting:', error);
      showMessage('Error al eliminar el elemento', 'error');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('categories_config')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      showMessage(`Elemento ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
      await fetchData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      showMessage('Error al cambiar el estado del elemento', 'error');
    }
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    try {
      setError(null);
      const currentList = activeTab === 'categories' ? categories : documentTypes;
      const sortedList = [...currentList].sort((a, b) => a.display_order - b.display_order);
      const currentIndex = sortedList.findIndex(item => item.id === id);
      
      if (currentIndex === -1) return;
      
      let newOrder: number;
      
      if (direction === 'up' && currentIndex > 0) {
        const prevItem = sortedList[currentIndex - 1];
        newOrder = prevItem.display_order - 1;
      } else if (direction === 'down' && currentIndex < sortedList.length - 1) {
        const nextItem = sortedList[currentIndex + 1];
        newOrder = nextItem.display_order + 1;
      } else {
        return;
      }

      const { error } = await supabase
        .from('categories_config')
        .update({ 
          display_order: newOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      showMessage(`Elemento movido ${direction === 'up' ? 'hacia arriba' : 'hacia abajo'}`, 'success');
      await fetchData();
    } catch (error: any) {
      console.error('Error moving item:', error);
      showMessage('Error al cambiar el orden del elemento', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Cargando configuración...</span>
        </div>
      </div>
    );
  }

  const currentList = activeTab === 'categories' ? categories : documentTypes;
  const currentTitle = activeTab === 'categories' ? 'Categorías' : 'Tipos de Normas';
  const currentIcon = activeTab === 'categories' ? Tag : FileText;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de {currentTitle}</h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchData}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm flex items-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refrescar</span>
          </button>
          <button
            onClick={() => {
              setFormData({
                name: '',
                type: activeTab === 'categories' ? 'category' : 'document_type',
                display_order: getNextOrderNumber(),
                is_active: true
              });
              setShowForm(true);
            }}
            className="bg-red-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-800"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo {activeTab === 'categories' ? 'Categoría' : 'Tipo'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'categories'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Categorías ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('document_types')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'document_types'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tipos de Normas ({documentTypes.length})</span>
          </button>
        </nav>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {editingId ? 'Editar' : 'Nuevo'} {activeTab === 'categories' ? 'Categoría' : 'Tipo de Norma'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={`Nombre de la ${activeTab === 'categories' ? 'categoría' : 'tipo de norma'}`}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Activo (disponible para usar)
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

      {/* Lista de elementos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {currentList.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentList
              .sort((a, b) => a.display_order - b.display_order)
              .map((item, index) => (
                <div key={item.id} className={`p-4 hover:bg-gray-50 transition-colors ${!item.is_active ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Controles de orden */}
                      <div className="flex flex-col items-center space-y-1">
                        <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full text-xs font-bold text-red-900">
                          {index + 1}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => moveItem(item.id, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
                            title="Mover hacia arriba"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveItem(item.id, 'down')}
                            disabled={index === currentList.length - 1}
                            className={`p-1 rounded ${index === currentList.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
                            title="Mover hacia abajo"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Información del elemento */}
                      <div className="flex items-center space-x-3">
                        {React.createElement(currentIcon, { className: "w-5 h-5 text-gray-400" })}
                        <div>
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            Creado: {new Date(item.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Estado y acciones */}
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleActive(item.id, item.is_active)}
                          className={`px-3 py-1 text-xs rounded-md font-medium ${item.is_active ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                        >
                          {item.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {React.createElement(currentIcon, { className: "w-8 h-8 text-gray-400" })}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay {currentTitle.toLowerCase()} configuradas
            </h3>
            <p className="text-gray-600 mb-4">
              Crea tu primera {activeTab === 'categories' ? 'categoría' : 'tipo de norma'} para comenzar.
            </p>
            <button
              onClick={() => {
                setFormData({
                  name: '',
                  type: activeTab === 'categories' ? 'category' : 'document_type',
                  display_order: 1,
                  is_active: true
                });
                setShowForm(true);
              }}
              className="bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-800"
            >
              Crear primera {activeTab === 'categories' ? 'categoría' : 'tipo de norma'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
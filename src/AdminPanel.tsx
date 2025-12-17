import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Plus, CreditCard as Edit, Trash2, Save, X, AlertCircle, Image, Users, FileText, Star, Eye, EyeOff, MessageSquare, LogOut, Shield, Wrench, Pencil } from 'lucide-react';
import { useAuth } from './useAuth';
import { AdminLogin } from './AdminLogin';
import { ContactsManager } from './ContactsManager';
import { ConsultationsManager } from './ConsultationsManager';
import { CategoriesManager } from './CategoriesManager';

interface Article {
  id: string;
  title: string;
  author: string;
  document_type: string;
  published_date: string;
  category: string[];
  content: string;
  summary?: string;
  official_link?: string;
  author_contact_id?: string;
  is_hidden?: boolean;
  created_at: string;
}

interface SpecialArticle {
  id: string;
  title: string;
  author: string;
  published_date: string;
  category: string[];
  content: string;
  summary?: string;
  image_url?: string;
  author_contact_id?: string;
  is_hidden?: boolean;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  bio?: string;
  is_active: boolean;
}

// Función para formatear fechas de forma segura (sin problemas de zona horaria)
const formatDateSafe = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

export function AdminPanel() {
  const { isAuthenticated, login, logout, error: authError } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'articles' | 'specials' | 'contacts' | 'consultations' | 'categories'>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [specialArticles, setSpecialArticles] = useState<SpecialArticle[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showEditMessages, setShowEditMessages] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState('Página en Mantenimiento');
  const [maintenanceMessage, setMaintenanceMessage] = useState('Estamos realizando mejoras en nuestro sitio para brindarte una mejor experiencia.');
  const [maintenanceTimeMessage, setMaintenanceTimeMessage] = useState('Volveremos en unos minutos');
  const [maintenanceFooterMessage, setMaintenanceFooterMessage] = useState('Gracias por tu paciencia y comprensión.');
  const [maintenanceCompanyName, setMaintenanceCompanyName] = useState('Rojas Cala Asociados - Asesoría Legal');
  const [formData, setFormData] = useState({
    title: '',
    author: 'Julio Cesar Rojas Cala',
    author_contact_id: '',
    document_type: '',
    published_date: new Date().toISOString().split('T')[0],
    category: [] as string[],
    content: '',
    summary: '',
    official_link: '',
    image_url: '',
    is_hidden: false
  });

  useEffect(() => {
    fetchData();
    fetchCategoriesConfig();
    // Cargar estado de mantenimiento y mensajes desde localStorage
    const savedMode = localStorage.getItem('maintenanceMode');
    if (savedMode !== null) {
      setMaintenanceMode(savedMode === 'true');
    }

    const savedTitle = localStorage.getItem('maintenanceTitle');
    if (savedTitle) setMaintenanceTitle(savedTitle);

    const savedMessage = localStorage.getItem('maintenanceMessage');
    if (savedMessage) setMaintenanceMessage(savedMessage);

    const savedTimeMessage = localStorage.getItem('maintenanceTimeMessage');
    if (savedTimeMessage) setMaintenanceTimeMessage(savedTimeMessage);

    const savedFooterMessage = localStorage.getItem('maintenanceFooterMessage');
    if (savedFooterMessage) setMaintenanceFooterMessage(savedFooterMessage);

    const savedCompanyName = localStorage.getItem('maintenanceCompanyName');
    if (savedCompanyName) setMaintenanceCompanyName(savedCompanyName);
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      await Promise.all([fetchArticles(), fetchSpecialArticles(), fetchContacts(), fetchCategoriesConfig()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos. Verifica tu conexión a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        contact:author_contact_id(name, email)
      `)
      .order('published_date', { ascending: false });

    if (error) throw error;
    setArticles(data || []);
  };

  const fetchSpecialArticles = async () => {
    const { data, error } = await supabase
      .from('special_articles')
      .select(`
        *,
        contact:author_contact_id(name, email)
      `)
      .order('published_date', { ascending: false });

    if (error && error.code !== 'PGRST116') { // Ignore table not found error
      throw error;
    }
    setSpecialArticles(data || []);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error && error.code !== 'PGRST116') { // Ignore table not found error
      throw error;
    }
    setContacts(data || []);
  };

  const fetchCategoriesConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('categories_config')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error && error.code !== 'PGRST116') { // Ignore table not found error
        throw error;
      }

      const allData = data || [];
      setDocumentTypes(allData.filter(item => item.type === 'document_type').map(item => item.name));
      setCategories(allData.filter(item => item.type === 'category').map(item => item.name));
    } catch (error: any) {
      console.error('Error fetching categories config:', error);
      // Fallback to hardcoded values if table doesn't exist
      setDocumentTypes([
        "Ley", "Decreto Supremo", "Resolución Ministerial", "Resolución Directoral",
        "Ordenanza", "Acuerdo", "Directiva", "Reglamento"
      ]);
      setCategories([
        "Constitucional", "Administrativo", "Civil", "Penal", "Laboral",
        "Tributario", "Ambiental", "Comercial"
      ]);
    }
  };

  const toggleMaintenanceMode = () => {
    const newMode = !maintenanceMode;
    setMaintenanceMode(newMode);
    localStorage.setItem('maintenanceMode', String(newMode));

    // Disparar evento para que otras partes de la app se actualicen inmediatamente
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'maintenanceMode',
      newValue: String(newMode),
      storageArea: localStorage
    }));

    setSuccess(
      newMode
        ? 'Modo mantenimiento activado'
        : 'Modo mantenimiento desactivado'
    );
    setTimeout(() => setSuccess(null), 3000);
  };

  const saveMaintenanceMessages = () => {
    localStorage.setItem('maintenanceTitle', maintenanceTitle);
    localStorage.setItem('maintenanceMessage', maintenanceMessage);
    localStorage.setItem('maintenanceTimeMessage', maintenanceTimeMessage);
    localStorage.setItem('maintenanceFooterMessage', maintenanceFooterMessage);
    localStorage.setItem('maintenanceCompanyName', maintenanceCompanyName);
    setSuccess('Mensajes de mantenimiento guardados');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} error={authError} />;
  }

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

  const handleCategoryChange = (categoryName: string) => {
    setFormData(prev => {
      const newCategories = prev.category.includes(categoryName)
        ? prev.category.filter(cat => cat !== categoryName)
        : [...prev.category, categoryName];
      
      return { ...prev, category: newCategories };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validar campos requeridos
      if (!formData.title.trim()) {
        throw new Error('El título es requerido');
      }
      if (formData.category.length === 0) {
        throw new Error('Debe seleccionar al menos una categoría');
      }
      if (!formData.content.trim()) {
        throw new Error('El contenido es requerido');
      }

      // Determinar el autor basado en la selección
      let authorName = formData.author;
      let authorContactId = formData.author_contact_id || null;

      if (formData.author_contact_id) {
        const selectedContact = contacts.find(c => c.id === formData.author_contact_id);
        if (selectedContact) {
          authorName = selectedContact.name;
        }
      }

      const baseData = {
        title: formData.title.trim(),
        author: authorName,
        author_contact_id: authorContactId,
        published_date: formData.published_date,
        category: formData.category,
        content: formData.content.trim(),
        summary: formData.summary.trim() || null,
        is_hidden: formData.is_hidden
      };

      if (activeTab === 'articles') {
        if (!formData.document_type) {
          throw new Error('El tipo de documento es requerido');
        }

        const articleData = {
          ...baseData,
          document_type: formData.document_type,
          official_link: formData.official_link.trim() || null
        };

        if (editingId) {
          const { error } = await supabase
            .from('articles')
            .update({ ...articleData, updated_at: new Date().toISOString() })
            .eq('id', editingId);

          if (error) throw error;
          showMessage('Artículo actualizado exitosamente', 'success');
        } else {
          const { error } = await supabase
            .from('articles')
            .insert([articleData]);

          if (error) throw error;
          showMessage('Artículo creado exitosamente', 'success');
        }
        await fetchArticles();
      } else if (activeTab === 'specials') {
        const specialData = {
          ...baseData,
          image_url: formData.image_url.trim() || null
        };

        if (editingId) {
          const { error } = await supabase
            .from('special_articles')
            .update({ ...specialData, updated_at: new Date().toISOString() })
            .eq('id', editingId);

          if (error) throw error;
          showMessage('Artículo especial actualizado exitosamente', 'success');
        } else {
          const { error } = await supabase
            .from('special_articles')
            .insert([specialData]);

          if (error) throw error;
          showMessage('Artículo especial creado exitosamente', 'success');
        }
        await fetchSpecialArticles();
      }

      // Resetear formulario
      resetForm();
    } catch (error: any) {
      console.error('Error saving:', error);
      showMessage(error.message || 'Error al guardar. Intenta nuevamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: 'Julio Cesar Rojas Cala',
      author_contact_id: '',
      document_type: '',
      published_date: new Date().toISOString().split('T')[0],
      category: [],
      content: '',
      summary: '',
      official_link: '',
      image_url: '',
      is_hidden: false
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (item: Article | SpecialArticle) => {
    setFormData({
      title: item.title,
      author: item.author,
      author_contact_id: item.author_contact_id || '',
      document_type: 'document_type' in item ? item.document_type : '',
      published_date: item.published_date,
      category: Array.isArray(item.category) ? item.category : [item.category].filter(Boolean),
      content: item.content,
      summary: item.summary || '',
      official_link: 'official_link' in item ? item.official_link || '' : '',
      image_url: 'image_url' in item ? item.image_url || '' : '',
      is_hidden: item.is_hidden || false
    });
    setEditingId(item.id);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string, type: 'articles' | 'specials') => {
    if (!confirm('¿Estás seguro de que quieres eliminar este artículo?')) return;

    try {
      setError(null);
      const table = type === 'articles' ? 'articles' : 'special_articles';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      showMessage('Artículo eliminado exitosamente', 'success');
      
      if (type === 'articles') {
        await fetchArticles();
      } else {
        await fetchSpecialArticles();
      }
    } catch (error: any) {
      console.error('Error deleting:', error);
      showMessage('Error al eliminar el artículo', 'error');
    }
  };

  const toggleVisibility = async (id: string, type: 'articles' | 'specials', currentHiddenStatus: boolean) => {
    try {
      setError(null);
      const table = type === 'articles' ? 'articles' : 'special_articles';
      const { error } = await supabase
        .from(table)
        .update({ 
          is_hidden: !currentHiddenStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      const action = !currentHiddenStatus ? 'ocultado' : 'mostrado';
      showMessage(`Artículo ${action} exitosamente`, 'success');
      
      if (type === 'articles') {
        await fetchArticles();
      } else {
        await fetchSpecialArticles();
      }
    } catch (error: any) {
      console.error('Error toggling visibility:', error);
      showMessage('Error al cambiar la visibilidad del artículo', 'error');
    }
  };

  // Filtrar artículos según la opción de mostrar ocultos
  const getFilteredArticles = () => {
    if (showHidden) {
      return articles; // Mostrar todos
    }
    return articles.filter(article => !article.is_hidden); // Solo mostrar visibles
  };

  const getFilteredSpecialArticles = () => {
    if (showHidden) {
      return specialArticles; // Mostrar todos
    }
    return specialArticles.filter(article => !article.is_hidden); // Solo mostrar visibles
  };

  const getVisibilityStats = () => {
    if (activeTab === 'articles') {
      const visible = articles.filter(a => !a.is_hidden).length;
      const hidden = articles.filter(a => a.is_hidden).length;
      return { visible, hidden, total: articles.length };
    } else {
      const visible = specialArticles.filter(a => !a.is_hidden).length;
      const hidden = specialArticles.filter(a => a.is_hidden).length;
      return { visible, hidden, total: specialArticles.length };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  const stats = getVisibilityStats();
  const currentArticles = activeTab === 'articles' ? getFilteredArticles() : getFilteredSpecialArticles();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sesión activa</span>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
        {activeTab !== 'contacts' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-800"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo {activeTab === 'articles' ? 'Artículo' : 'Artículo Especial'}</span>
          </button>
        )}
      </div>

      {/* Maintenance Mode Toggle */}
      <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-lg p-4" style={{ position: 'relative', zIndex: 10 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Wrench className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Modo Mantenimiento</h3>
              <p className="text-sm text-amber-700">
                {maintenanceMode
                  ? 'La página está en modo mantenimiento. Los visitantes verán un mensaje informativo.'
                  : 'La página está disponible normalmente para todos los visitantes.'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleMaintenanceMode}
            type="button"
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              maintenanceMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {maintenanceMode ? 'Desactivar Mantenimiento' : 'Activar Mantenimiento'}
          </button>
        </div>

        {/* Edit Messages Button */}
        <div className="border-t border-amber-200 pt-4">
          <button
            onClick={() => setShowEditMessages(!showEditMessages)}
            className="w-full flex items-center justify-center space-x-2 bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span>{showEditMessages ? 'Ocultar Edición de Mensajes' : 'Editar Mensajes'}</span>
          </button>

          {/* Editable Messages */}
          {showEditMessages && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={maintenanceTitle}
                  onChange={(e) => setMaintenanceTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Página en Mantenimiento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  Mensaje Principal
                </label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={2}
                  placeholder="Estamos realizando mejoras en nuestro sitio..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  Mensaje de Tiempo
                </label>
                <input
                  type="text"
                  value={maintenanceTimeMessage}
                  onChange={(e) => setMaintenanceTimeMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Volveremos en unos minutos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  Mensaje de Agradecimiento
                </label>
                <input
                  type="text"
                  value={maintenanceFooterMessage}
                  onChange={(e) => setMaintenanceFooterMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Gracias por tu paciencia y comprensión."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  value={maintenanceCompanyName}
                  onChange={(e) => setMaintenanceCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Rojas Cala Asociados - Asesoría Legal"
                />
              </div>
              <button
                onClick={saveMaintenanceMessages}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Guardar Mensajes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('articles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'articles'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Artículos Normativos ({articles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('specials')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'specials'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Artículos Especiales ({specialArticles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'contacts'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Contactos ({contacts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'consultations'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Consultas</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'categories'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Configuración</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Controles de visibilidad para artículos */}
      {activeTab !== 'contacts' && activeTab !== 'consultations' && activeTab !== 'categories' && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showHidden"
                  checked={showHidden}
                  onChange={(e) => setShowHidden(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="showHidden" className="text-sm font-medium text-gray-700">
                  Mostrar artículos ocultos
                </label>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Visibles: <strong>{stats.visible}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Ocultos: <strong>{stats.hidden}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Total: <strong>{stats.total}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de estado */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
          <div className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          {success}
        </div>
      )}

      {/* Contenido de las pestañas */}
      {activeTab === 'contacts' ? (
        <ContactsManager />
      ) : activeTab === 'consultations' ? (
        <ConsultationsManager />
      ) : activeTab === 'categories' ? (
        <CategoriesManager />
      ) : (
        <>
          {/* Formulario Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingId ? 'Editar' : 'Nuevo'} {activeTab === 'articles' ? 'Artículo' : 'Artículo Especial'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ingresa el título del artículo"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Autor</label>
                      <div className="space-y-2">
                        <select
                          value={formData.author_contact_id}
                          onChange={(e) => {
                            const contactId = e.target.value;
                            const selectedContact = contacts.find(c => c.id === contactId);
                            setFormData({ 
                              ...formData, 
                              author_contact_id: contactId,
                              author: selectedContact ? selectedContact.name : formData.author
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Seleccionar contacto existente</option>
                          {contacts.map(contact => (
                            <option key={contact.id} value={contact.id}>
                              {contact.name} ({contact.email})
                            </option>
                          ))}
                        </select>
                        <div className="text-sm text-gray-500">O escribir nombre personalizado:</div>
                        <input
                          type="text"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value, author_contact_id: '' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Nombre del autor"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Publicación</label>
                      <input
                        type="date"
                        required
                        value={formData.published_date}
                        onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeTab === 'articles' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Norma *
                        </label>
                        <select
                          required
                          value={formData.document_type}
                          onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Seleccionar tipo</option>
                          {documentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className={activeTab === 'articles' ? '' : 'md:col-span-2'}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categorías * (Selecciona una o más)
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {categories.map(category => (
                            <label key={category} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.category.includes(category)}
                                onChange={() => handleCategoryChange(category)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <span className="text-sm">{category}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {formData.category.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Categorías seleccionadas:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formData.category.map(cat => (
                              <span key={cat} className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resumen {activeTab === 'specials' ? '(opcional)' : ''}
                    </label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder={
                        activeTab === 'specials' 
                          ? "Breve resumen del artículo especial (opcional)..." 
                          : "Breve resumen del artículo..."
                      }
                    />
                    {activeTab === 'specials' && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Para artículos especiales, el resumen es opcional. Si no se proporciona, se mostrará el inicio del contenido.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido Completo *
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder={activeTab === 'articles' ? 'Análisis completo del documento legal...' : 'Contenido del artículo especial...'}
                    />
                  </div>

                  {activeTab === 'articles' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enlace Oficial (opcional)</label>
                      <input
                        type="url"
                        value={formData.official_link}
                        onChange={(e) => setFormData({ ...formData, official_link: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://..."
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen (opcional)</label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://images.pexels.com/..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Puedes usar fotos de Pexels como: https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg
                      </p>
                    </div>
                  )}

                  {/* Control de visibilidad */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="is_hidden"
                        checked={formData.is_hidden}
                        onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="is_hidden" className="text-sm font-medium text-gray-700">
                        Ocultar artículo (no aparecerá en el sitio público)
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Los artículos ocultos se guardan como borradores y puedes hacerlos visibles más tarde.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-4">
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

          {/* Tabla de contenido */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  {activeTab === 'articles' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                  )}
                  {activeTab === 'specials' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categorías
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentArticles.map((item) => (
                  <tr key={item.id} className={item.is_hidden ? 'bg-gray-50 opacity-75' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.is_hidden ? (
                          <div className="flex items-center space-x-2">
                            <EyeOff className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500 font-medium">Oculto</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">Visible</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">
                        {item.author}
                        {item.author_contact_id && (
                          <span className="ml-1 text-blue-600">📧</span>
                        )}
                      </div>
                      {/* Mostrar si tiene resumen o no para artículos especiales */}
                      {activeTab === 'specials' && (
                        <div className="text-xs text-gray-400 mt-1">
                          {item.summary ? '📝 Con resumen' : '📄 Sin resumen'}
                        </div>
                      )}
                    </td>
                    {activeTab === 'articles' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {'document_type' in item ? item.document_type : ''}
                        </span>
                      </td>
                    )}
                    {activeTab === 'specials' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {'image_url' in item && item.image_url ? (
                          <img src={item.image_url} alt="" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(item.category) ? item.category : [item.category]).filter(Boolean).map(cat => (
                          <span key={cat} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateSafe(item.published_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleVisibility(item.id, activeTab, item.is_hidden || false)}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            item.is_hidden ? 'text-gray-400 hover:text-green-600' : 'text-green-600 hover:text-gray-400'
                          }`}
                          title={item.is_hidden ? 'Mostrar artículo' : 'Ocultar artículo'}
                        >
                          {item.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-gray-100"
                          title="Editar artículo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, activeTab)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-gray-100"
                          title="Eliminar artículo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {showHidden 
                    ? `No hay ${activeTab === 'articles' ? 'artículos normativos' : 'artículos especiales'} publicados aún.`
                    : `No hay ${activeTab === 'articles' ? 'artículos normativos' : 'artículos especiales'} visibles. ${stats.hidden > 0 ? 'Activa "Mostrar artículos ocultos" para ver todos.' : ''}`
                  }
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
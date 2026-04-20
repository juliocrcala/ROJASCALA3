import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Plus, CreditCard as Edit, Trash2, Save, X, AlertCircle, CheckCircle, FileText, Search, Eye, EyeOff } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface RepositoryNorm {
  id: string;
  slug: string;
  title: string;
  norm_type: string;
  norm_number: string;
  entity: string;
  published_date: string;
  content: string;
  summary: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
};

const emptyForm = () => ({
  slug: '',
  title: '',
  norm_type: '',
  norm_number: '',
  entity: '',
  published_date: new Date().toISOString().split('T')[0],
  content: '',
  summary: '',
  is_hidden: false
});

const formatDateSafe = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export function RepositoryManager() {
  const [norms, setNorms] = useState<RepositoryNorm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(emptyForm());
  const [entities, setEntities] = useState<string[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchNorms();
    fetchCategoryOptions();
  }, []);

  const fetchCategoryOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('categories_config')
        .select('name, type, display_order, is_active')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      const items = data || [];
      setEntities(items.filter((i: any) => i.type === 'entity').map((i: any) => i.name));
      setDocumentTypes(items.filter((i: any) => i.type === 'document_type').map((i: any) => i.name));
    } catch (err: any) {
      console.error('Error fetching category options:', err);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(msg);
      setError(null);
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(msg);
      setSuccess(null);
      setTimeout(() => setError(null), 5000);
    }
  };

  const fetchNorms = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('repository_norms')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;
      setNorms(data || []);
    } catch (err: any) {
      showMessage(`Error al cargar repositorio: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalSlug = formData.slug.trim() || slugify(formData.title);
      if (!finalSlug) {
        showMessage('El titulo o slug es obligatorio', 'error');
        setIsSaving(false);
        return;
      }

      const payload = {
        slug: finalSlug,
        title: formData.title.trim(),
        norm_type: formData.norm_type.trim(),
        norm_number: formData.norm_number.trim(),
        entity: formData.entity.trim(),
        published_date: formData.published_date,
        content: formData.content,
        summary: formData.summary.trim(),
        is_hidden: formData.is_hidden
      };

      if (editingId) {
        const { error } = await supabase
          .from('repository_norms')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
        showMessage('Norma actualizada exitosamente', 'success');
      } else {
        const { error } = await supabase
          .from('repository_norms')
          .insert([payload]);
        if (error) throw error;
        showMessage('Norma agregada al repositorio', 'success');
      }

      resetForm();
      await fetchNorms();
    } catch (err: any) {
      showMessage(`Error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (norm: RepositoryNorm) => {
    setFormData({
      slug: norm.slug,
      title: norm.title,
      norm_type: norm.norm_type || '',
      norm_number: norm.norm_number || '',
      entity: norm.entity || '',
      published_date: norm.published_date,
      content: norm.content,
      summary: norm.summary || '',
      is_hidden: norm.is_hidden || false
    });
    setEditingId(norm.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Seguro que deseas eliminar esta norma del repositorio?')) return;
    try {
      const { error } = await supabase
        .from('repository_norms')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showMessage('Norma eliminada', 'success');
      await fetchNorms();
    } catch (err: any) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  const toggleVisibility = async (norm: RepositoryNorm) => {
    try {
      const { error } = await supabase
        .from('repository_norms')
        .update({ is_hidden: !norm.is_hidden, updated_at: new Date().toISOString() })
        .eq('id', norm.id);
      if (error) throw error;
      await fetchNorms();
    } catch (err: any) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const normalize = (t: string) => (t || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtered = norms.filter((n) => {
    if (!search.trim()) return true;
    const q = normalize(search);
    return (
      normalize(n.title).includes(q) ||
      normalize(n.norm_number).includes(q) ||
      normalize(n.norm_type).includes(q) ||
      normalize(n.entity).includes(q) ||
      normalize(n.slug).includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Repositorio de Normas</h2>
          <p className="text-sm text-gray-500">Copia y publica las normas de El Peruano para indexarlas en tu sitio.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm()); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-md text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Nueva Norma
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-800">
          <AlertCircle className="w-5 h-5 mt-0.5" /> <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-800">
          <CheckCircle className="w-5 h-5 mt-0.5" /> <span className="text-sm">{success}</span>
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Editar Norma' : 'Nueva Norma'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Ley N 31234 que modifica..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Norma</label>
                {documentTypes.length > 0 ? (
                  <select
                    value={formData.norm_type}
                    onChange={(e) => setFormData({ ...formData, norm_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="">Selecciona un tipo</option>
                    {documentTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.norm_type}
                    onChange={(e) => setFormData({ ...formData, norm_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ej: Ley, Decreto Supremo"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entidad</label>
                {entities.length > 0 ? (
                  <select
                    value={formData.entity}
                    onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="">Selecciona una entidad</option>
                    {entities.map((en) => (
                      <option key={en} value={en}>{en}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.entity}
                    onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ej: SUNAT, MINEM, INGEMMET"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">Agrega entidades en el panel de Categorías.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero</label>
                <input
                  type="text"
                  value={formData.norm_number}
                  onChange={(e) => setFormData({ ...formData, norm_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: 31234-2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Publicacion *</label>
                <input
                  type="date"
                  required
                  value={formData.published_date}
                  onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="se genera automaticamente si lo dejas vacio"
              />
              <p className="text-xs text-gray-500 mt-1">Se usa para la URL: /repositorio/tu-slug</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumen breve (opcional)</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenido completo de la norma *</label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Pega aqui el texto tal cual de la norma publicada en El Peruano..."
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="repo_is_hidden"
                checked={formData.is_hidden}
                onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                className="h-4 w-4 text-red-900 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="repo_is_hidden" className="text-sm text-gray-700">Ocultar del publico</label>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por titulo, numero o tipo..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Cargando normas...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border border-dashed rounded-lg">
          <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          No hay normas en el repositorio todavia.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Norma</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numero</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{n.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{n.norm_type || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{n.entity || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{n.norm_number || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDateSafe(n.published_date)}</td>
                  <td className="px-4 py-3 text-sm">
                    {n.is_hidden ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"><EyeOff className="w-3 h-3" /> Oculto</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded"><Eye className="w-3 h-3" /> Visible</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => toggleVisibility(n)} className="p-1 text-gray-500 hover:text-gray-800" title={n.is_hidden ? 'Mostrar' : 'Ocultar'}>
                        {n.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleEdit(n)} className="p-1 text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(n.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

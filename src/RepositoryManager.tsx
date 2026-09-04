import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Plus, CreditCard as Edit, Trash2, Save, X, AlertCircle, CheckCircle, FileText, Search, Eye, EyeOff, Upload } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface NormAttachment {
  id?: string;
  label: string;
  pdf_url: string;
  file?: File;
  sort_order: number;
}

interface RepositoryNorm {
  id: string;
  slug: string;
  title: string;
  norm_type: string;
  norm_number: string;
  published_date: string;
  content: string;
  summary: string;
  pdf_url: string | null;
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
  published_date: new Date().toISOString().split('T')[0],
  content: '',
  summary: '',
  pdf_url: '',
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [attachments, setAttachments] = useState<NormAttachment[]>([]);

  useEffect(() => {
    fetchNorms();
  }, []);

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

  const fetchAttachments = async (normId: string): Promise<NormAttachment[]> => {
    const { data, error } = await supabase
      .from('repository_norm_attachments')
      .select('*')
      .eq('norm_id', normId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map((a: any) => ({
      id: a.id,
      label: a.label,
      pdf_url: a.pdf_url,
      sort_order: a.sort_order
    }));
  };

  const uploadPdf = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.pdf`;
    const filePath = `norms/${fileName}`;

    const { error } = await supabase.storage
      .from('repository-pdfs')
      .upload(filePath, file, { cacheControl: '31536000', upsert: false });

    if (error) throw new Error(`Error al subir PDF: ${error.message}`);

    const { data: urlData } = supabase.storage
      .from('repository-pdfs')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
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

      if (!pdfFile && !formData.pdf_url && !formData.content.trim() && attachments.length === 0) {
        showMessage('Debes subir un PDF o escribir el contenido de la norma', 'error');
        setIsSaving(false);
        return;
      }

      let finalPdfUrl = formData.pdf_url || null;
      if (pdfFile) {
        setUploadingPdf(true);
        try {
          finalPdfUrl = await uploadPdf(pdfFile);
        } finally {
          setUploadingPdf(false);
        }
      }

      const payload = {
        slug: finalSlug,
        title: formData.title.trim(),
        norm_type: formData.norm_type.trim(),
        norm_number: formData.norm_number.trim(),
        published_date: formData.published_date,
        content: formData.content || '',
        summary: formData.summary.trim(),
        pdf_url: finalPdfUrl,
        is_hidden: formData.is_hidden
      };

      let normId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from('repository_norms')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('repository_norms')
          .insert([payload])
          .select('id')
          .single();
        if (error) throw error;
        normId = data.id;
      }

      // Save attachments
      if (normId) {
        // Delete old attachments
        await supabase
          .from('repository_norm_attachments')
          .delete()
          .eq('norm_id', normId);

        // Upload new files and save all attachments
        const attachmentsToSave: { norm_id: string; label: string; pdf_url: string; sort_order: number }[] = [];

        for (let i = 0; i < attachments.length; i++) {
          const att = attachments[i];
          let url = att.pdf_url;
          if (att.file) {
            setUploadingPdf(true);
            url = await uploadPdf(att.file);
            setUploadingPdf(false);
          }
          if (url) {
            attachmentsToSave.push({
              norm_id: normId,
              label: att.label,
              pdf_url: url,
              sort_order: i
            });
          }
        }

        if (attachmentsToSave.length > 0) {
          const { error: attError } = await supabase
            .from('repository_norm_attachments')
            .insert(attachmentsToSave);
          if (attError) throw attError;
        }
      }

      showMessage(editingId ? 'Norma actualizada exitosamente' : 'Norma agregada al repositorio', 'success');
      resetForm();
      await fetchNorms();
    } catch (err: any) {
      showMessage(`Error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
      setUploadingPdf(false);
    }
  };

  const handleEdit = async (norm: RepositoryNorm) => {
    setFormData({
      slug: norm.slug,
      title: norm.title,
      norm_type: norm.norm_type || '',
      norm_number: norm.norm_number || '',
      published_date: norm.published_date,
      content: norm.content || '',
      summary: norm.summary || '',
      pdf_url: norm.pdf_url || '',
      is_hidden: norm.is_hidden || false
    });
    setPdfFile(null);
    setEditingId(norm.id);
    setShowForm(true);

    try {
      const atts = await fetchAttachments(norm.id);
      setAttachments(atts);
    } catch {
      setAttachments([]);
    }
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
    setPdfFile(null);
    setAttachments([]);
    setEditingId(null);
    setShowForm(false);
  };

  const addAttachment = () => {
    setAttachments(prev => [...prev, { label: '', pdf_url: '', sort_order: prev.length }]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const updateAttachmentLabel = (index: number, label: string) => {
    setAttachments(prev => prev.map((a, i) => i === index ? { ...a, label } : a));
  };

  const updateAttachmentFile = (index: number, file: File) => {
    setAttachments(prev => prev.map((a, i) => i === index ? { ...a, file, pdf_url: a.pdf_url || 'pending' } : a));
  };

  const normalize = (t: string) => (t || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtered = norms.filter((n) => {
    if (!search.trim()) return true;
    const q = normalize(search);
    return (
      normalize(n.title).includes(q) ||
      normalize(n.norm_number).includes(q) ||
      normalize(n.norm_type).includes(q) ||
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
          onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm()); setAttachments([]); }}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Norma</label>
                <input
                  type="text"
                  value={formData.norm_type}
                  onChange={(e) => setFormData({ ...formData, norm_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Ley, Decreto Supremo"
                />
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

            {/* PDF Principal */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-900 mb-3">PDF principal de la norma</label>
              <p className="text-xs text-gray-500 mb-3">Este es el documento principal. Los visitantes podran descargarlo o abrirlo en una nueva pestana.</p>

              {(pdfFile || formData.pdf_url) && (
                <div className="mb-3 flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                  <FileText className="w-5 h-5 text-red-700 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {pdfFile ? pdfFile.name : 'PDF cargado anteriormente'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null);
                      setFormData(prev => ({ ...prev, pdf_url: '' }));
                    }}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!pdfFile && !formData.pdf_url && (
                <label className="flex items-center gap-3 px-4 py-4 bg-white border-2 border-dashed border-red-300 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                  <Upload className="w-6 h-6 text-red-700" />
                  <div>
                    <span className="text-sm font-medium text-red-800">Subir PDF de la norma</span>
                    <p className="text-xs text-gray-500">Maximo 20MB</p>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPdfFile(file);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Documentos adicionales (Anexos) */}
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Documentos adicionales</label>
                  <p className="text-xs text-gray-500 mt-1">Agrega anexos, exposiciones de motivos u otros documentos relacionados.</p>
                </div>
                <button
                  type="button"
                  onClick={addAttachment}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-700 hover:bg-blue-600 text-white rounded-md font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar documento
                </button>
              </div>

              {attachments.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-3">No hay documentos adicionales. Usa el boton para agregar anexos u otros PDFs.</p>
              )}

              <div className="space-y-3">
                {attachments.map((att, index) => (
                  <div key={index} className="bg-white rounded-md border border-gray-200 p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del boton de descarga</label>
                          <input
                            type="text"
                            value={att.label}
                            onChange={(e) => updateAttachmentLabel(index, e.target.value)}
                            placeholder="Ej: Anexo 1, Exposicion de Motivos, Anexo 3..."
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {att.file ? (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                            <FileText className="w-4 h-4 text-blue-700 flex-shrink-0" />
                            <span className="text-xs text-gray-600 truncate">{att.file.name}</span>
                          </div>
                        ) : att.pdf_url && att.pdf_url !== 'pending' ? (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                            <FileText className="w-4 h-4 text-blue-700 flex-shrink-0" />
                            <span className="text-xs text-gray-600 truncate">PDF cargado</span>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-2 border-dashed border-blue-300 rounded cursor-pointer hover:bg-blue-50 transition-colors">
                            <Upload className="w-4 h-4 text-blue-700" />
                            <span className="text-xs font-medium text-blue-800">Subir PDF</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) updateAttachmentFile(index, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1 text-red-500 hover:text-red-700 mt-5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido en texto {(pdfFile || formData.pdf_url) ? '(opcional - complemento al PDF)' : '*'}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {(pdfFile || formData.pdf_url)
                  ? 'Si subiste PDF, este campo es opcional. Puedes pegar el texto de la norma para que sea buscable.'
                  : 'Si no subes PDF, el contenido en texto es obligatorio.'}
              </p>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Pega aqui el texto de la norma o notas adicionales..."
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
                <Save className="w-4 h-4" /> {isSaving ? (uploadingPdf ? 'Subiendo PDF...' : 'Guardando...') : 'Guardar'}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numero</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {n.title}
                    {n.pdf_url && <span className="ml-2 inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded"><FileText className="w-3 h-3" />PDF</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{n.norm_type || '-'}</td>
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

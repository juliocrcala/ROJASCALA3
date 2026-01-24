import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { X, Plus } from 'lucide-react';

interface ArticleFormProps {
  onSuccess?: () => void;
}

interface Contact {
  id: string;
  name: string;
  email: string;
}

interface AuthorEntry {
  type: 'contact' | 'custom';
  contactId: string;
  customName: string;
  photoUrl: string;
}

const documentTypes = [
  "Ley", "Decreto Supremo", "Resolución Ministerial", "Resolución Directoral",
  "Ordenanza", "Acuerdo", "Directiva", "Circular"
];

const categories = [
  "Derecho Civil",
  "Derecho Penal",
  "Derecho Laboral",
  "Derecho Tributario",
  "Derecho Administrativo",
  "Derecho Constitucional",
  "Derecho Comercial",
  "Otros"
];

export function ArticleForm({ onSuccess }: ArticleFormProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [authors, setAuthors] = useState<AuthorEntry[]>([
    { type: 'contact', contactId: '', customName: '', photoUrl: '' }
  ]);
  const [formData, setFormData] = useState({
    title: '',
    document_type: '',
    published_date: new Date().toISOString().split('T')[0],
    category: '',
    content: '',
    official_link: '',
    summary: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const addAuthor = () => {
    setAuthors([...authors, { type: 'contact', contactId: '', customName: '', photoUrl: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index: number, field: keyof AuthorEntry, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const authorNames: string[] = [];
      const authorContactIds: (string | null)[] = [];
      const authorPhotoUrls: (string | null)[] = [];

      authors.forEach(author => {
        if (author.type === 'contact' && author.contactId) {
          const contact = contacts.find(c => c.id === author.contactId);
          if (contact) {
            authorNames.push(contact.name);
            authorContactIds.push(author.contactId);
            authorPhotoUrls.push(null);
          }
        } else if (author.type === 'custom' && author.customName.trim()) {
          authorNames.push(author.customName.trim());
          authorContactIds.push(null);
          authorPhotoUrls.push(author.photoUrl.trim() || null);
        }
      });

      if (authorNames.length === 0) {
        alert('Debe agregar al menos un autor');
        return;
      }

      const articleData: any = {
        ...formData,
        author: authorNames,
        author_contact_id: authorContactIds
      };

      if (authorPhotoUrls.some(url => url !== null)) {
        articleData.author_photo_url = authorPhotoUrls;
      }

      const { error } = await supabase
        .from('articles')
        .insert([articleData]);

      if (error) throw error;

      setFormData({
        title: '',
        document_type: '',
        published_date: new Date().toISOString().split('T')[0],
        category: '',
        content: '',
        official_link: '',
        summary: ''
      });

      setAuthors([{ type: 'contact', contactId: '', customName: '', photoUrl: '' }]);

      if (onSuccess) onSuccess();
      alert('Artículo publicado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar el artículo');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Autores</label>
          <button
            type="button"
            onClick={addAuthor}
            className="flex items-center space-x-1 text-sm text-red-900 hover:text-red-700"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar autor</span>
          </button>
        </div>

        <div className="space-y-3">
          {authors.map((author, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 border border-gray-200 rounded-md">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={author.type === 'contact'}
                      onChange={() => updateAuthor(index, 'type', 'contact')}
                      className="mr-2"
                    />
                    <span className="text-sm">Contacto existente</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={author.type === 'custom'}
                      onChange={() => updateAuthor(index, 'type', 'custom')}
                      className="mr-2"
                    />
                    <span className="text-sm">Nombre personalizado</span>
                  </label>
                </div>

                {author.type === 'contact' ? (
                  <select
                    value={author.contactId}
                    onChange={(e) => updateAuthor(index, 'contactId', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                  >
                    <option value="">Seleccionar contacto</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      type="text"
                      value={author.customName}
                      onChange={(e) => updateAuthor(index, 'customName', e.target.value)}
                      placeholder="Nombre del autor"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                    />
                    <input
                      type="url"
                      value={author.photoUrl}
                      onChange={(e) => updateAuthor(index, 'photoUrl', e.target.value)}
                      placeholder="URL de la foto (opcional)"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                    />
                  </>
                )}
              </div>

              {authors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAuthor(index)}
                  className="text-red-600 hover:text-red-800 mt-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de Norma</label>
        <select
          required
          value={formData.document_type}
          onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        >
          <option value="">Seleccionar tipo</option>
          {documentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha</label>
        <input
          type="date"
          required
          value={formData.published_date}
          onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Categoría</label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        >
          <option value="">Seleccionar categoría</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Resumen (opcional)</label>
        <textarea
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          rows={3}
          placeholder="Breve resumen del artículo"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Análisis completo</label>
        <textarea
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Link a norma oficial (opcional)</label>
        <input
          type="url"
          value={formData.official_link}
          onChange={(e) => setFormData({ ...formData, official_link: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Publicar Artículo
      </button>
    </form>
  );
}

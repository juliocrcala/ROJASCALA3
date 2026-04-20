import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Calendar, FileText, ArrowLeft, ChevronRight, Tag, Building2 } from 'lucide-react';
import { supabase } from './supabase';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LoadingSpinner } from './LoadingSpinner';

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

const normalizeText = (text: string): string =>
  (text || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const formatDateSafe = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export function RepositoryPage() {
  const [norms, setNorms] = useState<RepositoryNorm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedEntity, setSelectedEntity] = useState<string>('Todas');
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [entities, setEntities] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [normsRes, optionsRes] = await Promise.all([
          supabase
            .from('repository_norms')
            .select('*')
            .eq('is_hidden', false)
            .order('published_date', { ascending: false }),
          supabase
            .from('categories_config')
            .select('name, type, display_order, is_active')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
        ]);
        if (normsRes.error) throw normsRes.error;
        setNorms(normsRes.data || []);
        const opts = optionsRes.data || [];
        setDocumentTypes(opts.filter((i: any) => i.type === 'document_type').map((i: any) => i.name));
        setEntities(opts.filter((i: any) => i.type === 'entity').map((i: any) => i.name));
      } catch (err) {
        console.error('Error fetching repository norms:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return norms.filter((n) => {
      if (search.trim()) {
        const q = normalizeText(search);
        const hit =
          normalizeText(n.title).includes(q) ||
          normalizeText(n.norm_number).includes(q) ||
          normalizeText(n.norm_type).includes(q) ||
          normalizeText(n.summary || '').includes(q) ||
          normalizeText(n.content || '').includes(q);
        if (!hit) return false;
      }
      if (selectedDate) {
        if (n.published_date !== selectedDate) return false;
      } else {
        if (dateFrom && n.published_date < dateFrom) return false;
        if (dateTo && n.published_date > dateTo) return false;
      }
      if (selectedType !== 'Todos' && n.norm_type !== selectedType) return false;
      if (selectedEntity !== 'Todas' && n.entity !== selectedEntity) return false;
      return true;
    });
  }, [norms, search, dateFrom, dateTo, selectedDate, selectedType, selectedEntity]);

  const clearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSelectedDate('');
    setSelectedType('Todos');
    setSelectedEntity('Todas');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Repositorio de Normas</h1>
          </div>
          <p className="text-red-100 max-w-2xl">
            Consulta el texto completo de las normas publicadas en El Peruano, indexadas y buscables.
          </p>
          <p className="text-red-200 text-sm mt-2">by Rojas Cala</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-red-900" />
              <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
            </div>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              <button
                onClick={() => setSelectedType('Todos')}
                className={`px-4 py-2 rounded text-sm ${
                  selectedType === 'Todos' ? 'bg-red-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                Todos
              </button>
              {documentTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded text-sm ${
                    selectedType === t ? 'bg-red-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-red-900" />
              <h3 className="text-lg font-semibold text-gray-900">Entidad</h3>
            </div>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              <button
                onClick={() => setSelectedEntity('Todas')}
                className={`px-4 py-2 rounded text-sm ${
                  selectedEntity === 'Todas' ? 'bg-red-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                Todas
              </button>
              {entities.length === 0 ? (
                <span className="text-sm text-gray-500 self-center">Agrega entidades desde el panel de administración</span>
              ) : (
                entities.map((en) => (
                  <button
                    key={en}
                    onClick={() => setSelectedEntity(en)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded text-sm ${
                      selectedEntity === en ? 'bg-red-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{en}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar norma por titulo, tipo o numero..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-500 mb-1">Fecha exacta</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="md:col-span-3 flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm text-red-700 border border-red-300 rounded-md hover:bg-red-50"
              >
                Limpiar filtros
              </button>
            </div>
            {!selectedDate && (
              <>
                <div className="md:col-span-3">
                  <label className="block text-xs text-gray-500 mb-1">Desde</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Cargando repositorio..." size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600">No se encontraron normas con esos criterios.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-2">{filtered.length} norma(s) encontrada(s)</p>
            {filtered.map((n) => (
              <Link
                key={n.id}
                to={`/repositorio/${n.slug}`}
                className="block bg-white rounded-lg border border-gray-200 hover:border-red-400 hover:shadow-md transition-all p-4 md:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {n.norm_type && (
                        <span className="inline-block text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded">
                          {n.norm_type}
                        </span>
                      )}
                      {n.norm_number && (
                        <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                          N {n.norm_number}
                        </span>
                      )}
                      {n.entity && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                          <Building2 className="w-3 h-3" /> {n.entity}
                        </span>
                      )}
                      <span className="inline-flex items-center text-xs text-gray-500 gap-1">
                        <Calendar className="w-3 h-3" /> {formatDateSafe(n.published_date)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-snug">{n.title}</h3>
                    {n.summary && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.summary}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function RepositoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [norm, setNorm] = useState<RepositoryNorm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('repository_norms')
          .select('*')
          .eq('slug', slug)
          .eq('is_hidden', false)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          setNotFound(true);
        } else {
          setNorm(data);
        }
      } catch (err) {
        console.error('Error fetching norm:', err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Cargando norma..." size="large" />
      </div>
    );
  }

  if (notFound || !norm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <FileText className="w-14 h-14 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Norma no encontrada</h2>
          <p className="text-gray-600 mb-4">La norma que buscas no existe o fue retirada del repositorio.</p>
          <Link to="/repositorio" className="text-red-700 hover:text-red-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Volver al repositorio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link to="/repositorio" className="inline-flex items-center gap-1 text-sm text-red-700 hover:text-red-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver al repositorio
        </Link>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {norm.norm_type && (
              <span className="inline-block text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded">{norm.norm_type}</span>
            )}
            {norm.norm_number && (
              <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">N {norm.norm_number}</span>
            )}
            {norm.entity && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                <Building2 className="w-3 h-3" /> {norm.entity}
              </span>
            )}
            <span className="inline-flex items-center text-xs text-gray-500 gap-1">
              <Calendar className="w-3 h-3" /> {formatDateSafe(norm.published_date)}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{norm.title}</h1>

          {norm.summary && (
            <p className="text-gray-700 italic border-l-4 border-red-200 pl-4 mb-6">{norm.summary}</p>
          )}

          <div className="prose prose-sm md:prose max-w-none text-gray-800">
            <MarkdownRenderer content={norm.content} />
          </div>
        </article>
      </div>
    </div>
  );
}

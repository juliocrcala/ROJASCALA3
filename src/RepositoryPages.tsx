import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Calendar, FileText, ArrowLeft, ChevronRight, Download, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase } from './supabase';
import { LoadingSpinner } from './LoadingSpinner';

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

interface NormAttachment {
  id: string;
  label: string;
  pdf_url: string;
  sort_order: number;
}

const normalizeText = (text: string): string =>
  (text || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const stripForSearch = (text: string): string =>
  normalizeText(text)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const fuzzyMatch = (text: string, term: string): boolean => {
  if (!term || !term.trim()) return true;
  const target = stripForSearch(text);
  const tokens = stripForSearch(term).split(' ').filter(Boolean);
  if (tokens.length === 0) return true;
  const matched = tokens.filter(tok => target.includes(tok)).length;
  const required = Math.max(1, Math.ceil(tokens.length * 0.7));
  return matched >= required;
};

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');
  pages.push(total);
  return pages;
};

type RepoPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

const RepoPagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: RepoPaginationProps) => {
  if (totalPages <= 1) return null;
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col items-center gap-3 pt-6">
      <p className="text-sm text-gray-600">
        Mostrando {start}-{end} de {totalItems} resultados
      </p>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Anterior
        </button>
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`e-${idx}`} className="px-2 text-gray-500">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[40px] px-3 py-2 rounded-md text-sm border transition-colors ${
                p === currentPage
                  ? 'bg-red-900 text-white border-red-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo, selectedDate]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('repository_norms')
          .select('*')
          .eq('is_hidden', false)
          .order('published_date', { ascending: false });
        if (error) throw error;
        setNorms(data || []);
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
        const combined = [n.title, n.norm_number, n.norm_type, n.summary || '', n.content || ''].join(' ');
        if (!fuzzyMatch(combined, search)) return false;
      }
      if (selectedDate) {
        if (n.published_date !== selectedDate) return false;
      } else {
        if (dateFrom && n.published_date < dateFrom) return false;
        if (dateTo && n.published_date > dateTo) return false;
      }
      return true;
    });
  }, [norms, search, dateFrom, dateTo, selectedDate]);

  const clearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSelectedDate('');
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
            {filtered.slice((Math.min(currentPage, Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))) - 1) * ITEMS_PER_PAGE, Math.min(currentPage, Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))) * ITEMS_PER_PAGE).map((n) => (
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
            {filtered.length > ITEMS_PER_PAGE && (
              <RepoPagination
                currentPage={Math.min(currentPage, Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)))}
                totalPages={Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))}
                totalItems={filtered.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function RepositoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [norm, setNorm] = useState<RepositoryNorm | null>(null);
  const [attachments, setAttachments] = useState<NormAttachment[]>([]);
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
          // Fetch attachments
          const { data: attData } = await supabase
            .from('repository_norm_attachments')
            .select('*')
            .eq('norm_id', data.id)
            .order('sort_order', { ascending: true });
          setAttachments(attData || []);
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

  const hasAnyPdf = norm.pdf_url || attachments.length > 0;

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
            <span className="inline-flex items-center text-xs text-gray-500 gap-1">
              <Calendar className="w-3 h-3" /> {formatDateSafe(norm.published_date)}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{norm.title}</h1>

          {norm.summary && (
            <p className="text-gray-700 italic border-l-4 border-red-200 pl-4 mb-6">{norm.summary}</p>
          )}

          {/* PDF Downloads Section */}
          {hasAnyPdf && (
            <div className="mb-8 bg-gray-50 rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Documentos PDF</h2>
              <div className="flex flex-wrap gap-3">
                {norm.pdf_url && (
                  <>
                    <a
                      href={norm.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors font-medium shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> Abrir norma completa
                    </a>
                    <a
                      href={norm.pdf_url}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border border-red-300 text-red-800 bg-white rounded-lg hover:bg-red-50 transition-colors font-medium"
                    >
                      <Download className="w-4 h-4" /> Descargar norma
                    </a>
                  </>
                )}
                {attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border border-blue-300 text-blue-800 bg-white rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    <FileText className="w-4 h-4" /> {att.label || 'Documento adjunto'}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Content notice + text */}
          {norm.content && (
            <>
              {hasAnyPdf && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Aviso sobre el contenido</p>
                    <p>
                      El siguiente texto corresponde a la norma indicada. Sin embargo, contenido como cuadros, graficos
                      o formatos especiales no son posibles de adaptar a esta version web. Para ver el documento completo
                      con todo su formato original, se recomienda descargar o abrir el PDF.
                    </p>
                  </div>
                </div>
              )}
              <div className="max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed text-justify break-words font-serif text-[15px]">
                {norm.content}
              </div>
            </>
          )}

          {!norm.content && !hasAnyPdf && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>Esta norma no tiene contenido disponible todavia.</p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

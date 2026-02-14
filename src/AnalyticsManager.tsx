import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Eye, TrendingUp, Users, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface PageView {
  id: string;
  page_url: string;
  page_title: string;
  article_id: string | null;
  visitor_id: string;
  session_id: string;
  created_at: string;
}

interface AnalyticsSummary {
  date: string;
  total_views: number;
  unique_visitors: number;
  top_pages: Array<{
    url: string;
    title: string;
    views: number;
  }>;
}

interface Stats {
  totalViews: number;
  uniqueVisitors: number;
  todayViews: number;
  avgViewsPerDay: number;
}

export function AnalyticsManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [recentViews, setRecentViews] = useState<PageView[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    uniqueVisitors: 0,
    todayViews: 0,
    avgViewsPerDay: 0
  });
  const [topPages, setTopPages] = useState<Array<{ url: string; title: string; views: number }>>([]);
  const [dateRange, setDateRange] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const { data: views, error: viewsError } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (viewsError) throw viewsError;

      const { data: allViews, error: allViewsError } = await supabase
        .from('page_views')
        .select('visitor_id, created_at')
        .gte('created_at', startDate.toISOString());

      if (allViewsError) throw allViewsError;

      const uniqueVisitors = new Set(allViews?.map(v => v.visitor_id)).size;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayViews = allViews?.filter(v => new Date(v.created_at) >= today).length || 0;

      const pageViewCounts = (views || []).reduce((acc, view) => {
        const key = `${view.page_url}|${view.page_title}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPagesData = Object.entries(pageViewCounts)
        .map(([key, views]) => {
          const [url, title] = key.split('|');
          return { url, title, views };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      setRecentViews(views || []);
      setTopPages(topPagesData);
      setStats({
        totalViews: allViews?.length || 0,
        uniqueVisitors,
        todayViews,
        avgViewsPerDay: Math.round((allViews?.length || 0) / dateRange)
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('generate_daily_analytics');

      if (error) throw error;

      await fetchAnalytics();
      alert('Reporte diario generado exitosamente');
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Error al generar el reporte diario');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando estadísticas..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Estadísticas del Sitio</h2>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
          <button
            onClick={generateDailyReport}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generar Reporte</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Visitas Totales</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Visitantes Únicos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Visitas Hoy</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayViews.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Promedio Diario</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgViewsPerDay.toLocaleString()}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Páginas Más Visitadas</h3>
        </div>

        {topPages.length > 0 ? (
          <div className="space-y-3">
            {topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{page.title || 'Sin título'}</p>
                  <p className="text-sm text-gray-600 truncate">{page.url}</p>
                </div>
                <div className="ml-4 flex items-center space-x-4">
                  <span className="text-2xl font-bold text-blue-600">{page.views}</span>
                  <span className="text-sm text-gray-500">visitas</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No hay datos de páginas visitadas</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Visitas Recientes</h3>

        {recentViews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Página
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentViews.slice(0, 20).map((view) => (
                  <tr key={view.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(view.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {view.page_title || 'Sin título'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-md">
                      {view.page_url}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No hay visitas registradas</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Sobre las Estadísticas</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Las visitas solo se registran cuando los usuarios aceptan las cookies</li>
          <li>Los datos son anónimos y no incluyen información personal identificable</li>
          <li>Los visitantes únicos se cuentan por ID de visitante generado localmente</li>
          <li>Puedes generar reportes diarios para mantener un historial</li>
        </ul>
      </div>
    </div>
  );
}

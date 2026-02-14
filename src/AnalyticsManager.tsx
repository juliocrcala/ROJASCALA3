import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Eye, TrendingUp, Users, Calendar, BarChart3, RefreshCw, Download, FileText, Trash2 } from 'lucide-react';
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
  created_at: string;
  updated_at: string;
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
  const [historicalReports, setHistoricalReports] = useState<AnalyticsSummary[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchHistoricalReports();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      console.log('Fetching analytics from:', startDate.toISOString());

      const { data: views, error: viewsError } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      console.log('Views query result:', { views, error: viewsError });

      if (viewsError) {
        console.error('Views error details:', viewsError);
        throw new Error(`Error al cargar vistas: ${viewsError.message || JSON.stringify(viewsError)}`);
      }

      const { data: allViews, error: allViewsError } = await supabase
        .from('page_views')
        .select('visitor_id, created_at')
        .gte('created_at', startDate.toISOString());

      console.log('All views query result:', { count: allViews?.length, error: allViewsError });

      if (allViewsError) {
        console.error('All views error details:', allViewsError);
        throw new Error(`Error al cargar todas las vistas: ${allViewsError.message || JSON.stringify(allViewsError)}`);
      }

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
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      const errorMessage = err.message || err.toString() || 'Error desconocido al cargar las estadísticas';
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        full: err
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistoricalReports = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      setHistoricalReports(data || []);
    } catch (err) {
      console.error('Error fetching historical reports:', err);
    }
  };

  const generateDailyReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.rpc('generate_daily_analytics', {
        target_date: today
      });

      if (error) {
        console.error('RPC Error:', error);
        throw new Error(error.message || 'Error al generar el reporte');
      }

      await fetchAnalytics();
      await fetchHistoricalReports();
      alert('Reporte diario generado y guardado exitosamente');
    } catch (err: any) {
      console.error('Error generating report:', err);
      const errorMessage = err.message || 'Error al generar el reporte diario';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCSV = () => {
    const csvContent = [
      ['Fecha', 'Visitas Totales', 'Visitantes Únicos', 'Visitas Hoy', 'Promedio Diario'],
      [
        new Date().toLocaleDateString('es-ES'),
        stats.totalViews.toString(),
        stats.uniqueVisitors.toString(),
        stats.todayViews.toString(),
        stats.avgViewsPerDay.toString()
      ],
      [],
      ['Páginas Más Visitadas'],
      ['Título', 'URL', 'Visitas'],
      ...topPages.map(page => [page.title || 'Sin título', page.url, page.views.toString()])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `estadisticas_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteReport = async (reportDate: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el reporte del ${new Date(reportDate).toLocaleDateString('es-ES')}?`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('analytics_summary')
        .delete()
        .eq('date', reportDate);

      if (error) throw error;

      await fetchHistoricalReports();
      alert('Reporte eliminado exitosamente');
    } catch (err: any) {
      console.error('Error deleting report:', err);
      alert('Error al eliminar el reporte: ' + (err.message || 'Error desconocido'));
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
            <option value={1}>Últimas 24 horas</option>
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
          <button
            onClick={downloadCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            <span>Descargar CSV</span>
          </button>
          <button
            onClick={generateDailyReport}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Guardar Reporte</span>
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
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Reportes Guardados</h3>
        </div>

        {historicalReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitantes Únicos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guardado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historicalReports.map((report) => (
                  <tr key={report.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(report.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.total_views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.unique_visitors.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(report.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => deleteReport(report.date)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar reporte"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No hay reportes guardados. Presiona "Guardar Reporte" para crear uno.
          </p>
        )}
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
        <h4 className="font-semibold text-blue-900 mb-2">Sobre las Estadísticas y Reportes</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Las visitas solo se registran cuando los usuarios aceptan las cookies</li>
          <li>Los datos son anónimos y no incluyen información personal identificable</li>
          <li>Los visitantes únicos se cuentan por ID de visitante generado localmente</li>
          <li><strong>Descargar CSV:</strong> Descarga un archivo con las estadísticas actuales para guardar en tu computadora</li>
          <li><strong>Guardar Reporte:</strong> Guarda un snapshot permanente de las estadísticas del día en la base de datos</li>
        </ul>
      </div>
    </div>
  );
}

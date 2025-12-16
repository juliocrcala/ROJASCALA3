import React, { useState, useEffect } from 'react';
import { Search, Scale, Building2, Trees, FileText, Menu, X, Lightbulb, Briefcase, Zap, Droplets, Home, Book, Gavel, ScrollText, Mail, MapPin, User, Calendar, BookOpen, Linkedin, Instagram, Shield, Users, Globe, Landmark, Car, Plane, Ship, Wifi, Database, Heart, ShoppingCart, Factory, GraduationCap, Stethoscope, Palette, Baby, Accessibility, Mountain, PawPrint as Paw, Trophy, HardHat, Eye, DollarSign, Truck, Fish, Camera, AlertTriangle, Handshake, ExternalLink, Filter, Import as SortAsc, Dessert as SortDesc, Copy, CheckCircle } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from './supabase';
import { AdminPanel } from './AdminPanel';
import { FloatingHelpWidget } from './FloatingHelpWidget';
import { ErrorBoundary } from './ErrorBoundary';


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
  services_link?: string;
  job_title?: string;
  services_description?: string;
  is_active: boolean;
  display_order?: number;
}

interface CategoryConfig {
  id: string;
  name: string;
  type: 'category' | 'document_type';
  display_order: number;
  is_active: boolean;
}

// Función para formatear fechas de forma segura (sin problemas de zona horaria)
const formatDateSafe = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Mapeo de iconos para categorías (fallback para categorías sin icono específico)
const getCategoryIcon = (categoryName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    // Derecho Público
    "Constitucional": <Gavel className="w-5 h-5" />,
    "Administrativo": <Building2 className="w-5 h-5" />,
    "Penal": <Scale className="w-5 h-5" />,
    "Procesal": <FileText className="w-5 h-5" />,
    "Tributario": <DollarSign className="w-5 h-5" />,
    "Internacional Público": <Globe className="w-5 h-5" />,
    "Electoral": <Users className="w-5 h-5" />,
    "Municipal": <Landmark className="w-5 h-5" />,
    "Regional": <MapPin className="w-5 h-5" />,
    "Militar y Policial": <Shield className="w-5 h-5" />,
    "Seguridad y Defensa": <Shield className="w-5 h-5" />,
    "Contrataciones del Estado": <FileText className="w-5 h-5" />,
    "Transparencia y Acceso a la Información": <Eye className="w-5 h-5" />,
    "Función Pública y Ética Pública": <Users className="w-5 h-5" />,
    "Migratorio": <Globe className="w-5 h-5" />,
    "Cooperación Internacional": <Handshake className="w-5 h-5" />,
    "Responsabilidad Fiscal": <DollarSign className="w-5 h-5" />,
    "Seguridad Ciudadana": <Shield className="w-5 h-5" />,

    // Derecho Privado
    "Civil": <Building2 className="w-5 h-5" />,
    "Comercial": <Briefcase className="w-5 h-5" />,
    "Laboral": <Briefcase className="w-5 h-5" />,
    "Internacional Privado": <Globe className="w-5 h-5" />,
    "Familia": <Heart className="w-5 h-5" />,
    "Sucesión": <Book className="w-5 h-5" />,
    "Notarial y Registral": <ScrollText className="w-5 h-5" />,
    "Propiedad Intelectual": <ScrollText className="w-5 h-5" />,
    "Arbitraje y Mecanismos Alternativos de Resolución de Conflictos (MASC)": <Scale className="w-5 h-5" />,

    // Derecho Social y Especializado
    "Ambiental": <Trees className="w-5 h-5" />,
    "Minero": <Mountain className="w-5 h-5" />,
    "Energético": <Zap className="w-5 h-5" />,
    "Agrario": <Trees className="w-5 h-5" />,
    "Educativo": <GraduationCap className="w-5 h-5" />,
    "Sanitario": <Stethoscope className="w-5 h-5" />,
    "Cultural": <Palette className="w-5 h-5" />,
    "Patrimonio": <Landmark className="w-5 h-5" />,
    "Género y Diversidad": <Users className="w-5 h-5" />,
    "Discapacidad y Accesibilidad": <Accessibility className="w-5 h-5" />,
    "Pueblos Indígenas": <Users className="w-5 h-5" />,
    "Protección Animal": <Paw className="w-5 h-5" />,
    "Juventud": <Baby className="w-5 h-5" />,
    "Deporte": <Trophy className="w-5 h-5" />,
    "Vivienda": <Home className="w-5 h-5" />,
    "Urbanístico": <HardHat className="w-5 h-5" />,
    "Bioética": <Heart className="w-5 h-5" />,
    "Protección de Datos Personales": <Eye className="w-5 h-5" />,

    // Derecho Económico
    "Consumidor": <ShoppingCart className="w-5 h-5" />,
    "Competencia": <Scale className="w-5 h-5" />,
    "Seguridad Alimentaria": <ShoppingCart className="w-5 h-5" />,
    "Aduanero": <Truck className="w-5 h-5" />,
    "Comercio Exterior": <Globe className="w-5 h-5" />,
    "Financiero": <DollarSign className="w-5 h-5" />,
    "Bancario": <DollarSign className="w-5 h-5" />,

    // Derecho de Transporte y Comunicaciones
    "Transportes": <Car className="w-5 h-5" />,
    "Marítimo": <Ship className="w-5 h-5" />,
    "Portuario": <Ship className="w-5 h-5" />,
    "Aeronáutico": <Plane className="w-5 h-5" />,
    "Telecomunicaciones": <Wifi className="w-5 h-5" />,

    // Derecho Tecnológico y Moderno
    "Ciencia y Tecnología": <Lightbulb className="w-5 h-5" />,
    "Inteligencia Artificial y Datos Masivos": <Database className="w-5 h-5" />,
    "Infraestructura": <HardHat className="w-5 h-5" />,

    // Derecho Sectorial
    "Pesca y Acuicultura": <Fish className="w-5 h-5" />,
    "Turismo": <Camera className="w-5 h-5" />,
    "Prevención del Lavado de Activos": <AlertTriangle className="w-5 h-5" />,
    "Responsabilidad Social Empresarial": <Handshake className="w-5 h-5" />,

    // Categorías adicionales
    "Eléctrico": <Zap className="w-5 h-5" />,
    "Agua": <Droplets className="w-5 h-5" />,
    "Reales": <Home className="w-5 h-5" />
  };

  return iconMap[categoryName] || <FileText className="w-5 h-5" />;
};

const RCLogo = () => (
  <div className="relative font-serif text-white leading-none">
    <span className="text-4xl absolute -top-1 left-0" style={{ fontWeight: '500' }}>R</span>
    <span className="text-4xl absolute top-2 left-2" style={{ fontWeight: '500' }}>C</span>
    <div className="w-10 h-10"></div>
  </div>
);

const Header = ({ isMenuOpen, setIsMenuOpen }) => {
  const location = useLocation();
  
  return (
    <header className="bg-red-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <RCLogo />
            <h1 className="text-4xl" style={{ fontFamily: 'Brush Script MT, cursive' }}>Rojas Cala</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`hover:text-red-200 ${location.pathname === '/' ? 'text-red-200' : ''}`}>Inicio</Link>
            <Link to="/normas" className={`hover:text-red-200 ${location.pathname === '/normas' ? 'text-red-200' : ''}`}>Normas</Link>
            <Link to="/fechas" className={`hover:text-red-200 ${location.pathname === '/fechas' ? 'text-red-200' : ''}`}>Fechas</Link>
            <Link to="/categorias" className={`hover:text-red-200 ${location.pathname === '/categorias' ? 'text-red-200' : ''}`}>Categorías</Link>
            <Link to="/especiales" className={`hover:text-red-200 ${location.pathname === '/especiales' ? 'text-red-200' : ''}`}>Especiales</Link>
            <Link to="/contacto" className={`hover:text-red-200 ${location.pathname === '/contacto' ? 'text-red-200' : ''}`}>Contacto</Link>
          </nav>
          
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

const MobileMenu = ({ isMenuOpen }) => {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-red-800 text-white">
      <div className="container mx-auto px-4 py-2">
        <nav className="flex flex-col space-y-2">
          <Link to="/" className="py-2 hover:text-red-200">Inicio</Link>
          <Link to="/normas" className="py-2 hover:text-red-200">Normas</Link>
          <Link to="/fechas" className="py-2 hover:text-red-200">Fechas</Link>
          <Link to="/categorias" className="py-2 hover:text-red-200">Categorías</Link>
          <Link to="/especiales" className="py-2 hover:text-red-200">Especiales</Link>
          <Link to="/contacto" className="py-2 hover:text-red-200">Contacto</Link>
        </nav>
      </div>
    </div>
  );
};

const AuthorLink = ({ author, authorContactId, contacts }) => {
  const contact = contacts.find(c => c.id === authorContactId);
  
  if (contact) {
    return (
      <Link 
        to={`/contacto/${contact.id}`}
        className="text-red-900 font-medium hover:text-red-700 hover:underline"
      >
        {author}
      </Link>
    );
  }
  
  return <span className="text-gray-600">{author}</span>;
};

const ArticleDetail = () => {
  const { id, type } = useParams();
  const [article, setArticle] = useState<Article | SpecialArticle | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticleAndContacts();
  }, [id, type]);

  const fetchArticleAndContacts = async () => {
    try {
      await Promise.all([fetchArticle(), fetchContacts()]);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticle = async () => {
    const table = type === 'special' ? 'special_articles' : 'articles';
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .eq('is_hidden', false) // Solo mostrar artículos visibles
      .single();

    if (error) throw error;
    setArticle(data);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true);

    if (error && error.code !== 'PGRST116') throw error;
    setContacts(data || []);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-xl">Cargando artículo...</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artículo no encontrado</h2>
          <Link to="/" className="text-red-900 hover:text-red-700">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Navegación */}
        <div className="mb-8">
          <Link to="/" className="text-red-900 hover:text-red-700 flex items-center">
            ← Volver al inicio
          </Link>
        </div>

        {/* Imagen para artículos especiales */}
        {type === 'special' && 'image_url' in article && article.image_url && (
          <div className="mb-8">
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Encabezado del artículo */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full ${
              type === 'special' 
                ? 'bg-purple-100 text-purple-900' 
                : 'bg-red-100 text-red-900'
            }`}>
              {type === 'special' ? 'Artículo Especial' : (article as Article).document_type}
            </span>
            <span className="text-gray-600">
              {formatDateSafe(article.published_date)}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center justify-between mb-6">
            <div className="text-lg">
              <span className="text-gray-600">Por </span>
              <AuthorLink 
                author={article.author} 
                authorContactId={article.author_contact_id} 
                contacts={contacts} 
              />
            </div>
            
            {type !== 'special' && 'official_link' in article && article.official_link && (
              <a
                href={article.official_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver norma oficial
              </a>
            )}
          </div>

          {/* Categorías */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(Array.isArray(article.category) ? article.category : [article.category]).filter(Boolean).map(cat => (
              <span key={cat} className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                {cat}
              </span>
            ))}
          </div>

          {/* Resumen */}
          {article.summary && (
            <div className="bg-gray-50 border-l-4 border-red-900 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Resumen</h2>
              <p className="text-gray-700 leading-relaxed">{article.summary}</p>
            </div>
          )}
        </header>

        {/* Contenido principal */}
        <main className="prose prose-lg max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </main>

        {/* Información del autor */}
        {article.author_contact_id && (
          <div className="mt-12 bg-red-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Sobre el autor</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center text-white">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{article.author}</h4>
                <Link
                  to={`/contacto/${article.author_contact_id}`}
                  className="text-red-900 hover:text-red-700 font-medium"
                >
                  Ver perfil completo →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Navegación adicional */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link 
              to="/" 
              className="text-red-900 hover:text-red-700 font-medium"
            >
              ← Ver más artículos
            </Link>
            <Link 
              to="/contacto" 
              className="bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition-colors"
            >
              Contactar al autor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecialsPage = () => {
  const [specialArticles, setSpecialArticles] = useState<SpecialArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<SpecialArticle[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para el buscador y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedAuthor, setSelectedAuthor] = useState('Todos');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'author'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortArticles();
  }, [specialArticles, searchTerm, selectedCategory, selectedAuthor, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      await Promise.all([fetchSpecialArticles(), fetchContacts(), fetchCategories()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecialArticles = async () => {
    const { data, error } = await supabase
      .from('special_articles')
      .select('*')
      .eq('is_hidden', false) // Solo mostrar artículos visibles
      .order('published_date', { ascending: false });

    if (error) throw error;
    setSpecialArticles(data || []);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true);

    if (error && error.code !== 'PGRST116') throw error;
    setContacts(data || []);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories_config')
        .select('name')
        .eq('type', 'category')
        .eq('is_active', true)
        .order('display_order');

      if (error && error.code !== 'PGRST116') throw error;
      setCategories((data || []).map(item => item.name));
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback a categorías por defecto si hay error
      setCategories([
        "Constitucional", "Administrativo", "Civil", "Penal", "Laboral",
        "Tributario", "Ambiental", "Comercial"
      ]);
    }
  };

  const filterAndSortArticles = () => {
    let filtered = [...specialArticles];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.author.toLowerCase().includes(searchLower) ||
        (article.summary && article.summary.toLowerCase().includes(searchLower)) ||
        (Array.isArray(article.category) ? article.category : [article.category])
          .some(cat => cat.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(article => {
        const articleCategories = Array.isArray(article.category) ? article.category : [article.category];
        return articleCategories.includes(selectedCategory);
      });
    }

    // Filtrar por autor
    if (selectedAuthor !== 'Todos') {
      filtered = filtered.filter(article => article.author === selectedAuthor);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.published_date).getTime() - new Date(b.published_date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredArticles(filtered);
  };

  // Obtener categorías únicas de los artículos especiales
  const getUniqueCategories = () => {
    const allCategories = specialArticles.flatMap(article => 
      Array.isArray(article.category) ? article.category : [article.category]
    ).filter(Boolean);
    return [...new Set(allCategories)].sort();
  };

  // Obtener autores únicos
  const getUniqueAuthors = () => {
    const allAuthors = specialArticles.map(article => article.author).filter(Boolean);
    return [...new Set(allAuthors)].sort();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todas');
    setSelectedAuthor('Todos');
    setSortBy('date');
    setSortOrder('desc');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-xl">Cargando artículos especiales...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">Artículos Especiales</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Análisis profundos y guías prácticas sobre temas legales relevantes
        </p>
      </div>

      {/* Barra de búsqueda principal */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar en artículos especiales por título, contenido, autor o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Controles de filtros y ordenamiento */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Botón para mostrar/ocultar filtros en móvil */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filtros y ordenamiento</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 text-red-900 hover:text-red-700"
            >
              <Filter className="w-5 h-5" />
              <span>{showFilters ? 'Ocultar' : 'Mostrar'} filtros</span>
            </button>
          </div>

          {/* Filtros */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="Todas">Todas las categorías</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por autor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="Todos">Todos los autores</option>
                  {getUniqueAuthors().map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'author')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="date">Fecha</option>
                  <option value="title">Título</option>
                  <option value="author">Autor</option>
                </select>
              </div>

              {/* Orden */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  <span>{sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}</span>
                </button>
              </div>
            </div>

            {/* Botón limpiar filtros */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Limpiar todos los filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'Todas' || selectedAuthor !== 'Todos' ? (
              <>
                Mostrando <strong>{filteredArticles.length}</strong> de <strong>{specialArticles.length}</strong> artículos especiales
                {searchTerm && (
                  <span> para "<strong>{searchTerm}</strong>"</span>
                )}
              </>
            ) : (
              <>Mostrando <strong>{specialArticles.length}</strong> artículos especiales</>
            )}
          </p>
          
          {(searchTerm || selectedCategory !== 'Todas' || selectedAuthor !== 'Todos') && (
            <button
              onClick={clearFilters}
              className="text-red-900 hover:text-red-700 text-sm font-medium"
            >
              Ver todos los artículos
            </button>
          )}
        </div>
      </div>

      {/* Grid de artículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map((article) => (
          <article key={article.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {article.image_url && (
              <div className="relative">
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">
                    Artículo Especial
                  </span>
                </div>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(article.category) ? article.category : [article.category]).filter(Boolean).slice(0, 2).map(cat => (
                    <span key={cat} className="inline-block px-2 py-1 text-xs bg-red-100 text-red-900 rounded-full">
                      {cat}
                    </span>
                  ))}
                  {(Array.isArray(article.category) ? article.category : [article.category]).filter(Boolean).length > 2 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{(Array.isArray(article.category) ? article.category : [article.category]).filter(Boolean).length - 2}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDateSafe(article.published_date)}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-3 line-clamp-2 hover:text-red-900 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">{article.summary}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <AuthorLink 
                    author={article.author} 
                    authorContactId={article.author_contact_id} 
                    contacts={contacts} 
                  />
                </div>
                <Link 
                  to={`/articulo/special/${article.id}`}
                  className="inline-flex items-center text-red-900 hover:text-red-700 font-medium transition-colors"
                >
                  Leer más <BookOpen className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      {/* Estado vacío */}
      {filteredArticles.length === 0 && specialArticles.length > 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron artículos</h3>
            <p className="text-gray-600 mb-6">
              No hay artículos especiales que coincidan con tu búsqueda. Intenta con otros términos o ajusta los filtros.
            </p>
            <button
              onClick={clearFilters}
              className="bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition-colors"
            >
              Ver todos los artículos
            </button>
          </div>
        </div>
      )}

      {specialArticles.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay artículos especiales publicados aún.</p>
        </div>
      )}
    </div>
  );
};

// Componente para manejar el envío de correos
const ContactEmailButton = ({ contact, className = "", children }) => {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Consulta Legal');
    const body = encodeURIComponent(`Hola ${contact.name},

Me gustaría obtener más información sobre tus servicios legales.

Saludos cordiales.`);
    
    const mailtoLink = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    
    // Intentar abrir el cliente de correo
    try {
      window.location.href = mailtoLink;
    } catch (error) {
      console.error('Error opening email client:', error);
      // Si falla, mostrar opciones alternativas
      setShowOptions(true);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying email:', error);
    }
  };

  const openGmail = () => {
    const subject = encodeURIComponent('Consulta Legal');
    const body = encodeURIComponent(`Hola ${contact.name},

Me gustaría obtener más información sobre tus servicios legales.

Saludos cordiales.`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const openOutlook = () => {
    const subject = encodeURIComponent('Consulta Legal');
    const body = encodeURIComponent(`Hola ${contact.name},

Me gustaría obtener más información sobre tus servicios legales.

Saludos cordiales.`);
    
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${contact.email}&subject=${subject}&body=${body}`;
    window.open(outlookUrl, '_blank');
  };

  if (showOptions) {
    return (
      <div className="relative">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-3">
          <div className="text-sm font-medium text-gray-900 mb-3">
            Opciones para contactar:
          </div>
          
          <button
            onClick={handleEmailClick}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Abrir cliente de correo</span>
          </button>
          
          <button
            onClick={openGmail}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Abrir Gmail</span>
          </button>
          
          <button
            onClick={openOutlook}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Abrir Outlook</span>
          </button>
          
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">O copiar email:</span>
              <button
                onClick={copyEmail}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm">{copied ? 'Copiado!' : contact.email}</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowOptions(false)}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            Cerrar opciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleEmailClick}
        className={className}
      >
        {children}
      </button>
      
      <div className="text-center">
        <button
          onClick={() => setShowOptions(true)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ¿No se abre tu correo? Ver más opciones
        </button>
      </div>
    </div>
  );
};

const ContactPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contacts:', error);
        throw error;
      }
      
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Fallback al contacto por defecto
      setContacts([{
        id: '1',
        name: 'Julio Cesar Rojas Cala',
        email: 'julio.cesar@rojascala.org',
        linkedin_url: 'https://www.linkedin.com/in/julio-cesar-rojas-cala-069883238/',
        instagram_url: 'https://www.instagram.com/jc_rojascala/?hl=es-la',
        bio: 'Especialista en análisis de normas legales y regulaciones.',
        job_title: 'Especialista Legal',
        is_active: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-xl">Cargando información de contacto...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Nuestro Equipo</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Conoce a los profesionales especializados en análisis de normas legales y regulaciones
        </p>
      </div>
      
      {/* Layout horizontal para contactos */}
      <div className="space-y-12">
        {contacts.map((contact, index) => (
          <div key={contact.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
              {/* Imagen del contacto */}
              <div className="lg:w-80 lg:flex-shrink-0">
                <div className="h-80 lg:h-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
                  {contact.photo_url ? (
                    <img 
                      src={contact.photo_url} 
                      alt={contact.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <User className="w-32 h-32 text-red-300 mx-auto mb-4" />
                      <p className="text-red-600 font-medium">Foto próximamente</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Información del contacto */}
              <div className="flex-1 p-8 lg:p-12">
                <div className="space-y-8">
                  {/* Nombre y título */}
                  <div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-3">{contact.name}</h3>
                    <p className="text-xl text-red-600 font-medium">{contact.job_title || 'Especialista Legal'}</p>
                  </div>

                  {/* Información de contacto */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Correo Electrónico</p>
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-xl font-semibold text-gray-900 hover:text-red-600 transition-colors"
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Servicios */}
                  {(contact.services_description || contact.services_link) && (
                    <div className="bg-red-50 rounded-xl p-8">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Mis servicios:</h4>
                      {contact.services_description && (
                        <p className="text-gray-700 mb-6 text-lg leading-relaxed">{contact.services_description}</p>
                      )}
                      {contact.services_link && (
                        <a
                          href={contact.services_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-8 py-4 bg-red-900 text-white rounded-xl hover:bg-red-800 transition-colors font-medium text-lg"
                        >
                          <ExternalLink className="w-6 h-6 mr-3" />
                          Ver servicios completos
                        </a>
                      )}
                    </div>
                  )}

                  {/* Biografía */}
                  {contact.bio && (
                    <div className="bg-gray-50 rounded-xl p-8">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Acerca de</h4>
                      <p className="text-gray-700 leading-relaxed text-lg">{contact.bio}</p>
                    </div>
                  )}

                  {/* Redes sociales */}
                  {(contact.linkedin_url || contact.instagram_url) && (
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-6">Redes sociales</h4>
                      <div className="flex space-x-4">
                        {/* Botón de correo */}
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}&su=${encodeURIComponent('Consulta Legal')}&body=${encodeURIComponent(`Hola ${contact.name}, me gustaría obtener más información sobre tus servicios legales.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center space-x-3 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                          <Mail className="w-6 h-6" />
                          <span className="font-medium text-lg">Gmail</span>
                        </a>
                        {contact.linkedin_url && (
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center space-x-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            <Linkedin className="w-6 h-6" />
                            <span className="font-medium text-lg">LinkedIn</span>
                          </a>
                        )}
                        {contact.instagram_url && (
                          <a
                            href={contact.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors"
                          >
                            <Instagram className="w-6 h-6" />
                            <span className="font-medium text-lg">Instagram</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-12">
          <User className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay información de contacto disponible.</p>
        </div>
      )}
    </div>
  );
};

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [specialArticles, setSpecialArticles] = useState<SpecialArticle[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<{ name: string; icon: React.ReactNode }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchArticles(), fetchSpecialArticles(), fetchContacts(), fetchCategories()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_hidden', false) // Solo mostrar artículos visibles
      .order('published_date', { ascending: false });

    if (error) throw error;
    setArticles(data || []);
  };

  const fetchSpecialArticles = async () => {
    const { data, error } = await supabase
      .from('special_articles')
      .select('*')
      .eq('is_hidden', false) // Solo mostrar artículos visibles
      .order('published_date', { ascending: false });

    if (error && error.code !== 'PGRST116') throw error;
    setSpecialArticles(data || []);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true);

    if (error && error.code !== 'PGRST116') throw error;
    setContacts(data || []);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories_config')
        .select('name')
        .eq('type', 'category')
        .eq('is_active', true)
        .order('display_order');

      if (error && error.code !== 'PGRST116') throw error;
      
      const categoryNames = (data || []).map(item => item.name);
      const categoriesWithIcons = categoryNames.map(name => ({
        name,
        icon: getCategoryIcon(name)
      }));
      
      setCategories(categoriesWithIcons);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback a categorías por defecto si hay error
      const defaultCategories = [
        "Constitucional", "Administrativo", "Civil", "Penal", "Laboral",
        "Tributario", "Ambiental", "Comercial"
      ];
      setCategories(defaultCategories.map(name => ({
        name,
        icon: getCategoryIcon(name)
      })));
    }
  };
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getArticlesByCategory = (categoryName: string) => {
    const normalArticles = articles.filter(article => 
      Array.isArray(article.category) 
        ? article.category.includes(categoryName)
        : article.category === categoryName
    );
    const specials = specialArticles.filter(article => 
      Array.isArray(article.category) 
        ? article.category.includes(categoryName)
        : article.category === categoryName
    );
    return [...normalArticles, ...specials];
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-xl">Cargando categorías...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">Categorías Legales</h2>
      
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const categoryArticles = getArticlesByCategory(category.name);
          return (
            <div key={category.name} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center text-white">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    {categoryArticles.length > 0 && (
                      <p className="text-sm text-gray-500">{categoryArticles.length} artículos</p>
                    )}
                  </div>
                </div>
                <div className="text-red-900">
                  {selectedCategory === category.name ? '−' : '+'}
                </div>
              </div>

              {selectedCategory === category.name && categoryArticles.length > 0 && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {categoryArticles.slice(0, 3).map((article) => (
                    <div key={article.id} className="text-sm">
                      <Link 
                        to={`/articulo/${'document_type' in article ? 'normal' : 'special'}/${article.id}`}
                        className="block hover:bg-gray-50 p-2 rounded"
                      >
                        <h4 className="font-medium text-gray-900 line-clamp-2 hover:text-red-900">{article.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <AuthorLink 
                            author={article.author} 
                            authorContactId={article.author_contact_id} 
                            contacts={contacts} 
                          />
                          <span className="text-gray-500 text-xs">
                            {formatDateSafe(article.published_date)}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                  {categoryArticles.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{categoryArticles.length - 3} artículos más
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron categorías que coincidan con la búsqueda.</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-gray-600">
          <strong>{categories.length}</strong> categorías legales disponibles
        </p>
      </div>
    </div>
  );
};

const DocumentTypesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchArticles(), fetchContacts(), fetchDocumentTypes()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_hidden', false) // Solo mostrar artículos visibles
      .order('published_date', { ascending: false });

    if (error) throw error;
    setArticles(data || []);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true);

    if (error && error.code !== 'PGRST116') throw error;
    setContacts(data || []);
  };

  const fetchDocumentTypes = async () => {
    try {
      console.log('🔍 Fetching document types from database...');
      const { data, error } = await supabase
        .from('categories_config')
        .select('name')
        .eq('type', 'document_type')
        .eq('is_active', true)
        .order('display_order');

      if (error && error.code !== 'PGRST116') throw error;
      
      const types = (data || []).map(item => item.name);
      console.log('✅ Document types fetched:', data);
      console.log('📋 Setting document types:', types);
      
      if (types.length === 0) {
        console.log('⚠️ No document types found, using fallback');
        // Fallback a tipos por defecto si hay error
        setDocumentTypes([
          "Ley", "Decreto Supremo", "Resolución Ministerial", "Resolución Directoral",
          "Ordenanza", "Acuerdo", "Directiva", "Reglamento"
        ]);
      } else {
        setDocumentTypes(types);
      }
    } catch (error) {
      console.error('❌ Error in fetchDocumentTypes:', error);
      // Fallback a tipos por defecto si hay error
      setDocumentTypes([
        "Ley", "Decreto Supremo", "Resolución Ministerial", "Resolución Directoral",
        "Ordenanza", "Acuerdo", "Directiva", "Reglamento"
      ]);
    }
  };
  
  const filteredTypes = documentTypes.filter(type =>
    type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getArticlesByType = (typeName: string) => {
    return articles.filter(article => article.document_type === typeName);
  };

  const handleTypeClick = (typeName: string) => {
    setSelectedType(selectedType === typeName ? null : typeName);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-xl">Cargando tipos de normas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">Tipos de Normas Legales</h2>
      
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar tipos de normas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTypes.map((type) => {
          const typeArticles = getArticlesByType(type);
          return (
            <div key={type} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleTypeClick(type)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{type}</h3>
                    {typeArticles.length > 0 && (
                      <p className="text-sm text-gray-500">{typeArticles.length} artículos</p>
                    )}
                  </div>
                </div>
                <div className="text-red-900">
                  {selectedType === type ? '−' : '+'}
                </div>
              </div>

              {selectedType === type && typeArticles.length > 0 && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {typeArticles.slice(0, 3).map((article) => (
                    <div key={article.id} className="text-sm">
                      <Link 
                        to={`/articulo/normal/${article.id}`}
                        className="block hover:bg-gray-50 p-2 rounded"
                      >
                        <h4 className="font-medium text-gray-900 line-clamp-2 hover:text-red-900">{article.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <AuthorLink 
                            author={article.author} 
                            authorContactId={article.author_contact_id} 
                            contacts={contacts} 
                          />
                          <span className="text-gray-500 text-xs">
                            {formatDateSafe(article.published_date)}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                  {typeArticles.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{typeArticles.length - 3} artículos más
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron tipos de normas que coincidan con la búsqueda.</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-gray-600">
          <strong>{documentTypes.length}</strong> tipos de normas disponibles
        </p>
      </div>
    </div>
  );
};

const CalendarPage = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [articles, setArticles] = useState<Article[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchArticles(), fetchContacts()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_hidden', false) // Solo mostrar artículos visibles
      .order('published_date', { ascending: false });

    if (error) throw error;
    setArticles(data || []);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true);

    if (error && error.code !== 'PGRST116') throw error;
    setContacts(data || []);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const filteredArticles = selectedDate
    ? articles.filter(article => 
        format(parse(article.published_date, 'yyyy-MM-dd', new Date()), 'yyyy-MM-dd') === 
        format(selectedDate, 'yyyy-MM-dd')
      )
    : [];

  const previousMonth = () => {
    setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() + 1));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={previousMonth}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  ←
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  →
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="text-center font-semibold py-2">
                  {day}
                </div>
              ))}
              {daysInMonth.map((day, index) => {
                const hasArticles = articles.some(
                  article => article.published_date === format(day, 'yyyy-MM-dd')
                );
                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      p-2 text-center rounded-full
                      ${isToday(day) ? 'bg-red-100 text-red-900' : ''}
                      ${!isSameMonth(day, currentDate) ? 'text-gray-300' : ''}
                      ${hasArticles ? 'font-bold text-red-900' : ''}
                      ${
                        selectedDate &&
                        format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                          ? 'bg-red-900 text-white'
                          : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedDate && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">
              Normas del {format(selectedDate, 'd \'de\' MMMM, yyyy', { locale: es })}
            </h3>
            {filteredArticles.length > 0 ? (
              <div className="space-y-4">
                {filteredArticles.map(article => (
                  <div
                    key={article.id}
                    className="bg-white p-6 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-block px-3 py-1 text-sm bg-red-100 text-red-900 rounded-full">
                        {article.document_type}
                      </span>
                      <span className="text-sm text-gray-500">{formatDateSafe(article.published_date)}</span>
                    </div>
                    <Link to={`/articulo/normal/${article.id}`}>
                      <h4 className="text-xl font-semibold mb-2 hover:text-red-900">{article.title}</h4>
                    </Link>
                    <p className="text-gray-600 mb-2">{article.summary || article.content.substring(0, 200) + '...'}</p>
                    <div className="text-sm mb-2">
                      <AuthorLink 
                        author={article.author} 
                        authorContactId={article.author_contact_id} 
                        contacts={contacts} 
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <Link 
                        to={`/articulo/normal/${article.id}`}
                        className="text-red-900 hover:text-red-700 font-medium"
                      >
                        Leer más →
                      </Link>
                      {article.official_link && (
                        <a
                          href={article.official_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-blue-600 hover:text-blue-800"
                        >
                          Ver norma oficial →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No hay normas publicadas en esta fecha.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [articles, setArticles] = useState<Article[]>([]);
  const [specialArticles, setSpecialArticles] = useState<SpecialArticle[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<{ name: string; icon: React.ReactNode }[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchArticles(), 
        fetchSpecialArticles(), 
        fetchContacts(), 
        fetchCategories(), 
        fetchDocumentTypes()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_hidden', false) // Solo mostrar artículos visibles
      .order('published_date', { ascending: false })
      .limit(20);

    if (error) throw error;
    setArticles(data || []);
  };

  const fetchSpecialArticles = async () => {
    const { data, error } = await supabase
      .from('special_articles')
      .select('*')
      .eq('is_hidden', false) // Solo mostrar artículos visibles
      .order('published_date', { ascending: false })
      .limit(10);

    if (error && error.code !== 'PGRST116') throw error;
    setSpecialArticles(data || []);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true);

    if (error && error.code !== 'PGRST116') throw error;
    setContacts(data || []);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories_config')
        .select('name')
        .eq('type', 'category')
        .eq('is_active', true)
        .order('display_order');

      if (error && error.code !== 'PGRST116') throw error;
      
      const categoryNames = (data || []).map(item => item.name);
      const categoriesWithIcons = categoryNames.map(name => ({
        name,
        icon: getCategoryIcon(name)
      }));
      
      setCategories(categoriesWithIcons);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback a categorías por defecto si hay error
      const defaultCategories = [
        "Constitucional", "Administrativo", "Civil", "Penal", "Laboral",
        "Tributario", "Ambiental", "Comercial"
      ];
      setCategories(defaultCategories.map(name => ({
        name,
        icon: getCategoryIcon(name)
      })));
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('categories_config')
        .select('name')
        .eq('type', 'document_type')
        .eq('is_active', true)
        .order('display_order');

      if (error && error.code !== 'PGRST116') throw error;
      setDocumentTypes((data || []).map(item => item.name));
    } catch (error) {
      console.error('Error fetching document types:', error);
      // Fallback a tipos por defecto si hay error
      setDocumentTypes([
        "Ley", "Decreto Supremo", "Resolución Ministerial", "Resolución Directoral",
        "Ordenanza", "Acuerdo", "Directiva", "Reglamento"
      ]);
    }
  };

  // Combinar artículos normales y especiales, ordenados por fecha
  const allArticles = [
    ...articles.map(article => ({ ...article, type: 'normal' as const })),
    ...specialArticles.map(article => ({ ...article, type: 'special' as const, document_type: 'Artículo Especial' }))
  ].sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime());

  const filteredArticles = allArticles.filter(article => {
    const articleCategories = Array.isArray(article.category) ? article.category : [article.category];
    const matchesCategory = selectedCategory === "Todos" || articleCategories.includes(selectedCategory);
    const matchesType = selectedType === "Todos" || 
      (article.type === 'normal' ? article.document_type === selectedType : selectedType === 'Artículo Especial');
    const matchesSearch = searchTerm === "" || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <>
      <section className="bg-gradient-to-r from-red-900 to-red-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Análisis de Normas Legales</h2>
            <p className="text-xl mb-8">Mantente informado sobre las últimas normativas y regulaciones legales</p>
            <div className="flex items-center bg-white rounded-lg p-2">
              <Search className="w-5 h-5 text-gray-500 mx-2" />
              <input
                type="text"
                placeholder="Buscar normas legales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-gray-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Categorías</h3>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              <button
                onClick={() => setSelectedCategory("Todos")}
                className={`px-4 py-2 rounded ${
                  selectedCategory === "Todos"
                    ? "bg-red-900 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded ${
                    selectedCategory === category.name
                      ? "bg-red-900 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {category.icon}
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Tipo de Norma</h3>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              <button
                onClick={() => setSelectedType("Todos")}
                className={`px-4 py-2 rounded ${
                  selectedType === "Todos"
                    ? "bg-red-900 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedType("Artículo Especial")}
                className={`flex items-center space-x-2 px-4 py-2 rounded ${
                  selectedType === "Artículo Especial"
                    ? "bg-red-900 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-sm">Artículo Especial</span>
              </button>
              {documentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded ${
                    selectedType === type
                      ? "bg-red-900 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <article key={`${article.type}-${article.id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {article.type === 'special' && 'image_url' in article && article.image_url && (
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                    article.type === 'special' 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'bg-red-100 text-red-900'
                  }`}>
                    {article.type === 'normal' ? article.document_type : 'Artículo Especial'}
                  </span>
                  <span className="text-sm text-gray-500">{formatDateSafe(article.published_date)}</span>
                </div>
                <Link to={`/articulo/${article.type}/${article.id}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:text-red-900">{article.title}</h3>
                </Link>
                <p className="text-gray-600 mb-4">{article.summary || article.content.substring(0, 150) + '...'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {(Array.isArray(article.category) ? article.category : [article.category]).filter(Boolean).slice(0, 2).map(cat => (
                        <span key={cat} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {cat}
                        </span>
                      ))}
                      {(Array.isArray(article.category) ? article.category : [article.category]).filter(Boolean).length > 2 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{(Array.isArray(article.category) ? article.category : [article.category]).filter(Boolean).length - 2}
                        </span>
                      )}
                    </div>
                    <AuthorLink 
                      author={article.author} 
                      authorContactId={article.author_contact_id} 
                      contacts={contacts} 
                    />
                  </div>
                  <div className="flex space-x-2">
                    {article.type === 'normal' && 'official_link' in article && article.official_link && (
                      <a
                        href={article.official_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver oficial
                      </a>
                    )}
                    <Link 
                      to={`/articulo/${article.type}/${article.id}`}
                      className="text-red-900 hover:text-red-700 font-medium"
                    >
                      Leer más →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron artículos que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </main>
    </>
  );
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <ErrorBoundary>
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <MobileMenu isMenuOpen={isMenuOpen} />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/normas" element={<DocumentTypesPage />} />
          <Route path="/admin" element={
            <ErrorBoundary>
              <AdminPanel />
            </ErrorBoundary>
          } />
          <Route path="/fechas" element={<CalendarPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/especiales" element={<SpecialsPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/contacto/:id" element={<ContactPage />} />
          <Route path="/articulo/:type/:id" element={<ArticleDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        {/* Widget flotante de ayuda */}
        <FloatingHelpWidget />

        <footer className="bg-gray-900 text-white mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <RCLogo />
                  <h4 className="text-xl italic" style={{ fontFamily: 'Brush Script MT, cursive' }}>Rojas Cala</h4>
                </div>
                <p className="text-gray-400">
                  Manteniéndote actualizado con las últimas normas legales y regulaciones.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-4">Enlaces Rápidos</h4>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white">Inicio</Link></li>
                  <li><Link to="/normas" className="text-gray-400 hover:text-white">Normas</Link></li>
                  <li><Link to="/fechas" className="text-gray-400 hover:text-white">Fechas</Link></li>
                  <li><Link to="/categorias" className="text-gray-400 hover:text-white">Categorías</Link></li>
                  <li><Link to="/especiales" className="text-gray-400 hover:text-white">Especiales</Link></li>
                  <li><Link to="/contacto" className="text-gray-400 hover:text-white">Contacto</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-4">Contacto</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Email: julio.cesar@rojascala.org</li>
                  <li>Dirección: Av. Principal 123, Lima</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Rojas Cala. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
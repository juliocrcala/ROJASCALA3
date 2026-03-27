import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  es: {
    nav_home: 'Inicio',
    nav_norms: 'Normas',
    nav_dates: 'Fechas',
    nav_categories: 'Categorías',
    nav_special: 'Especiales',
    nav_articles: 'Artículos',
    nav_contact: 'Contacto',
    nav_login: 'Iniciar Sesión',
    all_filter: 'Todos',
    categories_title: 'Categorías',
    document_type_title: 'Tipo de Norma',
    special_article_badge: 'Artículo Especial',
    view_attachment: 'Ver Anexo',
    hero_title: 'Bienvenido a Nuestro Blog',
    hero_subtitle: 'Descubre artículos, noticias y recursos sobre nuestros temas',
    featured_articles: 'Artículos Destacados',
    latest_articles: 'Últimos Artículos',
    all_articles: 'Todos los Artículos',
    read_more: 'Leer más',
    search_placeholder: 'Buscar artículos...',
    filter_by_category: 'Filtrar por categoría',
    all_categories: 'Todas las categorías',
    no_articles_found: 'No se encontraron artículos',
    no_articles_description: 'No hay artículos publicados en este momento.',
    contact_title: 'Contacto',
    contact_subtitle: 'Ponte en contacto con nosotros',
    contact_name: 'Nombre',
    contact_email: 'Correo Electrónico',
    contact_phone: 'Teléfono',
    contact_message: 'Mensaje',
    contact_send: 'Enviar Mensaje',
    contact_sending: 'Enviando...',
    contact_success: 'Mensaje enviado exitosamente',
    contact_error: 'Error al enviar el mensaje',
    consultation_title: 'Solicitar Consulta',
    consultation_subtitle: 'Agenda una consulta con nosotros',
    consultation_send: 'Solicitar Consulta',
    consultation_sending: 'Enviando...',
    consultation_success: 'Consulta solicitada exitosamente',
    consultation_error: 'Error al solicitar la consulta',
    follow_us: 'Síguenos en',
    newsletter_title: 'Suscríbete a nuestro boletín',
    newsletter_description: 'Recibe las últimas noticias y artículos directamente en tu correo',
    newsletter_placeholder: 'Tu correo electrónico',
    newsletter_subscribe: 'Suscribirse',
    newsletter_subscribing: 'Suscribiendo...',
    newsletter_success: '¡Suscripción exitosa!',
    newsletter_error: 'Error al suscribirse',
    newsletter_already_subscribed: 'Este correo ya está suscrito',
    share_article: 'Compartir artículo',
    published_on: 'Publicado el',
    by_author: 'Por',
    article_not_found: 'Artículo no encontrado',
    article_not_found_description: 'El artículo que buscas no existe o ha sido eliminado.',
    back_to_home: 'Volver al inicio',
    loading: 'Cargando...',
    error_loading: 'Error al cargar',
    try_again: 'Intentar nuevamente',
    cookie_message: 'Usamos cookies para mejorar tu experiencia en nuestro sitio web.',
    cookie_accept: 'Aceptar',
    cookie_reject: 'Rechazar',
    cookie_learn_more: 'Más información',
    login_title: 'Iniciar Sesión',
    login_email: 'Correo Electrónico',
    login_password: 'Contraseña',
    login_button: 'Iniciar Sesión',
    login_logging_in: 'Iniciando sesión...',
    login_error: 'Error al iniciar sesión',
    logout: 'Cerrar Sesión',
    admin_panel: 'Panel de Administración',
    maintenance_mode: 'Modo de Mantenimiento',
    maintenance_title: 'Sitio en Mantenimiento',
    maintenance_message: 'Estamos realizando mejoras. Vuelve pronto.',
    categories: 'Categorías',
    articles: 'Artículos',
    contacts: 'Contactos',
    consultations: 'Consultas',
    newsletter: 'Newsletter',
    analytics: 'Analíticas',
    settings: 'Configuración',
    footer_tagline: 'Manteniéndote actualizado con las últimas normas legales y regulaciones.',
    footer_quick_links: 'Enlaces Rápidos',
    footer_contact: 'Contacto',
  },
  en: {
    nav_home: 'Home',
    nav_norms: 'Norms',
    nav_dates: 'Dates',
    nav_categories: 'Categories',
    nav_special: 'Special',
    nav_articles: 'Articles',
    nav_contact: 'Contact',
    nav_login: 'Login',
    all_filter: 'All',
    categories_title: 'Categories',
    document_type_title: 'Document Type',
    special_article_badge: 'Special Article',
    view_attachment: 'View Attachment',
    hero_title: 'Welcome to Our Blog',
    hero_subtitle: 'Discover articles, news and resources about our topics',
    featured_articles: 'Featured Articles',
    latest_articles: 'Latest Articles',
    all_articles: 'All Articles',
    read_more: 'Read more',
    search_placeholder: 'Search articles...',
    filter_by_category: 'Filter by category',
    all_categories: 'All categories',
    no_articles_found: 'No articles found',
    no_articles_description: 'There are no published articles at this time.',
    contact_title: 'Contact',
    contact_subtitle: 'Get in touch with us',
    contact_name: 'Name',
    contact_email: 'Email',
    contact_phone: 'Phone',
    contact_message: 'Message',
    contact_send: 'Send Message',
    contact_sending: 'Sending...',
    contact_success: 'Message sent successfully',
    contact_error: 'Error sending message',
    consultation_title: 'Request Consultation',
    consultation_subtitle: 'Schedule a consultation with us',
    consultation_send: 'Request Consultation',
    consultation_sending: 'Sending...',
    consultation_success: 'Consultation requested successfully',
    consultation_error: 'Error requesting consultation',
    follow_us: 'Follow us on',
    newsletter_title: 'Subscribe to our newsletter',
    newsletter_description: 'Receive the latest news and articles directly in your inbox',
    newsletter_placeholder: 'Your email address',
    newsletter_subscribe: 'Subscribe',
    newsletter_subscribing: 'Subscribing...',
    newsletter_success: 'Successfully subscribed!',
    newsletter_error: 'Error subscribing',
    newsletter_already_subscribed: 'This email is already subscribed',
    share_article: 'Share article',
    published_on: 'Published on',
    by_author: 'By',
    article_not_found: 'Article not found',
    article_not_found_description: 'The article you are looking for does not exist or has been deleted.',
    back_to_home: 'Back to home',
    loading: 'Loading...',
    error_loading: 'Error loading',
    try_again: 'Try again',
    cookie_message: 'We use cookies to improve your experience on our website.',
    cookie_accept: 'Accept',
    cookie_reject: 'Reject',
    cookie_learn_more: 'Learn more',
    login_title: 'Login',
    login_email: 'Email',
    login_password: 'Password',
    login_button: 'Login',
    login_logging_in: 'Logging in...',
    login_error: 'Error logging in',
    logout: 'Logout',
    admin_panel: 'Admin Panel',
    maintenance_mode: 'Maintenance Mode',
    maintenance_title: 'Site Under Maintenance',
    maintenance_message: 'We are making improvements. Come back soon.',
    categories: 'Categories',
    articles: 'Articles',
    contacts: 'Contacts',
    consultations: 'Consultations',
    newsletter: 'Newsletter',
    analytics: 'Analytics',
    settings: 'Settings',
    footer_tagline: 'Keeping you updated with the latest legal norms and regulations.',
    footer_quick_links: 'Quick Links',
    footer_contact: 'Contact',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'es') ? saved : 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.es] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

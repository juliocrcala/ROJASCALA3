import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function DiagnosticPanel() {
  const [status, setStatus] = useState<{
    articles: any;
    specialArticles: any;
    contacts: any;
    error: string | null;
  }>({
    articles: null,
    specialArticles: null,
    contacts: null,
    error: null,
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');

      const articlesResult = await supabase
        .from('articles')
        .select('*')
        .eq('is_hidden', false);

      const specialArticlesResult = await supabase
        .from('special_articles')
        .select('*')
        .eq('is_hidden', false);

      const contactsResult = await supabase
        .from('contacts')
        .select('*')
        .eq('is_active', true);

      setStatus({
        articles: articlesResult,
        specialArticles: specialArticlesResult,
        contacts: contactsResult,
        error: null,
      });

      console.log('Diagnostic results:', {
        articles: articlesResult,
        specialArticles: specialArticlesResult,
        contacts: contactsResult,
      });
    } catch (err: any) {
      console.error('Diagnostic error:', err);
      setStatus({
        articles: null,
        specialArticles: null,
        contacts: null,
        error: err.message,
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '20px',
      maxWidth: '400px',
      maxHeight: '600px',
      overflow: 'auto',
      zIndex: 9999,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ marginTop: 0 }}>Diagnóstico de Conexión</h3>

      {status.error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {status.error}
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <strong>Artículos:</strong>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(status.articles, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Artículos Especiales:</strong>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(status.specialArticles, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Contactos:</strong>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(status.contacts, null, 2)}
        </pre>
      </div>

      <button
        onClick={testConnection}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Probar de Nuevo
      </button>
    </div>
  );
}

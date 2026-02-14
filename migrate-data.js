import { createClient } from '@supabase/supabase-js';

const OLD_SUPABASE_URL = 'https://kyekcfjulzgvziqpyfod.supabase.co';
const OLD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZWtjZmp1bHpndnppcXB5Zm9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU2OTM2NCwiZXhwIjoyMDY2MTQ1MzY0fQ.A7-7lb6ocohR7zqlmQGg5ZlXnFuHqHWO4yUamMuo0zQ';

const NEW_SUPABASE_URL = 'https://dzqwatrhficgrioidxnw.supabase.co';
const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6cXdhdHJoZmljZ3Jpb2lkeG53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg0MTQyMywiZXhwIjoyMDgxNDE3NDIzfQ.mS48IcMbHCEf9-Bb01-NMQZxBCfnAvG0qahRpOjvnE0';

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SERVICE_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SERVICE_KEY);

async function migrateData() {
  console.log('🚀 Iniciando migración de datos...\n');

  try {
    console.log('📋 Migrando categorías...');
    const { data: categories, error: catError } = await oldSupabase
      .from('categories')
      .select('*')
      .order('id');

    if (catError) {
      console.log(`⚠️  No se encontró tabla categories en BD antigua: ${catError.message}`);
    } else if (categories && categories.length > 0) {
      const { error: insertError } = await newSupabase
        .from('categories_config')
        .upsert(categories, { onConflict: 'id' });

      if (insertError) {
        console.log(`⚠️  Error al migrar categorías: ${insertError.message}`);
      } else {
        console.log(`✅ ${categories.length} categorías migradas`);
      }
    } else {
      console.log('ℹ️  No hay categorías para migrar');
    }

    console.log('\n📰 Migrando artículos...');
    const { data: articles, error: artError } = await oldSupabase
      .from('articles')
      .select('*')
      .order('id');

    if (artError) {
      console.log(`⚠️  No se encontró tabla articles: ${artError.message}`);
    } else if (articles && articles.length > 0) {
      const { error: insertError } = await newSupabase
        .from('articles')
        .upsert(articles, { onConflict: 'id' });

      if (insertError) {
        console.log(`⚠️  Error al migrar artículos: ${insertError.message}`);
      } else {
        console.log(`✅ ${articles.length} artículos migrados`);
      }
    } else {
      console.log('ℹ️  No hay artículos para migrar');
    }

    console.log('\n👥 Migrando contactos...');
    const { data: contacts, error: conError } = await oldSupabase
      .from('contacts')
      .select('*')
      .order('id');

    if (conError) {
      console.log(`⚠️  No se encontró tabla contacts: ${conError.message}`);
    } else if (contacts && contacts.length > 0) {
      const { error: insertError } = await newSupabase
        .from('contacts')
        .upsert(contacts, { onConflict: 'id' });

      if (insertError) {
        console.log(`⚠️  Error al migrar contactos: ${insertError.message}`);
      } else {
        console.log(`✅ ${contacts.length} contactos migrados`);
      }
    } else {
      console.log('ℹ️  No hay contactos para migrar');
    }

    console.log('\n📞 Migrando consultas...');
    const { data: consultations, error: consError } = await oldSupabase
      .from('consultations')
      .select('*')
      .order('id');

    if (consError) {
      console.log(`⚠️  No se encontró tabla consultations: ${consError.message}`);
    } else if (consultations && consultations.length > 0) {
      const { error: insertError } = await newSupabase
        .from('consultations')
        .upsert(consultations, { onConflict: 'id' });

      if (insertError) {
        console.log(`⚠️  Error al migrar consultas: ${insertError.message}`);
      } else {
        console.log(`✅ ${consultations.length} consultas migradas`);
      }
    } else {
      console.log('ℹ️  No hay consultas para migrar');
    }

    console.log('\n⚙️  Migrando configuración del sitio...');
    const { data: settings, error: setError } = await oldSupabase
      .from('site_settings')
      .select('*')
      .order('id');

    if (setError) {
      console.log(`⚠️  No se encontró tabla site_settings: ${setError.message}`);
    } else if (settings && settings.length > 0) {
      const { error: insertError } = await newSupabase
        .from('site_settings')
        .upsert(settings, { onConflict: 'id' });

      if (insertError) {
        console.log(`⚠️  Error al migrar configuración: ${insertError.message}`);
      } else {
        console.log(`✅ ${settings.length} configuraciones migradas`);
      }
    } else {
      console.log('ℹ️  No hay configuraciones para migrar');
    }

    console.log('\n📧 Migrando suscriptores del newsletter...');
    const { data: subscribers, error: subError } = await oldSupabase
      .from('newsletter_subscribers')
      .select('*')
      .order('id');

    if (subError) {
      console.log(`⚠️  No se encontró tabla newsletter_subscribers: ${subError.message}`);
    } else if (subscribers && subscribers.length > 0) {
      const { error: insertError } = await newSupabase
        .from('newsletter_subscribers')
        .upsert(subscribers, { onConflict: 'id' });

      if (insertError) {
        console.log(`⚠️  Error al migrar suscriptores: ${insertError.message}`);
      } else {
        console.log(`✅ ${subscribers.length} suscriptores migrados`);
      }
    } else {
      console.log('ℹ️  No hay suscriptores para migrar');
    }

    console.log('\n✅ ¡Migración completada!');
    console.log('\n📊 Resumen de datos encontrados:');
    if (categories) console.log(`   - Categorías: ${categories.length}`);
    if (articles) console.log(`   - Artículos: ${articles.length}`);
    if (contacts) console.log(`   - Contactos: ${contacts.length}`);
    if (consultations) console.log(`   - Consultas: ${consultations.length}`);
    if (settings) console.log(`   - Configuraciones: ${settings.length}`);
    if (subscribers) console.log(`   - Suscriptores: ${subscribers.length}`);

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  }
}

migrateData();

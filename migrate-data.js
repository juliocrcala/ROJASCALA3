// Script para migrar datos de la base de datos antigua a la nueva
import { createClient } from '@supabase/supabase-js';

// Base de datos ANTIGUA (origen)
const OLD_SUPABASE_URL = 'https://kyekcfjulzgvziqpyfod.supabase.co';
const OLD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZWtjZmp1bHpndnppcXB5Zm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NjkzNjQsImV4cCI6MjA2NjE0NTM2NH0.UVCqAK9eodnYaVxZyrrD6n7aU5x3cNC92ypaVgM0krQ';

// Base de datos NUEVA (destino)
const NEW_SUPABASE_URL = 'https://dzqwatrhficgrioidxnw.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6cXdhdHJoZmljZ3Jpb2lkeG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDE0MjMsImV4cCI6MjA4MTQxNzQyM30.4Kr3t_fHTbwjbNG-bYCmU87mlKa35LSomIy-XOruEgY';

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

async function migrateTable(tableName) {
  console.log(`\n📦 Migrando tabla: ${tableName}`);

  try {
    // Obtener datos de la tabla antigua
    const { data: oldData, error: fetchError } = await oldSupabase
      .from(tableName)
      .select('*');

    if (fetchError) {
      console.error(`❌ Error al leer ${tableName} de la base antigua:`, fetchError.message);
      return { success: false, count: 0 };
    }

    if (!oldData || oldData.length === 0) {
      console.log(`ℹ️  No hay datos en ${tableName} de la base antigua`);
      return { success: true, count: 0 };
    }

    console.log(`📊 Encontrados ${oldData.length} registros en ${tableName}`);

    // Verificar cuántos ya existen en la nueva base
    const { data: newData, error: checkError } = await newSupabase
      .from(tableName)
      .select('id');

    const existingIds = new Set((newData || []).map(item => item.id));
    const dataToInsert = oldData.filter(item => !existingIds.has(item.id));

    if (dataToInsert.length === 0) {
      console.log(`✅ Todos los registros de ${tableName} ya están en la nueva base`);
      return { success: true, count: 0 };
    }

    console.log(`⬆️  Insertando ${dataToInsert.length} registros nuevos...`);

    // Insertar en la nueva base (en lotes de 100)
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < dataToInsert.length; i += batchSize) {
      const batch = dataToInsert.slice(i, i + batchSize);

      const { error: insertError } = await newSupabase
        .from(tableName)
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error al insertar lote en ${tableName}:`, insertError.message);
        continue;
      }

      inserted += batch.length;
      console.log(`   ✓ Insertados ${inserted}/${dataToInsert.length} registros`);
    }

    console.log(`✅ Migración de ${tableName} completada: ${inserted} registros insertados`);
    return { success: true, count: inserted };

  } catch (error) {
    console.error(`❌ Error migrando ${tableName}:`, error.message);
    return { success: false, count: 0 };
  }
}

async function migrate() {
  console.log('🚀 Iniciando migración de datos...\n');
  console.log('📍 Base antigua:', OLD_SUPABASE_URL);
  console.log('📍 Base nueva:', NEW_SUPABASE_URL);

  const tables = [
    'categories_config',
    'contacts',
    'articles',
    'special_articles',
    'consultations',
    'newsletter_subscribers'
  ];

  const results = {};

  for (const table of tables) {
    const result = await migrateTable(table);
    results[table] = result;
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE MIGRACIÓN');
  console.log('='.repeat(60));

  let totalMigrated = 0;
  for (const [table, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${table}: ${result.count} registros migrados`);
    totalMigrated += result.count;
  }

  console.log('='.repeat(60));
  console.log(`🎉 Total migrado: ${totalMigrated} registros`);
  console.log('='.repeat(60));
}

// Ejecutar migración
migrate().catch(console.error);

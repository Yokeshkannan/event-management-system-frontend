const { query } = require('./src/config/supabase');

async function migrate() {
  try {
    await query('ALTER TABLE events ADD COLUMN image_url VARCHAR(1024)');
    console.log('Successfully added image_url column to events table');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
}

migrate();

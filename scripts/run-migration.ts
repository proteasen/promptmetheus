import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or Key environment variables are not set');
  process.exit(1);
}

// Create a Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Read the SQL file
    const sql = fs.readFileSync(path.join(__dirname, 'create-tables.sql'), 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const [index, statement] of statements.entries()) {
      console.log(`Executing statement ${index + 1}/${statements.length}...`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
      
      const { error } = await supabase.rpc('pg_temp.pg_exec', { _stmt: statement });
      
      if (error) {
        // Skip duplicate object errors (code 42P07 for table already exists, 42710 for duplicate object)
        if (error.code === '42P07' || error.code === '42710') {
          console.log('Skipping (object already exists)');
          continue;
        }
        throw error;
      }
      
      console.log('✓ Success');
    }
    
    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

// Execute the migration
runMigration();

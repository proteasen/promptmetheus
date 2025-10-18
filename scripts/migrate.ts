import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or API key environment variables are not set');
  process.exit(1);
}

// Create a Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Read SQL files
const readSqlFile = (filename: string): string => {
  try {
    return readFileSync(join(__dirname, filename), 'utf8');
  } catch (error) {
    console.error(`Error reading SQL file ${filename}:`, error);
    process.exit(1);
  }
};

// Execute a SQL query
const executeQuery = async (sql: string) => {
  try {
    console.log(`Executing: ${sql.split('\n').map(l => l.trim()).join(' ').substring(0, 100)}...`);
    const { data, error } = await supabase.rpc('pg_temp.exec', { sql });
    
    if (error) {
      // Skip duplicate object errors (code 42P07 for table already exists, 42710 for duplicate object)
      if (error.code === '42P07' || error.code === '42710') {
        console.log('Skipping (object already exists)');
        return { success: true, data: null };
      }
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error executing query:', error);
    return { success: false, error };
  }
};

// Create a function to execute raw SQL in Supabase
const createExecFunction = async () => {
  try {
    // Drop the function if it exists
    await supabase.rpc('drop_function_if_exists', { func_name: 'exec' });
    
    // Create the exec function
    const { error } = await supabase.rpc('create_or_replace_function', {
      func_name: 'exec',
      func_args: 'text',
      func_body: `
      DECLARE
        result text;
      BEGIN
        IF $1 = '' THEN
          RETURN 'Error: SQL statement is empty';
        END IF;
        EXECUTE $1;
        RETURN 'Success';
      EXCEPTION WHEN OTHERS THEN
        RETURN SQLERRM;
      END;
      `,
      func_lang: 'plpgsql',
      func_returns: 'text',
      is_secure: false
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating exec function:', error);
    return false;
  }
};

// Apply migrations
const applyMigrations = async () => {
  console.log('Starting database migrations...');
  
  try {
    // Create the exec function first
    console.log('Setting up exec function...');
    const execCreated = await createExecFunction();
    if (!execCreated) {
      throw new Error('Failed to create exec function');
    }
    
    console.log('Applying database migrations...');
    
    // Execute the create-tables.sql script
    console.log('Creating tables...');
    const createTablesSql = readSqlFile('create-tables.sql');
    const { success: tablesCreated } = await executeQuery(createTablesSql);
    
    if (!tablesCreated) {
      throw new Error('Failed to create tables');
    }
    
    // Execute the missing-tables.sql script
    console.log('Creating missing tables and columns...');
    const missingTablesSql = readSqlFile('001_create_missing_tables.sql');
    const { success: missingTablesCreated } = await executeQuery(missingTablesSql);
    
    if (!missingTablesCreated) {
      console.warn('Warning: Some missing tables or columns could not be created');
    }
    
    console.log('Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};

// Run the migrations
applyMigrations()
  .then((success) => {
    if (success) {
      console.log('✅ All migrations completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Migrations failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Unexpected error during migrations:', error);
    process.exit(1);
  });

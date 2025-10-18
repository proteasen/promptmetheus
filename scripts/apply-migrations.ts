import { Client } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a database client
const client = new Client({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Function to execute a SQL query
async function executeQuery(query: string, params: any[] = []) {
  try {
    console.log(`Executing: ${query.split('\n').map(l => l.trim()).join(' ').substring(0, 100)}...`);
    const result = await client.query(query, params);
    return { success: true, result };
  } catch (error) {
    console.error('Error executing query:', error);
    return { success: false, error };
  }
}

// Apply migrations
async function applyMigrations() {
  console.log('Connecting to database...');
  await client.connect();
  
  try {
    console.log('Applying database migrations...');
    
    // Enable UUID extension if not exists
    console.log('Enabling UUID extension...');
    const { success: uuidSuccess } = await executeQuery(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'
    );
    
    if (!uuidSuccess) {
      throw new Error('Failed to enable UUID extension');
    }

    // Create chats table
    console.log('Creating chats table...');
    const { success: createChatsTable } = await executeQuery(`
      CREATE TABLE IF NOT EXISTS public.chats (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        model TEXT NOT NULL DEFAULT 'gpt-4',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);

    if (!createChatsTable) {
      throw new Error('Failed to create chats table');
    }
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  "`);

  if (!createMessagesTable) {
    console.error('Failed to create messages table');
    process.exit(1);
  }

  // Enable RLS on chats
  const enableRlsChats = await runCommand(`psql ${databaseUrl} -c "
    ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
  "`);

  if (!enableRlsChats) {
    console.error('Failed to enable RLS on chats table');
    process.exit(1);
  }

  // Create chat policies
  const createChatPolicies = await runCommand(`psql ${databaseUrl} -c "
    DROP POLICY IF EXISTS \"Users can view their own chats\" ON public.chats;
    DROP POLICY IF EXISTS \"Users can insert their own chats\" ON public.chats;
    DROP POLICY IF EXISTS \"Users can update their own chats\" ON public.chats;
    DROP POLICY IF EXISTS \"Users can delete their own chats\" ON public.chats;

    CREATE POLICY \"Users can view their own chats\"
      ON public.chats FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY \"Users can insert their own chats\"
      ON public.chats FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY \"Users can update their own chats\"
      ON public.chats FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY \"Users can delete their own chats\"
      ON public.chats FOR DELETE
      USING (auth.uid() = user_id);
  "`);

  if (!createChatPolicies) {
    console.error('Failed to create chat policies');
    process.exit(1);
  }

  // Enable RLS on messages
  const enableRlsMessages = await runCommand(`psql ${databaseUrl} -c "
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  "`);

  if (!enableRlsMessages) {
    console.error('Failed to enable RLS on messages table');
    process.exit(1);
  }

  // Create message policies
  const createMessagePolicies = await runCommand(`psql ${databaseUrl} -c "
    DROP POLICY IF EXISTS \"Users can view their own messages\" ON public.messages;
    DROP POLICY IF EXISTS \"Users can insert their own messages\" ON public.messages;

    CREATE POLICY \"Users can view their own messages\"
      ON public.messages FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY \"Users can insert their own messages\"
      ON public.messages FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  "`);

  if (!createMessagePolicies) {
    console.error('Failed to create message policies');
    process.exit(1);
  }

  // Create indexes for better performance
  const createIndexes = await runCommand(`psql ${databaseUrl} -c "
    CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
    CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
  "`);

  if (!createIndexes) {
    console.error('Failed to create indexes');
    process.exit(1);
  }

  // Create function to update updated_at timestamp
  const createUpdateTrigger = await runCommand(`psql ${databaseUrl} -c "
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;
    CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON public.chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  "`);

  if (!createUpdateTrigger) {
    console.error('Failed to create update trigger');
    process.exit(1);
  }

  console.log('Database migrations applied successfully!');
}

// Run the migrations
applyMigrations().catch((error) => {
  console.error('Error applying migrations:', error);
  process.exit(1);
});

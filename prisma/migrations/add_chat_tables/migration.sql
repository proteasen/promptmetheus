-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'gpt-4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policies for chats
CREATE POLICY "Users can view their own chats"
    ON public.chats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats"
    ON public.chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
    ON public.chats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
    ON public.chats FOR DELETE
    USING (auth.uid() = user_id);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view their own messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

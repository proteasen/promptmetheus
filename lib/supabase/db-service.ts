import { createClient } from './client';
import { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type Chat = Tables['chats']['Row'];
type Message = Tables['messages']['Row'];

export class DatabaseService {
  private client = createClient();

  // Chats
  async getChats(userId: string): Promise<Chat[]> {
    const { data, error } = await this.client
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getChat(chatId: string, userId: string): Promise<Chat | null> {
    const { data, error } = await this.client
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async createChat(userId: string, title: string): Promise<Chat> {
    const { data, error } = await this.client
      .from('chats')
      .insert([{ user_id: userId, title }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Messages
  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async saveMessage(
    chatId: string,
    role: 'user' | 'assistant' | 'system',
    content: string
  ): Promise<Message> {
    const { data, error } = await this.client
      .from('messages')
      .insert([{ chat_id: chatId, role, content }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Files
  async uploadFile(
    chatId: string,
    file: File,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `chats/${chatId}/${fileName}`;

    const { error: uploadError } = await this.client.storage
      .from('chat-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = this.client.storage
      .from('chat-files')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  // User Data
  async getUserProfile(userId: string) {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }
}

export const dbService = new DatabaseService();

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const api = {
  async request<T = any>(
    path: string,
    { method = 'GET', body, headers = {}, signal }: RequestOptions = {}
  ): Promise<T> {
    const url = new URL(path, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if available
    if (typeof window === 'undefined') {
      const { getAccessToken } = getKindeServerSession();
      const token = await getAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include',
      signal,
    };

    const isGetOrHead = method === 'GET' || method === 'HEAD';
    if (body && !isGetOrHead) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Something went wrong',
        response.status,
        data.details
      );
    }

    return data;
  },

  // Chat endpoints
  chats: {
    create: (title: string) =>
      api.request<{ chatId: string }>('/api/chats', {
        method: 'POST',
        body: { title },
      }),
    
    list: () =>
      api.request<{ chats: Array<{ id: string; title: string; updated_at: string }> }>(
        '/api/chats'
      ),
    
    get: (chatId: string) =>
      api.request<{ chat: any }>(`/api/chats/${chatId}`),
    
    delete: (chatId: string) =>
      api.request(`/api/chats/${chatId}`, { method: 'DELETE' }),
  },

  // Message endpoints
  messages: {
    send: (chatId: string, content: string, role: 'user' | 'assistant' = 'user') =>
      api.request<{ message: any }>('/api/messages', {
        method: 'POST',
        body: { chatId, content, role },
      }),
    
    list: (chatId: string) =>
      api.request<{ messages: Array<any> }>(`/api/messages?chatId=${chatId}`),
  },

  // Code generation
  generate: {
    code: (prompt: string, chatId: string, context: string = '') =>
      api.request<{ content: string }>('/api/generate', {
        method: 'POST',
        body: { prompt, chatId, context },
      }),
  },

  // File upload
  files: {
    upload: (chatId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return api.request<{ url: string }>(`/api/files?chatId=${chatId}`, {
        method: 'POST',
        headers: {},
        body: formData,
      });
    },
  },

  // Health check
  health: {
    check: () => api.request<{
      status: string;
      timestamp: string;
      version: string;
      environment: string;
      database: string;
      openai: string;
    }>('/api/health'),
  },
};

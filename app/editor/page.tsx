"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/editor');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Promptmetheus</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              History
            </Button>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}

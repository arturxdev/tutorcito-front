'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

interface UserMenuProps {
  user: {
    email?: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
    };
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Sesión cerrada correctamente');
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={displayName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <User size={16} className="text-purple-600 dark:text-purple-300" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
          {displayName}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoading}
        className="gap-2"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Cerrar Sesión</span>
      </Button>
    </div>
  );
}

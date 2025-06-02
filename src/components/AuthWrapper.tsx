import React, { useEffect, useState, useCallback } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Header } from './Header';
import { NameInputModal } from './NameInputModal';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [showNameModal, setShowNameModal] = useState(false);

  const checkUserProfile = useCallback(async () => {
    if (!session) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.user_metadata?.first_name) {
      setShowNameModal(true);
    }
  }, [session, supabase]);

  useEffect(() => {
    if (session) {
      checkUserProfile();
    }
  }, [session, checkUserProfile]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showNameModal && (
        <NameInputModal onComplete={() => setShowNameModal(false)} />
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 
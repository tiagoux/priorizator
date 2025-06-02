import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { HomePage } from './pages/HomePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { ProfilePage } from './pages/ProfilePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LandingPage } from './pages/LandingPage';
import { Header } from './components/Header';
import { NameInputModal } from './components/NameInputModal';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useSession();
  
  if (!session) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      {session && <Header />}
      {showNameModal && (
        <NameInputModal onComplete={() => setShowNameModal(false)} />
      )}
      <main className="flex-1">
        <Routes>
          <Route 
            path="/" 
            element={
              session ? (
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              ) : (
                <LandingPage />
              )
            } 
          />
          <Route 
            path="/project/:projectId" 
            element={
              <ProtectedRoute>
                <FeaturesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/how-it-works" 
            element={
              <ProtectedRoute>
                <HowItWorksPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/auth/AuthForm';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { CleanupConfirmation } from './components/cleanup/CleanupConfirmation';
import { LandingPage } from './components/landing/LandingPage';
import { supabase, isSupabaseConfigured, mockData } from './lib/supabase';

interface OnboardingData {
  exName: string;
  breakupDate: string;
  exPhotos: File[];
  phoneNumber: string;
  email: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

const AppContent: React.FC = () => {
  const { user, loading, isDemo } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showCleanupConfirmation, setShowCleanupConfirmation] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      setShowLanding(false);
      checkOnboardingStatus();
    } else if (!loading) {
      setCheckingProfile(false);
    }
  }, [user, loading]);

  const checkOnboardingStatus = async () => {
    try {
      if (isDemo || !isSupabaseConfigured) {
        // In demo mode, skip onboarding
        setNeedsOnboarding(false);
        setCheckingProfile(false);
        return;
      }

      // Check if user has any cleanup sessions
      const { data: sessions, error } = await supabase!
        .from('cleanup_sessions')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking sessions:', error);
        setNeedsOnboarding(true);
      } else {
        // User needs onboarding if they have no cleanup sessions
        setNeedsOnboarding(!sessions || sessions.length === 0);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setNeedsOnboarding(true);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) return;

    if (isDemo || !isSupabaseConfigured) {
      // In demo mode, just skip onboarding
      setNeedsOnboarding(false);
      return;
    }

    try {
      // Create cleanup session
      const { data: session, error: sessionError } = await supabase!
        .from('cleanup_sessions')
        .insert({
          user_id: user.id,
          ex_partner_name: data.exName,
          relationship_end_date: data.breakupDate,
          social_networks: Object.values(data.socialMedia).filter(Boolean),
          status: 'pending',
          items_found: 0,
          items_processed: 0,
          progress_percentage: 0
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return;
      }

      // Create initial milestones
      if (session) {
        const milestones = [
          {
            user_id: user.id,
            cleanup_session_id: session.id,
            milestone_type: 'setup',
            title: 'Configuração Inicial',
            description: 'Você configurou sua conta e está pronto para começar!',
            achieved: true,
            achieved_at: new Date().toISOString()
          },
          {
            user_id: user.id,
            cleanup_session_id: session.id,
            milestone_type: 'first_cleanup',
            title: 'Primeira Limpeza',
            description: 'Complete sua primeira limpeza digital',
            achieved: false
          }
        ];

        const { error: milestonesError } = await supabase!
          .from('recovery_milestones')
          .insert(milestones);

        if (milestonesError) {
          console.error('Error creating milestones:', milestonesError);
        }

        // Create initial cleanup stats
        const { error: statsError } = await supabase!
          .from('cleanup_stats')
          .insert({
            user_id: user.id,
            total_cleanups: 0,
            total_items_removed: 0,
            networks_cleaned: [],
            time_saved_minutes: 0,
            recovery_score: 0
          });

        if (statsError) {
          console.error('Error creating stats:', statsError);
        }
      }

      setNeedsOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show landing page if user is not authenticated and showLanding is true
  if (!user && showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (!user) {
    return <AuthForm />;
  }

  if (needsOnboarding && !isDemo) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Mock cleanup data for demonstration
  const mockCleanupData = {
    messages: { count: 127, label: 'Mensagens e conversas' },
    photos: { count: 89, label: 'Fotos e vídeos' },
    social: { count: 43, label: 'Conexões em redes sociais' },
    financial: { count: 12, label: 'Transações financeiras' }
  };

  return (
    <>
      <MainDashboard />
      <CleanupConfirmation
        cleanupData={mockCleanupData}
        isOpen={showCleanupConfirmation}
        onConfirm={() => {
          setShowCleanupConfirmation(false);
          console.log('Starting cleanup process...');
        }}
        onCancel={() => setShowCleanupConfirmation(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
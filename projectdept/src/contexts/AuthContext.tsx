import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, mockData } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signOut: () => Promise<void>;
  error: string | null;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(!isSupabaseConfigured);

  useEffect(() => {
    // If Supabase is not configured, use demo mode
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, using demo mode');
      setUser(mockData.user as User);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase!.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setError('Erro ao conectar com o banco de dados.');
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setError(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Demo mode - simulate successful login
      setUser(mockData.user as User);
      return { data: { user: mockData.user }, error: null };
    }

    setError(null);
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      // Demo mode - simulate successful signup
      const demoUser = { ...mockData.user, email, user_metadata: { full_name: fullName } };
      setUser(demoUser as User);
      return { data: { user: demoUser }, error: null };
    }

    setError(null);
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
    }

    return { data, error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      // Demo mode - simulate logout
      setUser(null);
      return;
    }
    
    setError(null);
    const { error } = await supabase!.auth.signOut();
    if (error) {
      setError(error.message);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    error,
    isDemo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
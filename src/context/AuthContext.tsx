import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { full_name?: string; baby_name?: string; baby_birth_date?: string }) => Promise<{ error: PostgrestError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));

        // Create or update user profile on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          await createOrUpdateUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createOrUpdateUserProfile = async (user: User) => {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email!,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating/updating user profile:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setState(prev => ({ ...prev, loading: false, error }));
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setState(prev => ({ ...prev, loading: false, error }));
    return { error };
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      setState(prev => ({ ...prev, loading: false, error }));
      return;
    }

    // Explicitly clear the user and session state
    setState(prev => ({
      ...prev,
      user: null,
      session: null,
      loading: false,
      error: null
    }));
  };

  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    setState(prev => ({ ...prev, loading: false, error }));
    return { error };
  };

  const updateProfile = async (updates: { full_name?: string; baby_name?: string; baby_birth_date?: string }) => {
    if (!state.user) return { error: null };

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', state.user.id);

    return { error };
  };

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

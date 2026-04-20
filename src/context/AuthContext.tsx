import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  blood_type: string;
  medical_conditions: string[];
  allergies: string[];
  medications: string[];
  emergency_contact: string;
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileFetchRef = useRef<string | null>(null);

  const fetchUserProfile = async (userId: string) => {
    if (profileFetchRef.current === userId) return;
    profileFetchRef.current = userId;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setUser(data as UserProfile);
      }
    } catch {
    } finally {
      profileFetchRef.current = null;
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
      if (session?.user.id) {
        fetchUserProfile(session.user.id);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);

      if (session?.user.id) {
        (async () => {
          await fetchUserProfile(session.user.id);
        })();
      } else {
        setUser(null);
        profileFetchRef.current = null;
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      await supabase.from('user_profiles').insert({
        id: authData.user.id,
        full_name: fullName,
      });

      await supabase.from('user_analytics').insert({
        user_id: authData.user.id,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    profileFetchRef.current = null;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!session?.user.id) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);

    if (error) throw error;
    await fetchUserProfile(session.user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

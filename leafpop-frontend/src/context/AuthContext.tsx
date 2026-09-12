'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isDemoUser: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'demo-user-123',
  username: 'DemoPopper',
  email: 'demo@leafpop.ai',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
};

/** Write a short-lived session cookie so Next.js middleware can gate /app/* */
function setSessionCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'leafpop_session=1; path=/; max-age=86400; SameSite=Lax';
  }
}

/** Remove the session cookie on sign-out */
function clearSessionCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'leafpop_session=; path=/; max-age=0; SameSite=Lax';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Check local storage for existing session or demo flag
    const savedToken = localStorage.getItem('leafpop_token');
    const savedDemo = localStorage.getItem('leafpop_demo_mode');

    if (savedDemo === 'true' || (!isSupabaseConfigured && !savedToken)) {
      setUser(DEMO_USER);
      setToken('demo-token');
      setIsDemoUser(true);
      setSessionCookie();
      setIsLoading(false);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setToken(session.access_token);
          localStorage.setItem('leafpop_token', session.access_token);
          setSessionCookie();
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'LeafPopper',
          });
          setIsDemoUser(false);
        } else if (savedToken === 'demo-token') {
          setUser(DEMO_USER);
          setToken('demo-token');
          setIsDemoUser(true);
          setSessionCookie();
        }
        setIsLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setToken(session.access_token);
          localStorage.setItem('leafpop_token', session.access_token);
          localStorage.removeItem('leafpop_demo_mode');
          setSessionCookie();
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'LeafPopper',
          });
          setIsDemoUser(false);
        } else {
          // If logged out from supabase
          if (!localStorage.getItem('leafpop_demo_mode')) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('leafpop_token');
          }
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      // Default to demo session for smooth hackathon testing
      setUser(DEMO_USER);
      setToken('demo-token');
      setIsDemoUser(true);
      setSessionCookie();
      setIsLoading(false);
    }
  }, []);

  const enterDemoMode = () => {
    setUser(DEMO_USER);
    setToken('demo-token');
    setIsDemoUser(true);
    setSessionCookie();
    localStorage.setItem('leafpop_demo_mode', 'true');
    localStorage.setItem('leafpop_token', 'demo-token');
  };

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured || !supabase) {
      enterDemoMode();
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;
      if (data.session) {
        setToken(data.session.access_token);
        localStorage.setItem('leafpop_token', data.session.access_token);
        localStorage.removeItem('leafpop_demo_mode');
        setSessionCookie();
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          username: data.user.user_metadata?.username || email.split('@')[0],
        });
        setIsDemoUser(false);
      }
    } catch (_) {
      // Fallback to Demo Mode on any auth error so user is never blocked
      const userHandle = email.split('@')[0] || 'LeafPopper';
      setUser({
        id: 'demo-user-123',
        email: email || 'demo@leafpop.ai',
        username: userHandle,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=60',
      });
      setToken('demo-token');
      setIsDemoUser(true);
      setSessionCookie();
      localStorage.setItem('leafpop_demo_mode', 'true');
      localStorage.setItem('leafpop_token', 'demo-token');
    }
  };

  const signUp = async (email: string, pass: string, username: string) => {
    if (!isSupabaseConfigured || !supabase) {
      enterDemoMode();
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { username },
        },
      });

      if (error) throw error;
      if (data.session && data.user) {
        setToken(data.session.access_token);
        localStorage.setItem('leafpop_token', data.session.access_token);
        setSessionCookie();
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          username,
        });
        setIsDemoUser(false);
      } else {
        // Fallback for signups requiring email confirmation
        enterDemoMode();
      }
    } catch (_) {
      // Fallback to Demo Mode on any signup error
      setUser({
        id: 'demo-user-123',
        email: email || 'demo@leafpop.ai',
        username: username || 'LeafPopper',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=60',
      });
      setToken('demo-token');
      setIsDemoUser(true);
      setSessionCookie();
      localStorage.setItem('leafpop_demo_mode', 'true');
      localStorage.setItem('leafpop_token', 'demo-token');
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Signout error', e);
      }
    }
    localStorage.removeItem('leafpop_token');
    localStorage.removeItem('leafpop_demo_mode');
    clearSessionCookie();
    setUser(null);
    setToken(null);
    setIsDemoUser(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isDemoUser,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

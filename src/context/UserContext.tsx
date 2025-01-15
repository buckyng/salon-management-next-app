'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Tables } from '@/lib/database.types';
import { jwtDecode } from 'jwt-decode';

interface UserContextType {
  authUser: User | null; // Authenticated user details from Supabase Auth
  dbUser: Tables<'users'> | null; // User details from `public.users`
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<Tables<'users'> | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseClient();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const { data, error } = await supabase.auth.getUser();

      if (!data || error) return;

      try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const { authUser, dbUser } = await response.json();
        setAuthUser(authUser || null);
        setDbUser(dbUser || null);
      } catch (error) {
        console.error(
          'Error fetching user data:',
          error instanceof Error ? error.message : error
        );
        setAuthUser(null);
        setDbUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Real-time user session handling
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const jwt = jwtDecode(session.access_token);
          console.log('jwt', jwt);
        }
        fetchUser();
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ authUser, dbUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

'use client';

import { createSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

interface UserMetadata {
  id: string;
  email: string | undefined;
  groups: {
    id: string;
    name: string | null;
    roles: string[];
    logo_url: string | null;
  }[]; // Group ID mapped to roles
  name: string | null; // From profiles table
  avatar_url: string | null; // From profiles table
}

interface UserContextValue {
  user: UserMetadata | null;
  loading: boolean;
  error: string | null;
  updateUser: (updates: Partial<UserMetadata>) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUserMetadata = async () => {
      try {
        setLoading(true);

        const supabase = createSupabaseClient();

        // Ensure session exists first
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError || !sessionData?.session) {
          console.error('Failed to retrieve session.');
          router.push('/login'); // Redirect to sign-in page
          return;
        }

        // Fetch the authenticated user
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError || !authData?.user) {
          console.error('Failed to get authenticated user.');
          router.push('/login'); // Redirect to sign-in page
          return;
        }

        const userId = authData.user.id;

        // Fetch profile data from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Extract group IDs and roles from app_metadata
        const groupRoles = authData.user.app_metadata.groups || {}; // { groupId: roles[] }
        const groupIds = Object.keys(groupRoles);

        // Fetch group names from the groups table
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('id, name, logo_url')
          .in('id', groupIds);

        if (groupError) throw groupError;

        // Combine group names with roles
        const groups = groupIds.map((groupId) => ({
          id: groupId,
          name:
            groupData?.find((group) => group.id === groupId)?.name ||
            'Unknown Group',
          roles: groupRoles[groupId], // Extract roles for this group
          logo_url:
            groupData?.find((group) => group.id === groupId)?.logo_url || null,
        }));

        // Combine auth user metadata, profile data, and group info
        const metadata: UserMetadata = {
          id: userId,
          email: authData.user.email,
          groups,
          name: profileData?.name || null,
          avatar_url: profileData?.avatar_url || null,
        };

        setUser(metadata);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserMetadata();
  }, []);

  const updateUser = (updates: Partial<UserMetadata>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <UserContext.Provider value={{ user, loading, error, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

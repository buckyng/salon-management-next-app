'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { createSupabaseClient } from '@/lib/supabase/client';

interface Group {
  id: string;
  name: string | null;
  roles: string[];
  logo_url?: string | null;
}

interface GroupContextValue {
  activeGroup: Group | null;
  setActiveGroup: (group: Group) => void;
}

const GroupContext = createContext<GroupContextValue | undefined>(undefined);

export const GroupProvider = ({
  children,
  groupId,
}: {
  children: React.ReactNode;
  groupId: string;
}) => {
  const { user } = useUser();
  const [activeGroup, setActiveGroupState] = useState<Group | null>(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!user) return;

      const cachedGroup = localStorage.getItem('activeGroup');
      if (cachedGroup) {
        try {
          const parsedGroup = JSON.parse(cachedGroup);
          if (parsedGroup.id === groupId) {
            setActiveGroupState(parsedGroup);
            return;
          }
        } catch (error) {
          console.error('Error parsing cached group:', error);
        }
      }

      const supabase = createSupabaseClient();

      try {
        const group = user.groups.find((g) => g.id === groupId);

        if (!group) {
          console.error(`Group with ID ${groupId} not found for user.`);
          return;
        }

        const { data, error } = await supabase
          .from('groups')
          .select('id, name, logo_url')
          .eq('id', groupId)
          .single();

        if (error) {
          console.error('Error fetching group details:', error.message);
          return;
        }

        const activeGroupDetails: Group = {
          id: data.id,
          name: data.name,
          roles: group.roles,
          logo_url: data.logo_url || null,
        };

        setActiveGroupState(activeGroupDetails);
        localStorage.setItem('activeGroup', JSON.stringify(activeGroupDetails));
      } catch (error) {
        console.error('Error fetching group details:', error);
      }
    };

    fetchGroupDetails();
  }, [user, groupId]);

  const setActiveGroup = (group: Group) => {
    setActiveGroupState(group);
    localStorage.setItem('activeGroup', JSON.stringify(group)); // Persist active group
  };

  return (
    <GroupContext.Provider value={{ activeGroup, setActiveGroup }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};

'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

interface Group {
  id: string;
  name: string | null;
  roles: string[];
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
    if (!user) return;
    const group = user.groups.find((g) => g.id === groupId);
    if (group) {
      setActiveGroupState(group);
    } else {
      console.error(`Group with ID ${groupId} not found for user.`);
    }
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

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EditProfileDialog from './EditProfileDialog';
import ChangePasswordDialog from './ChangePasswordDialog';
import { useUser } from '@/context/UserContext';
import {
  changeUserPassword,
  logoutUser,
  updateUserProfile,
} from '@/services/authService';
import { toast } from 'react-toastify';

const UserProfileMenu: React.FC = () => {
  const router = useRouter();
  const { user, loading, updateUser } = useUser();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (loading) return null;

  const handleProfileSave = async (name: string) => {
    await updateUserProfile({ name, avatarUrl: user?.avatar_url || '' });
    updateUser({ name });
  };

  const handlePasswordChange = async (
    currentPassword: string,
    newPassword: string
  ) => {
    await changeUserPassword({
      email: user?.email || '',
      currentPassword,
      newPassword,
    });
    toast.success('Password changed successfully');
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar>
            <AvatarImage
              src={user?.avatar_url || ''}
              alt={user?.name || 'User'}
            />
            <AvatarFallback>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setIsEditingProfile(true)}>
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsChangingPassword(true)}>
            Change Password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfileDialog
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        onSave={handleProfileSave}
        initialName={user?.name || ''}
      />

      <ChangePasswordDialog
        isOpen={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
        onChangePassword={handlePasswordChange}
      />
    </div>
  );
};

export default UserProfileMenu;

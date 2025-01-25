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
import { changeUserPassword, logoutUser } from '@/services/authService';
import { toast } from 'react-toastify';
import { uploadImage } from '@/lib/supabase/storage/client';
import { updateUserDetails } from '@/lib/supabase/helpers/user';

const UserProfileMenu: React.FC = () => {
  const router = useRouter();
  const { user, loading, updateUser } = useUser();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (loading) return null;

  const handleProfileSave = async (name: string, avatarFile: File | null) => {
    try {
      let uploadedAvatarUrl = user?.avatar_url || '';

      if (!user) {
        console.error('userId is required');
        return;
      }

      if (avatarFile) {
        const { imageUrl, error } = await uploadImage({
          file: avatarFile,
          bucket: 'avatars',
          folder: 'profile',
          userId: user.id,
        });

        if (error) {
          throw new Error('Error uploading avatar');
        }
        uploadedAvatarUrl = imageUrl;
      }

      const updateError = await updateUserDetails({
        userId: user.id,
        name,
        avatarUrl: uploadedAvatarUrl,
      });
      if (updateError) throw updateError;

      // Dynamically update the UserContext
      updateUser({
        name,
        avatar_url: uploadedAvatarUrl,
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile. Please try again.');
    }
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
        initialAvatarUrl={user?.avatar_url || ''}
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

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { useUserContext } from '@/context/UserContext';
import { uploadImage } from '@/lib/supabase/storage/client';
import { updateUserDetails } from '@/lib/supabase/helpers/user';
import { handleLogout } from '@/lib/supabase/helpers/auth';

export const UserProfileMenu: React.FC = () => {
  const router = useRouter();
  const { dbUser, loading } = useUserContext(); // Access user and dbUserId from context

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || '');
      setAvatarUrl(dbUser.avatar_url || '');
    }
  }, [dbUser]);

  if (loading) {
    return null; // Optionally, show a loading spinner
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarUrl(e.target?.result as string);
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      let uploadedUrl = avatarUrl;
      if (!dbUser) {
        console.error('userId is required');
        return;
      }

      // Upload avatar if file exists
      if (file) {
        const { imageUrl, error } = await uploadImage({
          file,
          bucket: 'avatars',
          folder: 'profile',
          userId: dbUser.id,
        });

        if (error) {
          console.error('Error uploading avatar:', error);
          return;
        }

        uploadedUrl = imageUrl;
      }

      // Update user profile using helper function
      if (!dbUser.id) throw new Error('User ID not found');

      const updateError = await updateUserDetails({
        dbUserId: dbUser.id,
        name,
        avatarUrl: uploadedUrl,
      });
      if (updateError) throw updateError;

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const logout = async () => {
    try {
      await handleLogout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar>
            <AvatarImage src={avatarUrl || ''} alt={name || 'User'} />
            <AvatarFallback>
              {name?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Avatar</label>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={avatarUrl || ''} alt="Avatar" />
                  <AvatarFallback>
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsEditing(false)} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

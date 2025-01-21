'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGroup } from '@/context/GroupContext';
import { uploadImage } from '@/lib/supabase/storage/client';
import { updateGroupDetails } from '@/lib/supabase/helpers/group';
import BackButton from '@/components/global/BackButton';

const UploadLogoPage = () => {
  const { activeGroup, updateGroup } = useGroup();
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (activeGroup) {
      setLogoUrl(activeGroup.logo_url || '');
    }
  }, [activeGroup]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      const reader = new FileReader();
      reader.onload = (e) => setLogoUrl(e.target?.result as string);
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      if (!activeGroup) {
        console.error('Active group not found');
        return;
      }

      let uploadedUrl = logoUrl;

      if (file) {
        const { imageUrl, error } = await uploadImage({
          file,
          bucket: 'avatars',
          folder: 'groups',
          userId: activeGroup.id, // Use group ID for the folder
        });

        if (error) {
          console.error('Error uploading logo:', error);
          return;
        }

        uploadedUrl = imageUrl;
      }

      const updateError = await updateGroupDetails({
        groupId: activeGroup.id,
        logoUrl: uploadedUrl,
      });

      if (updateError) throw updateError;

      updateGroup({ logo_url: uploadedUrl });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating group logo:', error);
    }
  };

  if (!activeGroup) {
    return <p>Loading group...</p>;
  }

  return (
    <div className="container mx-auto mt-6">
      <BackButton />
      <Avatar>
        <AvatarImage src={logoUrl || ''} alt="Group Logo" />
        <AvatarFallback>
          {activeGroup.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <h1 className="text-2xl font-bold mb-4">Update Group Logo</h1>
      <Button onClick={() => setIsEditing(true)}>Edit Group Logo</Button>

      {/* Edit Logo Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group Logo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Logo</label>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={logoUrl || ''} alt="Group Logo" />
                  <AvatarFallback>
                    {activeGroup?.name?.charAt(0).toUpperCase()}
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

export default UploadLogoPage;

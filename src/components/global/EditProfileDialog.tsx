'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, avatarFile: File | null) => Promise<void>;
  initialName: string;
  initialAvatarUrl: string;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName,
  initialAvatarUrl,
}) => {
  const [name, setName] = useState<string>(initialName);
  const [avatarUrl, setAvatarUrl] = useState<string>(initialAvatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFile(file);

      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(name, file);
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {/* Avatar Input */}
          <div>
            <label className="block text-sm font-medium">Avatar</label>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={avatarUrl || ''} alt="Avatar" />
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;

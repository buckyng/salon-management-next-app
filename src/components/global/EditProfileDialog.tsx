'use client';

import React, { useState, useEffect } from 'react';
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
  /**
   * name: updated display name
   * avatarFile: new avatar File or null
   * phone: updated phone number
   */
  onSave: (
    name: string,
    avatarFile: File | null,
    phone: string
  ) => Promise<void>;
  initialName: string;
  initialAvatarUrl: string;
  initialPhone: string;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName,
  initialAvatarUrl,
  initialPhone,
}) => {
  const [name, setName] = useState<string>(initialName);
  const [phone, setPhone] = useState<string>(initialPhone || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(initialAvatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setPhone(initialPhone);
      setAvatarUrl(initialAvatarUrl);
      setFile(null);
    }
  }, [isOpen, initialName, initialAvatarUrl, initialPhone]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // sanitize and format phone: only digits, then +1 prefix
      const digits = phone.replace(/\D/g, '');
      const formattedPhone = digits ? `+1${digits}` : '';
      await onSave(name, file, formattedPhone);
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <Input
              inputMode="numeric"
              pattern="\d*"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="1234567890"
            />
          </div>

          {/* Avatar Field */}
          <div>
            <label className="block text-sm font-medium">Avatar</label>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={avatarUrl || ''} alt="Avatar preview" />
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end space-x-2">
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

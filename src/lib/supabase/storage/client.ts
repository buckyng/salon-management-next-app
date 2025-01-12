import imageCompression from 'browser-image-compression';
import { createSupabaseClient } from '../client';

function getStorage() {
  const { storage } = createSupabaseClient();
  return storage;
}

type UploadProps = {
  file: File;
  bucket: string;
  folder?: string;
  userId: string; // Use userId to determine the file name
};

export async function uploadImage({
  file,
  bucket,
  folder,
  userId,
}: UploadProps) {
  const fileName = userId;
  const fileExtension = fileName.slice(fileName.lastIndexOf('.') + 1);
  const path = `${folder ? folder + '/' : ''}${fileName}.${fileExtension}`;

  try {
    file = await imageCompression(file, { maxSizeMB: 1 });
  } catch (error) {
    console.error('Error compressing image:', error);
    return { imageUrl: '', error: 'Error compressing image' };
  }

  const storage = getStorage();

  // Upload the file and overwrite if it already exists
  const { data, error } = await storage.from(bucket).upload(path, file, {
    upsert: true, // Overwrite the existing file
  });
  if (error) {
    console.error('Error uploading image:', error);
    return { imageUrl: '', error: 'Error uploading image' };
  }

  const imageUrl = `${process.env
    .NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/${bucket}/${
    data?.path
  }`;
  return { imageUrl, error: null };
}

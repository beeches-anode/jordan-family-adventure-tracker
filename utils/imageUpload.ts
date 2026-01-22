import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase-config';
import { Photo } from '../types';

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.4,           // Max file size in MB (400KB)
  maxWidthOrHeight: 1200,   // Max dimension - good for web/mobile viewing
  useWebWorker: true,       // Use web worker for better performance
  fileType: 'image/jpeg',   // Convert to JPEG for better compression
};

export interface UploadProgress {
  status: 'compressing' | 'uploading' | 'done' | 'error';
  progress: number;        // 0-100
  error?: string;
}

export const compressImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  const compressedFile = await imageCompression(file, {
    ...COMPRESSION_OPTIONS,
    onProgress: (progress) => {
      if (onProgress) {
        onProgress(Math.round(progress));
      }
    },
  });
  return compressedFile;
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const uploadPhoto = async (
  file: File,
  author: string,
  date: string,
  onProgress?: (status: UploadProgress) => void
): Promise<Photo> => {
  try {
    // Report compression starting
    onProgress?.({ status: 'compressing', progress: 0 });

    // Compress the image
    const compressedFile = await compressImage(file, (progress) => {
      onProgress?.({ status: 'compressing', progress });
    });

    // Get dimensions of compressed image
    const dimensions = await getImageDimensions(compressedFile);

    // Report upload starting
    onProgress?.({ status: 'uploading', progress: 0 });

    // Create a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = 'jpg'; // We convert to JPEG
    const path = `photos/${date}/${author}_${timestamp}_${randomId}.${extension}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, compressedFile);

    // Get the download URL
    const url = await getDownloadURL(storageRef);

    onProgress?.({ status: 'done', progress: 100 });

    return {
      url,
      path,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    onProgress?.({ status: 'error', progress: 0, error: errorMessage });
    throw error;
  }
};

export const uploadMultiplePhotos = async (
  files: File[],
  author: string,
  date: string,
  onProgress?: (index: number, status: UploadProgress) => void
): Promise<Photo[]> => {
  const photos: Photo[] = [];

  for (let i = 0; i < files.length; i++) {
    const photo = await uploadPhoto(files[i], author, date, (status) => {
      onProgress?.(i, status);
    });
    photos.push(photo);
  }

  return photos;
};

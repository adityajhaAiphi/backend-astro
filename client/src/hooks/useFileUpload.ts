import { useState } from 'react';
// import { storage } from '@/lib/firebase';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, type: 'image' | 'document' = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  return {
    uploadFile,
    uploading: false // You can add loading state if needed
  };
} 
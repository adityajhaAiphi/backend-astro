import React, { useRef } from 'react';
import Image from 'next/image';
import styles from '@/styles/FileUpload.module.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  children?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, children }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleDocumentClick = () => {
    documentInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className={styles.fileUpload}>
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
      <input
        type="file"
        ref={documentInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx"
      />
      <label className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors">
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#2c3e50" 
          strokeWidth="2" 
          className="w-6 h-6"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </label>
      {children}
    </div>
  );
}; 
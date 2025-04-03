import React, { useState } from 'react';
import { Box, TextField, IconButton, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Send, FlashOn } from '@mui/icons-material'; // Add FlashOn import
import { FileUpload } from './FileUpload';
import { useFileUpload } from '@/hooks/useFileUpload';
import { QUICK_PROMPTS } from '@/constants/quickPrompts';

interface ChatInputProps {
  onSendMessage: (
    content: string, 
    type?: 'text' | 'image' | 'document',
    fileUrl?: string,
    fileName?: string
  ) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const { uploadFile, uploading } = useFileUpload();
  const [error, setError] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);

  // Add quick prompt handler
  const handleQuickPrompt = (promptText: string) => {
    onSendMessage(promptText, 'text');
    setShowPrompts(false);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleFileSelect = async (file: File) => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // try {
    //   const url = await uploadFile(file, 'chat-files');
    //   onSendMessage(
    //     `Shared a ${file.type.includes('image') ? 'photo' : 'document'}`,
    //     file.type.includes('image') ? 'image' : 'document',
    //     url,
    //     file.name
    //   );
    // } catch (error) {
    //   console.error('Error uploading file:', error);
    //   setError('Failed to upload file. Please try again.');
    // }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {showPrompts && (
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          p: 2,
          backgroundColor: '#fff',
          borderTop: '1px solid',
          borderColor: 'divider',
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          boxShadow: '0 -4px 6px rgba(0,0,0,0.1)',
          zIndex: 1
        }}>
          {QUICK_PROMPTS.map((prompt) => (
            <Box
              key={prompt.id}
              onClick={() => handleQuickPrompt(`${prompt.icon} ${prompt.text}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{prompt.icon}</span>
              <span>{prompt.text}</span>
            </Box>
          ))}
        </Box>
      )}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        gap: 1,
        position: 'relative',
        backgroundColor: '#fff'
      }}>
        <FileUpload onFileSelect={handleFileSelect} />
        <IconButton
          onClick={() => setShowPrompts(!showPrompts)}
          sx={{
            color: showPrompts ? '#f59e0b' : '#6b7280',
            backgroundColor: showPrompts ? 'rgba(245,158,11,0.1)' : 'transparent',
            border: '2px solid',
            borderColor: showPrompts ? '#f59e0b' : '#e5e7eb',
            '&:hover': { 
              backgroundColor: 'rgba(245,158,11,0.1)',
              borderColor: '#f59e0b'
            }
          }}
          title="Quick prompts"
        >
          <FlashOn />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={disabled || uploading}
          size="small"
        />
        {uploading ? (
          <CircularProgress size={24} />
        ) : (
          <IconButton onClick={handleSend} disabled={!message.trim() || disabled}>
            <Send />
          </IconButton>
        )}
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};
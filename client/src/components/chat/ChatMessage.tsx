import React from 'react';
import { Box, Typography, Paper, Link } from '@mui/material';
import Image from 'next/image';
import { Description } from '@mui/icons-material';

interface ChatMessageProps {
  message: {
    content: string;
    senderId: string;
    type: 'text' | 'image' | 'document';
    fileUrl?: string;
    fileName?: string;
  };
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      <Paper
        sx={{
          p: 2,
          maxWidth: '70%',
          bgcolor: isCurrentUser ? 'primary.main' : 'grey.100',
          color: isCurrentUser ? 'white' : 'text.primary'
        }}
      >
        {message.type === 'text' && (
          <Typography>{message.content}</Typography>
        )}
        
        {message.type === 'image' && message.fileUrl && (
          <Box sx={{ maxWidth: 300 }}>
            <Image
              src={message.fileUrl}
              alt={message.fileName || 'Shared image'}
              width={300}
              height={200}
              style={{ objectFit: 'contain' }}
            />
          </Box>
        )}
        
        {message.type === 'document' && message.fileUrl && (
          <Link 
            href={message.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Description sx={{ color: '#2c3e50', fontSize: 24 }} />
            <Typography sx={{ 
              color: '#2c3e50',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}>
              {message.fileName || 'Document'}
            </Typography>
          </Link>
        )}
      </Paper>
    </Box>
  );
}; 
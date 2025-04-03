'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  Avatar,
} from '@mui/material';
import { X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import styles from './ChatHistoryDialog.module.css';
import { ChatMessage } from '@/types/chat';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: 'user' | 'astrologer';
  };
  timestamp: Date;
}

interface ChatHistory {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: Date;
  messages: Message[];
}

interface ChatHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  chatHistory: ChatHistory;
}

export function ChatHistoryDialog({ open, onClose, chatHistory }: ChatHistoryDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className={styles.dialog}
    >
      <DialogTitle className={styles.dialogTitle}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar>{chatHistory.userName[0]}</Avatar>
            <Box>
              <Typography variant="h6">{chatHistory.userName}</Typography>
              <Typography variant="caption" color="text.secondary">
                Chat History
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent className={styles.dialogContent}>
        <Box className={styles.messagesContainer}>
          {chatHistory.messages.map((message) => (
            <Box
              key={message.id}
              className={`${styles.messageWrapper} ${
                message.sender.role === 'astrologer' ? styles.astrologerMessage : styles.userMessage
              }`}
            >
              <Box className={styles.messageContent}>
                <Typography>{message.content}</Typography>
                <Typography variant="caption" className={styles.timestamp}>
                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
'use client'

import { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Typography, Button, Grid } from '@mui/material';
import { Send, Power } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import styles from './ChatInterface.module.css';

interface ChatInterfaceProps {
  astrologerId: string;
  astrologerName?: string;
  onClose?: () => void;
}

export function ChatInterface({ astrologerId, astrologerName, onClose }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, isConnected, isTyping, quickPrompts } = useChat(astrologerId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Guard clause for missing astrologerId
  if (!astrologerId) {
    return (
      <Box className={styles.chatContainer}>
        <Typography color="error">
          Error: Cannot initialize chat without an astrologer ID
        </Typography>
      </Box>
    );
  }

  // Guard clause for unauthenticated user
  if (!user) {
    return (
      <Box className={styles.chatContainer}>
        <Typography color="error">
          Error: You must be logged in to use the chat
        </Typography>
      </Box>
    );
  }

  useEffect(() => {
    if (!astrologerId) {
      console.error('ChatInterface Error: astrologerId is required but was not provided', {
        astrologerId,
        astrologerName,
        isUserAuthenticated: !!user
      });
    }
  }, [astrologerId, astrologerName, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDisconnect = () => {
    // Just call onClose since we can't directly disconnect
    onClose?.();
  };

  return (
    <Box className={styles.chatContainer}>
      {/* Header with connection status */}
      <Box className={styles.chatHeader}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <div className={isConnected ? styles.statusOnline : styles.statusOffline} />
          <Typography variant="body2">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Power size={16} />}
          onClick={handleDisconnect}
          size="small"
        >
          Close Chat
        </Button>
      </Box>

      {/* Quick Prompts Section */}
      <Box className={styles.quickPromptsContainer}>
        <Typography variant="subtitle2" gutterBottom sx={{ px: 2 }}>
          Quick Questions
        </Typography>
        <Grid container spacing={1} sx={{ px: 2 }}>
          {quickPrompts.map((prompt) => (
            <Grid item xs={6} key={prompt.id}>
              <Paper
                elevation={0}
                className={styles.promptCard}
                onClick={() => {
                  const randomQuestion = prompt.questions[Math.floor(Math.random() * prompt.questions.length)];
                  sendMessage(randomQuestion);
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span className={styles.promptIcon}>{prompt.icon}</span>
                  <Typography variant="body2">{prompt.text}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Messages area */}
      <Box className={styles.messagesContainer}>
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`${styles.message} ${msg.sender.id === user?._id ? styles.userMessage : styles.astrologerMessage}`}
          >
            <div className={styles.messageContent}>
              {msg.content.startsWith('http') ? (
                <img 
                  src={msg.content} 
                  alt="Shared" 
                  className={styles.sharedImage} 
                />
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <Box className={styles.typingIndicator}>
            <Typography variant="caption">Astrologer is typing...</Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message input */}
      <Paper component="form" onSubmit={handleSend} className={styles.inputContainer}>
        <TextField
          fullWidth
          placeholder={isConnected ? "Type your message..." : "Disconnected"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          variant="outlined"
          size="small"
          disabled={!isConnected}
        />
        <IconButton 
          type="submit" 
          color="primary" 
          disabled={!message.trim() || !isConnected}
        >
          <Send />
        </IconButton>
      </Paper>
    </Box>
  );
}